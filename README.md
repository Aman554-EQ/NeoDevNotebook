# NeoDevNotebook

A fast, visual, tutor-style **digital notebook** for Python, Django · Flask · FastAPI, Git, Docker,
PyTorch, machine learning and LLMs. Every topic goes **concept → visual → example → explanation →
practice**, with copy-ready code, practice problems and interview answers.

> Read [`soul.md`](soul.md) first. It holds the project rules. The roadmap and plan status are in
> [`plan/README.md`](plan/README.md), and [`navigation/README.md`](navigation/README.md) maps where everything lives.

## Quick start

Requirements: Node ≥ 22, pnpm, Docker Desktop (running) and Python 3.11+ (to verify code samples).

```bash
pnpm install
cp .env.example .env.local      # Windows PowerShell: Copy-Item .env.example .env.local
pnpm db:up                      # Postgres 17 in Docker on port 5434
pnpm db:setup                   # migrate + seed the search index from content/
pnpm dev                        # http://localhost:3000
```

## Everyday commands

| Command                    | What it does                                                                  |
| -------------------------- | ----------------------------------------------------------------------------- |
| `pnpm dev`                 | Dev server                                                                    |
| `pnpm build && pnpm start` | Production build and server                                                   |
| `pnpm check`               | lint + typecheck + unit tests + content/code verification                     |
| `pnpm test:e2e`            | Production build + Playwright E2E at 360/768/1024/1440 px (needs the DB)      |
| `pnpm verify:code`         | Validates content and runs every Python sample                                |
| `pnpm perf [url]`          | Lighthouse budgets against a running server (default `http://localhost:3000`) |
| `pnpm db:seed`             | Re-sync the search index after changing content                               |

## Branches

`main` holds releases, `develop` is for integration, and each module gets its own `module/<name>` branch.
See [`documentation/guides/adding-a-module.md`](documentation/guides/adding-a-module.md).
