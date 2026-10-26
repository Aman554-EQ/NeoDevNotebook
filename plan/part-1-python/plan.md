# Part 1: Python: Plan

**Branch:** `module/python` (from `develop`) · **Status:** 🔨 In progress (✅ Approved 2026-10-26)
**Module:** `content/python/` · idPrefix `py` · route `/learn/python`

---

## 1. Objective & Scope

**Goal:** a complete, visual Python module that takes a learner from "first script" to "confident in a Python
interview". Every lesson follows the template in `soul.md` §5 and has at least one visualization. Every
code sample is executed and verified.

**In scope**

- 36 lessons in 5 sections: Basics · Data Structures · Core Language · Packages, Imports & Tooling · Debugging
- 60 unique practice problems (15 easy · 15 simple · 15 medium · 15 hard), 8 of them "find and fix the bug"
- 56 interview questions with short answer, detailed answer, code, pitfalls and follow-ups
- 6 new 3D scenes and 16 2D visuals, plus a **trace-driven Code Stepper** that replays real Python execution
- Three small platform upgrades the module needs (§6)

**Out of scope:** running Python in the browser (soul.md §14), Django/Flask/FastAPI (Part 2), NumPy/pandas.

**Target Python version:** **3.13**, the version installed and used by `pnpm verify:code`. Where behaviour differs
between versions (for example `dis` output or error-message wording), the lesson says so.

---

## 2. Deliverables Checklist

- [ ] Platform: lesson **sections** in the sidebar and module page (§6.1)
- [ ] Platform: **Code Stepper** with traces recorded from real execution (§6.2)
- [ ] Platform: **content targets** in `module.yaml`, enforced by tests (§6.3)
- [ ] 36 lessons (§3), each with a visual, worked example, common mistakes, practice links and takeaways
- [ ] 6 3D scenes + 16 2D visuals (§4), each with controls, a caption, narration and a static fallback
- [ ] 60 problems (§5.1), each with solution code, explanation **below** the code, complexity and hidden test asserts
- [ ] 56 interview questions (§5.2)
- [ ] Every code sample, solution and trace verified on Python 3.13
- [ ] Unit + E2E tests (§8), all green at 4 viewports
- [ ] Docs: `documentation/part-1-python.md`, `navigation/part-1-python.md`, changelog, plan status

---

## 3. Content Outline: 36 lessons

Est. = estimated learner minutes. Visual codes are explained in §4.

### Section A: Basics (10 lessons)

| #   | Lesson                          | Covers                                                                                                      | Visual          | Est. |
| --- | ------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------- | ---- |
| 01  | How Python runs your code       | REPL vs script, `python -m`, source → bytecode → interpreter, `dis`, `__pycache__`                          | 2D BytecodePipe | 12   |
| 02  | Variables, objects & types      | names vs objects, `id`/`type`/value, dynamic + strong typing, `isinstance`, `None`                          | 3D MemoryGraph  | 15   |
| 03  | Numbers & operators             | int (arbitrary size), float precision (`0.1 + 0.2`), `//` `%` `**` `divmod`, precedence, `decimal`, bitwise | 2D FloatBits    | 15   |
| 04  | Strings                         | immutability, indexing, slicing, methods, f-strings, `bytes` vs `str`, Unicode/encoding                     | 2D SliceRuler   | 18   |
| 05  | Conditions & `match`            | `if/elif/else`, truthiness, `and`/`or` short-circuit, conditional expression, `match` patterns              | Code Stepper    | 15   |
| 06  | Loops                           | `for`, `while`, `range`, `enumerate`, `zip`, `break`/`continue`, loop `else`                                | Code Stepper    | 15   |
| 07  | Functions                       | `def`, return, positional/keyword/default, `*args`/`**kwargs`, keyword-only, positional-only, docstrings    | 3D CallStack    | 20   |
| 08  | Scope & closures                | LEGB, `global`/`nonlocal`, closures, `lambda`, late binding in loops                                        | 2D ScopeLEGB    | 18   |
| 09  | Recursion                       | base case, call stack depth, `RecursionError`, recursion vs iteration                                       | 3D CallStack    | 15   |
| 10  | Mutability, references & copies | `is` vs `==`, aliasing, shallow vs deep copy, mutable default argument, small-int caching, refcount & GC    | 3D MemoryGraph  | 20   |

### Section B: Data Structures (9 lessons)

