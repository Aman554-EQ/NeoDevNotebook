# Part 2 · Module 2: FastAPI (Plan)

**Branch:** `module/fastapi` (from `develop`, after Django is merged) · **Status:** ⏳ Awaiting approval (after Django)
**Module:** `content/fastapi/` · idPrefix `fa` · route `/learn/fastapi`
Uses the Part 2 platform built in the Django module (verification env, CodeTabs, recorded HTTP exchanges, guided
projects) and links back to the shared foundations lessons (Django plan, Q1).

---

## 1. Objective & Scope

**Goal:** an **intermediate FastAPI developer** who can build typed, async, well-tested APIs with SQL and NoSQL
databases, secure them with OAuth2/JWT, and use FastAPI as a **machine-learning / LLM backend**: model serving,
LLM inference with streaming, and ML engineering best practices.

| Part   | What                                                                                                                          | Size                                       |
| ------ | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Part 1 | **Main course:** async + typing foundations → FastAPI core → data → security → **ML & LLM backends** → quality and production | 27 lessons in 6 sections                   |
| Part 2 | **Projects:** 3 small guided projects + 1 big-shot project                                                                    | 4 projects                                 |
| Part 3 | **Practice:** 30 problems with hidden tests                                                                                   | 30 (8 easy · 8 simple · 7 medium · 7 hard) |
| Part 4 | **Interview:** 30 questions                                                                                                   | 30 (7 easy · 8 simple · 8 medium · 7 hard) |

**Versions:** FastAPI 0.136 (installed), Pydantic 2, SQLAlchemy 2.0 (sync + async), Alembic, Python 3.13.
**Out of scope:** training models (Part 5/6 cover PyTorch and ML), Kubernetes, GPU serving stacks (mentioned only).

---

## 2. Deliverables Checklist

- [ ] 27 lessons (§3) following the template + enrichment pattern
- [ ] Visuals (§4), reusing the shared web visuals with FastAPI data plus FastAPI-specific ones
- [ ] Part 2: 3 small projects + big-shot project (§5), all project test suites green in CI
- [ ] Part 3: 30 problems; Part 4: 30 interview questions
- [ ] Full gate green; docs, navigation, changelog, plan status

---

## 3. Part 1: Main course (27 lessons)

### Section A: Foundations for FastAPI (4 lessons)

| #   | Lesson                     | Covers                                                                                                                                                                            | Visual              | Est. |
| --- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ---- |
| 01  | FastAPI in one picture     | what FastAPI is (Starlette + Pydantic), ASGI vs WSGI, request lifecycle, automatic docs, pros/cons, who uses it and why; recap of HTTP/REST with links to the foundations lessons | 3D RequestLifecycle | 15   |
| 02  | Async Python for APIs      | event loop, `async def` vs `def` endpoints (threadpool), what blocks the loop, `asyncio.gather`, timeouts, when async helps and when it doesn't                                   | 2D AsyncTimeline    | 22   |
| 03  | Type hints & Pydantic v2   | models, field types, `Field` constraints, validators (`field_validator`, `model_validator`), serialization, strict vs lax, error format                                           | 2D ValidationFlow   | 25   |
| 04  | Setup, commands & settings | project layout, `fastapi dev`/`uvicorn` flags, reload, `pydantic-settings` + `.env`, environments, logging config, Postman/HTTPie against `/docs`                                 | 2D CommandMap       | 15   |

### Section B: FastAPI core (7 lessons)

