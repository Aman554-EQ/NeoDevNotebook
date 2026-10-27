# Part 2 · Module 3: Flask (Plan)

**Branch:** `module/flask` (from `develop`, after FastAPI is merged) · **Status:** ⏳ Awaiting approval (after FastAPI)
**Module:** `content/flask/` · idPrefix `fl` · route `/learn/flask`
Uses the Part 2 platform and links back to the shared foundations lessons.

---

## 1. Objective & Scope

**Goal:** an **intermediate Flask developer** who understands how a micro-framework is assembled from extensions,
can structure a real app (application factory, blueprints, MVC layering), build server-rendered pages and REST
APIs, use SQL and MongoDB, add sessions and JWT auth, and test and deploy it.

| Part   | What                                                                                  | Size                                       |
| ------ | ------------------------------------------------------------------------------------- | ------------------------------------------ |
| Part 1 | **Main course:** Flask core → structure → data → APIs & auth → quality and production | 22 lessons in 5 sections                   |
| Part 2 | **Projects:** 3 small guided projects + 1 big-shot project                            | 4 projects                                 |
| Part 3 | **Practice:** 30 problems with hidden tests                                           | 30 (8 easy · 8 simple · 7 medium · 7 hard) |
| Part 4 | **Interview:** 30 questions                                                           | 30 (7 easy · 8 simple · 8 medium · 7 hard) |

**Versions:** Flask 3.1 (installed), Werkzeug 3, Jinja2, Flask-SQLAlchemy 3 + SQLAlchemy 2.0, Flask-Migrate,
Flask-Login, Flask-JWT-Extended, marshmallow (or Pydantic, see Q1), Python 3.13.

---

## 2. Part 1: Main course (22 lessons)

### Section A: Flask core (6 lessons)

| #   | Lesson                       | Covers                                                                                                                            | Visual              | Est. |
| --- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ---- |
| 01  | Flask in one picture         | micro-framework philosophy, WSGI + Werkzeug + Jinja2, request lifecycle, pros/cons, where it's used; foundations recap with links | 3D RequestLifecycle | 15   |
| 02  | Setup, commands & config     | `flask run`/`--debug`, the `flask` CLI and custom commands, config objects, `.env` with python-dotenv, instance folder            | 2D CommandMap       | 15   |
| 03  | Routes, requests & responses | `@app.route`, methods, converters, `request` (args, form, json, files), `jsonify`, status codes, redirects, `url_for`, errors     | 2D HttpExchange     | 20   |
| 04  | Contexts: app & request      | what `current_app`, `g`, `request`, `session` really are, context locals, pushing contexts in scripts and tests                   | 2D ContextStack     | 18   |
| 05  | Templates with Jinja2        | syntax, inheritance, macros, filters, autoescaping, static files, flashing messages                                               | 2D MvtFlow          | 18   |
| 06  | Forms & validation           | Flask-WTF forms, CSRF, validators; validating JSON with marshmallow/Pydantic; error responses                                     | 2D ValidationFlow   | 18   |

### Section B: Structuring real apps (4 lessons)

| #   | Lesson                           | Covers                                                                                                                | Visual              | Est. |
| --- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------- | ---- |
| 07  | Application factory & blueprints | `create_app()`, blueprints, registering extensions, avoiding circular imports, config per environment                 | 2D BlueprintMap     | 20   |
| 08  | MVC with Flask                   | models / views (templates or JSON) / controllers (blueprint routes) + a services layer; where logic belongs           | 2D LayerMap         | 18   |
| 09  | Hooks & middleware               | `before_request`/`after_request`/`teardown_request`, error handlers, WSGI middleware (ProxyFix, request IDs, timing)  | 3D RequestLifecycle | 18   |
| 10  | The extension ecosystem          | how extensions work (`init_app`), the common ones and what each replaces from Django; choosing and vetting extensions | none (map)          | 12   |

### Section C: Data (4 lessons)

| #   | Lesson                            | Covers                                                                                           | Visual               | Est. |
| --- | --------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------- | ---- |
| 11  | Flask-SQLAlchemy models & queries | models, relationships, session lifecycle in a request, CRUD, the SQL behind each query           | 2D OrmToSql          | 25   |
| 12  | Migrations & efficient queries    | Flask-Migrate (Alembic), N+1 and eager loading, pagination, indexes, transactions                | 2D MigrationTimeline | 20   |
| 13  | PostgreSQL, MySQL & raw SQL       | connection URLs, drivers, pooling, when to drop to SQL (`text()`), query practice on a seeded DB | 2D SqlPlayground     | 20   |
| 14  | MongoDB with Flask                | PyMongo / Flask-PyMongo, document design, CRUD + aggregation, indexes, validation                | 2D DocVsTable        | 18   |

### Section D: APIs & auth (5 lessons)

| #   | Lesson                      | Covers                                                                                                   | Visual               | Est. |
| --- | --------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------- | ---- |
| 15  | REST APIs with Flask        | `MethodView`, CRUD resources, serialization with marshmallow, pagination/filtering, consistent errors    | 2D HttpExchange      | 25   |
| 16  | API docs & tools            | flask-smorest / OpenAPI, Swagger UI, Postman collections, documenting endpoints                          | 2D HttpExchange      | 15   |
| 17  | Sessions & Flask-Login      | signed cookie sessions vs server sessions, login/logout, `login_required`, remember-me, password hashing | 2D SessionVsToken    | 20   |
| 18  | JWT with Flask-JWT-Extended | access/refresh tokens, protecting routes, claims & roles, revocation (blocklist), cookies vs headers     | 2D JwtAnatomy        | 20   |
| 19  | API design in practice      | versioning, **idempotency keys**, **webhooks** (send/verify), rate limiting (Flask-Limiter), CORS        | 2D IdempotencyReplay | 20   |

