# Part 0: Project Setup: Documentation

**Status:** ✅ Built and tested on `setup/part-0` (2026-10-26) · Plan: [`plan/part-0-setup/plan.md`](../plan/part-0-setup/plan.md)

## What was built

| Area                    | What exists                                                                                                                                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App shell               | Top bar (nav, Ctrl/⌘ K search, theme toggle), module tree sidebar (a drawer below 1024px), breadcrumbs, "On this page" outline with scroll-spy (≥ 1280px), prev/next, skip link, 404                                                  |
| Pages                   | `/`, `/learn`, `/learn/[module]`, `/learn/[module]/[lesson]`, `/practice`, `/practice/[module]`, `/practice/[module]/[id]`, `/interview`, `/interview/[module]`, `/interview/[module]/[id]`, `/progress`, `/bookmarks`, `/api/search` |
| Content pipeline        | `content/<module>/` auto-discovered; MDX lessons + YAML problems/interview Qs validated with Zod; integrity checks (unique ids/titles, id prefixes)                                                                                   |
| Lesson components       | `CodeBlock` (Shiki at build time + copy button), `Callout`, `Reveal` (native `<details>`), `KeyTakeaways`, `LessonHeader`, badges, KaTeX math                                                                                         |
| Visualization framework | `VizFrame`: lazy mount, play/pause/step/previous/reset, aria-live narration, "What to notice", reduced-motion and no-WebGL fallback; auto-generated registry                                                                          |
| Demo visuals            | `ListAppendViz` (2D, motion): CPython list growth · `NamesViz` (3D, three.js): names → objects, with an SVG fallback                                                                                                                  |
| Practice & interview    | Filterable browsers (difficulty / tag / text / status kept in the URL), detail pages with hints, solution, explanation below the code, complexity, pitfalls and follow-ups                                                            |
| Progress                | Mark-as-done and bookmarks in `localStorage` (guarded for private mode); progress rings; "continue where you left off"                                                                                                                |
| Database                | Postgres 17 (Docker, port 5434) + Drizzle; schema v1 with `tsvector` + GIN full-text search; idempotent seed; accounts-ready tables                                                                                                   |
| Quality                 | ESLint, Prettier, `tsc` strict, Husky + lint-staged + commitlint, GitHub Actions CI                                                                                                                                                   |
| "Start Here" module     | 2 lessons, 2 problems, 2 interview questions: real content that exercises every component                                                                                                                                             |

## Architecture decisions

1. **Content in Git, pages fully static.** Every lesson, problem and question page is prerendered.
   `ensureStatic = "navigation"` makes the **build fail** if a page would need request-time rendering.
   The DB is a searchable copy (`pnpm db:seed`). Reading pages never touches it.
2. **Next.js 16 Cache Components.** Content loaders use `'use cache'`. `dynamicParams` is not available,
   so unknown ids call `notFound()` (returns 404).
3. **MDX compiled on the server with `@mdx-js/mdx`** instead of `@next/mdx`. Turbopack can't pass
   function-based rehype plugins, and we need custom plugins (fenced code → `CodeBlock`, focusable math, outline).
4. **One `CodeBlock` everywhere** (lessons and YAML markdown). It copies exactly the source and uses no ligatures, so what
   you see is what you paste. It uses the GitHub _high-contrast_ themes to meet WCAG AA.
5. **Visual JS is lazy.** Scenes (motion, three.js) load through `next/dynamic` only when scrolled near.
   An E2E test asserts `WebGLRenderer` is absent from every initial script.
6. **Modules are plug-ins.** Content folders and `src/components/viz/<module>/` are auto-discovered, so
   module branches don't touch shared files.

## Changes from the plan (and why)

| Plan said            | Built                                                 | Why                                                        |
| -------------------- | ----------------------------------------------------- | ---------------------------------------------------------- |
| `next-themes`        | ~10-line inline `ThemeScript` + toggle                | No dependency; sets the theme before first paint (tested)  |
| shadcn/ui            | `radix-ui` primitives directly (Dialog)               | Only two components needed; same accessibility, less code  |
| `rehype-pretty-code` | Custom rehype plugin + Shiki                          | Shares one `CodeBlock` with YAML content; exact copy text  |
| `@lhci/cli`          | `lighthouse` + `chrome-launcher` script (`pnpm perf`) | Lighter; uses Playwright's Chromium                        |
| Postgres port 5433   | **5434**                                              | 5433 is used by another local project (`bandly-db`)        |
| D3 helpers           | Not installed yet                                     | Not needed for Part 0; will be added when a chart needs it |

## How to run and test

See the [README](../README.md). The full gate is `pnpm check && pnpm test:e2e`.

## Test results (final run, 2026-10-26)

| Suite                                     | Result                                                                                                                            |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| ESLint / Prettier / `tsc --noEmit`        | ✅ clean                                                                                                                          |
| Vitest (6 files)                          | ✅ **40 / 40** (content loader, MDX pipeline, samples, progress store, components, DB seed + search on the test DB)               |
| Content + code verification               | ✅ 6 samples, 5 executed on Python 3.13 (1 is an intentionally buggy `norun` snippet)                                             |
| Playwright (4 viewports)                  | ✅ **269 passed**, 7 skipped by design (viewport-specific checks)                                                                 |
| axe (13 pages × light/dark × 4 viewports) | ✅ 0 serious/critical                                                                                                             |
| Lighthouse mobile                         | ✅ Performance 90–97, Accessibility 100, Best Practices 100, CLS ≤ 0.015, TBT ≤ 140 ms · lab LCP 2.6–3.5 s (info only, see below) |

## Known limitations

- **Lab LCP is above the 2.5 s budget** under Lighthouse's simulated slow 4G. The observed (unthrottled)
  LCP is 66–262 ms, at the same time as first paint. The simulation charges LCP with every byte requested
  before first paint, which is mostly Next.js/React's fixed runtime (~120 KB gz). Already done: zod removed from
  client JS (−25 KB gz), lazy visualization scenes, a single Fraunces weight, `display: optional` fonts.
  Tried with no effect, so reverted: inlined CSS, no font preload. **Owner decision (2026-10-26, option A):**
  LCP < 2.5 s is a field budget (real users, p75, e.g. Vercel Speed Insights once deployed); lab LCP is
  reported but no longer fails `pnpm perf` (soul.md §11).
- Search needs the database. If it's unreachable, the dialog shows a clear "Search is unavailable" message.
- `pnpm` in Git Bash on this machine resolves the wrong `cygpath` (Anaconda), so the Git hooks call `node` directly.

## How to extend

Follow [`guides/adding-a-module.md`](guides/adding-a-module.md).
