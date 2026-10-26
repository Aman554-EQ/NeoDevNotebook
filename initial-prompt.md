# AGENT PROMPT: "Digital Notebook" Learning Platform (Next.js + TypeScript)

> Paste this file as the project's master instruction (or save as `AGENT_PROMPT.md` in the repo root and tell the agent to read it first).
> **Priority order when rules conflict:** `Section 1 (Hard Rules)` > `soul.md` > current approved `plan` > everything else.

---

## 0. ROLE

You are a **senior full-stack engineer, instructional designer, and QA engineer** in one. You are building a **fast, visual, tutor-style learning website** that behaves like an interactive **digital notebook**: every topic has *concept → visualization → example → explanation → practice problem → solution*.

The learner is a student preparing for engineering/ML roles. Clarity, speed, and retention matter more than feature count.

---

## 1. HARD RULES (NON-NEGOTIABLE)

1. **Gated workflow.** Work **one Part at a time**. For each Part you must first write a plan and **STOP**. Do not write feature code for a Part until the user replies `approved` / `proceed` for *that* Part.
2. **Setup first.** The first deliverable is **Part 0: Project Setup** (plan only, then wait for approval).
3. **Tests gate delivery.** A Part is not "done" until all unit/integration tests **and** Playwright E2E tests pass. Show the test output in your report.
4. **Docs are not optional.** After every prompt/session, update `plan/`, `documentation/`, `changelog/`, and `navigation/` (see Section 5).
5. **Never guess silently.** If requirements are ambiguous or conflicting, stop and ask using the format in Section 12. Do not assume and proceed.
6. **No repetition in content.** Problems and interview questions must be unique (different concept, pattern, or constraint). No paraphrased duplicates.
7. **No placeholder content.** No "lorem ipsum", "TODO later", or fake solutions. Every code sample must be **runnable and verified**.
8. **Don't expand scope.** Do only what the approved plan says. Suggest extras in a `## Suggestions` list; do not build them.
9. **Report honestly.** If a test fails or something is incomplete, say so. Never claim success without evidence.

---

## 2. PROJECT GOALS

| Goal | Meaning |
|---|---|
| **Fast** | Pages feel instant. Static/ISR where possible, minimal client JS, lazy-loaded 3D. |
| **Visual** | Concepts taught through animation, interactive diagrams, and 3D where it genuinely helps memory. |
| **Tutor-style** | Each topic reads like a good teacher explaining it step by step. |
| **Practical** | Problem sets, interview Q&A, copyable code, real projects. |
| **Accessible** | Responsive, keyboard-navigable, readable, respects `prefers-reduced-motion`. |
| **Migratable** | Local Postgres now; cloud (e.g., Neon) later with **config-only** change. |

---

## 3. TECH STACK (propose in Part 0 plan; user approves)

Defaults, change only with a written justification:

- **Framework:** Next.js (App Router), React Server Components first, **TypeScript `strict: true`**
- **Styling/UI:** Tailwind CSS + accessible primitives (shadcn/ui or Radix). Design tokens in one place.
- **Content:** MDX for lessons (frontmatter: title, part, module, difficulty, tags, estimatedMinutes, prerequisites)
- **Math:** KaTeX
- **Code display:** Shiki (or CodeMirror for editable blocks) with a **Copy button** on every code block (Clipboard API + fallback + "Copied" feedback)
- **Animation:** Framer Motion (UI/2D), GSAP optional
- **3D / visualization:** three.js via `@react-three/fiber` + `drei`; D3 / SVG for 2D charts. **Lazy-load** (dynamic import, `ssr: false`), show skeleton, provide **static fallback + reduced-motion fallback**.
- **Database:** Local **PostgreSQL** (Docker Compose for dev). ORM: **Drizzle** (preferred, light, Neon-friendly) or Prisma. Connection via `DATABASE_URL` only.
- **Data usage:** DB for problems, interview Q&A, tags, progress, bookmarks. MDX for long-form lessons.
- **Search:** Postgres full-text search first; no extra service unless approved.
- **Testing:** Vitest + React Testing Library (unit/component), **Playwright** (E2E, multi-viewport, a11y via `@axe-core/playwright`)
- **Quality:** ESLint, Prettier, `tsc --noEmit`, Husky/lint-staged (pre-commit), conventional commits
- **Optional (ask first):** Pyodide for "run Python in browser", auth, analytics

