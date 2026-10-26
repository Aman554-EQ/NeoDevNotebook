# Navigation: Master Map

Where everything lives. Update this whenever a module, lesson, route, component or test is added or moved.

## Project control files

| What                  | Path                                                     |
| --------------------- | -------------------------------------------------------- |
| Rulebook (read first) | [../soul.md](../soul.md)                                 |
| Original brief        | [../initial-prompt.md](../initial-prompt.md)             |
| Roadmap & plan status | [../plan/README.md](../plan/README.md)                   |
| Documentation index   | [../documentation/README.md](../documentation/README.md) |
| Changelog             | [../changelog/](../changelog/)                           |
| Per-part maps         | [part-0-setup.md](part-0-setup.md)                       |

## Branches

| Branch          | Purpose                                                                   | Status                             |
| --------------- | ------------------------------------------------------------------------- | ---------------------------------- |
| `main`          | Releases (tag per part)                                                   | v0.1.0 = Part 0                    |
| `develop`       | Integration                                                               | Part 0 merged                      |
| `setup/part-0`  | Part 0                                                                    | ✅ merged                          |
| `module/python` | Part 1: Python                                                            | plan written, ⏳ awaiting approval |
| `module/<name>` | One per module (python, django, flask, fastapi, git, docker, pytorch, ml) | created when that part is approved |

## Modules → routes → files → tests

| Part | Module     | Route               | Content               | Visuals                          | E2E               |
| ---- | ---------- | ------------------- | --------------------- | -------------------------------- | ----------------- |
| 0    | Start Here | `/learn/start-here` | `content/start-here/` | `src/components/viz/start-here/` | `tests/e2e/core/` |

## Code map

| Concern                     | Path                                                                               |
| --------------------------- | ---------------------------------------------------------------------------------- |
| Routes (pages, API)         | `src/app/` (`(notebook)/` group = pages with the module sidebar)                   |
| Layout & navigation         | `src/components/layout/`                                                           |
| Lesson components           | `src/components/lesson/`                                                           |
| Practice/interview browser  | `src/components/problem/item-browser.tsx`                                          |
| Search dialog / query       | `src/components/search/`, `src/lib/search/query.ts`, `src/app/api/search/route.ts` |
| Progress & bookmarks        | `src/lib/progress/store.ts`, `src/components/progress/`                            |
| Visualization framework     | `src/components/viz/_shared/` (VizFrame, hooks)                                    |
| Content schemas & loaders   | `src/lib/content/`                                                                 |
| MDX pipeline & highlighting | `src/lib/mdx/`                                                                     |
| Database                    | `src/db/` (schema, client, migrate, seed, migrations)                              |
| Scripts                     | `scripts/` (viz registry, content/code verification, Lighthouse, db ping)          |
| Unit tests / E2E            | `tests/unit/`, `tests/e2e/`                                                        |
| Design tokens               | `src/app/globals.css`                                                              |