| #   | Lesson                          | Covers                                                                                                                                                                           | Visual              | Est. |
| --- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ---- |
| 05  | Paths, queries & bodies         | path/query params, validation with `Annotated`, request bodies, headers, cookies, forms, file uploads                                                                            | 2D HttpExchange     | 20   |
| 06  | Responses & errors              | `response_model` (and why it protects you), status codes, `JSONResponse`/`StreamingResponse`/`FileResponse`, `HTTPException`, custom exception handlers, consistent error schema | 2D HttpExchange     | 20   |
| 07  | Dependency injection            | `Depends`, sub-dependencies, dependencies with `yield` (DB sessions), class dependencies, caching per request, overriding in tests                                               | 2D DependencyGraph  | 25   |
| 08  | Routers & project structure     | `APIRouter`, prefixes/tags, **layered architecture** (routers → services → repositories → models: the FastAPI version of MVC), where validation and business rules live          | 2D LayerMap         | 20   |
| 09  | Middleware, CORS & lifespan     | middleware (timing, request ID), CORS, GZip, trusted hosts, `lifespan` startup/shutdown (load models, open pools), background tasks                                              | 3D RequestLifecycle | 20   |
| 10  | A complete CRUD API             | Todo/Notes CRUD end to end: schemas (create/update/read), pagination, filtering, sorting, PATCH semantics, 404/409/422 handling                                                  | 2D HttpExchange     | 25   |
| 11  | WebSockets & server-sent events | WebSocket endpoints, broadcasting, SSE with `StreamingResponse`, when to use which                                                                                               | 2D StreamTimeline   | 18   |

### Section C: Data (5 lessons)

| #   | Lesson                              | Covers                                                                                                                                            | Visual               | Est. |
| --- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ---- |
| 12  | SQLAlchemy 2.0 ORM                  | engine, session, declarative models with `Mapped[]`, relationships, CRUD, session-per-request via `Depends`                                       | 2D OrmToSql          | 25   |
| 13  | Migrations with Alembic             | autogenerate, upgrade/downgrade, data migrations, migrations in teams and CI                                                                      | 2D MigrationTimeline | 15   |
| 14  | Efficient queries                   | N+1 and `selectinload`/`joinedload`, indexes, offset vs **keyset pagination**, bulk operations, transactions and locking, `EXPLAIN` on PostgreSQL | 2D OrmToSql          | 22   |
| 15  | Async databases; PostgreSQL & MySQL | `AsyncSession` + asyncpg/aiosqlite, pooling, PostgreSQL vs MySQL vs SQLite settings, SQLModel (brief, pros/cons)                                  | 2D AsyncTimeline     | 20   |
| 16  | MongoDB with FastAPI                | document design, PyMongo async / Motor, CRUD + aggregation, indexes, Pydantic models for documents, when NoSQL fits                               | 2D DocVsTable        | 20   |

### Section D: Security (3 lessons)

| #   | Lesson                      | Covers                                                                                                                                                         | Visual           | Est. |
| --- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ---- |
| 17  | OAuth2 & JWT authentication | password hashing, OAuth2 password flow, access + refresh tokens, `get_current_user` dependency, token expiry/rotation, logout strategies                       | 2D JwtAnatomy    | 25   |
| 18  | Authorization & API keys    | roles/scopes, object ownership checks, API keys for machine clients, service-to-service auth                                                                   | 2D LayerMap      | 18   |
| 19  | Hardening an API            | HTTPS, security headers, CORS done right, rate limiting, request size limits, input validation as security, secrets, **idempotency keys**, **webhook** signing | none (checklist) | 20   |

### Section E: FastAPI for machine learning & LLMs (5 lessons)

| #   | Lesson                      | Covers                                                                                                                                                                                                                | Visual              | Est. |
| --- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ---- |
| 20  | Why FastAPI for ML backends | typed inputs/outputs, async I/O, OpenAPI for consumers, performance; pros/cons vs Flask/Django/BentoML/Triton/Ray Serve; industry patterns                                                                            | 2D FrameworkCompare | 15   |
| 21  | Serving a model             | load once in `lifespan`, prediction endpoint with Pydantic schemas, CPU-bound inference without blocking the loop (threadpool/process pool), batching, model versioning, input/output validation                      | 2D AsyncTimeline    | 25   |
| 22  | LLM inference with FastAPI  | calling an LLM API (Claude via the official SDK) behind a provider interface, **streaming tokens** with SSE, timeouts/retries/backoff, token & cost accounting, prompt templates, caching, guardrails                 | 2D StreamTimeline   | 28   |
| 23  | RAG and async job APIs      | embeddings + retrieval (small local index), chat-with-documents endpoint, long jobs: 202 Accepted + job status + **webhook** callback, idempotent submissions                                                         | 2D WebhookSequence  | 25   |
| 24  | ML backend best practices   | health vs readiness (model loaded?), latency/throughput metrics, structured logs, request IDs, monitoring drift and errors, reproducibility (pinned model + config), A/B and shadow traffic, Docker images for models | none (checklist)    | 20   |

