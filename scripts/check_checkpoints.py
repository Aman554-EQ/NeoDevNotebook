"""Run every <Checkpoint command="..."> of every project page in its project folder.

A checkpoint fails if the command exits non-zero, or if a pytest command selects no tests.
Part of `pnpm test:projects`, so the commands learners copy are proven to work.
"""

import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from test_projects import settings_module  # noqa: E402
from verify_code_samples import ROOT, interpreter  # noqa: E402

CHECKPOINT = re.compile(r"<Checkpoint\b[^>]*\bcommand=(['\"])(.*?)\1")
CODE = re.compile(r"^code:\s*(\S+)", re.M)


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    python = interpreter()
    failures, count = [], 0
    for page in sorted(ROOT.glob("content/*/projects/*.mdx")):
        text = page.read_text(encoding="utf-8")
        project = ROOT / "projects" / page.parts[-3] / CODE.search(text).group(1)
        for _, command in CHECKPOINT.findall(text):
            count += 1
            args = command.replace("python ", f'"{python}" ', 1)
            env = {"DJANGO_SETTINGS_MODULE": settings_module(project)}
            for line in (project / ".env.example").read_text(encoding="utf-8").splitlines():
                if "=" in line and not line.lstrip().startswith("#"):
                    key, value = line.split("=", 1)
                    env.setdefault(key.strip(), value.strip())
            import os

            result = subprocess.run(args, shell=True, cwd=project, capture_output=True, text=True,
                                    env={**os.environ, **env})
            out = result.stdout + result.stderr
            empty = "pytest" in command and (" passed" not in out)
            if result.returncode != 0 or empty:
                failures.append(f"{page.name}: {command}\n{out[-800:]}")
    for f in failures:
        print("✗", f)
    print(f"{'✗' if failures else '✓'} {count - len(failures)}/{count} project checkpoints pass")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