| #   | Lesson                           | Covers                                                                                           | Visual           | Est. |
| --- | -------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------- | ---- |
| 11  | Lists in depth                   | dynamic array, operation costs, `insert`/`pop(0)` shifting, `sort` vs `sorted`, `key`, stability | 3D ListArray     | 20   |
| 12  | Tuples & unpacking               | immutability (and its limits), packing/unpacking, star-unpacking, `namedtuple`                   | 2D Unpack        | 12   |
| 13  | Dictionaries                     | hash tables, hashing & collisions, insertion order, methods, dict comprehensions                 | 3D DictHashTable | 22   |
| 14  | Sets                             | hash sets, membership O(1), set algebra, `frozenset`                                             | 2D VennOps       | 12   |
| 15  | Comprehensions & generator exprs | list/dict/set comprehensions, filtering, nested, lazy generator expressions, memory              | 2D CompPipeline  | 15   |
| 16  | Stacks & queues                  | list as stack, why not as queue, `collections.deque`, `maxlen`                                   | 3D Deque         | 15   |
| 17  | Heaps & priority queues          | `heapq`, sift up/down, heap as array, tie-breaking, top-k                                        | 3D Heap          | 18   |
| 18  | The `collections` toolkit        | `Counter`, `defaultdict`, `OrderedDict`, `ChainMap`, `namedtuple` recap                          | 2D CounterBars   | 15   |
| 19  | Choosing a structure & Big-O     | complexity table, `timeit`, measuring growth, picking the right structure                        | 2D BigOChart     | 15   |

### Section C: Core Language (8 lessons)

| #   | Lesson                        | Covers                                                                                              | Visual             | Est. |
| --- | ----------------------------- | --------------------------------------------------------------------------------------------------- | ------------------ | ---- |
| 20  | Iterators & generators        | iteration protocol, `iter`/`next`, `yield`, `yield from`, lazy pipelines                            | Code Stepper       | 20   |
| 21  | Exceptions                    | `try/except/else/finally`, `raise`, custom exceptions, chaining (`from`), `ExceptionGroup`          | 2D ExceptionUnwind | 18   |
| 22  | Context managers              | `with`, `__enter__`/`__exit__`, `contextlib.contextmanager`, cleanup guarantees                     | Code Stepper       | 12   |
| 23  | Decorators                    | functions as objects, wrappers, `functools.wraps`, decorators with arguments                        | 2D DecoratorLayers | 18   |
| 24  | Classes & objects             | `class`, `__init__`, `self`, instance vs class attributes, methods                                  | 3D MemoryGraph     | 18   |
| 25  | Inheritance & special methods | inheritance, `super()`, MRO, dunder methods, `@property`, `classmethod`/`staticmethod`, `dataclass` | 2D MROGraph        | 22   |
| 26  | Files & data formats          | `open` modes, `pathlib`, text vs binary, `json`, `csv`, encodings                                   | Code Stepper       | 15   |
| 27  | Concurrency basics            | the GIL, threads vs processes vs `asyncio`, I/O-bound vs CPU-bound, free-threaded 3.13 note         | 2D ConcurrencyTime | 20   |

### Section D: Packages, Imports & Tooling (5 lessons)

| #   | Lesson                          | Covers                                                                                             | Visual           | Est. |
| --- | ------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------- | ---- |
| 28  | Modules & the import system     | `import` forms, `sys.path`, `sys.modules` cache, `__name__ == "__main__"`, circular imports        | 2D ImportResolve | 18   |
| 29  | Packages & project layout       | `__init__.py`, absolute vs relative imports, `src/` layout, `pyproject.toml`                       | 2D ImportResolve | 15   |
| 30  | pip & virtual environments      | `venv`, `pip install/freeze`, `requirements.txt`, version pins, why isolation matters              | 2D VenvLayers    | 15   |
| 31  | The standard library tour       | `os`, `sys`, `pathlib`, `datetime`, `itertools`, `functools`, `re`, `math`, `random`, `statistics` | Code Stepper     | 20   |
| 32  | Essential commands & type hints | cheat sheet (`python -m venv/pip/timeit/pdb/http.server`, `-i`, `help`, `dir`), type hints, `mypy` | none (reference) | 15   |

### Section E: Debugging (4 lessons)

