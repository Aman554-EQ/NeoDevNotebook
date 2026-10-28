<div align="center">

<img src="src/app/icon.svg" alt="NeoDevNotebook logo" width="88" height="88" />

# NeoDevNotebook

### Understand it. See it. Remember it.

A visual notebook for learners: **Python, Django, FastAPI, Git, Docker, PyTorch, machine learning and LLMs.**

<a href="https://neodevnotebook.vercel.app"><img src="https://img.shields.io/badge/Live_site-neodevnotebook.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live site" /></a>

<a href="https://github.com/Aman554-EQ/NeoDevNotebook/actions/workflows/ci.yml"><img src="https://github.com/Aman554-EQ/NeoDevNotebook/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI status" /></a>
<img src="https://img.shields.io/badge/code_samples-680%2B_verified-2ea44f" alt="680+ verified code samples" />
<img src="https://img.shields.io/badge/a11y-WCAG_2.1_AA-6f42c1" alt="WCAG 2.1 AA" />
<img src="https://img.shields.io/badge/account-not_needed-0969da" alt="No account needed" />

<br />

[How it teaches](#-how-it-teaches) ·
[Tracks](#-tracks) ·
[Features](#-features) ·
[Quality bar](#-quality-bar) ·
[Tech stack](#-tech-stack) ·
[Run it locally](#-run-it-locally) ·
[Commands](#-everyday-commands)

</div>

---

## 🧭 How it teaches

Every topic follows the same path:

```
 concept  →  visual  →  worked example  →  explanation  →  practice
```

Lessons come with animated and 3D visuals, copy-ready code that is run and checked before it is
published, practice problems with hidden tests, guided projects and interview answers.

> [!NOTE]
> The site never runs code for you. Read it, copy it, and practise on your own machine.

## 📚 Tracks

| Track               | Status     | What you get                                                                      |
| ------------------- | ---------- | --------------------------------------------------------------------------------- |
| 🚀 Start Here       | 🟢 Live    | How the notebook teaches, in two short lessons                                    |
| 🐍 Python           | 🟢 Live    | 36 lessons, 60 practice problems, 56 interview questions                          |
| 🌿 Django           | 🟢 Live    | 28 lessons, 4 guided projects (incl. an e-commerce capstone), 30 problems, 30 Q&A |
| ⚡ FastAPI          | 🟡 Next    | Typed async APIs, Pydantic, auth, background work and tests                       |
| 🔀 Git & GitHub     | ⚪ Planned | Version control, branching, reviews, recovery                                     |
| 🐳 Docker           | ⚪ Planned | Images, containers, Dockerfiles for Python and Node                               |
| 🔥 PyTorch          | ⚪ Planned | Tensors, autograd, training loops, 10+ models                                     |
| 📈 Machine Learning | ⚪ Planned | Loss, gradient descent, backprop, regularisation and evaluation                   |
| 🧠 LLMs             | ⚪ Planned | Tokens, attention, the KV cache, LoRA fine-tuning and retrieval                   |

## ✨ Features

|                                  |                                                                                                                                          |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 🎞️ **Visuals that explain**      | Step-through animations, 3D scenes for memory and request lifecycles, recorded HTTP exchanges and real SQL captured from the Django ORM. |
| 🧪 **Interactive mini lab**      | Right on the homepage: grow a Python list, send Django requests, branch and merge with Git, run a forward pass through a tiny network.   |
| 🎯 **Practice & interview prep** | Problems from easy to hard with hints and full solutions; interview questions with a short answer first, then the details.               |
| 🛠️ **Guided projects**           | Real, tested code with milestones, checkpoints and Postman collections.                                                                  |
| 🔎 **Fast search**               | <kbd>Ctrl</kbd> + <kbd>K</kbd> across lessons, problems and interview questions.                                                         |
| 🔖 **Progress & bookmarks**      | Saved in your browser. No account needed.                                                                                                |

## ✅ Quality bar

- **680+ code samples** are executed in CI, and their printed output must match the page.
- **100+ guided-project tests** run in CI, against PostgreSQL where it matters.
- **Responsive and themed:** the UI is tested at 360, 768, 1024 and 1440 px, in light and dark mode.
- **Accessible and fast:** automated accessibility checks (WCAG 2.1 AA) and Lighthouse budgets.

## 🧰 Tech stack

<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=nextjs,react,ts,tailwind,threejs,postgres,py,docker,nodejs,pnpm,vercel&perline=11" alt="Tech stack icons" />
  </a>
</p>

| Area                  | Tools                                                                                                                                                                                                                                                                      |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**         | ![Next.js](https://img.shields.io/badge/Next.js_16-000000?logo=nextdotjs&logoColor=white) ![React](https://img.shields.io/badge/React_19-20232A?logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) |
| **Styling & content** | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?logo=tailwindcss&logoColor=white) ![MDX](https://img.shields.io/badge/MDX-1B1F24?logo=mdx&logoColor=white) ![Shiki](https://img.shields.io/badge/Shiki-FF7A59)                                          |
| **Visuals**           | ![Three.js](https://img.shields.io/badge/Three.js-000000?logo=threedotjs&logoColor=white)                                                                                                                                                                                  |
| **Data**              | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white) ![Neon](https://img.shields.io/badge/Neon-00E599?logoColor=black) ![Drizzle](https://img.shields.io/badge/Drizzle_ORM-C5F74F?logo=drizzle&logoColor=black)                   |
| **Testing**           | ![Vitest](https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white) ![Playwright](https://img.shields.io/badge/Playwright-2EAD33?logoColor=white) ![axe](https://img.shields.io/badge/axe-663399)                                                            |
| **Verification**      | ![Python](https://img.shields.io/badge/Python_3.13-3776AB?logo=python&logoColor=white) — runs every code sample and guided project                                                                                                                                         |
| **Deploy**            | ![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)                                                                                                                                                                                          |

## 💻 Run it locally

**Requirements:** Node ≥ 22 · pnpm · Docker Desktop (running) · Python 3.13 (to verify code samples)

```bash
pnpm install
cp .env.example .env.local      # Windows PowerShell: Copy-Item .env.example .env.local
pnpm db:up                      # PostgreSQL 17 in Docker on port 5434
pnpm db:setup                   # migrate + seed the search index from content/
pnpm setup:py                   # .venv-verify/ with Django, DRF... for running the code samples
pnpm dev                        # http://localhost:3000
```

## ⌨️ Everyday commands

<details open>
<summary><strong>Develop & build</strong></summary>

| Command                    | What it does                                          |
| -------------------------- | ----------------------------------------------------- |
| `pnpm dev`                 | Dev server                                            |
| `pnpm build && pnpm start` | Production build and server                           |
| `pnpm db:seed`             | Re-sync the local search index after changing content |

</details>

<details open>
<summary><strong>Test & verify</strong></summary>

| Command              | What it does                                                                  |
| -------------------- | ----------------------------------------------------------------------------- |
| `pnpm check`         | lint + typecheck + unit tests + content/code verification                     |
| `pnpm test:e2e`      | Production build + Playwright E2E at 360/768/1024/1440 px (needs the DB)      |
| `pnpm verify:code`   | Validates content, runs every code sample, checks traces and recordings       |
| `pnpm test:projects` | Runs every guided project's tests, migration check, API files and checkpoints |
| `pnpm perf [url]`    | Lighthouse budgets against a running server (default `http://localhost:3000`) |

</details>

<details>
<summary><strong>Regenerate assets</strong></summary>

| Command            | What it does                                                         |
| ------------------ | -------------------------------------------------------------------- |
| `pnpm record`      | Re-records the HTTP/ORM/SQL recordings behind the visuals            |
| `pnpm gen:postman` | Regenerates OpenAPI schemas and Postman collections for the projects |

</details>

### Verifying samples that need PostgreSQL

Code samples that need PostgreSQL run only when `VERIFY_POSTGRES_URL` is set (CI sets it). Locally, set it
before running `pnpm verify:code`:

```powershell
$env:VERIFY_POSTGRES_URL="postgres://neo:neo_local_dev@localhost:5434/neodevnotebook"
```

```bash
export VERIFY_POSTGRES_URL="postgres://neo:neo_local_dev@localhost:5434/neodevnotebook"
```

> [!IMPORTANT]
> Every key in the repository is a fake. Real secrets only ever live in environment variables.

---

<div align="center">

### 👋 Author

Built by **Aman** · [@Aman554-EQ](https://github.com/Aman554-EQ)

Questions, corrections or ideas? [Open an issue](https://github.com/Aman554-EQ/NeoDevNotebook/issues) — they're welcome.

<sub>If NeoDevNotebook helped you learn something, a ⭐ on the repo goes a long way.</sub>

</div>