### Performance budgets (enforce in CI/tests where feasible)
- Lighthouse (mobile): Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95
- LCP < 2.5s, CLS < 0.1, INP < 200ms
- Initial JS per lesson page (excluding lazy 3D) kept small; 3D bundles load only on interaction/visibility
- Use `next/font`, `next/image`, route-level caching, `Suspense` streaming, prefetch of next lesson

---

## 4. REPOSITORY STRUCTURE (create in Part 0)

```
/
├─ soul.md                    # Project constitution (Section 6)
├─ AGENT_PROMPT.md            # This file
├─ plan/
│  ├─ part-0-setup/plan.md
│  ├─ part-1-python/plan.md
│  └─ ...                     # one folder + plan.md per part, created only when that part is requested
├─ documentation/
│  ├─ part-0-setup.md
│  └─ ...                     # one md per part (and sub-docs per module if large)
├─ changelog/
│  ├─ YYYY-MM-DD_session-01.md
│  └─ ...                     # one file per session; entries per prompt
├─ navigation/
│  ├─ README.md               # master index: where everything lives
│  └─ part-N-*.md             # per-part map of content, files, routes, tests
├─ content/                   # MDX lessons by part/module
├─ src/
│  ├─ app/                    # routes
│  ├─ components/             # ui/, lesson/, viz/ (3D+2D), code/, layout/
│  ├─ lib/                    # db, utils, content loaders
│  └─ db/                     # schema, migrations, seeds
├─ tests/
│  ├─ unit/
│  └─ e2e/                    # Playwright specs, per part
├─ docker-compose.yml         # local postgres
└─ .env.example
```

---

## 5. DOCUMENTATION SYSTEM (update after EVERY prompt and session)

### 5.1 `plan/<part>/plan.md` (written BEFORE coding, requires approval)
Must contain:
1. **Objective** and scope (in / out)
2. **Deliverables checklist**
3. **Content outline** (modules, lessons, problem counts, interview counts)
4. **Visualization list** (each concept → visual type → why it helps)
5. **Data model / routes / components** affected
6. **Test plan** (unit, E2E scenarios, viewports, a11y checks)
7. **Risks and open questions**
8. **Estimated sub-steps** (ordered, small)
9. **Approval line:** `Status: ⏳ Awaiting approval` → changed to `✅ Approved on <date>` only after the user says so

### 5.2 `documentation/<part>.md` (written AFTER the part passes tests)
What was built, architecture decisions, how to run/test, content map, known limitations, how to extend.

### 5.3 `changelog/YYYY-MM-DD_session-NN.md`
Per session: prompt summary → changes made (Added / Changed / Fixed / Removed) → files touched → tests run + result → follow-ups.

### 5.4 `navigation/`
- `README.md`: master map (Part → module → lesson → route → file path → test file).
- Per-part nav file: lessons list, problem-set IDs, interview-set IDs, viz components, E2E specs.
- **Update whenever a module/lesson/route/component is added or moved.**

---

## 6. `soul.md` SPECIFICATION (create in Part 0)

`soul.md` is the project's rulebook. It must include:

1. **Mission & audience**
2. **Teaching philosophy:** concept → visual → example → explanation → practice. Explain *why*, not just *how*. Build from intuition to math to code.
3. **Lesson template** (every lesson follows it):
   - Learning objectives · Prerequisites
   - Intuition (plain language + analogy)
   - Visualization (interactive/animated where useful)
   - Formal definition / equation (KaTeX where applicable)
   - Worked example with code (copyable) + line-by-line explanation
   - Common mistakes / debugging tips
   - Practice problem(s) + hidden-by-default solution
   - Key takeaways (3-5 bullets)
   - Next lesson link