| #   | Lesson                         | Covers                                                                                                  | Visual           | Est. |
| --- | ------------------------------ | ------------------------------------------------------------------------------------------------------- | ---------------- | ---- |
| 33  | Reading tracebacks             | traceback anatomy, reading bottom-up, chained exceptions, Python 3.13 error hints                       | 2D TracebackMap  | 15   |
| 34  | print, logging & assertions    | when `print` is fine, `logging` levels/handlers/format, `assert`, minimal reproductions                 | Code Stepper     | 15   |
| 35  | pdb & the IDE debugger         | `breakpoint()`, `n`/`s`/`c`/`l`/`p`/`w`, post-mortem `pdb.pm()`, VS Code breakpoints, watch expressions | Code Stepper     | 18   |
| 36  | Error catalogue & bug patterns | 15 common errors with their real 3.13 messages, causes and fixes; off-by-one, aliasing, late binding    | none (reference) | 20   |

> Lessons 32 and 36 are reference pages, where a visual would not clarify anything (soul.md §8).
> Everything else has at least one visual.

---

## 4. Visualization List

### 4.1 New 3D scenes (three.js, lazy-loaded, each with an SVG fallback driven by the same steps)

| Scene               | Used in      | What it shows / why it helps memory                                                                                       |
| ------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| **MemoryGraph3D**   | 02, 10, 24   | Generalises the Start Here names scene: name tags → objects, refcount badges, shallow vs deep copy; instance → class dict |
| **ListArray3D**     | 11           | A contiguous row of slots holding references; spare capacity; `insert(0, x)` visibly shifts every slot                    |
| **DictHashTable3D** | 13 (and 14)  | Key → `hash()` → bucket index; probing on collision; why keys must be hashable                                            |
| **CallStack3D**     | 07, 09, (21) | Frames stack up as calls happen and pop on return; recursion depth; locals inside each frame                              |
| **Deque3D**         | 16           | Linked blocks with O(1) appends at both ends vs a list shifting everything on `pop(0)`                                    |
| **Heap3D**          | 17           | Tree view and array view side by side; sift-up and sift-down swaps light up in both                                       |

### 4.2 New 2D visuals (SVG + motion)

BytecodePipe · FloatBits · SliceRuler (interactive start/stop/step) · ScopeLEGB · Unpack · VennOps · CompPipeline ·
CounterBars · BigOChart (built with the **dataviz** skill) · ExceptionUnwind · DecoratorLayers · MROGraph ·
ConcurrencyTime · ImportResolve · VenvLayers · TracebackMap.
(VennOps and CounterBars are simple enough that they share one SVG primitive.)

### 4.3 Code Stepper (trace-driven, reused in 8 lessons)

Shows the code with the current line highlighted, the variables in each frame and the printed output, step by
step, like a debugger. The steps are **recorded from real execution**, not written by hand (see §6.2), so the
visual can never disagree with what Python actually does.

All visuals follow soul.md §8: play/pause/step/reset, keyboard controls, a "What to notice" caption, narration
for screen readers, and a static version for reduced motion or no WebGL.

---

## 5. Practice Content

### 5.1 Problems: 60 (15 per tier), IDs `py-p-001` … `py-p-060`

🐞 = "find and fix the bug" problem (8 in total). Each problem tests a different concept, pattern or constraint.

**Easy: one concept each**

| ID  | Title                                     | Concept                        |
| --- | ----------------------------------------- | ------------------------------ |
| 001 | Reverse the words in a sentence           | `split` / `join`               |
| 002 | Count the vowels                          | iteration, membership          |
| 003 | Leap-year checker                         | conditions, modulo             |
| 004 | Sum of digits                             | `divmod` / int ↔ str           |
| 005 | Print a temperature table                 | f-string formatting            |
| 006 | Second-largest unique number              | sets, sorting                  |
| 007 | Palindrome, ignoring case & punctuation   | string methods, slicing        |
| 008 | Merge two score dicts, adding shared keys | dict operations                |
| 009 | Remove duplicates, keep order             | `dict.fromkeys`                |
| 010 | Find the missing number in 1..n           | arithmetic series              |
| 011 | Title-case a list of names                | list comprehension             |
| 012 | Word frequency                            | `Counter`                      |
| 013 | Safe integer parse with a default         | `try` / `except`               |
| 014 | 🐞 The loop that skips the last item      | `range` off-by-one             |
| 015 | Invert a dictionary                       | dict comprehension, uniqueness |

**Simple: two or three concepts combined**