### Section E: Quality & production (3 lessons)

| #   | Lesson                                  | Covers                                                                                                                   | Visual              | Est. |
| --- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------- | ---- |
| 20  | Testing Flask                           | pytest + app factory fixtures, test client, testing templates/APIs/auth/DB, CLI commands, health endpoint, coverage      | 2D TestPyramid      | 22   |
| 21  | Security & best practices               | `SECRET_KEY`, secure cookies, CSRF, XSS, SQL injection, security headers (Talisman), secrets, logging                    | none (checklist)    | 18   |
| 22  | Deployment, codebases & Flask vs others | gunicorn, Docker, reverse proxy/HTTPS, project layout, docs; **pros/cons of Flask vs Django vs FastAPI**; industry usage | 2D FrameworkCompare | 18   |

---

## 3. Visuals

Reused: RequestLifecycle (3D, Flask stack), HttpExchange, JwtAnatomy, OrmToSql, SqlPlayground, MigrationTimeline,
ValidationFlow, SessionVsToken, IdempotencyReplay, DocVsTable, TestPyramid, FrameworkCompare, LayerMap, MvtFlow,
CommandMap. New: **ContextStack** (app/request contexts pushed and popped around a request) and **BlueprintMap**
(how blueprints and extensions plug into the app factory).

---

## 4. Part 2: Projects

Same guided format. Code in `projects/flask/<name>/`, suites run in CI, Postman collections generated.

| Project                   | Builds                                                 | Key concepts                          |
| ------------------------- | ------------------------------------------------------ | ------------------------------------- |
| **URL shortener**         | create/redirect/stats, unique codes, click counting    | routes, SQLAlchemy, validation, tests |
| **Guestbook (MVC)**       | server-rendered posts with forms, flashing, pagination | templates, WTForms, CSRF, blueprints  |
| **Bookmarks API + Mongo** | tagged bookmarks in MongoDB with search                | PyMongo, aggregation, REST, JWT       |

**Big-shot project: TaskFlow** (team task manager / kanban)

- App factory + blueprints (`auth`, `boards`, `api`, `webhooks`), services layer, config per environment.
- Web UI with Flask-Login sessions and CSRF; REST API with JWT (access/refresh/revocation) for mobile clients.
- Teams, boards, tasks, comments, roles (owner/member/viewer) with authorization checks on every object.
- PostgreSQL via Flask-SQLAlchemy + migrations; activity feed in MongoDB.
- **Outgoing webhooks** (signed, retried with backoff) when tasks change; **idempotency keys** on task creation;
  rate limiting; request IDs and structured logs; security headers; `/health` and `/ready`.
- Tests: models, services, permissions matrix, API, webhook signing/retries, idempotency, CLI commands, health.

---

## 5. Parts 3 and 4

- **Practice:** 30 problems (`fl-p-001` … `fl-p-030`), 8/8/7/7, 5 find-and-fix-the-bug, hidden tests via the Flask
  test client (routes, contexts, blueprints, SQLAlchemy queries, sessions, JWT, error handlers, webhooks).
- **Interview:** 30 questions (`fl-i-001` … `fl-i-030`), 7/8/8/7: WSGI, contexts and `g`, app factory, blueprints,
  extensions, sessions (signed cookies), CSRF, Flask-SQLAlchemy sessions, migrations, testing, scaling Flask,
  async support in Flask, security, Flask vs Django vs FastAPI.

---

## 6. Step-wise Build Plan (on `module/flask`)

| #   | Step                                                         | Acceptance criteria                           |
| --- | ------------------------------------------------------------ | --------------------------------------------- |
| 4.1 | Branch; Flask extension pins in the verification env         | `verify:code` runs a Flask sample             |
| 4.2 | New visuals: ContextStack, BlueprintMap                      | Controls, fallback, axe; models unit-tested   |
| 4.3 | **Part 1:** lessons 01–10, then 11–22 (two milestones)       | Template + enrichment rules; samples verified |
| 4.4 | **Part 2:** 3 small projects + TaskFlow                      | Suites green in CI; Postman collections       |
| 4.5 | **Part 3:** 30 problems · **Part 4:** 30 interview questions | Targets met; everything verified              |
| 4.6 | Full gate + docs; report                                     | Everything green                              |

---

## 7. Open Questions (Flask-specific)

| #   | Item                                                                                                                                                                            | My default                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Q1  | **API serialization:** marshmallow (the classic Flask choice, used by flask-smorest) or Pydantic (already taught in FastAPI)?                                                   | marshmallow as the main path, Pydantic as a variation |
| Q2  | Extra verification packages: Flask-SQLAlchemy, Flask-Migrate, Flask-Login, Flask-WTF, Flask-JWT-Extended, flask-smorest, marshmallow, Flask-Limiter, flask-talisman, flask-cors | Approve                                               |
