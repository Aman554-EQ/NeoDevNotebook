# Part 0: Project Setup: Plan

**Branch:** `setup/part-0` (from `develop`) · **Status:** ✅ Done (approved 2026-10-26, built and tested 2026-10-26). Changes from the plan are listed in [documentation](../../documentation/part-0-setup.md#changes-from-the-plan-and-why)
**Owner decisions already made (2026-10-26):** no login (progress stored in the browser) · copy-only code (no Pyodide) ·
`main` + `develop` + module branches · target hosting **Vercel + Neon**.

---

## 1. Objective & Scope

**Goal:** a working, tested, empty-but-real "NeoDevNotebook" shell that every later part plugs into. This includes the layout,
design system, content pipeline, code blocks with copy, visualization framework, problem and interview views,
search, DB, tests, docs system and branching.

**In scope:** everything in §2.
**Out of scope:** any Python, Django or other teaching content, which belongs to Parts 1 to 6. The only content is a short
**"Start Here: How to use this notebook"** module. It's real content that also exercises every component in tests.

---

## 2. Deliverables Checklist

- [x] Git repo: `main`, `develop`, `setup/part-0`; `.gitignore`, `.gitattributes` (LF), commitlint + Husky
- [x] Next.js (App Router) + TypeScript strict + pnpm, ESLint, Prettier
- [x] Local Postgres 17 in Docker Compose (`dev` DB + separate `test` DB), `.env.example`
- [x] Drizzle ORM schema v1, migrations, seed script
- [x] Content pipeline: MDX lessons + YAML problems/interview Qs, validated with Zod, module **auto-discovery**
- [x] Design system: tokens, fonts, light/dark theme, base UI primitives
- [x] App shell: top bar, module sidebar, mobile drawer, "On this page" outline, breadcrumbs, prev/next, 404
- [x] Lesson components: `CodeBlock` (copy), `Callout`, `Math`, `Reveal` (hint/solution), `DifficultyBadge`, `KeyTakeaways`
- [x] Problem browser and interview browser with filters (difficulty / tag / search), shareable via URL params
- [x] Progress and bookmarks (browser storage), "mark as done" on lessons and problems
- [x] Search: Postgres full-text search API + `Ctrl/⌘ K` search dialog
- [x] **Viz framework:** `VizFrame` (lazy load, skeleton, controls, caption, reduced-motion fallback, SR text) +
      one 2D demo + one 3D demo inside "Start Here"
- [x] Code-sample verification script (runs every Python snippet in content)
- [x] Tests: Vitest + RTL unit tests; Playwright E2E (4 viewports, axe, keyboard, clipboard); Lighthouse check (lab LCP is info-only by owner decision A)
- [x] CI workflow (GitHub Actions; runs once a remote exists)
- [x] Docs: `documentation/part-0-setup.md`, `documentation/guides/adding-a-module.md`, navigation, changelog

---

## 3. Final Tech Stack (with justification)

| Concern         | Choice                                                                     | Why                                                                                  |
| --------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Framework       | **Next.js 16 (App Router)**, React 19, RSC-first                           | Static generation means instant pages; first-class on Vercel                         |
| Language        | **TypeScript `strict`**                                                    | Catches content and schema mistakes at build time                                    |
| Package manager | **pnpm** (installed, v11.5)                                                | Fast installs that use less disk                                                     |
| Styling         | **Tailwind CSS v4** + CSS-variable design tokens                           | No runtime cost; one place for tokens; easy theming                                  |
| UI primitives   | **shadcn/ui (Radix)**, only the components we use                          | Accessible dialogs, menus and tabs; we own the code                                  |
| Content         | **MDX** (lessons) + **YAML** (problems, interview Qs) checked with **Zod** | Content lives in Git, can be reviewed per branch, and is checked at build            |
| Code highlight  | **Shiki** at build time (`rehype-pretty-code`)                             | Zero client JS; VS Code-quality themes for light and dark                            |
| Math            | **KaTeX** at build time (`remark-math` + `rehype-katex`)                   | Fast, server-rendered equations                                                      |
| 2D animation    | **Motion** (Framer Motion) + SVG; **D3** helpers for charts                | Smooth, declarative, supports reduced motion                                         |
| 3D              | **three.js + @react-three/fiber + drei**, lazy-loaded                      | React-friendly 3D, loaded only when in view                                          |
| Database        | **PostgreSQL 17** (Docker) + **Drizzle ORM**                               | Lightweight and typed; switches to the Neon driver with only a `DATABASE_URL` change |
| Search          | Postgres full-text search (`tsvector` + GIN index)                         | No extra service                                                                     |
| Theme           | `next-themes`                                                              | No flash of the wrong theme                                                          |
| Unit tests      | **Vitest + React Testing Library**                                         | Fast and ESM-native                                                                  |
| E2E             | **Playwright** + `@axe-core/playwright`                                    | Real-browser tests, clipboard checks, accessibility scans                            |
| Perf            | Lighthouse CI (`@lhci/cli`) on a production build                          | Enforces the performance budgets                                                     |
| Quality         | ESLint, Prettier, `tsc --noEmit`, Husky + lint-staged, commitlint          | Keeps every branch consistent                                                        |

**Architecture decision: why content lives in Git _and_ in Postgres.**
Content is written as files in the repo, so each module branch carries its own content and merges cleanly. At build
time, pages are **statically generated from those files**, so reading a page never waits on the DB. A seed script
copies the content into **Postgres**, which powers **full-text search** now and stores **accounts, progress and
analytics** later. When we move to Neon, only `DATABASE_URL` changes.

---

## 4. Repository Structure

```
/
├─ soul.md · initial-prompt.md · README.md
├─ plan/ · documentation/ · changelog/ · navigation/
├─ content/
│  └─ <module>/                       ← one folder per module (auto-discovered)
│     ├─ module.yaml                  ← title, order, part, icon, description
│     ├─ lessons/NN-slug.mdx
│     ├─ problems/*.yaml
│     └─ interview/*.yaml
├─ src/
│  ├─ app/                            ← routes (see §6)
│  ├─ components/{ui,layout,lesson,problem,interview,viz}/
│  │  └─ viz/<module>/                ← module-specific visualizations
│  ├─ lib/{content,search,progress,utils}/
│  └─ db/{schema.ts,client.ts,migrations/,seed.ts}
├─ scripts/verify-code-samples.py     ← executes every Python snippet
├─ tests/{unit/,e2e/<module>/}
├─ docker-compose.yml · drizzle.config.ts · .env.example
└─ .github/workflows/ci.yml
```

---

## 5. Step-wise Setup Plan (each step ends with a commit on `setup/part-0`)

| #    | Step                                                                                                           | Acceptance criteria                                                                         |
| ---- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 0.1  | Git init: `main`, `develop`, `setup/part-0`; move docs into the repo                                           | `git branch` shows 3 branches; first commit on `main`                                       |
| 0.2  | Scaffold Next.js + TS strict + Tailwind + ESLint/Prettier + Husky/commitlint                                   | `pnpm dev` serves a page; `pnpm lint` and `pnpm typecheck` pass                             |
| 0.3  | Docker Compose Postgres (port **5434**; 5433 is used by another local project), dev + test DBs, `.env.example` | `docker compose up -d` is healthy; `pnpm db:ping` OK                                        |
| 0.4  | Drizzle schema v1 (§7) + migration + seed                                                                      | `pnpm db:migrate && pnpm db:seed` runs; tables exist                                        |
| 0.5  | Content pipeline: Zod schemas, loaders, module auto-discovery, MDX + Shiki + KaTeX                             | Unit tests: invalid YAML fails the build; modules are found                                 |
| 0.6  | Design system: tokens, fonts, light/dark, UI primitives                                                        | Theme toggle works with no flash; contrast is AA                                            |
| 0.7  | App shell: top bar, sidebar, mobile drawer, TOC, breadcrumbs, prev/next, 404                                   | Works at 360/768/1024/1440; usable by keyboard alone                                        |
| 0.8  | Lesson components: CodeBlock + copy, Callout, Math, Reveal, badges, takeaways                                  | Copy puts the exact code on the clipboard (E2E checks this)                                 |
| 0.9  | Problem & interview browsers with URL filters; detail pages                                                    | Filtering by difficulty/tag works and survives a page reload                                |
| 0.10 | Progress and bookmarks (browser storage) + `/progress` and `/bookmarks` pages                                  | State survives reload; storage failures are handled                                         |
| 0.11 | Search API (Postgres FTS) + `Ctrl/⌘ K` dialog                                                                  | A query returns ranked lessons, problems and Qs                                             |
| 0.12 | Viz framework: `VizFrame` + 2D demo (list append animation) + 3D demo (memory boxes)                           | 3D code isn't in the initial bundle; reduced-motion shows the static version; controls work |
| 0.13 | "Start Here" module (1 lesson, 2 problems, 2 interview Qs, all real content)                                   | Renders end-to-end using every component                                                    |
| 0.14 | Code-sample verification script                                                                                | `pnpm verify:code` runs all Python snippets and passes                                      |
| 0.15 | Full test suite + Lighthouse + CI workflow                                                                     | Everything green; the scores meet the budgets                                               |
| 0.16 | Docs: documentation, adding-a-module guide, navigation, changelog                                              | Files exist and are linked from the navigation index                                        |
| 0.17 | Merge `setup/part-0 → develop → main`, tag `v0.1.0`                                                            | Tests pass on `develop` before merging to `main`                                            |

---

## 6. Routes

| Route                                              | Purpose                                                           | Rendering                          |
| -------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------- |
| `/`                                                | Home: learning path across all parts, continue where you left off | Static                             |
| `/learn/[module]`                                  | Module overview: lessons, problem/interview counts                | Static                             |
| `/learn/[module]/[lesson]`                         | Lesson page                                                       | Static                             |
| `/practice/[module]` · `/practice/[module]/[id]`   | Problem browser · problem detail                                  | Static (filters run on the client) |
| `/interview/[module]` · `/interview/[module]/[id]` | Interview browser · Q detail                                      | Static                             |
| `/progress` · `/bookmarks`                         | Personal pages (browser storage)                                  | Client                             |
| `/api/search?q=`                                   | Full-text search                                                  | Dynamic (Postgres)                 |
| `not-found`                                        | 404 page with search                                              | Static                             |

---

## 7. DB Schema v1 (Drizzle / Postgres)

```
modules            (id PK, slug UQ, title, part, sort_order, description)
lessons            (id PK, module_id FK, slug, title, sort_order, est_minutes, difficulty, summary, body_text,
                    search tsvector GENERATED, UQ(module_id, slug))
tags               (id PK, slug UQ, label)
problems           (id PK text e.g. 'py-p-017', module_id FK, title UQ-per-module, difficulty ENUM(easy,simple,medium,hard),
                    statement, solution_code, explanation, complexity, search tsvector GENERATED)
interview_questions(id PK text, module_id FK, question, short_answer, detailed_answer, code, difficulty,
                    search tsvector GENERATED)
problem_tags / interview_tags (join tables)
-- ready for later accounts (created now, unused in v1):
users              (id uuid PK, email UQ, created_at)
progress           (user_id FK, item_type, item_id, status, updated_at, PK(user_id,item_type,item_id))
bookmarks          (user_id FK, item_type, item_id, created_at, PK(...))
```

GIN indexes on every `search` column. The seed is idempotent (an upsert keyed on IDs).

---

## 8. Design System (proposal)

**Feel:** paper notebook by day, slate study-lamp by night.

| Token                                     | Light                                                               | Dark                      |
| ----------------------------------------- | ------------------------------------------------------------------- | ------------------------- |
| `--bg` (paper)                            | `#FBFAF7`                                                           | `#0F1216`                 |
| `--surface` (card)                        | `#FFFFFF`                                                           | `#161B22`                 |
| `--ink` (text)                            | `#1C1B19`                                                           | `#E6E4DF`                 |
| `--muted`                                 | `#5F5B53`                                                           | `#9AA3AE`                 |
| `--rule` (notebook lines/borders)         | `#E7E3DA`                                                           | `#262D36`                 |
| `--accent` (links, focus)                 | `#4F46E5` indigo                                                    | `#8B93FF`                 |
| `--highlight` (marker)                    | `#FFF3B0`                                                           | `#3A3415`                 |
| Difficulty: easy / simple / medium / hard | green `#15803D` / teal `#0F766E` / amber `#B45309` / rose `#BE123C` | lighter tints of the same |

**Typography (via `next/font`, self-hosted):** **Inter** for UI and body text (16 to 18px, line-height 1.7) · **Fraunces** for
headings (warm, notebook character) · **JetBrains Mono** for code (ligatures off for clarity).
Type scale: 1.25 ratio. Spacing: 4px base (4/8/12/16/24/32/48/64). Radius: 10px cards, 6px controls.

**Components:** TopBar, Sidebar/Drawer, TOC, Breadcrumbs, PrevNext, CodeBlock, Callout (Tip/Warning/Intuition/Math),
Reveal, DifficultyBadge, TagChip, FilterBar, ProblemCard, InterviewCard, ProgressRing, VizFrame, SearchDialog.

**Skills note:** this environment has a **dataviz** skill, which I'll use for charts such as loss curves and
distributions. It has **no** dedicated frontend-design or 3D skill. The design follows §10 of `soul.md` and
established accessibility practice. If you install a frontend-design or three.js skill, I'll use it.

---

## 9. Test Plan

**Unit (Vitest + RTL):** Zod content schemas (valid and invalid), module discovery, lesson ordering/prev-next,
filter logic, progress store (including storage throwing), CodeBlock copy (mock clipboard), Reveal, DB queries against
the **test DB** only.

**E2E (Playwright, Chromium; projects at 360 / 768 / 1024 / 1440):**

1. Home → module → lesson → next lesson (sidebar, breadcrumbs, prev/next, deep link)
2. Mobile drawer opens, traps focus, and closes with Esc
3. Code block **copy** → clipboard equals the source exactly; a "Copied" toast appears
4. Problem browser: filter by difficulty and tag → URL updates → reload keeps the filters → reveal hint/solution → copy
5. Interview browser: expand, bookmark, then `/bookmarks` lists it after a reload
6. Search: `Ctrl K`, type, results, Enter navigates
7. Viz: the 3D chunk isn't requested before scrolling; play/pause/step/reset work; `reducedMotion: 'reduce'` shows the static fallback
8. Theme toggle persists; no console errors on any page
9. **axe** scan on every page type: 0 serious/critical violations; keyboard-only run through a lesson
10. 404 page renders for unknown routes
11. Content integrity: no duplicate IDs or titles; counts match `module.yaml`

**Performance:** Lighthouse mobile on home, a lesson and the problem browser. Budgets as in `soul.md` §11.

---

## 10. Risks & Open Questions

| #   | Item                                                            | My default if you don't say otherwise                      |
| --- | --------------------------------------------------------------- | ---------------------------------------------------------- |
| R1  | Next.js 16 / Tailwind 4 APIs may differ from older tutorials    | Pin exact versions; follow the official docs               |
| R2  | Docker Desktop must be running for the DB and DB tests          | The app still renders without the DB; only search needs it |
| Q1  | Site name                                                       | ✅ **NeoDevNotebook**                                      |
| Q2  | GitHub remote                                                   | ✅ https://github.com/Aman554-EQ/NeoDevNotebook.git        |
| Q3  | Part 2 interview count: 50+ in total, or 50+ **per framework**? | Ask in the Part 2 plan                                     |
| Q4  | Part 6: one `module/ml` branch, or a separate `module/llm`?     | Ask in the Part 6 plan                                     |

---

## 11. Suggestions (not included; build only if you ask)

- Spaced-repetition flashcards made from the interview Qs
- A printable "cheat sheet" export per module
- Login and progress synced to the DB (the schema is ready)

---

**Approval:** ✅ Approved by owner on 2026-10-26 ("proceed").
