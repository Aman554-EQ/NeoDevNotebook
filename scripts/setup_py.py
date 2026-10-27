"""`pnpm setup:py`: create .venv-verify/ with the exact packages in requirements-verify.txt.

The code verifier and the project test suites use this environment, so your global Python stays
untouched. Safe to re-run: it reuses the folder and only installs what changed.
"""

import subprocess
import sys
import venv
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VENV = ROOT / ".venv-verify"


def main() -> int:
    if sys.version_info < (3, 13):
        print(f"✗ Python 3.13+ is required (this is {sys.version.split()[0]})")
        return 1
    if not VENV.exists():
        print(f"Creating {VENV.name}/ ...")
        venv.create(VENV, with_pip=True)
    python = VENV / ("Scripts/python.exe" if sys.platform == "win32" else "bin/python")
    subprocess.run([python, "-m", "pip", "install", "-q", "--upgrade", "pip"], check=True)
    subprocess.run([python, "-m", "pip", "install", "-q", "-r", ROOT / "requirements-verify.txt"], check=True)
    print(f"✓ {VENV.name}/ is ready ({python})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
