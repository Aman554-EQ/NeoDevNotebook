# Part 2 · Module 1: Django (Plan)

**Branch:** `module/django` (from `develop`) · **Status:** ⏳ Awaiting approval
**Module:** `content/django/` · idPrefix `dj` · route `/learn/django`
**Order:** Django → FastAPI → Flask. Each module is planned, approved, built, tested and reported on before the next
one starts (owner's instruction, 2026-10-27).

---

## 1. Objective & Scope

**Goal:** someone who finishes this module is an **intermediate Django developer**. They can design, build, secure,
test, document and deploy a real Django + Django REST Framework (DRF) backend, explain how it works in an
interview, and know when Django is (and isn't) the right tool.

Each module has **4 parts**, as the owner asked:

| Part   | What                                                                                                                   | Size                                           |
| ------ | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Part 1 | **Main course:** web and backend fundamentals → Django core → REST APIs with DRF → data, security, testing, production | 28 lessons in 6 sections                       |
| Part 2 | **Projects:** 3 small guided projects + 1 big-shot project (PRD → design → build → secure → test), interactive         | 4 projects                                     |
| Part 3 | **Practice:** problems that test fundamentals and application, solutions run against hidden tests                      | **30** (8 easy · 8 simple · 7 medium · 7 hard) |
| Part 4 | **Interview:** commonly asked real-interview questions with short + detailed answers, code, pitfalls, follow-ups       | **30** (7 easy · 8 simple · 8 medium · 7 hard) |

Every lesson follows the soul.md §5 template **plus** the Part 1 enrichment pattern (Variations, Putting it
together, extra self-checks), has at least one visual where it clarifies something, and every code sample is
executed in CI.

**Out of scope:** front-end frameworks (React/Vue), Django Channels in depth (one lesson section only), GraphQL
beyond a comparison, cloud-provider-specific deployment.

**Versions:** Django **5.2 LTS**, DRF 3.16, Python 3.13, PostgreSQL 17 (already in the project's Docker setup).

---

## 2. Deliverables Checklist

- [ ] Part 2 platform upgrades (§6), built once here and reused by FastAPI and Flask
- [ ] 28 lessons (§3), each with code, variations, a realistic program, common mistakes, self-checks, takeaways
- [ ] Visuals (§4): 1 shared 3D request-lifecycle scene + 2D visuals, each with controls, caption, fallback
- [ ] Part 2: 3 small projects + 1 big-shot project (§5), every project's code runnable and its test suite green in CI
- [ ] Part 3: 30 problems with solutions + hidden tests (§7.1)
- [ ] Part 4: 30 interview questions (§7.2)
- [ ] Unit + content + code verification + E2E at 4 viewports + Lighthouse, all green (§9)
- [ ] Docs: `documentation/part-2-django.md`, `navigation/part-2-django.md`, changelog, plan status

---

## 3. Part 1: Main course (28 lessons)

Est. = estimated learner minutes. Every lesson has: concept → visual → worked example (code + line-by-line
explanation below it) → **Variations** → **Putting it together** → common mistakes (with real error messages) →
practice links → key takeaways.

### Section A: Web & backend foundations (5 lessons)

Written once here; FastAPI and Flask link back to them and add a short framework-specific recap (see Q1).

| #   | Lesson                           | Covers                                                                                                                                                                             | Visual              | Est. |
| --- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ---- |
| 01  | How the web works                | client/server, DNS → TCP → TLS → HTTP, request/response anatomy, methods, status codes, headers, cookies, HTTPS, browser vs API clients                                            | 3D RequestLifecycle | 20   |
| 02  | Backend fundamentals & REST      | statelessness, resources & URLs, REST constraints, JSON, safe vs **idempotent** methods, pagination, filtering, versioning, error formats, REST vs RPC/GraphQL/WebSockets/webhooks | 2D HttpExchange     | 22   |
| 03  | Databases for backend developers | relational vs document (NoSQL), tables/keys/relations, SQL essentials (SELECT, JOIN, GROUP BY, subqueries), indexes, transactions & ACID, PostgreSQL vs MySQL vs MongoDB           | 2D SqlPlayground    | 25   |
| 04  | Authentication & authorization   | authN vs authZ, password hashing (PBKDF2/argon2), sessions + cookies, tokens, **JWT anatomy** (header/payload/signature, expiry, refresh), OAuth2/OIDC overview, RBAC              | 2D JwtAnatomy       | 22   |
| 05  | Environment, tools & API clients | venv, `.env` and 12-factor config, secrets, **Postman** (collections, environments, tests), curl, HTTPie, browser DevTools network tab                                             | 2D HttpExchange     | 15   |

### Section B: Django core (8 lessons)

| #   | Lesson                            | Covers                                                                                                                                                                                        | Visual               | Est. |
| --- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ---- |
| 06  | Django in one picture             | what Django is, "batteries included", **MVT vs MVC**, project vs app, request → middleware → URLconf → view → model/template → response, who uses it                                          | 3D RequestLifecycle  | 15   |
| 07  | Setup, commands & settings        | `django-admin startproject`, `startapp`, `manage.py` (runserver, shell, check, makemigrations, migrate, createsuperuser, test, collectstatic, dbshell), settings structure, env vars, `DEBUG` | 2D CommandMap        | 18   |
| 08  | URLs & views                      | `path`/`re_path`, converters, `include`, names + `reverse`, function views, `HttpRequest`/`HttpResponse`/`JsonResponse`, `get_object_or_404`, class-based views (`View`, generic views)       | 2D UrlResolver       | 20   |
| 09  | Templates & static files          | DTL syntax, context, inheritance (`extends`/`block`), includes, filters, autoescaping (XSS), static files, `{% url %}`                                                                        | 2D MvtFlow           | 18   |
| 10  | Models & migrations               | fields & options, `Meta`, `__str__`, migrations (`makemigrations`, `migrate`, `sqlmigrate`, `showmigrations`), data migrations, squashing                                                     | 2D MigrationTimeline | 22   |
| 11  | The ORM: querying                 | QuerySets are lazy, `filter`/`exclude`/`get`, lookups, `Q` and `F`, ordering, slicing, `values`, `annotate`/`aggregate`, `update`/`delete` in bulk; the SQL Django writes                     | 2D OrmToSql          | 25   |
| 12  | Relationships & efficient queries | FK, M2M (with `through`), OneToOne, related names, **N+1** and `select_related`/`prefetch_related`, `only`/`defer`, indexes, `transaction.atomic`, `select_for_update`, raw SQL               | 2D OrmToSql          | 25   |
| 13  | Forms & validation                | `Form`/`ModelForm`, field + `clean_*` + `clean` validation, errors, CSRF protection, file uploads                                                                                             | 2D ValidationFlow    | 18   |

### Section C: The Django toolbox (4 lessons)

| #   | Lesson                           | Covers                                                                                                                                | Visual              | Est. |
| --- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ---- |
| 14  | The admin                        | registering models, `list_display`, filters, search, inlines, actions, permissions; admin as an internal tool, not a product          | none (screens)      | 15   |
| 15  | Users, sessions & permissions    | `User`, **custom user model** (do it on day one), login/logout, sessions, `login_required`, permissions & groups, object-level checks | 2D SessionVsToken   | 22   |
| 16  | Middleware & signals             | middleware order, writing middleware (timing, request ID), built-in security middleware, CORS, signals and when not to use them       | 3D RequestLifecycle | 18   |
| 17  | Caching, async & background work | cache framework (per-view, low-level, Redis), async views, why Celery/RQ exist, scheduled jobs, the outbox idea                       | 2D CacheHit         | 18   |

### Section D: REST APIs with DRF (5 lessons)

| #   | Lesson                           | Covers                                                                                                                                                                | Visual               | Est. |
| --- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ---- |
| 18  | DRF fundamentals                 | why DRF, `Serializer` vs `ModelSerializer`, validation, `APIView`, `Response`, status codes, the browsable API                                                        | 2D ValidationFlow    | 22   |
| 19  | A complete CRUD API              | generic views → `ViewSet` + routers, list/create/retrieve/update/partial_update/destroy, nested data, **pagination, filtering, ordering, search**                     | 2D HttpExchange      | 25   |
| 20  | API authentication & permissions | Session vs Token vs **JWT** (simplejwt: access/refresh, rotation, blacklist), permission classes, object permissions, **throttling**                                  | 2D JwtAnatomy        | 25   |
| 21  | API design in practice           | versioning, consistent error format, **idempotency keys** for POST, ETags/conditional requests, rate-limit headers, **webhooks** (send + receive + verify signatures) | 2D IdempotencyReplay | 22   |
| 22  | Documenting & exploring APIs     | OpenAPI with drf-spectacular, Swagger UI/ReDoc, exporting a **Postman** collection, example requests, writing a good README and API docs                              | 2D HttpExchange      | 15   |

### Section E: Databases in practice (3 lessons)

| #   | Lesson                         | Covers                                                                                                                                                             | Visual           | Est. |
| --- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ---- |
| 23  | PostgreSQL & MySQL with Django | `DATABASES` / `DATABASE_URL`, drivers (psycopg 3, mysqlclient), differences that bite (case sensitivity, JSON fields, transactions), connection pooling, `EXPLAIN` | 2D SqlPlayground | 20   |
| 24  | Query practice lab             | 15 graded ORM ↔ SQL exercises on a seeded shop database (filters, joins, aggregation, window functions, subqueries, `Exists`), each with the SQL equivalent        | 2D OrmToSql      | 30   |
| 25  | MongoDB alongside Django       | document modelling, embedding vs referencing, PyMongo CRUD + aggregation pipeline, indexes, why Django's ORM doesn't target Mongo (and the honest options)         | 2D DocVsTable    | 20   |

### Section F: Quality, security & production (3 lessons)

| #   | Lesson                                         | Covers                                                                                                                                                                                               | Visual              | Est. |
| --- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ---- |
| 26  | Testing Django properly                        | test pyramid, `TestCase`/`Client`/`APIClient`, pytest-django, fixtures & factories, testing models/views/permissions/queries (`assertNumQueries`), **health checks**, coverage                       | 2D TestPyramid      | 25   |
| 27  | Security & best practices                      | `check --deploy`, secrets & env, HTTPS/HSTS, CSRF/XSS/SQL injection/clickjacking, CORS, password validators, rate limiting, logging without leaking PII, dependency updates                          | none (checklist)    | 20   |
| 28  | Codebases, docs & deployment; Django vs others | project layout and app boundaries, split settings, services layer, docs (README, ADRs, docstrings), Docker + gunicorn, static files, CI, **pros/cons of Django vs FastAPI vs Flask**, industry usage | 2D FrameworkCompare | 20   |

---

## 4. Visualization List

Shared web visuals live in `src/components/viz/_shared/web/` so FastAPI and Flask reuse them with their own data.

| Visual                                                                                                                                                      | Kind | What it shows                                                                                                                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RequestLifecycle**                                                                                                                                        | 3D   | A request packet travelling client → server → middleware layers → router → view → ORM → DB and back, per framework (Django/FastAPI/Flask stacks). Steps highlight each layer; short-circuit (e.g. auth middleware returning 401) is shown |
| **HttpExchange**                                                                                                                                            | 2D   | A Postman-style request/response viewer: method, URL, headers, body, status, timing. Driven by **recorded real exchanges** (§6.2)                                                                                                         |
| **JwtAnatomy**                                                                                                                                              | 2D   | Interactive: edit the payload, see the base64url parts and signature change; tamper with a byte and watch verification fail; expiry timeline                                                                                              |
| **OrmToSql**                                                                                                                                                | 2D   | A QuerySet and the exact SQL Django generates (captured by running it), with a query counter showing N+1 vs `select_related`                                                                                                              |
| **SqlPlayground**                                                                                                                                           | 2D   | A small table set with highlighted rows for SELECT/JOIN/GROUP BY steps (results captured from real SQLite runs)                                                                                                                           |
| MvtFlow, UrlResolver, CommandMap, MigrationTimeline, ValidationFlow, SessionVsToken, CacheHit, IdempotencyReplay, DocVsTable, TestPyramid, FrameworkCompare | 2D   | One focused concept each, step-based with narration                                                                                                                                                                                       |

Every visual: play/pause/step/reset, caption, screen-reader text, reduced-motion fallback (soul.md §8). One 3D scene
per lesson at most, lazy-loaded.

---

## 5. Part 2: Projects (interactive, guided)

Every project page is a **guided build**: the learner reads a step, does it themselves, checks a hint, then reveals
the solution. Progress is saved locally. All project code lives in the repo under `projects/django/<name>/`, and
**its test suite runs in CI**, so every solution the learner sees is proven to work.

Each project page has these stages:

1. **PRD:** problem, users, user stories, scope and non-goals, acceptance criteria (how to write one is taught on
   the first project).
2. **Design:** data model (ER diagram), API table (method, path, auth, request/response), architecture (apps,
   layers), env/config list.
3. **Build milestones:** 5–10 tasks, each with "your turn" instructions, hints, the solution (multi-file code tabs),
   and a checkpoint test to run.
4. **Harden:** security and best-practices checklist for this project.
5. **Test:** the full test suite explained (unit, API, permissions, query counts, health).
6. **Ship:** run with Docker/gunicorn, environment variables, what changes in production.

### 5.1 Small projects (3)

| Project              | Builds                                                                                                   | Key concepts                                        |
| -------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| **Notes (MVT)**      | server-rendered notes app: list/create/edit/delete, search                                               | URLs, views, templates, ModelForm, CRUD, messages   |
| **Library REST API** | books/authors/loans API with DRF                                                                         | serializers, ViewSets, pagination, filtering, tests |
| **Auth starter**     | custom user, signup/login/logout (sessions) + JWT for the API, password reset by email (console backend) | auth, permissions, JWT, email, security settings    |

### 5.2 Big-shot project: **ShopLite** (e-commerce order platform)

A realistic backend that uses everything in the module:

- **Domain:** catalogue (categories, products, stock), carts, orders, payments, customers and staff.
- **Web side (MVT):** storefront pages with sessions (cart in session for guests), staff dashboard in the admin.
- **API side (DRF):** versioned `/api/v1/`, JWT auth (access + refresh), role permissions (customer vs staff),
  pagination/filtering/search, consistent error format, OpenAPI docs + Postman collection.
- **Orders done right:** `transaction.atomic` + `select_for_update` so stock can't oversell; order state machine.
- **Payments:** a simulated payment provider that calls back via **webhook** (HMAC signature verification,
  replay protection); **idempotency keys** on `POST /orders` so a retried request never creates two orders.
- **Middleware:** request ID + timing logs, security headers; CORS for a separate front-end.
- **Performance:** query budgets enforced in tests (`assertNumQueries`), indexes, caching the catalogue.
- **Config:** `.env` via `django-environ`, split settings (dev/test/prod), HTTPS settings (HSTS, secure cookies).
- **Tests:** models, services, API (auth, permissions, validation), webhook signatures, idempotency, concurrency
  of stock, `/health/` (liveness) and `/ready/` (DB check).

---

## 6. Platform upgrades for Part 2 (built once, here)

Same rule as Part 1: general features, built first as separate commits, unit + E2E tested.

### 6.1 Python verification environment

- Framework code can't run on the bare interpreter. Add `requirements-verify.txt` (exact pins) and
  `pnpm setup:py`, which creates `.venv-verify/` (git-ignored). `pnpm verify:code` uses it automatically.
- New packages (dev/verification only; nothing ships to the website): Django 5.2, djangorestframework,
  djangorestframework-simplejwt, django-environ, drf-spectacular, django-filter, pytest-django, model-bakery,
  mongomock (Mongo examples in CI), psycopg[binary] (Postgres examples). See Q2.

### 6.2 Multi-file samples and recorded HTTP exchanges

- **`<CodeTabs>`**: a multi-file sample (`models.py`, `views.py`, `urls.py`, `tests.py`) shown as tabs with a file
  tree. The verifier assembles the files into a temporary project and runs them (Django: settings in memory +
  SQLite; output or test results compared).
- **Recorded exchanges** (like Part 1's traces): `content/django/exchanges/<name>.py` drives the app through the
  test client; `scripts/record_exchanges.py` saves `<name>.http.json` (method, URL, headers, body, status, timing)
  for the **HttpExchange** visual. `verify:code` fails if a recording is stale.

### 6.3 Guided projects

- New content type `content/<module>/projects/<slug>/project.mdx` with stages and tasks (front matter lists
  milestones, each with `task`, `hints[]`, `solutionFiles`, `checkpoint` test name).
- New routes `/projects`, `/projects/<module>`, `/projects/<module>/<slug>`; a progress checklist per task (local
  storage, like lesson progress); sidebar and home page link them; search indexes them.
- Downloadable **Postman collection** per project (`public/postman/<module>-<slug>.json`), generated from the
  project's OpenAPI schema and checked in CI.

### 6.4 UI polish (owner asked for an eye-soothing, responsive experience)

- Module landing page shows the 4 parts as cards (Course · Projects · Practice · Interview) with progress.
- Long lessons: sticky "on this page" on desktop, a collapsible TOC button on mobile, and a "back to top" control.
- Code tabs and API viewers fit 360 px without page scroll; reading width and spacing tuned for long pages.

**New dependencies (website):** none expected; all visuals use the existing SVG/three.js stack.

---

## 7. Parts 3 and 4: Practice and Interview

### 7.1 Practice problems: 30 (`dj-p-001` … `dj-p-030`)

Each problem: statement, constraints, examples, starter code, hints, solution, explanation **below** the code,
complexity where it matters, and **hidden tests** (Django test client / ORM on seeded SQLite) that the solution
must pass in CI. Mix:

| Tier   | Count | Examples of what's tested                                                                                                        |
| ------ | ----- | -------------------------------------------------------------------------------------------------------------------------------- |
| easy   | 8     | write a URL + view returning JSON; model with constraints; a template filter; a `ModelForm` with validation                      |
| simple | 8     | ORM queries (filter/annotate/aggregate) on a seeded DB; a serializer with cross-field validation; a permission class             |
| medium | 7     | fix an N+1 (query budget enforced); paginated + filtered list endpoint; middleware adding request IDs; JWT-protected endpoint    |
| hard   | 7     | idempotent order creation; webhook signature verification; race-free stock decrement; complex reporting query (window functions) |

5 of the 30 are **find-and-fix-the-bug** problems (spread across tiers).

### 7.2 Interview questions: 30 (`dj-i-001` … `dj-i-030`)

Short answer (say it first), detailed answer, code where useful, pitfalls / what interviewers listen for, likely
follow-ups. Topics: MVT vs MVC, request lifecycle, middleware order, ORM laziness and N+1, `select_related` vs
`prefetch_related`, migrations in teams, custom user model, sessions vs JWT, CSRF, DRF serializers vs forms,
ViewSets and routers, permissions vs authentication, throttling, transactions and race conditions, signals pros/cons,
caching strategies, async Django, scaling Django, testing strategy, security checklist, Django vs FastAPI vs Flask.

---

## 8. Step-wise Build Plan (each step ends with green tests and a commit on `module/django`)

| #    | Step                                                                                       | Acceptance criteria                                                                 |
| ---- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| 2.1  | Release Part 1 if the owner OKs it; branch `module/django` from `develop`                  | Branch exists; Part 1 untouched                                                     |
| 2.2  | Platform: verification env (§6.1)                                                          | `pnpm setup:py` + `verify:code` run a Django sample; CI-safe on a clean machine     |
| 2.3  | Platform: `<CodeTabs>` + multi-file verification, recorded HTTP exchanges (§6.2)           | A 4-file sample runs; a stale exchange fails the check; viewer has unit + E2E tests |
| 2.4  | Platform: guided projects (§6.3) + UI polish (§6.4)                                        | Routes render, progress persists, search finds projects, 360 px has no page scroll  |
| 2.5  | Shared visuals: RequestLifecycle 3D, HttpExchange, JwtAnatomy, OrmToSql, SqlPlayground     | Controls, fallback, axe, reduced motion; viz models unit-tested                     |
| 2.6  | **Part 1 · Milestone A:** lessons 01–05 (foundations)                                      | Template + enrichment rules pass; samples verified                                  |
| 2.7  | **Part 1 · Milestone B:** lessons 06–17 (Django core + toolbox)                            | As 2.6; generated SQL in lessons captured from real runs                            |
| 2.8  | **Part 1 · Milestone C:** lessons 18–28 (DRF, databases, quality)                          | As 2.6; Postgres/Mongo samples verified (see Q3)                                    |
| 2.9  | **Part 2:** 3 small projects + ShopLite                                                    | Every project's test suite green in CI; Postman collections generated               |
| 2.10 | **Part 3:** 30 problems                                                                    | Targets met (8/8/7/7, 5 bug-fix); every solution passes its hidden tests            |
| 2.11 | **Part 4:** 30 interview questions                                                         | Targets met (7/8/8/7); every snippet verified                                       |
| 2.12 | Cross-links, search re-seed, full gate (unit, verify ×3, check:dev, E2E, Lighthouse), docs | Everything green; report to owner; **stop** for the FastAPI plan approval           |

---

## 9. Test Plan

- **Unit (Vitest):** CodeTabs, HttpExchange viewer, JwtAnatomy (encode/decode/tamper against PyJWT-recorded
  vectors), OrmToSql model, project progress store, Postman generator.
- **Content integrity:** targets (28 lessons, 30/30 with tier minimums), template + enrichment rules, unique IDs,
  internal links, every project milestone has hints + solution + checkpoint.
- **Code verification:** every sample, problem solution + hidden tests, interview snippet, recorded exchange, and
  **every project's full test suite** (pytest-django). Run three times to catch order-dependent output.
- **E2E (4 viewports):** every Django page 200 with no console errors; project progress; code tabs keyboard use;
  3D lifecycle lazy-load + fallback; axe light/dark; no horizontal scroll at 360 px.
- **Dev health:** `pnpm check:dev` (every route, visual, navigation) with zero warnings.
- **Performance:** Lighthouse on a long lesson, a project page and the problem list (soul.md §11 budgets).

---

## 10. Risks & Open Questions

| #   | Item                                                                                                                                                                                                                                                               | My default if you don't say otherwise                                          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| R1  | **Volume:** 28 lessons + 4 projects + 60 practice items per module, ×3 modules                                                                                                                                                                                     | Milestones with progress notes, everything verified before moving on           |
| R2  | Framework versions change; examples must keep running                                                                                                                                                                                                              | Exact pins in `requirements-verify.txt`; version noted on each lesson          |
| R3  | Long lessons and code-heavy project pages could hurt performance                                                                                                                                                                                                   | Code highlighted at build time (already), lazy visuals, Lighthouse in the gate |
| Q1  | **Shared foundations:** lessons 01–05 (HTTP, REST, databases, auth/JWT, tools) apply to all three frameworks. **A:** keep them in Django; FastAPI and Flask link back + short recap. **B:** a separate small "Backend Foundations" module that all three build on. | **A** (no duplication, Django comes first anyway)                              |
| Q2  | **New Python packages** for verification only (list in §6.1). Nothing is added to the website bundle.                                                                                                                                                              | Approve the list                                                               |
| Q3  | **Databases:** examples run on SQLite + PostgreSQL (existing Docker). For **MongoDB** and **MySQL**: **A:** add Docker services and run examples for real; **B:** Mongo via `mongomock`, MySQL shown with config/differences only (not executed).                  | **B** for CI speed; real Docker services optional via `pnpm db:extra`          |
| Q4  | **Projects as real code** in `projects/django/…`, each with its own test suite run in CI (the learner sees exactly the code that passed).                                                                                                                          | Yes                                                                            |
| Q5  | **Release Part 1 first?** `develop` has Part 1 (+ session 03) unreleased. Release `v0.2.0` before starting, or keep going and release later?                                                                                                                       | Release `v0.2.0` first (needs your OK)                                         |

---

## 11. Suggestions (not included; build only if you ask)

- Django Channels / WebSockets deep dive (real-time notifications for ShopLite).
- Celery + Redis worker with a visual task queue.
- A "deploy to a real host" walkthrough (Render/Fly/Railway) with HTTPS and a managed Postgres.