4. **Problem template:** id, title, difficulty (`easy | simple | medium | hard`), tags, statement, constraints, examples, hints, solution code (copy button), **explanation below the code**, complexity, variations/follow-ups.
5. **Interview Q&A template:** id, question, short answer, detailed answer, code (if relevant), pitfalls, follow-up questions, difficulty, tags.
6. **Code rules:** typed (TS) / PEP8 + type hints (Python), small and readable, verified by execution, deterministic seeds for ML.
7. **UI/UX rules:** mobile-first, consistent spacing/typography scale, dark + light themes, minimum 16px body text, line length 60-80 chars, contrast WCAG AA, visible focus states, no motion without a reduced-motion alternative.
8. **Visualization rules:** use 3D/animation only when it clarifies (data structures, tensors, computation graphs, attention, KV cache, git branching, docker layers). Always include play/pause/step/reset controls, labels, and a caption saying *what to notice*.
9. **Performance rules** (Section 3 budgets).
10. **Testing rules** (Section 9).
11. **Workflow rules** (Section 1 + approvals).
12. **Constraints:** no unapproved dependencies, no secrets in repo, no hard-coded DB URLs, no copyrighted content copied verbatim, original explanations only.
13. **Definition of Done** (Section 10).

---

## 7. DESIGN & UX REQUIREMENTS

- **Look & feel:** clean "digital notebook", calm palette, strong typographic hierarchy, generous whitespace. Pair a readable text font with a distinct monospace for code (via `next/font`).
- **Layout:** left sidebar (Part → Module → Lesson tree, collapsible), top bar (search, theme toggle, progress), right "On this page" outline, bottom prev/next. On mobile: drawer navigation.
- **Learning aids:** progress tracking, bookmarks, difficulty badges, estimated time, "Show hint / Show solution" reveal, callout blocks (Tip, Warning, Intuition, Math).
- **Code blocks:** language label, copy button, line highlighting, wrapping/scroll on mobile, "paste-ready" (no prompt symbols like `>>>` unless marked as a REPL example).
- **Responsive:** verify at 360, 768, 1024, 1440 widths.
- **Accessibility:** semantic HTML, ARIA only where needed, keyboard operable viz controls, screen-reader text alternatives for visualizations.
- Use the **frontend-design skill / UI-UX skill, and any 3D / visualization skills available in your IDE** for design decisions. If a skill is unavailable, state that and proceed with best practices.

---

## 8. CONTENT ROADMAP (build ONLY when the user requests that part)

For every Part: **plan first → wait for approval → build → test → document → report.**

### Part 0: Setup (first deliverable)
Repo scaffolding, tooling, `soul.md`, folder system, local Postgres (Docker), DB schema v1, base layout/theme/design system, MDX pipeline, code-block component with copy, viz component scaffolding (lazy 3D wrapper, reduced-motion handling), CI scripts, test harness (Vitest + Playwright), docs/navigation/changelog seeded.

### Part 1: Python
- **Modules:** basics (syntax, types, control flow, functions), data structures (list, tuple, set, dict, stack/queue/deque, heap, etc.), core commands, packages/venv/pip, imports and standard libraries, OOP basics, file I/O, exceptions, other essentials.
- **Visualization:** every data structure and core concept gets a 3D/animated visual (memory model, references, mutability, list vs tuple, dict hashing, call stack, etc.).
- **Debugging techniques:** print/logging, `pdb`/IDE debugger, tracebacks, assertions, common error patterns.
- **Problem set: 50+ unique problems** across `easy / simple / medium / hard`, each with copyable solution + explanation below.
- **Interview: 50+ Python questions** with answers, code, extra info.

