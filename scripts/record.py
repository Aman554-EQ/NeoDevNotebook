"""`pnpm record`: run content/<module>/recordings/<name>.py and save what it prints as <name>.json.

A recording drives real framework code (Django's test client, the ORM, SQLite) and prints one JSON
document. Visuals such as the HTTP exchange viewer and the ORM-to-SQL viewer render these files,
so every request, response and query shown on the site really happened.

usage: python scripts/record.py [--check] [name ...]
  --check  fail if any saved recording differs from a fresh run (used by `pnpm verify:code`)
"""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from verify_code_samples import ROOT, interpreter  # noqa: E402


def run(script: Path, python: str) -> str:
    module_dir = script.parent.parent
    with tempfile.TemporaryDirectory() as tmp:
        for helper in [*(module_dir / "support").glob("*.py"), *script.parent.glob("_*.py")]:
            shutil.copy(helper, tmp)
        target = Path(tmp) / "recording.py"
        shutil.copy(script, target)
        result = subprocess.run(
            [python, "-E", "-s", "-X", "utf8", str(target)],
            capture_output=True, text=True, encoding="utf-8", cwd=tmp, timeout=120,
        )
    if result.returncode != 0:
        raise SystemExit(f"✗ {script.relative_to(ROOT)} failed:\n{result.stderr}")
    data = json.loads(result.stdout)
    return json.dumps(data, indent=2, ensure_ascii=False) + "\n"


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    check = "--check" in sys.argv
    names = [a for a in sys.argv[1:] if not a.startswith("--")]
    scripts = sorted(p for p in ROOT.glob("content/*/recordings/*.py") if not p.name.startswith("_"))
    if names:
        scripts = [s for s in scripts if s.stem in names]
    python = interpreter()
    stale = []
    for script in scripts:
        fresh = run(script, python)
        out = script.with_suffix(".json")
        if check:
            if not out.exists() or out.read_text(encoding="utf-8") != fresh:
                stale.append(out.relative_to(ROOT))
        else:
            out.write_text(fresh, encoding="utf-8", newline="\n")
            print(f"✓ {out.relative_to(ROOT)}")
    if stale:
        print("✗ stale recordings (run `pnpm record`):\n  " + "\n  ".join(map(str, stale)))
        return 1
    if check:
        print(f"✓ {len(scripts)} recording(s) up to date")
    return 0


if __name__ == "__main__":
    sys.exit(main())