### Section F: Quality & production (3 lessons)

| #   | Lesson                         | Covers                                                                                                                                                                              | Visual              | Est. |
| --- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ---- |
| 25  | Testing FastAPI                | `TestClient` and `httpx.AsyncClient`, pytest fixtures, test databases and rollbacks, `dependency_overrides`, mocking the LLM, testing streaming, health, auth, validation, coverage | 2D TestPyramid      | 25   |
| 26  | Docs, tooling & codebases      | OpenAPI tags/examples/descriptions, Swagger UI & ReDoc, exporting to **Postman**, versioning, README/ADR templates, linting/formatting/typing in CI                                 | 2D HttpExchange     | 15   |
| 27  | Deployment & FastAPI vs others | uvicorn/gunicorn workers, Docker, env config, observability, performance tuning; **pros and cons** of FastAPI vs Django vs Flask, when to choose which                              | 2D FrameworkCompare | 18   |

---

## 4. Visualization List

Reused with FastAPI data: **RequestLifecycle (3D)**, HttpExchange, JwtAnatomy, OrmToSql, MigrationTimeline,
ValidationFlow, DocVsTable, TestPyramid, FrameworkCompare, CommandMap.

New for this module:

| Visual                    | Kind | What it shows                                                                                                                                               |
| ------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AsyncTimeline**         | 2D   | Sync vs async workers serving overlapping requests; a blocking call freezing the loop; threadpool offload                                                   |
| **DependencyGraph**       | 2D   | The dependency tree FastAPI resolves for one request (settings → DB session → current user → endpoint), with per-request caching and `yield` teardown order |
| **StreamTimeline**        | 2D   | LLM tokens arriving over SSE vs a single blocking response; time-to-first-token vs total time                                                               |
| LayerMap, WebhookSequence | 2D   | Router/service/repository layers; async job + webhook callback sequence                                                                                     |

---

## 5. Part 2: Projects (interactive, guided)

Same guided format as Django (PRD → design → build milestones with hints/solutions/checkpoints → harden → test →
ship). Code in `projects/fastapi/<name>/`, test suites run in CI, Postman collections generated from OpenAPI.

### 5.1 Small projects (3)

| Project                    | Builds                                                                    | Key concepts                                            |
| -------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------- |
| **Tasks API**              | CRUD with SQLAlchemy + Alembic, pagination, filters                       | schemas, DI, repositories, migrations, tests            |
| **Sentiment model server** | load a small model at startup, `/predict` and `/predict/batch`, versioned | lifespan, CPU-bound inference, validation, latency logs |
| **Realtime chat**          | WebSocket rooms + message history in MongoDB                              | WebSockets, Mongo, auth on sockets                      |

### 5.2 Big-shot project: **DocuMind** (an LLM document-assistant backend)

- **Users & auth:** signup/login, JWT access + refresh, API keys for programmatic clients, roles (user/admin).
- **Documents:** upload (size/type validation), chunking, embeddings, a small vector index; per-user isolation.
- **Chat:** `/chat` answers questions with retrieved context; **streams** tokens over SSE; citations; conversation
  history in PostgreSQL (SQLAlchemy async).
- **LLM layer:** provider interface (real Claude adapter + deterministic fake for tests and offline use), timeouts,
  retries with backoff, token/cost accounting per user, response caching.
- **Jobs & webhooks:** bulk ingestion as a background job (202 + status endpoint), **signed webhooks** on
  completion, **idempotency keys** on submission.
- **Ops:** rate limiting per API key, request IDs, structured logs, `/health` (liveness) and `/ready` (DB + model
  ready), settings via `.env`, Docker.
- **Tests:** unit (chunking, prompt building), API (auth, validation, streaming), fake-LLM integration tests,
  webhook signatures, idempotency, rate limits, readiness.