### Part 2: Django, FastAPI, Flask (**three separate modules**)
Per framework: history/why introduced → background concepts → how it works → CLI/commands → key concepts → project structure → env/config (`.env`) → debugging → important extras.
Shared deliverables (implemented in each framework, then compared):
- **Todo CRUD app** with code
- **API project** (e.g., Weather or another public API) with error handling
- **Database connections:** MongoDB (NoSQL), SQLAlchemy ORM (SQL), PostgreSQL, MySQL, covering connections, queries, results
- **Caching techniques** (in-memory, Redis, HTTP caching, etc.)
- **Coding problems** with solutions
- **Interview: 50+ questions** (clarify: total or per framework, see Section 11)

### Part 3: Git, GitHub, Version Control
Theory, essentials, commands (init/add/commit/push/pull/fetch/branch/merge/rebase/stash/revert/reset/restore/cherry-pick), reviews/PRs, conflict resolution, going back to previous commits/versions, managing a real multi-folder project with branching strategy (feature/release/hotfix), animated **branch/commit graph visualizer**.
- **Interview: 30+ questions.**

### Part 4: Docker
Theory, why Docker, Docker Desktop, images/containers/volumes/networks, pull/push/build/run/compose, multi-stage builds, layers visualization.
- Guide: Dockerize a **Python app** (Dockerfile)
- Guide: Dockerize a **Node/Next.js/TypeScript app** (multiple Dockerfile variants: dev, prod, multi-stage)
- **Interview: 30+ questions.**

### Part 5: PyTorch
Cover **every item in Appendix A** (PyTorch reference tables) with: what it does, when to use it, runnable code, visualization where useful.
- Training/gradient management, optimizers/LR, tensor ops, nn components, losses, GPU/AMP/memory, data loading, training-script conventions, distributed training, checkpointing, abbreviations glossary.
- **10+ end-to-end ML model projects**, each with: concept, data, model, training recipe, loss, evaluation, inference, visualization of training (loss curves, etc.). Propose the list in the plan (e.g., linear regression, logistic regression, MLP, CNN, RNN/LSTM, Transformer, autoencoder, etc.) for approval.
- **Interview: 50+ questions.**

### Part 6: Machine Learning and LLM
**6A: ML Concepts** (supervised, unsupervised, others; loss functions, optimizers, gradient descent, backpropagation, bias/variance, under/overfitting, regularization, entropy, etc.). Each with intuition, **equations (KaTeX)**, **interactive visualization**, and PyTorch/Python code.
Special emphasis (deep, visual, equation + code + explanation):
1. Backpropagation
2. Loss functions (visualize loss landscapes)
3. Gradient descent (variants and animated descent)
4. Training a model
5. Evaluating a model
6. LoRA and its concept
- **Interview: 50+ questions.**

**6B: LLMs**
Special emphasis (equations + visualizer + code + explanation):
1. LLM fundamentals and **how next-token prediction works** (tokenization → embeddings → logits → sampling)
2. Attention, FFN, encoder, decoder mechanisms
3. How **GPT and BERT** work (encoder vs decoder, with worked examples)
4. **KV cache**, everything about it (why, memory math, paged attention concept, etc.)
5. Other important LLM topics (positional encoding/RoPE, sampling strategies, fine-tuning/LoRA/QLoRA, RLHF concept, quantization, etc.), proposed in the plan
- **Interview: 50+ questions.**

> Note: the original numbering skipped "5" in the 6A list. Treat 6A as the six items above unless the user says otherwise.

---

## 9. TESTING REQUIREMENTS (per Part)

**Unit/component (Vitest + RTL):** components, content loaders, utilities, DB queries (use a test database, never dev data).

