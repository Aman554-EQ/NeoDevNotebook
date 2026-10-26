# Part 1: Python (documentation)

**Branch:** `module/python` · **Built:** 2026-10-26/27 · **Plan:** [plan/part-1-python/plan.md](../plan/part-1-python/plan.md)

## What was built

| Area        | Delivered                                                                                                                                                        |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lessons     | **36** in 5 sections: Basics (10), Data Structures (9), Core Language (8), Packages, Imports & Tooling (5), Debugging (4)                                        |
| Visuals     | **6 3D scenes** (MemoryViz, ListArrayViz, DictTableViz, DequeViz, HeapViz, shared CallStack) + **16 2D visuals** + the trace-driven **Code Stepper** (8 lessons) |
| Practice    | **60 problems**, 15 per tier (easy / simple / medium / hard), **8** find-and-fix-the-bug                                                                         |
| Interview   | **56 questions**: 9 easy · 14 simple · 21 medium · 12 hard                                                                                                       |
| Cross-links | Every lesson lists related problems and interview questions ("Practise this lesson")                                                                             |

Every code sample, solution (plus hidden asserts), interview snippet and recorded trace runs on **Python 3.13**
in `pnpm verify:code`: 172 samples (158 executed) and 10 traces.

## Platform features added in this part (usable by every later part)

1. **Lesson sections:** optional `section:` front matter. It groups lessons in the sidebar (collapsible) and on the
   module page. A section split across non-consecutive lessons fails the build.
2. **Recorded traces + Code Stepper:** `content/<module>/traces/<name>.py` is recorded by
   `scripts/trace_python.py` (`pnpm traces`) into a committed `<name>.trace.json`. It contains lines, frames,
   address-free reprs, stdout, and **call / return / exception / yield / resume** events. `pnpm verify:code` fails
   if a trace is missing, stale or orphaned. In MDX: `<CodeStepper trace="…" title="…" caption="…" />` and
   `<CallStack trace="…" … />`. Traces are excluded from Prettier (byte-exact comparison).
3. **Content targets:** `targets:` in `module.yaml` (lessons, problems, interview, per-difficulty minimums), enforced
   by `pnpm verify:content` and unit tests.
4. **Lesson → practice links:** `practice:` and `interview:` ID lists in lesson front matter. Missing IDs fail the
   build, and the lesson page renders them automatically.
5. **Shared three.js toolkit** (`src/components/viz/_shared/three/toolkit.tsx`): theme colours, `TextFace`,
   camera-facing `NameTag3D`, and `SceneStage` with a `fitWidth` camera for narrow screens.
6. **VizFrame:** optional `badge`, and a progress bar for long step sequences.
7. **Inline code in titles:** `` `code` `` in question and problem titles renders as code. Page titles,
   bookmarks, prev/next and search show plain text.
8. **Practice browser:** long tag lists collapse to the 10 most-used tags, with an "All N tags" toggle.

## Architecture decisions

- **Visual models are data, verified against CPython.** Each 3D/2D scene is driven by a TypeScript model (frames +
  narration). Claims about CPython internals are checked against real Python on every test run
  (`tests/unit/viz-models.test.ts`): heap arrays (`heapq`), list capacities (`sys.getsizeof`), deque states, and dict
  probe paths. `SliceRulerViz` reimplements slicing and is tested against 847 CPython results.
- **Traces are committed, not generated at build time.** That keeps the Vercel build free of Python, and the
  stale-trace check keeps them honest.
- **Problem and interview authoring** used a local builder that ran every solution with its hidden asserts before
  writing the YAML. The YAML files are the source of truth, and the builder isn't part of the repo.
- **Text in 3D scenes** is drawn as canvas textures (`TextFace`, `NameTag3D`). drei's `Html` overlay doesn't mount
  for elements present on a canvas's first render (found and fixed in this part, including Start Here).

## How to run and test

```bash
pnpm dev                    # http://localhost:3000/learn/python
pnpm traces                 # re-record traces after editing content/python/traces/*.py
pnpm check                  # lint + typecheck + unit + content + code + traces
pnpm test:e2e               # build + Playwright (4 viewports)
pnpm db:seed                # refresh the search index after content changes
```

## Test results (2026-10-27)

| Suite                        | Result                                                                                 |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| ESLint, Prettier, `tsc`      | ✅ clean                                                                               |
| Vitest (14 files)            | ✅ **79 / 79** (incl. viz models vs CPython, traces, content rules, internal links)    |
| verify:code                  | ✅ **172 samples** (158 executed) + **10 traces** up to date                           |
| Playwright (4 viewports)     | ✅ **557 passed**, 239 skipped by design                                               |
| Lighthouse (8 pages, mobile) | ✅ Performance 90–97, Accessibility 100, Best Practices 100, CLS ≤ 0.015, TBT ≤ 162 ms |

## Known limitations

- Lab LCP is 2.4–3.4 s (informational by owner decision A; the field budget applies once deployed). The home page's
  Performance score is at the 90 threshold.
- `ConcurrencyViz` is schematic (abstract time slots, labelled "not measured").
- Version-specific details (bytecode, error messages, the traceback format, the pdb transcript) are from CPython
  3.13. They're verified there and labelled in the lessons.
- `DequeViz` draws 4-slot blocks for clarity (CPython uses 64), and says so in its caption.

## How to extend

Add a lesson as `content/python/lessons/NN-slug.mdx` with `section`, `practice` and `interview`. Add a trace under
`content/python/traces/` and run `pnpm traces`. Add problems/interview YAML with hidden `verify:` asserts. See
[guides/adding-a-module.md](guides/adding-a-module.md) for the general module workflow.