---

## 6. Parts 3 and 4

### 6.1 Practice problems: 30 (`fa-p-001` … `fa-p-030`), hidden tests via `TestClient`

| Tier   | Count | Examples                                                                                                    |
| ------ | ----- | ----------------------------------------------------------------------------------------------------------- |
| easy   | 8     | endpoint with path/query validation; Pydantic model with constraints; custom status codes; a router         |
| simple | 8     | dependency that reads a header; CRUD on an in-memory repo; exception handler with error schema; settings    |
| medium | 7     | JWT-protected route; keyset pagination; fix a blocking call in an async endpoint; SQLAlchemy N+1 fix        |
| hard   | 7     | streaming SSE endpoint with a fake LLM; idempotent job submission; webhook verification; batching predictor |

5 are find-and-fix-the-bug.

### 6.2 Interview questions: 30 (`fa-i-001` … `fa-i-030`)

ASGI vs WSGI, `async def` vs `def`, how DI works, Pydantic v2 validation, `response_model`, background tasks vs
task queues, lifespan, OAuth2/JWT flow, refresh tokens, CORS, rate limiting, SQLAlchemy sessions in async apps,
N+1, Alembic, testing with dependency overrides, serving ML models (blocking, batching, versioning), LLM streaming,
LLM reliability (timeouts, retries, fallbacks), RAG basics, scaling FastAPI, FastAPI vs Django vs Flask.

---

## 7. Step-wise Build Plan (on `module/fastapi`)

| #   | Step                                                                                   | Acceptance criteria                                                                          |
| --- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 3.1 | Branch from `develop` (Django merged); FastAPI pins in the verification env            | `verify:code` runs a FastAPI sample                                                          |
| 3.2 | New visuals: AsyncTimeline, DependencyGraph, StreamTimeline, LayerMap, WebhookSequence | Controls, fallback, axe; models unit-tested                                                  |
| 3.3 | **Part 1 · Milestone A:** lessons 01–11                                                | Template + enrichment rules; samples and exchanges verified                                  |
| 3.4 | **Part 1 · Milestone B:** lessons 12–19                                                | As 3.3; Postgres samples run; Mongo per the Django Q3 decision                               |
| 3.5 | **Part 1 · Milestone C:** lessons 20–27 (ML/LLM + quality)                             | LLM code verified with the fake provider; real-provider code shown, run only with a key (Q2) |
| 3.6 | **Part 2:** 3 small projects + DocuMind                                                | All project suites green in CI; Postman collections                                          |
| 3.7 | **Part 3:** 30 problems · **Part 4:** 30 interview questions                           | Targets met; every solution and snippet verified                                             |
| 3.8 | Full gate + docs; report; **stop** for the Flask plan approval                         | Everything green                                                                             |

---

## 8. Test Plan

As the Django module (§9 there), plus: streaming endpoints tested end to end with the fake LLM; dependency
overrides covered; the async database path tested against SQLite (aiosqlite) and PostgreSQL.

---

## 9. Open Questions (FastAPI-specific)

| #   | Item                                                                                                                                                                                                                                                                                   | My default                                                                    |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Q1  | **Small ML model** for the sentiment server: **A:** a tiny pure-Python / scikit-learn model (fast, CPU, no GPU); **B:** a Hugging Face transformer (realistic, but downloads hundreds of MB and needs PyTorch)                                                                         | **A** in CI; lesson 21 shows the transformer version as an optional variation |
| Q2  | **LLM provider:** lessons use Claude through the official Anthropic SDK behind a provider interface; CI uses a deterministic fake. Real calls only run when you set `ANTHROPIC_API_KEY` locally. OK, or do you want another provider (OpenAI, a local model via Ollama) shown as well? | Claude + an OpenAI-compatible/Ollama adapter as a variation                   |
| Q3  | Extra verification packages: pydantic-settings, aiosqlite, asyncpg, pymongo (async), python-multipart, passlib/argon2-cffi, scikit-learn (if Q1 = A uses it), anthropic                                                                                                                | Approve                                                                       |
