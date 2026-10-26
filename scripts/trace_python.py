"""Record step-by-step execution traces for the Code Stepper visual.

Every content/<module>/traces/<name>.py is run under sys.settrace in its own isolated
interpreter. Each step stores the line about to run, the event, the visible frames with
their local variables (as short, address-free reprs) and the output printed so far.
The result is saved next to the source as <name>.trace.json and committed, so the
website build never needs Python.

Usage:
  python scripts/trace_python.py            # (re)record every trace
  python scripts/trace_python.py --check    # fail if any committed trace is missing or stale
  python scripts/trace_python.py --one FILE # print one trace as JSON (used internally)
"""

from __future__ import annotations

import io
import json
import os
import re
import subprocess
import sys
import types
from contextlib import redirect_stdout
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
# Overridable so tests can point the recorder at a temporary content tree.
CONTENT = Path(os.environ.get("NDN_CONTENT_DIR", ROOT / "content")).resolve()
FORMAT_VERSION = 1
MAX_STEPS = 120
MAX_REPR = 80
TIMEOUT_S = 30

_ADDRESS = re.compile(r" at 0x[0-9a-fA-F]+")


def short_repr(value: object) -> str:
    """A deterministic, readable, size-limited representation of a value."""
    if isinstance(value, types.FunctionType):
        return f"function {value.__name__}"
    if isinstance(value, type):
        return f"class {value.__name__}"
    if isinstance(value, types.ModuleType):
        return f"module {value.__name__}"
    if isinstance(value, types.GeneratorType):
        return f"generator {value.__name__}"
    try:
        text = repr(value)
    except Exception as exc:  # a broken __repr__ must not break the trace
        text = f"<repr failed: {type(exc).__name__}>"
    text = _ADDRESS.sub("", text)
    return text if len(text) <= MAX_REPR else text[: MAX_REPR - 1] + "…"


def visible_locals(frame: types.FrameType) -> list[list[str]]:
    names = []
    for name, value in frame.f_locals.items():
        if name.startswith("__") and name.endswith("__"):
            continue  # __name__, __builtins__, … are noise for learners
        names.append([name, short_repr(value)])
    return names


def record(path: Path) -> dict:
    """Run one program under a tracer and return its trace."""
    source = path.read_text(encoding="utf-8")
    filename = str(path)
    code = compile(source, filename, "exec")
    out = io.StringIO()
    steps: list[dict] = []
    truncated = False

    class Stop(Exception):
        pass

    def snapshot(frame: types.FrameType, event: str, extra: dict | None = None) -> None:
        nonlocal truncated
        if len(steps) >= MAX_STEPS:
            truncated = True
            raise Stop
        frames = []
        f: types.FrameType | None = frame
        while f is not None:
            if f.f_code.co_filename == filename:
                name = "<module>" if f.f_code.co_name == "<module>" else f.f_code.co_name
                frames.append({"name": name, "locals": visible_locals(f)})
            f = f.f_back
        frames.reverse()  # outermost first: <module>, then each call
        step = {"line": frame.f_lineno, "event": event, "frames": frames, "stdout": out.getvalue()}
        if extra:
            step.update(extra)
        steps.append(step)

    def tracer(frame: types.FrameType, event: str, arg: object):
        if frame.f_code.co_filename != filename:
            return None  # don't trace library code
        if event == "line":
            snapshot(frame, "line")
        elif event == "call" and frame.f_code.co_name != "<module>":
            snapshot(frame, "call")
        elif event == "return":
            snapshot(frame, "return", {"returnValue": short_repr(arg)})
        elif event == "exception":
            exc_type, exc_value, _ = arg  # type: ignore[misc]
            snapshot(frame, "exception", {"exception": f"{exc_type.__name__}: {exc_value}"})
        return tracer

    namespace: dict = {"__name__": "__main__", "__file__": filename}
    error = None
    with redirect_stdout(out):
        sys.settrace(tracer)
        try:
            exec(code, namespace)
        except Stop:
            pass
        except Exception as exc:  # an uncaught error is part of the lesson, not a crash
            error = f"{type(exc).__name__}: {exc}"
        finally:
            sys.settrace(None)

    trace = {
        "version": FORMAT_VERSION,
        "python": f"{sys.version_info.major}.{sys.version_info.minor}",
        "source": source,
        "steps": steps,
        "stdout": out.getvalue(),
        "truncated": truncated,
    }
    if error:
        trace["error"] = error
    return trace


def record_isolated(path: Path) -> dict:
    """Record in a fresh interpreter so programs can't affect each other."""
    result = subprocess.run(
        [sys.executable, "-I", "-X", "utf8", str(Path(__file__).resolve()), "--one", str(path)],
        capture_output=True,
        text=True,
        encoding="utf-8",
        timeout=TIMEOUT_S,
    )
    if result.returncode != 0:
        raise RuntimeError(f"{path}: tracer failed\n{result.stderr}")
    return json.loads(result.stdout)


def trace_sources() -> list[Path]:
    return sorted(CONTENT.glob("*/traces/*.py"))


def serialise(trace: dict) -> str:
    return json.dumps(trace, ensure_ascii=False, indent=1) + "\n"


def main(argv: list[str]) -> int:
    sys.stdout.reconfigure(encoding="utf-8")  # Windows consoles default to cp1252
    if argv[:1] == ["--one"]:
        sys.stdout.write(json.dumps(record(Path(argv[1]).resolve()), ensure_ascii=False))
        return 0

    check = argv[:1] == ["--check"]
    problems: list[str] = []
    sources = trace_sources()
    for src in sources:
        target = src.with_suffix(".trace.json")
        fresh = serialise(record_isolated(src))
        rel = src.relative_to(CONTENT).as_posix()
        if check:
            if not target.exists():
                problems.append(f"{rel}: trace missing (run `pnpm traces`)")
            elif target.read_text(encoding="utf-8") != fresh:
                problems.append(f"{rel}: trace is stale (run `pnpm traces`)")
        else:
            target.write_text(fresh, encoding="utf-8", newline="\n")
    orphans = [
        j.relative_to(CONTENT).as_posix()
        for j in sorted(CONTENT.glob("*/traces/*.trace.json"))
        if not j.with_name(j.name.replace(".trace.json", ".py")).exists()
    ]
    problems += [f"{o}: no matching .py source" for o in orphans]

    if problems:
        print("\n".join(f"✗ {p}" for p in problems))
        return 1
    verb = "up to date" if check else "recorded"
    print(f"✓ {len(sources)} trace(s) {verb} on Python {sys.version.split()[0]}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
