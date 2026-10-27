"""`pnpm test:projects`: run every guided project's own checks (projects/<module>/<name>/).

For each project with a pytest.ini:
  1. its test suite (pytest, warnings are errors, fake values from .env.example)
  2. `makemigrations --check`: models and committed migrations agree (Django projects)
Then the Postman collections and OpenAPI files must be up to date (scripts/gen_postman.py --check).

Set SHOPLITE_TEST_DATABASE_URL to also run ShopLite against PostgreSQL (CI does).
usage: python scripts/test_projects.py [name ...]
"""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from verify_code_samples import ROOT, interpreter  # noqa: E402


def settings_module(project: Path) -> str:
    for line in (project / "pytest.ini").read_text(encoding="utf-8").splitlines():
        if line.startswith("DJANGO_SETTINGS_MODULE"):
            return line.split("=", 1)[1].strip()
    return ""


def run(cmd: list[str], cwd: Path, env: dict[str, str]) -> tuple[bool, str]:
    result = subprocess.run(cmd, cwd=cwd, env=env, capture_output=True, text=True, encoding="utf-8")
    return result.returncode == 0, (result.stdout + result.stderr).strip()


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    names = [a for a in sys.argv[1:] if not a.startswith("-")]
    projects = sorted(p.parent for p in ROOT.glob("projects/*/*/pytest.ini"))
    if names:
        projects = [p for p in projects if p.name in names]
    python = interpreter()
    base_env = {k: v for k, v in os.environ.items() if k != "DJANGO_SETTINGS_MODULE"}
    failed = []
    for project in projects:
        label = project.relative_to(ROOT).as_posix()
        ok, out = run([python, "-m", "pytest", "-p", "no:cacheprovider"], project, base_env)
        summary = out.splitlines()[-1] if out else ""
        print(f"{'✓' if ok else '✗'} {label}: {summary}")
        if not ok:
            failed.append(label)
            print(out)
        if (project / "manage.py").exists():
            env = {**base_env, "DJANGO_SETTINGS_MODULE": settings_module(project)}
            # The test settings load .env.example only under pytest, so pass the fake values here.
            for line in (project / ".env.example").read_text(encoding="utf-8").splitlines():
                if "=" in line and not line.lstrip().startswith("#"):
                    key, value = line.split("=", 1)
                    env.setdefault(key.strip(), value.strip())
            ok, out = run([python, "manage.py", "makemigrations", "--check", "--dry-run"], project, env)
            if not ok:
                failed.append(f"{label} (migrations)")
                print(f"✗ {label}: models changed without a migration\n{out}")
    ok, out = run([python, str(ROOT / "scripts" / "gen_postman.py"), "--check"], ROOT, base_env)
    print(out)
    if not ok:
        failed.append("postman/openapi")
    if failed:
        print(f"✗ failed: {', '.join(failed)}")
        return 1
    print(f"✓ {len(projects)} project(s) green")
    return 0


if __name__ == "__main__":
    sys.exit(main())
