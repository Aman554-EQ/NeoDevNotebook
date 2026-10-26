# soul.md: The Rulebook of "NeoDevNotebook"

> The project's constitution. When rules conflict, this is the priority order:
> **soul.md > the approved part plan > initial-prompt.md (original brief) > everything else.**
> Change this file only after the owner agrees. Log every change in `changelog/`.

---

## 1. Mission & Audience

**Mission:** a fast, visual, tutor-style **digital notebook** that takes a learner from "I've heard of it" to
"I can explain it in an interview and write the code", covering Python → web frameworks → Git → Docker →
PyTorch → ML → LLMs.

**Audience:** students and job-seekers preparing for Python / backend / ML engineering roles.
Assume curiosity, not prior expertise. Respect their time.

**The three promises:**

1. **Understand it.** Every concept comes with an intuition, a visual and the reason _why_ it works.
2. **Remember it.** Animations and 3D build visual memory of the data structure or mechanism.
3. **Use it.** Copy-ready code, practice problems and interview answers.

---

## 2. Workflow Rules (non-negotiable)

1. **Part by part, gated.** For each part: write `plan/<part>/plan.md`, then **stop**, then wait for the owner's
   `proceed` / `approved` for _that_ part, then build, test and document, then report. Approval for one part never covers the next.
2. **Step by step.** Each part is broken into small ordered steps, each with acceptance criteria.
3. **Ask, don't guess.** If something is ambiguous, ask using the format in §13. Confusing work goes into a separate step.
4. **No scope creep.** Build only what the approved plan says. Put extra ideas under `## Suggestions`.
5. **Honest reporting.** Never claim success without test output. Report failures and gaps plainly.
6. **Docs are part of the work.** Every prompt or session updates `changelog/`, and also `navigation/`, `documentation/` and `plan/` when they're affected.

---

## 3. Git & Branching Rules

```
main      ← releases only (always green, deployable)
  └─ develop   ← integration branch
       ├─ setup/part-0
       ├─ module/python
       ├─ module/django
       ├─ module/flask
       ├─ module/fastapi
       ├─ module/git
       ├─ module/docker
       ├─ module/pytorch
       ├─ module/ml          (Part 6: ML, LLM split to be decided in Part 6 plan)
       └─ module/<future>    ← any new module follows the same path
```

- Each module is built on its **own branch from `develop`**.
- Flow: `module/x`, then all tests pass, then merge into `develop`, then the full suite is re-run on `develop`, then merge into `main` and tag `vX.Y.0`.
- **Modules are plug-ins.** A module lives in its own folders (`content/<module>/`, `src/components/viz/<module>/`,
  `tests/e2e/<module>/`) and is **auto-discovered**. Adding a module should not need edits to shared files,
  so module branches don't conflict with each other.
