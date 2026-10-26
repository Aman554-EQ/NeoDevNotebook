# Guide: adding a new module

A module is a **plug-in**. It lives in its own folders and is discovered automatically, so a module
branch never edits shared files and merges cleanly.

## 1. Branch

```bash
git checkout develop && git pull
git checkout -b module/<name>          # e.g. module/python
```

## 2. Content (auto-discovered)

```
content/<name>/
├─ module.yaml              # required: makes the folder a module
├─ lessons/01-first-lesson.mdx
├─ problems/<prefix>-p-001.yaml
└─ interview/<prefix>-i-001.yaml
```

`module.yaml`:

```yaml
title: Python
part: 1 # roadmap part (see src/lib/roadmap.ts)
order: 0 # order within the part
description: One sentence shown on cards.
icon: code # compass | code | server | git | container | flame | brain | sparkles
idPrefix: py # 2-4 letters, unique across modules; ids become py-p-001, py-i-001
```

- **Lessons** are `NN-slug.mdx`, with front matter `title, summary, estimatedMinutes, difficulty,
objectives[], prerequisites[], tags[]`. Follow the lesson template in `soul.md` §5.
  Available components: `<Callout type="tip|warning|intuition|math">`, `<Reveal kind="hint|solution" label="…">`,
  `<KeyTakeaways>`, plus your module's visualizations.
- **Code fences**: `python title="file.py" {2,4-5}` sets a title and highlights lines. Add `norun` to skip
  execution, or `repl` to allow `>>>` prompts. A fence followed by ` ```text title="Output" ` is
  checked: the code must print exactly that.
- **Problems and interview questions** follow `src/lib/content/schema.ts`. The file name must equal the id.
  The optional `verify:` field holds hidden asserts that are appended when the code is verified.
- Math: `$inline$` and `$$display$$` (KaTeX). In MDX prose, escape literal `{` and `}`.

## 3. Visualizations (auto-registered)

```
src/components/viz/<name>/
├─ index.ts                 # export const viz = { MyViz, OtherViz }
├─ my-viz.tsx               # light wrapper: <VizFrame …> + next/dynamic scene
└─ my-scene.tsx             # the heavy part (motion / three.js), loaded lazily
```

Rules (from `soul.md` §8):

- Wrap every visual in `VizFrame` with `title`, `caption` ("What to notice") and `steps`
  (`{ label, narration }[]`). The narration is the screen-reader text alternative.
- Read `useViz()` → `{ step, total, reducedMotion }`. Render the scene from `step` only.
- Load the scene with `next/dynamic(() => import("./my-scene"), { ssr: false })` so heavy libraries
  never reach the initial bundle. Scenes that use `motion` wrap themselves in
  `<MotionConfig reducedMotion={reducedMotion ? "always" : "never"}>`.
- 3D: pass `kind="3d"` and a static `fallback` (usually an SVG that is also driven by `step`).
- Component names must be unique across modules. `pnpm gen:viz` fails on duplicates.

## 4. Tests

- E2E specs go in `tests/e2e/<name>/` and import `test`/`expect` from `../fixtures` (that fixture fails on console errors).
- Add count assertions for the module's targets (for example ≥ 50 problems), plus difficulty distribution checks.
- `tests/e2e/core/theme-a11y.spec.ts` lists the pages to scan. Add your module's representative pages to `ALL_PAGES` in `tests/e2e/fixtures.ts`.

## 5. Done → merge

```bash
pnpm check && pnpm test:e2e        # everything green
git checkout develop && git merge --no-ff module/<name>
pnpm check && pnpm test:e2e        # re-run on develop
git checkout main && git merge --no-ff develop && git tag vX.Y.0
```

Update `plan/`, `documentation/`, `navigation/` and `changelog/` before merging.
