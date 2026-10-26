"""Run every Python code sample found in content/ (see `pnpm verify:content`).

Each sample runs in its own isolated interpreter (`python -I`) with a timeout.
A sample fails if it raises, times out, prints something other than its "Output"
block, or contains `>>>` prompts without the `repl` flag (code must be paste-ready).
"""

from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SAMPLES = ROOT / ".cache" / "code-samples.json"
TIMEOUT_S = 60


def check(sample: dict) -> str | None:
    """Return an error message, or None if the sample passes."""
    code: str = sample["code"]
    flags: list[str] = sample.get("flags", [])
    if "repl" not in flags and any(line.lstrip().startswith(">>>") for line in code.splitlines()):
        return "contains '>>>' prompts; code must be paste-ready (or mark the fence `repl`)"
    if "norun" in flags or "repl" in flags:
        return None

    with tempfile.TemporaryDirectory() as tmp:
        script = Path(tmp) / "sample.py"
        script.write_text(code, encoding="utf-8")
        try:
            result = subprocess.run(
                [sys.executable, "-I", str(script)],
                capture_output=True,
                text=True,
                timeout=TIMEOUT_S,
                cwd=tmp,
                encoding="utf-8",
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
    failures = [(s["source"], err) for s in samples if (err := check(s))]
    ran = sum(1 for s in samples if not {"norun", "repl"} & set(s.get("flags", [])))
    if failures:
        for source, err in failures:
            print(f"✗ {source}: {err}\n")
        print(f"✗ {len(failures)} of {len(samples)} code samples failed")
        return 1
    print(f"✓ {len(samples)} code samples OK ({ran} executed) on Python {sys.version.split()[0]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
