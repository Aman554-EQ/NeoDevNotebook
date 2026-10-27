"use client"

import { cn } from "@/lib/utils"
import { VizFrame, useViz, type VizStep } from "../_shared/viz-frame"

/* ------------------------------------------------------------------------------------------ */
/* Commands                                                                                   */
/* ------------------------------------------------------------------------------------------ */

type Command = { group: string; cmd: string }
type CommandStep = VizStep & { active: string[]; terminal: string[] }

const DJANGO_COMMANDS: Command[] = [
  { group: "Create", cmd: "django-admin startproject" },
  { group: "Create", cmd: "startapp" },
  { group: "Develop", cmd: "runserver" },
  { group: "Develop", cmd: "shell" },
  { group: "Database", cmd: "makemigrations" },
  { group: "Database", cmd: "migrate" },
  { group: "Database", cmd: "showmigrations" },
  { group: "Database", cmd: "dbshell" },
  { group: "Users", cmd: "createsuperuser" },
  { group: "Quality", cmd: "check" },
  { group: "Quality", cmd: "test" },
  { group: "Ship", cmd: "check --deploy" },
  { group: "Ship", cmd: "collectstatic" },
]

const DJANGO_STEPS: CommandStep[] = [
  {
    label: "New project",
    narration:
      "startproject creates manage.py and a configuration package. The trailing dot puts them in the current folder instead of a nested one.",
    active: ["django-admin startproject"],
    terminal: [
      "$ django-admin startproject config .",
      "manage.py",
      "config/  __init__.py  settings.py  urls.py  asgi.py  wsgi.py",
    ],
  },
  {
    label: "New app",
    narration:
      "A project holds apps; each app is one area of the domain (notes, orders, payments). Add it to INSTALLED_APPS so Django finds its models and templates.",
    active: ["startapp"],
    terminal: [
      "$ python manage.py startapp notes",
      "notes/  admin.py  apps.py  models.py  tests.py  views.py  migrations/",
      '# settings.py → INSTALLED_APPS += ["notes"]',
    ],
  },
  {
    label: "Run it",
    narration:
      "runserver starts a development server that reloads when code changes. It is single-purpose and unhardened: never use it in production.",
    active: ["runserver"],
    terminal: [
      "$ python manage.py runserver",
      "Watching for file changes with StatReloader",
      "Starting development server at http://127.0.0.1:8000/",
    ],
  },
  {
    label: "Schema",
    narration:
      "makemigrations writes migration files from model changes; migrate applies them; showmigrations lists what's applied.",
    active: ["makemigrations", "migrate", "showmigrations"],
    terminal: [
      "$ python manage.py makemigrations",
      "$ python manage.py migrate",
      "$ python manage.py showmigrations notes",
    ],
  },
  {
    label: "Explore",
    narration:
      "shell opens Python with your project loaded (try the ORM there); dbshell opens the database's own client (psql, sqlite3) with the right credentials.",
    active: ["shell", "dbshell"],
    terminal: [
      "$ python manage.py shell",
      ">>> from notes.models import Note",
      ">>> Note.objects.count()",
      "$ python manage.py dbshell",
    ],
  },
  {
    label: "Admin user",
    narration: "createsuperuser makes a user with every permission, for /admin/.",
    active: ["createsuperuser"],
    terminal: [
      "$ python manage.py createsuperuser",
      "Username: admin",
      "Superuser created successfully.",
    ],
  },
  {
    label: "Quality",
    narration:
      "check validates settings and models without running anything; test runs the test suite against a fresh test database.",
    active: ["check", "test"],
    terminal: [
      "$ python manage.py check",
      "System check identified no issues (0 silenced).",
      "$ python manage.py test",
    ],
  },
  {
    label: "Ship",
    narration:
      "check --deploy flags unsafe production settings (DEBUG, HTTPS, cookies, HSTS); collectstatic copies every static file into STATIC_ROOT for the web server.",
    active: ["check --deploy", "collectstatic"],
    terminal: ["$ python manage.py check --deploy", "$ python manage.py collectstatic --noinput"],
  },
]

export function CommandMapViz() {
  return (
    <VizFrame
      title="The Django commands you will use every week"
      caption="Everything goes through manage.py, which loads your settings first. That is why `python manage.py shell` can import your models while a plain `python` can't."
      steps={DJANGO_STEPS}
      intervalMs={3000}
    >
      <CommandScene commands={DJANGO_COMMANDS} steps={DJANGO_STEPS} />
    </VizFrame>
  )
}