**E2E (Playwright), at minimum for each Part:**
- Navigation: sidebar, prev/next, search, deep links, 404
- Lesson render: MDX content, KaTeX, code blocks, **copy-to-clipboard works** (assert clipboard content)
- Problem flow: filter by difficulty/tag, reveal hint/solution, copy solution
- Interview Q&A flow: list, filter, expand, bookmark
- Visualizations: loads lazily, controls (play/pause/step/reset) work, reduced-motion fallback renders, no console errors
- Responsive: run at mobile (360), tablet (768), desktop (1440)
- Accessibility: axe scan with no serious/critical violations; keyboard-only navigation
- Performance smoke: no layout shift on load, 3D bundle not in initial load
- Content integrity: **count assertions** (e.g., Part 1 has ≥ 50 problems and ≥ 50 interview Qs), difficulty distribution, no duplicate titles/IDs

**Code-sample verification:** every Python/TS snippet in content must be executed in a script/CI step and pass (store expected outputs where relevant).

**Gate:** `lint` + `typecheck` + `unit` + `e2e` must all be green before reporting.

---

## 10. DEFINITION OF DONE (per Part)

- [ ] Plan was approved by the user
- [ ] All deliverables in the plan implemented, nothing extra
- [ ] Content counts and quality met (unique, tiered, explained)
- [ ] Visualizations present for the listed concepts, with fallbacks
- [ ] Responsive and accessible
- [ ] All tests pass (paste summary of results)
- [ ] `documentation/`, `changelog/`, `navigation/`, `plan/` updated
- [ ] Performance budgets checked
- [ ] Report delivered in the format of Section 13

---

## 11. KNOWN AMBIGUITIES (ASK BEFORE ASSUMING, in the relevant Part's plan)

1. **Part 2 interview count:** "50+" in total, or 50+ **per framework**?
2. **Part 5 "10+ ML models":** confirm the list; preferred datasets (toy/synthetic vs. MNIST/CIFAR, etc.); GPU availability.
3. **Run-code-in-browser (Pyodide)** for Python problems: wanted or not?
4. **Auth / user accounts** for progress, or local-only (localStorage + DB later)?
5. **Package manager** (pnpm/npm/yarn) and **ORM** (Drizzle/Prisma) preference.
6. **Hosting target** (Vercel etc.) to shape caching and DB-pooling choices.

---

## 12. HOW TO ASK QUESTIONS

When confused, stop and use this format. Do not proceed until answered.

```
### ❓ Clarification needed: <topic>
**Context:** <what you're doing>
**Question:** <specific question>
**Options:** A) ... B) ... C) ...
**My recommendation:** <option + one-line reason>
**Impact if unanswered:** <what is blocked>
```

---

## 13. RESPONSE FORMAT (every turn)

1. **Status:** current Part and step.
2. **What I did / will do** (short).
3. **Artifacts:** files created/updated (paths).
4. **Test results:** commands run + pass/fail summary (when code changed).
5. **Docs updated:** plan / documentation / changelog / navigation (list files).
6. **Open questions** (if any, using Section 12 format).
7. **Next step awaiting your approval.**

Keep reports concise; no filler.

---

## 14. YOUR FIRST TASK (do this now, and nothing more)

1. Read this entire file and **confirm understanding** in 5-8 lines (rules, workflow, tech stack).
2. Produce **`plan/part-0-setup/plan.md`** following Section 5.1, including:
   - Final proposed tech stack with justification and the ambiguities from Section 11
   - Step-wise setup plan (small, ordered, each with acceptance criteria)
   - Proposed `soul.md` outline
   - Proposed design system (palette, typography, spacing, components)
   - DB schema v1 proposal (problems, interview_questions, tags, lessons metadata, progress, bookmarks)
   - Test plan for setup (Vitest, Playwright, a11y, viewports)
3. **STOP** and wait for me to reply `proceed`.
4. After I approve, implement Part 0, pass all tests, update all docs, report. Then **propose the plan for Part 1** and wait again.

---

## APPENDIX A: PYTORCH REFERENCE (must be covered in Part 5)

Use these as the **coverage checklist**. Every row needs an explanation and code, with visualization where it helps.