| ID  | Title                                     | Concepts                       |
| --- | ----------------------------------------- | ------------------------------ |
| 016 | Run-length encoding                       | iteration + string building    |
| 017 | Transpose a matrix                        | `zip(*rows)`, unpacking        |
| 018 | Split a list into chunks of n             | slicing with step, `range`     |
| 019 | Rotate a list by k                        | slicing, modulo                |
| 020 | Caesar cipher                             | `ord`/`chr`, modulo            |
| 021 | Two-sum with a dictionary                 | hashing, single pass           |
| 022 | First non-repeating character             | `Counter` + order              |
| 023 | Multiset intersection of two lists        | `Counter` `&`                  |
| 024 | Parse a `key=value;…` config string       | `split`, type conversion, dict |
| 025 | Running average generator                 | generators, state              |
| 026 | Totals per column from CSV text           | `csv`, `io.StringIO`           |
| 027 | Bank account class with validation        | classes, exceptions            |
| 028 | Memoized Fibonacci                        | `functools.lru_cache`          |
| 029 | Consecutive differences                   | `itertools.pairwise`           |
| 030 | 🐞 Click counter raises UnboundLocalError | closures, `nonlocal`           |

**Medium: needs a pattern or the right data structure**

| ID  | Title                               | Pattern / structure         |
| --- | ----------------------------------- | --------------------------- |
| 031 | Valid brackets                      | stack                       |
| 032 | Group anagrams                      | dict of canonical keys      |
| 033 | Top-k frequent words with tie-break | `heapq` / sort key          |
| 034 | Maximum sum of k consecutive items  | fixed sliding window        |
| 035 | Longest substring without repeats   | variable window + dict      |
| 036 | Merge overlapping intervals         | sort + sweep                |
| 037 | Queue from two stacks               | amortized analysis, class   |
| 038 | Flatten any nested list             | recursion / `yield from`    |
| 039 | LRU cache                           | `OrderedDict`               |
| 040 | 🐞 Binary search that never ends    | loop invariants, `bisect`   |
| 041 | Product of array except self        | prefix / suffix products    |
| 042 | Deep-merge nested dicts             | recursion on dicts          |
| 043 | Temporarily override dict values    | `contextmanager`, `finally` |
| 044 | Retry decorator with a limit        | decorator factory           |
| 045 | 🐞 Iterator that only works once    | iterable vs iterator        |

**Hard: several steps, optimisation, edge cases**

| ID  | Title                                        | Technique                       |
| --- | -------------------------------------------- | ------------------------------- |
| 046 | Shortest route (weighted graph)              | Dijkstra with `heapq`           |
| 047 | Install order for package dependencies       | topological sort + cycle report |
| 048 | Median of a data stream                      | two heaps                       |
| 049 | Word ladder                                  | BFS with `deque`                |
| 050 | Calculator for `+ - * /` and parentheses     | tokenizer + recursive descent   |
| 051 | Autocomplete with a trie                     | trie class                      |
| 052 | Lazily merge k sorted iterators              | generators + heap               |
| 053 | Longest increasing subsequence in O(n log n) | `bisect` patience sorting       |
| 054 | Edit distance                                | dynamic programming             |
| 055 | TTL cache with an injectable clock           | class design, testability       |
| 056 | Count N-Queens solutions                     | backtracking                    |
| 057 | Find where a linked list's cycle starts      | Floyd's two pointers            |
| 058 | Log report: status counts and p95 latency    | parsing, `Counter`, percentiles |
| 059 | 🐞 Tree walk hits RecursionError             | recursion → explicit stack      |
| 060 | Count friend groups                          | union-find, path compression    |