function CommandScene({ commands, steps }: { commands: Command[]; steps: CommandStep[] }) {
  const { step } = useViz()
  const s = steps[step]!
  const groups = [...new Set(commands.map((c) => c.group))]
  return (
    <div className="space-y-3 p-4" data-testid="command-map">
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {groups.map((g) => (
          <section key={g} className="border-rule rounded-lg border p-2">
            <h4 className="text-muted mb-1 text-xs font-semibold tracking-wide uppercase">{g}</h4>
            <ul className="flex flex-wrap gap-1">
              {commands
                .filter((c) => c.group === g)
                .map((c) => (
                  <li
                    key={c.cmd}
                    className={cn(
                      "rounded px-1.5 py-0.5 font-mono text-xs",
                      s.active.includes(c.cmd)
                        ? "bg-accent text-accent-ink font-semibold"
                        : "bg-surface-2 text-muted",
                    )}
                  >
                    {c.cmd}
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
      <pre className="bg-code-bg border-rule overflow-x-auto rounded-lg border px-3 py-2 font-mono text-xs leading-relaxed sm:text-[0.8rem]">
        {s.terminal.join("\n")}
      </pre>
    </div>
  )
}

/* ------------------------------------------------------------------------------------------ */
/* Sessions vs tokens                                                                         */
/* ------------------------------------------------------------------------------------------ */

type SideBySide = VizStep & { left: string[]; right: string[] }

function TwoColumns({
  steps,
  left,
  right,
  testId,
}: {
  steps: SideBySide[]
  left: string
  right: string
  testId: string
}) {
  const { step } = useViz()
  const s = steps[step]!
  return (
    <div className="grid gap-3 p-4 md:grid-cols-2" data-testid={testId}>
      {[
        { title: left, lines: s.left },
        { title: right, lines: s.right },
      ].map((col) => (
        <section key={col.title} className="border-rule rounded-lg border">
          <h4 className="border-rule bg-surface-2 border-b px-3 py-1.5 text-sm font-semibold">
            {col.title}
          </h4>
          <pre className="overflow-x-auto px-3 py-2 font-mono text-xs leading-relaxed whitespace-pre-wrap sm:text-[0.8rem]">
            {col.lines.join("\n")}
          </pre>
        </section>
      ))}
    </div>
  )
}

const SESSION_STEPS: SideBySide[] = [
  {
    label: "Log in",
    narration:
      "Both start the same way: the server checks the password hash. What it hands back differs.",
    left: [
      "POST /login/  email + password",
      "→ row in django_session:",
      "  key k2v9…  data {user_id: 7}  expires …",
      "← Set-Cookie: sessionid=k2v9…; HttpOnly",
    ],
    right: [
      "POST /api/auth/token/  email + password",
      "→ nothing stored on the server",
      "← {access: eyJhbGci…, refresh: eyJhbGci…}",
      "  signed with the server's secret key",
    ],
  },
  {
    label: "Next request",
    narration:
      "A session is a pointer: the server looks it up. A JWT carries its own claims: the server only verifies the signature.",
    left: [
      "GET /orders/",
      "Cookie: sessionid=k2v9…   (the browser adds it)",
      "→ SELECT … FROM django_session WHERE key = …",
      "→ request.user = User 7",
    ],
    right: [
      "GET /api/orders/",
      "Authorization: Bearer eyJhbGci…   (the app adds it)",
      "→ verify signature + exp, no database",
      "→ request.user = User 7 (from user_id claim)",
    ],
  },
  {
    label: "Log out",
    narration:
      "Deleting a session row logs the user out everywhere at once. A JWT stays valid until it expires, so access tokens are short-lived and refresh tokens can be blacklisted.",
    left: ["POST /logout/", "→ DELETE the session row", "the old cookie is now worthless"],
    right: [
      "POST /api/auth/logout/ {refresh}",
      "→ refresh token blacklisted",
      "the access token still works until exp (5–15 min)",
    ],
  },
  {
    label: "Risks",
    narration:
      "Cookies are sent automatically, so cookie auth needs CSRF protection. Tokens kept in JavaScript-readable storage can be stolen by XSS.",
    left: [
      "sent automatically by the browser",
      "→ CSRF protection required",
      "HttpOnly: JavaScript can't read it",
    ],
    right: [
      "sent only when code adds the header",
      "→ no CSRF on that header",
      "if stored in localStorage, XSS can steal it",
    ],
  },
  {
    label: "Pick",
    narration:
      "Same-site websites: sessions (simple, revocable). Mobile apps and third-party API clients: tokens. Many real backends, like ShopLite, use both.",
    left: ["best for: server-rendered sites,", "SPAs on the same domain"],
    right: ["best for: mobile apps, other services,", "clients on other domains"],
  },
]

export function SessionVsTokenViz() {
  return (
    <VizFrame
      title="Sessions vs JWTs: where the login lives"
      caption="A session ID is a key to data the server keeps; a JWT is the data itself, signed. That one difference explains revocation, scaling and which attacks each must defend against."
      steps={SESSION_STEPS}
      intervalMs={3600}
    >
      <TwoColumns
        steps={SESSION_STEPS}
        left="Session + cookie"
        right="JWT (token)"
        testId="session-vs-token"
      />
    </VizFrame>
  )
}

const DOC_STEPS: SideBySide[] = [
  {
    label: "Same order",
    narration: "One order with two lines, stored two ways.",
    left: [
      "orders        id=41  user_id=7  status='paid'",
      "order_items   order_id=41 product_id=3 qty=2",
      "              order_id=41 product_id=9 qty=1",
      "products      id=3 'Dune'   id=9 'Chess set'",
    ],
    right: [
      "{",
      '  "_id": 41, "user_id": 7, "status": "paid",',
      '  "items": [',
      '    {"product_id": 3, "name": "Dune", "qty": 2},',
      '    {"product_id": 9, "name": "Chess set", "qty": 1}',
      "  ]",
      "}",
    ],
  },
  {
    label: "Read it",
    narration:
      "Relational: a JOIN puts the pieces back together. Document: one read returns everything that belongs together.",
    left: [
      "SELECT o.id, p.name, i.qty",
      "FROM orders o",
      "JOIN order_items i ON i.order_id = o.id",
      "JOIN products p ON p.id = i.product_id",
      "WHERE o.id = 41;",
    ],
    right: ['db.orders.find_one({"_id": 41})', "→ the whole order, items included"],
  },
  {
    label: "Change a name",
    narration:
      "Renaming a product: one row in SQL. In documents, every copied name is a separate value, so you embed what's read together and reference what changes independently.",
    left: [
      "UPDATE products SET name = 'Dune (2021 ed.)'",
      "WHERE id = 3;   -- one row, every order sees it",
    ],
    right: [
      "embedded copies don't change by themselves:",
      "db.orders.update_many(",
      '  {"items.product_id": 3},',
      '  {"$set": {"items.$[i].name": "Dune (2021 ed.)"}}, …)',
    ],
  },
  {
    label: "Guarantees",
    narration:
      "Relational databases enforce structure (types, foreign keys, constraints) for you. MongoDB is flexible per document; validation is opt-in with JSON Schema.",
    left: [
      "schema enforced by the database",
      "foreign keys, unique, check constraints",
      "multi-row transactions: standard",
    ],
    right: [
      "flexible shape per document",
      "validation: opt-in ($jsonSchema)",
      "single-document writes are atomic",
    ],
  },
]

export function DocVsTableViz() {
  return (
    <VizFrame
      title="Tables and documents: the same order twice"
      caption="Neither is better in general. Relational shines when data is connected and must stay consistent; documents shine when you read and write one self-contained thing at a time."
      steps={DOC_STEPS}
      intervalMs={3600}
    >
      <TwoColumns
        steps={DOC_STEPS}
        left="Relational (PostgreSQL)"
        right="Document (MongoDB)"
        testId="doc-vs-table"
      />
    </VizFrame>
  )
}

/* ------------------------------------------------------------------------------------------ */
/* Test pyramid                                                                               */
/* ------------------------------------------------------------------------------------------ */

const LEVELS = [
  { id: "e2e", label: "End-to-end", width: "w-1/3", note: "few · slow · whole system" },
  { id: "api", label: "Integration / API", width: "w-2/3", note: "some · test client + database" },
  { id: "unit", label: "Unit", width: "w-full", note: "many · fast · no I/O" },
]
const PYRAMID_STEPS: (VizStep & { active: string; example: string[] })[] = [
  {
    label: "Unit",
    narration:
      "The base: small, fast tests of pure logic (a price calculation, a signature check, the order state machine). Hundreds run in a second.",
    active: "unit",
    example: [
      "def test_state_machine():",
      "    order = Order(status=Order.Status.SHIPPED)",
      "    assert not order.can_become(Order.Status.CANCELLED)",
    ],
  },
  {
    label: "API",
    narration:
      "The middle: requests through the real URL routing, permissions, serializers and a test database. This is where most Django bugs are caught.",
    active: "api",
    example: [
      "def test_customers_cannot_change_prices(api, customer, catalog):",
      "    api.force_authenticate(customer)",
      '    r = api.patch("/api/v1/products/dune/", {"price": "0.01"})',
      "    assert r.status_code == 403",
    ],
  },
  {
    label: "End-to-end",
    narration:
      "The top: a real browser or HTTP client against a running deployment. Valuable but slow and brittle, so keep only the critical journeys (sign up, check out).",
    active: "e2e",
    example: [
      "browser: open /, add Dune to cart, log in, place order",
      "→ expect 'Order #… placed'",
    ],
  },
  {
    label: "Health",
    narration:
      "In production, /health/ (alive?) and /ready/ (database and cache OK?) are tiny tests that monitors and load balancers run every few seconds.",
    active: "e2e",
    example: [
      "$ curl -s https://shop.example.com/ready/",
      '{"status": "ok", "checks": {"database": "ok", "cache": "ok"}}',
    ],
  },
]

export function TestPyramidViz() {
  return (
    <VizFrame
      title="The test pyramid"
      caption="Many fast tests at the bottom, few slow ones at the top. A failing unit test points straight at the bug; a failing end-to-end test only tells you something, somewhere, broke."
      steps={PYRAMID_STEPS}
      intervalMs={3400}
    >
      <PyramidScene />
    </VizFrame>
  )
}

function PyramidScene() {
  const { step } = useViz()
  const s = PYRAMID_STEPS[step]!
  return (
    <div className="space-y-3 p-4" data-testid="test-pyramid">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-1.5">
        {LEVELS.map((l) => (
          <div
            key={l.id}
            className={cn(
              "rounded-md border-2 px-3 py-2 text-center",
              l.width,
              s.active === l.id ? "border-accent bg-accent-soft" : "border-rule bg-surface",
            )}
          >
            <span className="block text-sm font-semibold">{l.label}</span>
            <span className="text-muted block text-xs">{l.note}</span>
          </div>
        ))}
      </div>
      <pre className="bg-code-bg border-rule mx-auto max-w-2xl overflow-x-auto rounded-lg border px-3 py-2 font-mono text-xs leading-relaxed sm:text-[0.8rem]">
        {s.example.join("\n")}
      </pre>
    </div>
  )
}

/* ------------------------------------------------------------------------------------------ */
/* Framework comparison                                                                       */
/* ------------------------------------------------------------------------------------------ */

const ROWS: { aspect: string; django: string; fastapi: string; flask: string }[] = [
  {
    aspect: "Philosophy",
    django: "batteries included: one way to do most things",
    fastapi: "modern API framework built on type hints",
    flask: "micro-framework: you choose every extension",
  },
  {
    aspect: "Database",
    django: "built-in ORM + migrations",
    fastapi: "bring your own (SQLAlchemy, SQLModel)",
    flask: "bring your own (Flask-SQLAlchemy)",
  },
  {
    aspect: "Admin & auth",
    django: "admin site, users, permissions, sessions built in",
    fastapi: "security utilities; auth is yours to assemble",
    flask: "extensions (Flask-Login, Flask-JWT-Extended)",
  },
  {
    aspect: "Validation & docs",
    django: "forms; DRF serializers; OpenAPI via drf-spectacular",
    fastapi: "Pydantic models; OpenAPI + Swagger UI automatic",
    flask: "WTForms / marshmallow; docs via extensions",
  },
  {
    aspect: "Async",
    django: "async views; the ORM's async methods (aget, acreate) run sync code in a thread",
    fastapi: "async-first (ASGI)",
    flask: "async views possible; WSGI at heart",
  },
  {
    aspect: "Best fit",
    django: "full products: content sites, shops, internal tools, big teams",
    fastapi: "JSON APIs, ML/LLM model serving, high-concurrency I/O",
    flask: "small services, prototypes, apps needing unusual structure",
  },
  {
    aspect: "Watch out for",
    django: "heavier for a tiny service; ORM habits (N+1)",
    fastapi: "you design structure, auth and data layer yourself",
    flask: "structure and consistency depend on team discipline",
  },
]

export function FrameworkCompareViz() {
  return (
    <VizFrame
      title="Django, FastAPI and Flask side by side"
      caption="All three are production-proven. The question is not which is best, but how much the framework should decide for you, and whether you mainly serve pages or JSON."
      steps={ROWS.map((r) => ({
        label: r.aspect,
        narration: `Django: ${r.django}. FastAPI: ${r.fastapi}. Flask: ${r.flask}.`,
      }))}
      intervalMs={3800}
    >
      <CompareScene />
    </VizFrame>
  )
}

function CompareScene() {
  const { step } = useViz()
  return (
    <div className="p-4" data-testid="framework-compare">
      <div tabIndex={0} role="region" aria-label="Comparison table" className="overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-rule border-b">
              <th scope="col" className="py-1.5 pr-2">
                Aspect
              </th>
              <th scope="col" className="py-1.5 pr-2">
                Django
              </th>
              <th scope="col" className="py-1.5 pr-2">
                FastAPI
              </th>
              <th scope="col" className="py-1.5">
                Flask
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => (
              <tr
                key={r.aspect}
                className={cn("border-rule border-b align-top", i === step && "bg-accent-soft")}
              >
                <th scope="row" className="py-1.5 pr-2 font-semibold">
                  {r.aspect}
                </th>
                <td className="py-1.5 pr-2">{r.django}</td>
                <td className="py-1.5 pr-2">{r.fastapi}</td>
                <td className="py-1.5">{r.flask}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
