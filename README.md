# NeoDevNotebook

A fast, visual, tutor-style **digital notebook** for Python, Django · Flask · FastAPI, Git, Docker,
PyTorch, machine learning and LLMs. Every topic goes **concept → visual → example → explanation →
practice**, with copy-ready code, practice problems and interview answers.

> Project rules (`soul.md`), plans (`plan/`), documentation (`documentation/`), the file map
> (`navigation/`) and session notes (`changelog/`) are kept on the maintainer's machine and are not
> part of this repository (see `.gitignore`).

## Quick start

Requirements: Node ≥ 22, pnpm, Docker Desktop (running) and Python 3.13 (to verify code samples).

```bash
pnpm install
cp .env.example .env.local      # Windows PowerShell: Copy-Item .env.example .env.local
pnpm db:up                      # Postgres 17 in Docker on port 5434
pnpm db:setup                   # migrate + seed the search index from content/
pnpm setup:py                   # .venv-verify/ with Django, DRF... for running the code samples
pnpm dev                        # http://localhost:3000
```

## Everyday commands

| Command                    | What it does                                                                  |
| -------------------------- | ----------------------------------------------------------------------------- |
| `pnpm dev`                 | Dev server                                                                    |
| `pnpm build && pnpm start` | Production build and server                                                   |
| `pnpm check`               | lint + typecheck + unit tests + content/code verification                     |
| `pnpm test:e2e`            | Production build + Playwright E2E at 360/768/1024/1440 px (needs the DB)      |
| `pnpm verify:code`         | Validates content, runs every code sample, checks traces and recordings       |
| `pnpm test:projects`       | Runs every guided project's tests, migration check, API files and checkpoints |
| `pnpm record`              | Re-records the HTTP/ORM/SQL recordings behind the visuals                     |
| `pnpm gen:postman`         | Regenerates OpenAPI schemas and Postman collections for the projects          |
| `pnpm perf [url]`          | Lighthouse budgets against a running server (default `http://localhost:3000`) |
| `pnpm db:seed`             | Re-sync the search index after changing content                               |

## Branches

`main` holds releases, `develop` is for integration, and each module gets its own `module/<name>` branch.
Module work is merged into `develop` with `--no-ff` when its full test gate is green; `develop` is merged
into `main` (and tagged) for each release. Vercel deploys `main`.

Code samples that need PostgreSQL run when `VERIFY_POSTGRES_URL` is set (CI sets it); locally:
`$env:VERIFY_POSTGRES_URL="postgres://neo:neo_local_dev@localhost:5434/neodevnotebook"` before
`pnpm verify:code`. Every key in the repository is a fake; real secrets only ever live in environment variables.