Three more 🐞 problems (8 in total) will replace regular ones during writing (for example "mutable default in a
class attribute"), each covering a concept not already listed. The total stays 60 and each tier stays at 15.

Every solution has hidden `verify:` asserts, including edge cases (empty input, duplicates, large n), that run
in `pnpm verify:code`.

### 5.2 Interview questions: 56, IDs `py-i-001` … `py-i-056`

| Group                             | #   | Questions                                                                                                                                                                                                                                                                                                                                                                              |
| --------------------------------- | --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Language basics**               | 14  | mutable vs immutable · `is` vs `==` · how arguments are passed ("call by object reference") · `*args`/`**kwargs` · mutable default argument · list vs tuple · shallow vs deep copy · truthiness & `None` · dynamic vs strong typing · small-int caching & string interning · `if __name__ == "__main__"` · LEGB, `global`, `nonlocal` · `lambda` limits · f-strings vs `format` vs `%` |
| **Data structures**               | 12  | dict internals & cost · why keys must be hashable · set vs list membership · list operation costs · `deque` vs list · `heapq` usage · `Counter` & `defaultdict` · stable sorting & `key` · comprehension vs generator expression memory · dict ordering guarantee · tuple holding a list as a dict key · `namedtuple` vs `dataclass`                                                   |
| **Functions, OOP & advanced**     | 13  | how decorators work · `functools.wraps` · closures & late binding · iterator vs generator · `yield from` · context managers · `@property` · `classmethod` vs `staticmethod` · MRO & `super()` · `__repr__` vs `__str__` · `__slots__` · `__eq__`/`__hash__` contract · what a metaclass is (and why you rarely need one)                                                               |
| **Runtime, memory & concurrency** | 8   | the GIL · threads vs processes vs `asyncio` · reference counting & cycle GC · how CPython runs code (bytecode) · `__pycache__` · `async`/`await` basics · why Python is slow & how to speed it up · free-threaded Python 3.13                                                                                                                                                          |
| **Packages & tooling**            | 5   | why virtual environments · `requirements.txt` vs `pyproject.toml` · how `import` finds modules · circular imports & fixes · absolute vs relative imports                                                                                                                                                                                                                               |
| **Debugging & testing**           | 4   | how to debug a failing script step by step · essential `pdb` commands · `logging` vs `print` · `assert` vs exceptions, plus a minimal `pytest` test                                                                                                                                                                                                                                    |

Difficulty mix target: about 30% easy/simple, 45% medium, 25% hard. The tests enforce at least 8 questions per tier.

---

## 6. Platform changes (shared files, kept small)

Part 0's rule is that modules plug in without touching shared files. These three changes are general features
that every later part will also use, so they're built first, as their own commits, and tested on their own.

### 6.1 Lesson sections

- An optional `section: "Data Structures"` field in lesson front matter.
- The sidebar tree and module page group lessons under section headings. Modules without sections look the
  same as today (Start Here is unaffected).

### 6.2 Code Stepper with recorded traces

- `content/python/traces/<name>.py` holds the program to visualize.
- `scripts/trace_python.py` runs it under `sys.settrace` and records, for each step: line, event
  (call/line/return/exception), frames with their locals (as `repr`, size-limited) and stdout so far. The result is
  saved as `<name>.trace.json` **next to the source and committed**, so the build doesn't need Python (Vercel builds don't have it).
- `pnpm verify:code` re-records every trace and **fails if a committed trace is out of date**.
- `<CodeStepper trace="loops-enumerate" />` in MDX: the server loads the JSON and the client renders the stepper
  inside `VizFrame` (steps, narration and keyboard controls come from the framework).
- Limits: at most 120 steps and 2,000-character reprs. Long runs are truncated with a visible note.

### 6.3 Content targets

- `module.yaml` gets optional `targets: { problems, interview, perDifficulty }`.
- A content test fails if a module is below its targets, so "50+" is checked automatically.

**New dependencies:** none. Tracing uses the Python standard library, and the chart is built with SVG.

---

## 7. Step-wise Build Plan (each step ends with green tests and a commit on `module/python`)

| #    | Step                                                                         | Acceptance criteria                                                                         |
| ---- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 1.1  | Platform: lesson sections (§6.1)                                             | Unit + E2E: grouping renders; Start Here unchanged                                          |
| 1.2  | Platform: trace recorder + Code Stepper (§6.2)                               | Recorded trace equals a hand-checked expected trace; stale-trace check fails when it should |
| 1.3  | Platform: content targets (§6.3)                                             | A module below its target fails the content test                                            |
| 1.4  | Module skeleton: `module.yaml`, sections, empty E2E suite                    | `/learn/python` renders; search indexes the module                                          |
| 1.5  | 3D scenes: MemoryGraph3D (generalised), CallStack3D, ListArray3D             | Lazy load, controls, fallback, axe and reduced-motion tests pass                            |
| 1.6  | **Milestone A:** lessons 01–10 (Basics) + their 2D visuals                   | All samples and traces verified; E2E for every lesson page                                  |
| 1.7  | 3D scenes: DictHashTable3D, Deque3D, Heap3D                                  | Same checks as 1.5                                                                          |
| 1.8  | **Milestone B:** lessons 11–19 (Data Structures)                             | As 1.6                                                                                      |
| 1.9  | **Milestone C:** lessons 20–27 (Core Language)                               | As 1.6                                                                                      |
| 1.10 | **Milestone D:** lessons 28–36 (Packages/Tooling + Debugging)                | As 1.6; error-catalogue messages are captured from real 3.13 runs                           |
| 1.11 | **Milestone E:** 60 problems                                                 | Targets met (15 per tier); every solution passes its hidden asserts                         |
| 1.12 | **Milestone F:** 56 interview questions                                      | Targets met; every code snippet verified                                                    |
| 1.13 | Cross-linking: lessons ↔ problems ↔ interview Qs; search re-seed             | No broken internal links (link-check test)                                                  |
| 1.14 | Full gate + Lighthouse + docs                                                | Everything green; docs, navigation and changelog updated                                    |
| 1.15 | Merge `module/python → develop`, re-run the gate, then `main` + tag `v0.2.0` | Release and push only with your OK                                                          |

