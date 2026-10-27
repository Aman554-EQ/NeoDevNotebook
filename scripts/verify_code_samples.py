"""Run every Python code sample found in content/ (see `pnpm verify:content`).

Each sample runs in its own interpreter with a timeout, in a temporary folder that also holds the
module's helper files (content/<module>/support/*.py, e.g. Django's playground.py). A sample fails
if it raises, times out, prints something other than its "Output" block, or contains `>>>` prompts
without the `repl` flag (code must be paste-ready).

Interpreter: $VERIFY_PYTHON, else .venv-verify (created by `pnpm setup:py`), else this Python.
Fence flags: `norun` (shown only), `repl` (has >>> prompts), `postgres` (runs only when
$VERIFY_POSTGRES_URL is set; the URL is passed to the sample as DATABASE_URL).

usage: python scripts/verify_code_samples.py [--only <text in source>]
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SAMPLES = ROOT / ".cache" / "code-samples.json"
TIMEOUT_S = 60


def interpreter() -> str:
    if os.environ.get("VERIFY_PYTHON"):
        return os.environ["VERIFY_PYTHON"]
    for candidate in (ROOT / ".venv-verify" / "Scripts" / "python.exe", ROOT / ".venv-verify" / "bin" / "python"):
        if candidate.exists():
            return str(candidate)
    return sys.executable


def support_files(module: str) -> list[Path]:
    folder = ROOT / "content" / module / "support"
    return sorted(folder.glob("*.py")) if folder.is_dir() else []


def check(sample: dict, python: str) -> str | None:
    """Return an error message, or None if the sample passes."""
    code: str = sample["code"]
    flags: list[str] = sample.get("flags", [])
    if "repl" not in flags and any(line.lstrip().startswith(">>>") for line in code.splitlines()):
        return "contains '>>>' prompts; code must be paste-ready (or mark the fence `repl`)"
    if "norun" in flags or "repl" in flags:
        return None
    env = {**os.environ, "PYTHONIOENCODING": "utf-8"}
    if "postgres" in flags:
        env["DATABASE_URL"] = os.environ["VERIFY_POSTGRES_URL"]

    with tempfile.TemporaryDirectory() as tmp:
        for helper in support_files(sample.get("module", "")):
            shutil.copy(helper, tmp)
        script = Path(tmp) / "sample.py"
        script.write_text(code, encoding="utf-8")
        try:
            # -E -s: ignore PYTHON* variables (e.g. a fixed PYTHONHASHSEED) and user site-packages,
            # but keep the sample's folder on sys.path so it can import the support files.
            result = subprocess.run(
                [python, "-E", "-s", "-X", "utf8", str(script)],
                capture_output=True,
                text=True,
                timeout=TIMEOUT_S,
                cwd=tmp,
                encoding="utf-8",
                env=env,
            )
        except subprocess.TimeoutExpired:
            return f"timed out after {TIMEOUT_S}s"

    if result.returncode != 0:
        return f"exit code {result.returncode}\n{result.stderr.strip()}"
    expected = sample.get("expectedOutput")
    if expected is not None and result.stdout.rstrip() != expected.rstrip():
        return f"output mismatch\n--- expected ---\n{expected.rstrip()}\n--- got ---\n{result.stdout.rstrip()}"
    return None


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")  # Windows consoles default to cp1252
    if not SAMPLES.exists():
        print("✗ .cache/code-samples.json not found — run `pnpm verify:content` first")
        return 1
    samples = json.loads(SAMPLES.read_text(encoding="utf-8"))
    if "--only" in sys.argv:
        needle = sys.argv[sys.argv.index("--only") + 1]
        samples = [s for s in samples if needle in s["source"]]

    python = interpreter()
    needs_django = any(s.get("module") == "django" for s in samples)
    if needs_django and subprocess.run([python, "-c", "import django"], capture_output=True).returncode:
        print(f"✗ Django is not installed for {python}. Run `pnpm setup:py` first.")
        return 1

    skipped = [s for s in samples if "postgres" in s.get("flags", []) and not os.environ.get("VERIFY_POSTGRES_URL")]
    runnable = [s for s in samples if s not in skipped]
    with ThreadPoolExecutor(max_workers=min(8, os.cpu_count() or 2)) as pool:
        errors = list(pool.map(lambda s: check(s, python), runnable))
    failures = [(s["source"], err) for s, err in zip(runnable, errors) if err]
    ran = sum(1 for s in runnable if not {"norun", "repl"} & set(s.get("flags", [])))
    if failures:
        for source, err in failures:
            print(f"✗ {source}: {err}\n")
        print(f"✗ {len(failures)} of {len(samples)} code samples failed")
        return 1
    version = subprocess.run([python, "-c", "import sys; print(sys.version.split()[0])"], capture_output=True, text=True).stdout.strip()
    print(f"✓ {len(runnable)} code samples OK ({ran} executed) on Python {version}")
    if skipped:
        print(f"! {len(skipped)} PostgreSQL samples skipped: set VERIFY_POSTGRES_URL to run them")
    return 0


if __name__ == "__main__":
    sys.exit(main())