- Conventional commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:`), checked by commitlint.
- Never commit secrets, `.env` or generated build output.
- Pushing to a remote happens only when the owner asks.

---

## 4. Teaching Philosophy

**Concept → Visual → Example → Explanation → Practice.**
Move from intuition, to a picture, to the math (when there is math), to the code. Always explain _why_ before _how_.
Use one analogy per concept, and make sure it's accurate. Prefer short paragraphs and concrete numbers over abstract prose.

---

## 5. Lesson Template (every lesson follows it)

| #   | Section                                                    | Notes                                                            |
| --- | ---------------------------------------------------------- | ---------------------------------------------------------------- |
| 1   | **Learning objectives** · **Prerequisites** · est. minutes | 3 to 5 objectives                                                |
| 2   | **Intuition**                                              | Plain language plus one analogy                                  |
| 3   | **Visualization**                                          | Interactive or animated when it helps (see §8)                   |
| 4   | **Formal definition / equation**                           | KaTeX, every symbol defined                                      |
| 5   | **Worked example**                                         | Copyable code plus a line-by-line explanation **below** the code |
| 6   | **Common mistakes & debugging tips**                       | Real error messages and how to fix them                          |
| 7   | **Practice**                                               | 1 to 3 problems; hint and solution hidden by default             |
| 8   | **Key takeaways**                                          | 3 to 5 bullets                                                   |
| 9   | **Next lesson**                                            | prev / next links                                                |

---

## 6. Problem Template

`id` (e.g. `py-p-017`) · `title` · `difficulty` (`easy | simple | medium | hard`) · `tags` · `statement` ·
`constraints` · `examples (input → output)` · `hints[]` · `solution code` (copy button) ·
**explanation below the code** · `time/space complexity` · `variations / follow-ups`.

**Uniqueness:** no two problems may test the same concept, pattern **and** constraint. Paraphrased duplicates are banned,
and the content-integrity tests check for duplicate IDs and titles.

**Difficulty ladder:** `easy` (one concept, warm-up) → `simple` (2 to 3 concepts combined) → `medium` (needs a pattern or
data-structure choice) → `hard` (several steps, optimisation, edge cases).

## 7. Interview Q&A Template

`id` · `question` · `short answer` (2 to 3 sentences you could say aloud) · `detailed answer` · `code` (if relevant) ·
`pitfalls / what interviewers look for` · `follow-up questions` · `difficulty` · `tags`.

---

## 8. Visualization Rules

- Use 3D or animation **only when it clarifies**: memory/references, data structures, call stacks, computation graphs,
  tensors, attention, KV cache, git commit graphs, docker layers, request lifecycles.
- Every visual has **play / pause / step / reset** controls (where it's time-based), labels, and a caption saying
  **"What to notice"**.
- Every visual has a **text alternative** for screen readers and a **static fallback** for `prefers-reduced-motion`
  and for when WebGL is unavailable.
- 3D bundles (three.js, R3F) are **lazy-loaded** when scrolled into view and never ship in the initial page JS.
- Controls are keyboard-operable.

---

## 9. Code Rules

- **TypeScript:** `strict: true`, no `any` without a comment explaining why, small components, Server Components by default,
  `"use client"` only where interaction needs it.
- **Python in content:** PEP 8, type hints, runnable as-is, **paste-ready** (no `>>>` prompts unless marked as a REPL).
- **Every code sample is executed by a verification script** before a part is marked done. Where possible, its expected
  output is stored and compared.
- ML code uses fixed seeds and runs on CPU in a reasonable time (GPU-only snippets are labelled).
- Environment config comes only from env vars (`DATABASE_URL`, …). No hard-coded URLs or secrets.

---

## 10. UI / UX Rules

- **Feel:** a calm, paper-like digital notebook with strong typographic hierarchy and generous whitespace.
- **Mobile-first.** Verified at **360 / 768 / 1024 / 1440** px. No horizontal scroll except inside code blocks.
- Body text ≥ **16px**, line length **60 to 80 characters**, WCAG **AA** contrast, visible focus rings.
- **Light and dark** themes, both designed rather than auto-inverted.
- Layout: top bar (search, theme, progress) · left module tree (a drawer on mobile) · "On this page" outline · prev/next.
- Learning aids: difficulty badges, estimated time, hint/solution reveal, callouts (Tip, Warning, Intuition, Math),
  bookmarks, progress ticks.
- Motion is purposeful, under 300ms for UI transitions, and always has a reduced-motion alternative.

---

## 11. Performance Rules

- Lessons, problem pages and interview pages are **statically generated** at build time, so no DB query runs when a page is viewed.
- **Lab budgets** (mobile Lighthouse, `pnpm perf`, must pass): **Performance ≥ 90, Accessibility ≥ 95,
  Best Practices ≥ 95, CLS < 0.1, TBT < 200ms**. Lab LCP is reported for information only.
- **Field budgets** (real users, p75, measured once deployed): **LCP < 2.5s, CLS < 0.1, INP < 200ms**.
  _Decided by the owner on 2026-10-26 (option A): simulated slow-4G LCP mostly measures the framework's fixed
  runtime, so LCP is judged on real-user data._
- Syntax highlighting (Shiki) and math (KaTeX) are rendered **at build time** and add zero client JS.
- Use `next/font`, `next/image`, prefetching of the next lesson, and lazy loading for heavy visuals.

---

## 12. Testing Rules & Definition of Done

**Gate:** `lint` + `typecheck` + `unit` + `content verification` + `e2e` must **all pass** before a part is reported as done.

A part is **Done** when:

- [ ] Its plan was approved
- [ ] Every deliverable in the plan is built, with nothing extra
- [ ] Content counts are met, entries are unique, and difficulty is tiered
- [ ] The listed visualizations exist, with fallbacks
- [ ] It works at all four viewports, the axe scan finds no serious or critical issues, and it is keyboard-navigable
- [ ] All tests pass, with the output pasted in the report
- [ ] `plan/`, `documentation/`, `changelog/` and `navigation/` are updated
- [ ] It's merged `module/x → develop` (and to `main` when the owner approves the release)

---

## 13. How to Ask

```
### ❓ Clarification needed: <topic>
Context · Question · Options A/B/C · My recommendation · What is blocked
```

## 14. Constraints

- No unapproved dependencies. Each new library needs a one-line justification in the plan.
- No copyrighted text copied verbatim. All explanations are original.
- No placeholder content ("lorem ipsum", "TODO later", fake solutions).
- Local Postgres for now. Moving to Neon must need **only a `DATABASE_URL` change**.
- No login in v1. Progress and bookmarks are stored locally in the browser, and the DB schema is ready for accounts later.
- Run-in-browser Python is **out of scope**. Code is copy-only.
