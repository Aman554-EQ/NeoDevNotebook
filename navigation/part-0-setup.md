# Navigation: Part 0 (Setup + Start Here)

## Lessons

| #   | Lesson                  | Route                                       | File                                                        |
| --- | ----------------------- | ------------------------------------------- | ----------------------------------------------------------- |
| 01  | How this notebook works | `/learn/start-here/how-this-notebook-works` | `content/start-here/lessons/01-how-this-notebook-works.mdx` |
| 02  | Why list.append is fast | `/learn/start-here/why-append-is-fast`      | `content/start-here/lessons/02-why-append-is-fast.mdx`      |

## Problems

| ID       | Title                       | Difficulty | File                                        |
| -------- | --------------------------- | ---------- | ------------------------------------------- |
| sh-p-001 | Fix the shared default list | easy       | `content/start-here/problems/sh-p-001.yaml` |
| sh-p-002 | Count the list resizes      | simple     | `content/start-here/problems/sh-p-002.yaml` |

## Interview questions

| ID       | Question                                 | Difficulty | File                                         |
| -------- | ---------------------------------------- | ---------- | -------------------------------------------- |
| sh-i-001 | What does `b = a` do when `a` is a list… | easy       | `content/start-here/interview/sh-i-001.yaml` |
| sh-i-002 | Why is `list.append` O(1) amortized…     | medium     | `content/start-here/interview/sh-i-002.yaml` |

## Visualizations

| Component       | Kind                         | Used in   | Files                                                         |
| --------------- | ---------------------------- | --------- | ------------------------------------------------------------- |
| `NamesViz`      | 3D (three.js) + SVG fallback | Lesson 01 | `src/components/viz/start-here/names-*.tsx`, `names-model.ts` |
| `ListAppendViz` | 2D (motion)                  | Lesson 02 | `src/components/viz/start-here/list-append-*.tsx`             |

## E2E specs (`tests/e2e/core/`)

| Spec                 | Covers                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| `navigation.spec.ts` | Home path, prev/next, breadcrumbs, sidebar state, all routes 200, 404s                           |
| `mobile-nav.spec.ts` | Drawer focus trap, Escape, navigation (< 1024px)                                                 |
| `lesson.spec.ts`     | Template sections, copy → clipboard, no ligatures, line highlights, KaTeX, outline, mark-as-done |
| `practice.spec.ts`   | URL filters + reload, status filter, hints/solution reveal, explanation below code, copy         |
| `interview.spec.ts`  | Quick answers, answer reveal, bookmarks round-trip                                               |
| `search.spec.ts`     | Ctrl+K, keyboard selection, empty state, Escape                                                  |
| `viz.spec.ts`        | three.js not in initial JS, lazy 3D, controls, keyboard, reduced-motion fallback                 |
| `theme-a11y.spec.ts` | Theme persistence, no flash, axe light/dark on 13 pages, skip link, no horizontal scroll         |