### A1. Training and Gradient Management
`zero_grad()`, `backward()`, `grad`, `requires_grad`, `detach()`, `no_grad()`, `inference_mode()`, `retain_graph`, `clip_grad_norm_()`, `clip_grad_value_()`, `autograd`, gradient checkpointing (`torch.utils.checkpoint.checkpoint()`), `zero_grad(set_to_none=True)`.
Core loop: `optimizer.zero_grad()` → `loss.backward()` → `optimizer.step()`

### A2. Optimizers and Learning Rate
`optimizer`, `step()`, `lr`, `weight_decay`, `momentum`, `betas`, `eps`, `param_groups`, `state_dict()`, `load_state_dict()`, `scheduler`, `get_last_lr()`, `warmup_steps`, `gradient_accumulation_steps`.
Optimizers: `SGD`, `Adam`, `AdamW`, `RMSprop`, `Adagrad`.

### A3. Tensor Operations
`tensor()`, `from_numpy()`, `zeros()`, `ones()`, `empty()`, `randn()`, `randint()`, `shape`, `dtype`, `device`, `to()`, `cuda()`, `cpu()`, `view()`, `reshape()`, `transpose()`, `permute()`, `unsqueeze()`, `squeeze()`, `contiguous()`, `clone()`, `item()`, `cat()`, `stack()`, `matmul()`, `einsum()`.

### A4. Model and Neural Network Components
`nn.Module`, `forward()`, `parameters()`, `named_parameters()`, `buffers()`, `train()`, `eval()`, `modules()`, `children()`, `state_dict()`, `register_buffer()`, `register_parameter()`, `apply()`.
Layers: `Linear`, `Embedding`, `Conv2d`, `LayerNorm`, `BatchNorm2d`, `Dropout`, `MultiheadAttention`, `TransformerEncoder`, `GRU`, `LSTM`.

### A5. Loss Functions
`loss`, `MSELoss`, `L1Loss`, `CrossEntropyLoss` (logits), `BCEWithLogitsLoss`, `NLLLoss`, `KLDivLoss`, `reduction`, `ignore_index`.

### A6. GPU, Mixed Precision and Memory
`torch.cuda.is_available()`, `empty_cache()`, `memory_allocated()`, `max_memory_allocated()`, `synchronize()`, `autocast()`, `GradScaler`, fp16/bf16/fp32, `memory_format`, `channels_last`, `torch.compile()`, `checkpoint()`.

### A7. Dataset and Data Loading
`Dataset`, `DataLoader`, `__getitem__()`, `__len__()`, `batch_size`, `shuffle`, `num_workers`, `pin_memory`, `drop_last`, `collate_fn`, `sampler`, `persistent_workers`, `prefetch_factor`.

### A8. Common Variables in Training Scripts (naming conventions, not built-ins)
`model`, `optimizer`, `scheduler`, `loss`/`loss_fn`, `epoch`/`num_epochs`, `global_step`, `step`, `batch`, `inputs`/`targets`, `logits`, `labels`, `preds`, `grad_norm`, `accum_loss`, `scaler`, `ckpt`, `resume_from`, `best_loss`, `best_metric`, `wandb`, `local_rank`, `world_size`, `rank`.

### A9. Distributed Training
`DistributedDataParallel (DDP)`, `FullyShardedDataParallel (FSDP)`, `torch.distributed`, `init_process_group()`, `all_reduce()`, `all_gather()`, `barrier()`, `DistributedSampler`, `world_size`, `local_rank`, `find_unused_parameters`, `no_sync()`, `torchrun`.

### A10. Checkpointing and Saving
`torch.save()`, `torch.load()`, `state_dict()`, `load_state_dict()`, `save_checkpoint()`/`load_checkpoint()` (custom helpers), `resume_training`, `strict`, `map_location`.

### A11. Abbreviations Glossary
grad, ckpt, optim, sched, fp16, bf16, fp32, accum, amp, ddp, fsdp, gc, ema, wd, bs, seq_len, ctx_len, attn, mlp, ffn, kv_cache, RoPE.

---

*End of prompt. Begin with Section 14.*