After each milestone (A–F) I'll send a short progress note with test results and screenshots. I'll keep going
unless you say stop, since approving this plan covers the whole of Part 1.

---

## 8. Test Plan

**Unit (Vitest)**

- Section grouping and ordering; the content-target check (pass/fail fixtures)
- Trace recorder: a deterministic expected trace for a small program; truncation; exception events
- Code Stepper component: steps, frames, output panel, keyboard navigation
- Every new viz model (pure functions): for example, the heap model's sift-up sequence matches what `heapq` does

**Content integrity**

- ≥ 60 problems (exactly 15 per tier), ≥ 56 interview questions (≥ 8 per tier)
- Unique IDs, titles and questions (normalised); every lesson has a visual except 32 and 36
- Every lesson follows the template: objectives, key takeaways, a "Common mistakes" heading, a practice link
- All internal links resolve to existing routes

**Code verification (`pnpm verify:code`)**

- Every lesson sample (with output comparison where an Output block exists), every problem solution plus its hidden
  asserts, and every interview snippet is executed. Traces must be up to date.

**E2E (Playwright, 360 / 768 / 1024 / 1440)**

- Every Python lesson, problem and interview page returns 200 with no console errors
- Sidebar sections collapse/expand; the mobile drawer shows sections
- Each 3D scene: not in the initial JS, loads on scroll, controls work, the reduced-motion fallback renders
- Code Stepper: step/back/play/reset, the highlighted line changes, keyboard operation
- Practice: tier filters show 15 each; solution copy is exact for a sample of problems
- axe (light + dark): every Python lesson at 1440, and representative pages at all 4 viewports
- No horizontal page scroll on any Python page at 360px

**Performance:** `pnpm perf` on three Python pages: the heaviest 3D lesson, the problem browser with 60 items, and
a problem page. Lab budgets from soul.md §11.

---

## 9. Risks & Open Questions

| #   | Item                                                                                                                         | My default if you don't say otherwise                              |
| --- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| R1  | **Volume:** 36 lessons + 116 practice items is a lot of original writing                                                     | Build in milestones A–F, with every item verified before moving on |
| R2  | Python 3.13-specific output (`dis`, error wording) may differ on other versions                                              | Label version-specific output; verify on 3.13                      |
| R3  | Many 3D scenes could slow pages                                                                                              | One 3D scene per lesson at most, lazy-loaded; perf checked in 1.14 |
| R4  | Problem browser with 60 items on mobile                                                                                      | Already list-based with filters; perf-tested                       |
| Q1  | **Counts:** 60 problems (15 per tier) and 56 interview questions. Is that right, or do you want more?                        | ✅ Owner: 60 / 56                                                  |
| Q2  | **Extra topics** not in your brief but common in interviews: concurrency (27), type hints (32), stdlib tour (31). Keep them? | ✅ Owner: keep                                                     |
| Q3  | **Check-ins:** a progress note after each milestone without waiting, or stop for approval after each?                        | ✅ Owner: note and continue                                        |
| Q4  | **Push:** push `module/python` to GitHub after each milestone as a backup?                                                   | ✅ Owner: OK (push branch per milestone; `main` only with OK)      |

---

## 10. Suggestions (not included; build only if you ask)

- "Predict the output" quizzes inside lessons, answered before revealing the Code Stepper
- Spaced-repetition review of interview questions
- A printable Python cheat sheet built from lessons 32 and 36

---

**Approval:** ✅ Approved by owner on 2026-10-26 ("proceed").
