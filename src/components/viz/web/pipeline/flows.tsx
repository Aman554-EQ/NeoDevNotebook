"use client"

import { PipelineViz } from "./pipeline-viz"

/** Concept visuals built on PipelineViz. Data only: every step mirrors what really happens. */

export function WebRequestViz() {
  return (
    <PipelineViz
      title="What happens when you open a URL"
      caption="Most of the trip happens before your code runs: name lookup, a TCP connection and a TLS handshake. Keep-alive reuses that connection, which is why the second request to a site is faster than the first."
      nodes={[
        { id: "browser", label: "Browser", detail: "client" },
        { id: "dns", label: "DNS", detail: "name → IP" },
        { id: "tcp", label: "TCP", detail: "connection" },
        { id: "tls", label: "TLS", detail: "encryption" },
        { id: "http", label: "HTTP request", detail: "method + path" },
        { id: "server", label: "Server", detail: "your backend" },
        { id: "resp", label: "HTTP response", detail: "status + body" },
      ]}
      steps={[
        {
          label: "A URL",
          narration:
            "The browser splits the URL: scheme https (so port 443 and TLS), host shop.example.com, path /orders/7.",
          active: ["browser"],
          panel: { title: "URL", lines: ["https://shop.example.com/orders/7"] },
        },
        {
          label: "DNS lookup",
          narration:
            "The host name is turned into an IP address by DNS (answers are cached by the browser, the OS and resolvers).",
          active: ["dns"],
          done: ["browser"],
          panel: { title: "DNS answer", lines: ["shop.example.com  A  203.0.113.10"] },
        },
        {
          label: "TCP connect",
          narration:
            "A TCP connection to 203.0.113.10:443 is opened with a three-way handshake. TCP guarantees ordered, complete delivery.",
          active: ["tcp"],
          done: ["browser", "dns"],
          panel: {
            title: "Handshake",
            lines: ["client → SYN", "server → SYN-ACK", "client → ACK"],
          },
        },
        {
          label: "TLS handshake",
          narration:
            "Client and server agree on keys; the browser checks the server's certificate matches shop.example.com. Everything after this is encrypted.",
          active: ["tls"],
          done: ["browser", "dns", "tcp"],
          panel: {
            title: "TLS 1.3",
            lines: [
              "ClientHello (supported ciphers, key share)",
              "ServerHello + certificate for shop.example.com",
              "certificate verified → session keys derived",
            ],
          },
        },
        {
          label: "Request",
          narration:
            "Now the actual HTTP request: a method, a path, headers (Host, Accept, cookies or an Authorization token) and sometimes a body.",
          active: ["http"],
          done: ["browser", "dns", "tcp", "tls"],
          panel: {
            title: "HTTP request",
            lines: [
              "GET /orders/7 HTTP/1.1",
              "Host: shop.example.com",
              "Accept: application/json",
              "Cookie: sessionid=k2v9…",
            ],
          },
        },
        {
          label: "Server work",
          narration:
            "The web server hands the request to your application: routing picks a view, the view checks who is asking, reads the database and builds a response.",
          active: ["server"],
          done: ["browser", "dns", "tcp", "tls", "http"],
          panel: {
            title: "Inside the backend",
            lines: ["route /orders/<id>/ → order_detail", "SELECT … FROM orders WHERE id = 7"],
          },
        },
        {
          label: "Response",
          narration:
            "The response carries a status code (200 OK), headers (Content-Type, caching, cookies) and a body.",
          active: ["resp"],
          done: ["browser", "dns", "tcp", "tls", "http", "server"],
          panel: {
            title: "HTTP response",
            lines: [
              "HTTP/1.1 200 OK",
              "Content-Type: application/json",
              "",
              '{"id": 7, "status": "paid", "total": "25.00"}',
            ],
          },
        },
        {
          label: "Reuse",
          narration:
            "The browser shows the result and keeps the connection open (keep-alive), so the next request skips DNS, TCP and TLS.",
          active: ["browser"],
          done: ["resp"],
          panel: {
            title: "Next request",
            lines: ["GET /orders/8 → same connection, no new handshakes"],
          },
        },
      ]}
    />
  )
}

export function UrlResolverViz() {
  return (
    <PipelineViz
      title="How Django finds the view for a URL"
      caption="Patterns are tried top to bottom and the first match wins. include() strips the matched prefix and continues in another urls.py; converters both match and convert (<int:pk> gives an int)."
      nodes={[
        { id: "path", label: "Request path" },
        { id: "root", label: "config/urls.py", detail: "ROOT_URLCONF" },
        { id: "include", label: "shop/urls.py", detail: "include()" },
        { id: "conv", label: "Converter", detail: "<int:pk>" },
        { id: "view", label: "View call" },
      ]}
      steps={[
        {
          label: "Path",
          narration: "Django only looks at the path: no domain, no query string (?page=2).",
          active: ["path"],
          panel: {
            title: "request",
            lines: ["GET /shop/products/42/?ref=home", "path = 'shop/products/42/'"],
          },
        },
        {
          label: "Root patterns",
          narration:
            "ROOT_URLCONF's urlpatterns are tried in order. 'admin/' doesn't match; 'shop/' matches the start of the path.",
          active: ["root"],
          done: ["path"],
          panel: {
            title: "config/urls.py",
            lines: [
              'path("admin/", admin.site.urls),        # no',
              'path("shop/", include("shop.urls")),    # yes: prefix matched',
            ],
          },
        },
        {
          label: "include()",
          narration:
            "The matched 'shop/' is removed and the rest, 'products/42/', is matched against shop/urls.py.",
          active: ["include"],
          done: ["path", "root"],
          panel: {
            title: "shop/urls.py",
            lines: [
              'app_name = "shop"',
              'path("", views.product_list, name="product-list"),              # no',
              'path("products/<int:pk>/", views.product_detail, name="product-detail"),',
            ],
          },
        },
        {
          label: "Convert",
          narration:
            "The int converter matches the digits and converts them: the view receives pk=42 as an int, not a string.",
          active: ["conv"],
          done: ["path", "root", "include"],
          panel: { title: "match", lines: ["'42' matches [0-9]+  →  pk = 42  (int)"] },
        },
        {
          label: "Call the view",
          narration:
            "Django calls the view with the request and the captured values as keyword arguments.",
          active: ["view"],
          done: ["path", "root", "include", "conv"],
          panel: { title: "call", lines: ["product_detail(request, pk=42)"] },
        },
        {
          label: "No match → 404",
          narration:
            "For /shop/products/abc/ the int converter refuses 'abc', no other pattern matches, and Django answers 404 Not Found.",
          active: ["conv"],
          done: ["path", "root", "include"],
          tone: "error",
          panel: {
            title: "request",
            lines: ["GET /shop/products/abc/", "→ Resolver404 → 404 Not Found"],
          },
        },
        {
          label: "reverse()",
          narration:
            "Names work backwards too: reverse('shop:product-detail', args=[42]) builds the URL, so templates and redirects never hard-code paths.",
          active: ["path"],
          done: ["root", "include", "conv"],
          panel: {
            title: "reverse",
            lines: [
              'reverse("shop:product-detail", args=[42])  →  "/shop/products/42/"',
              '{% url "shop:product-detail" 42 %}',
            ],
          },
        },
      ]}
    />
  )
}

export function MvtFlowViz() {
  return (
    <PipelineViz
      title="Model, View, Template: one page request"
      caption="The view is the coordinator: it asks the model for data and hands it to a template. Templates only display; they never query or decide business rules. Autoescaping makes user data safe to show."
      nodes={[
        { id: "url", label: "URLconf" },
        { id: "view", label: "View", detail: "views.py" },
        { id: "model", label: "Model", detail: "models.py" },
        { id: "tpl", label: "Template", detail: "*.html" },
        { id: "resp", label: "HttpResponse" },
      ]}
      steps={[
        {
          label: "Route",
          narration: "The URLconf matched /products/ to product_list.",
          active: ["url"],
          panel: {
            title: "urls.py",
            lines: ['path("products/", views.product_list, name="product-list")'],
          },
        },
        {
          label: "View asks the model",
          narration:
            "The view builds a QuerySet. Nothing has hit the database yet: QuerySets are lazy.",
          active: ["view", "model"],
          done: ["url"],
          panel: {
            title: "views.py",
            lines: [
              "def product_list(request):",
              '    products = Product.objects.filter(is_active=True).order_by("name")',
              '    return render(request, "shop/product_list.html", {"products": products})',
            ],
          },
        },
        {
          label: "Template renders",
          narration:
            "render() fills the template with the context. Looping over products runs the SQL query now. {{ p.name }} is HTML-escaped automatically.",
          active: ["tpl"],
          done: ["url", "view", "model"],
          panel: {
            title: "shop/product_list.html",
            lines: [
              '{% extends "base.html" %}',
              "{% block content %}",
              "  {% for p in products %}<li>{{ p.name }} · {{ p.price }}</li>",
              "  {% empty %}<li>Nothing for sale yet.</li>{% endfor %}",
              "{% endblock %}",
            ],
          },
        },
        {
          label: "Response",
          narration:
            "The result is an HttpResponse: status 200, Content-Type text/html, the rendered HTML as body.",
          active: ["resp"],
          done: ["url", "view", "model", "tpl"],
          panel: {
            title: "response",
            lines: [
              "200 OK  text/html; charset=utf-8",
              "<li>Chess set · 30.00</li>",
              "<li>Dune · 12.50</li>",
            ],
          },
        },
        {
          label: "Escaping",
          narration:
            "A product named <script>…</script> is shown as text, not run: autoescaping turns < into &lt;. Only mark data |safe when you created the HTML yourself.",
          active: ["tpl"],
          done: ["url", "view", "model"],
          panel: {
            title: "autoescape",
            lines: [
              "name = '<script>alert(1)</script>'",
              "{{ p.name }}  →  &lt;script&gt;alert(1)&lt;/script&gt;",
            ],
          },
        },
      ]}
    />
  )
}

export function ValidationFlowViz() {
  return (
    <PipelineViz
      title="How a Django form validates input"
      caption="Each layer has one job: convert types, check single fields, then check fields together. You only ever read form.cleaned_data, which is converted and trusted, never request.POST directly."
      nodes={[
        { id: "raw", label: "request.POST", detail: "all strings" },
        { id: "python", label: "to_python()", detail: "convert" },
        { id: "fields", label: "validators", detail: "per field" },
        { id: "cleanf", label: "clean_<field>()", detail: "your rules" },
        { id: "clean", label: "clean()", detail: "cross-field" },
        { id: "out", label: "is_valid()", detail: "cleaned_data / errors" },
      ]}
      steps={[
        {
          label: "Raw input",
          narration:
            "Everything submitted by a browser arrives as text, and none of it can be trusted yet.",
          active: ["raw"],
          panel: {
            title: "request.POST",
            lines: [
              "seats = '3'",
              "email = 'ADA@Example.COM'",
              "start = '2026-05-01'",
              "end   = '2026-04-30'",
            ],
          },
        },
        {
          label: "Convert",
          narration:
            "Each field converts its text: IntegerField gives an int, DateField a datetime.date. Text that can't convert is an error right here.",
          active: ["python"],
          done: ["raw"],
          panel: {
            title: "converted",
            lines: [
              "seats = 3",
              "email = 'ADA@Example.COM'",
              "start = date(2026, 5, 1)",
              "end   = date(2026, 4, 30)",
            ],
          },
        },
        {
          label: "Field validators",
          narration:
            "Built-in checks run per field: max_value=10 for seats, a valid address for EmailField. All pass.",
          active: ["fields"],
          done: ["raw", "python"],
          panel: { title: "checks", lines: ["seats <= 10        ok", "email is valid     ok"] },
        },
        {
          label: "clean_email()",
          narration:
            "Your per-field method can also change the value. Here it lower-cases the email so duplicates are caught later.",
          active: ["cleanf"],
          done: ["raw", "python", "fields"],
          panel: {
            title: "forms.py",
            lines: [
              "def clean_email(self):",
              '    return self.cleaned_data["email"].lower()',
              "→ 'ada@example.com'",
            ],
          },
        },
        {
          label: "clean()",
          narration:
            "Rules that need several fields go in clean(). The end date is before the start date, so it raises ValidationError.",
          active: ["clean"],
          done: ["raw", "python", "fields", "cleanf"],
          tone: "error",
          panel: {
            title: "forms.py",
            lines: [
              "def clean(self):",
              "    data = super().clean()",
              '    if data["end"] < data["start"]:',
              '        raise ValidationError("End date must be after the start date.")',
            ],
          },
        },
        {
          label: "Result",
          narration:
            "is_valid() is False. A cross-field error is stored under '__all__' (non_field_errors); the template shows it above the form.",
          active: ["out"],
          done: ["raw", "python", "fields", "cleanf", "clean"],
          tone: "error",
          panel: {
            title: "form",
            lines: [
              "form.is_valid()            →  False",
              "form.errors['__all__']     →  ['End date must be after the start date.']",
              "form.non_field_errors()    →  the same list, for the template",
            ],
          },
        },
      ]}
    />
  )
}

export function CacheHitViz() {
  return (
    <PipelineViz
      title="Caching: a miss, a hit, an invalidation"
      caption="The first request pays for the database query and fills the cache; later ones skip the database entirely. The hard part is not storing, it is deleting the entry when the data changes."
      nodes={[
        { id: "req", label: "Request" },
        { id: "get", label: "cache.get(key)" },
        { id: "db", label: "Database", detail: "slow" },
        { id: "set", label: "cache.set(key, …)" },
        { id: "resp", label: "Response" },
      ]}
      steps={[
        {
          label: "Miss",
          narration:
            "The first request asks the cache for 'catalog:categories:v1'. It isn't there: a miss.",
          active: ["req", "get"],
          panel: { title: "code", lines: ["data = cache.get(KEY)        # → None"] },
        },
        {
          label: "Query",
          narration: "So the database does the work, which costs a network round trip and a query.",
          active: ["db"],
          done: ["req", "get"],
          panel: {
            title: "SQL",
            lines: ['SELECT "id", "name", "slug" FROM "catalog_category" ORDER BY "name"'],
          },
        },
        {
          label: "Store",
          narration:
            "The result is stored with a timeout, so even a forgotten entry eventually expires.",
          active: ["set"],
          done: ["req", "get", "db"],
          panel: { title: "code", lines: ["cache.set(KEY, data, timeout=3600)   # one hour"] },
        },
        {
          label: "Hit",
          narration: "The next request finds the value in the cache: zero database queries.",
          active: ["get", "resp"],
          done: ["req"],
          panel: {
            title: "code",
            lines: [
              "data = cache.get(KEY)        # → [{'id': 1, 'name': 'Books', …}]",
              "queries: 0",
            ],
          },
        },
        {
          label: "Invalidate",
          narration:
            "A staff member renames a category. The code that saves it also deletes the cache entry; without that, users would see the old name for up to an hour.",
          active: ["set"],
          tone: "error",
          panel: {
            title: "on save",
            lines: [
              "category.save()",
              "cache.delete(KEY)            # the next request is a miss again",
            ],
          },
        },
      ]}
    />
  )
}

export function IdempotencyReplayViz() {
  return (
    <PipelineViz
      title="Idempotency keys: a retry that can't double-charge"
      caption="The client picks the key, once per checkout attempt, and reuses it on every retry. The server stores the first successful response under that key and replays it, so a timeout followed by a retry never creates a second order."
      nodes={[
        { id: "client", label: "Client" },
        { id: "api", label: "POST /orders/" },
        { id: "store", label: "Key store", detail: "(user, key) → response" },
        { id: "service", label: "place_order()" },
        { id: "resp", label: "Response" },
      ]}
      steps={[
        {
          label: "First try",
          narration: "The app sends the order with a fresh key it generated for this checkout.",
          active: ["client", "api"],
          panel: {
            title: "request",
            lines: [
              "POST /api/v1/orders/",
              "Idempotency-Key: 7f3a9c1e",
              '{"items": [{"product": 3, "quantity": 2}]}',
            ],
          },
        },
        {
          label: "New key",
          narration:
            "No response is stored under (user, 7f3a9c1e), so the request is processed normally.",
          active: ["store", "service"],
          done: ["client", "api"],
          panel: {
            title: "store",
            lines: ["lookup (ada, 7f3a9c1e) → none", "place_order(…) → order #41, stock reserved"],
          },
        },
        {
          label: "Remember",
          narration:
            "In the same transaction as the order, the key, a hash of the body and the response are saved.",
          active: ["store"],
          done: ["client", "api", "service"],
          panel: { title: "store", lines: ['(ada, 7f3a9c1e) → 201, sha256(body), {"id": 41, …}'] },
        },
        {
          label: "Lost response",
          narration:
            "The network drops the response. The client can't tell whether the order exists, so it retries.",
          active: ["resp"],
          done: ["client", "api", "store", "service"],
          tone: "error",
          panel: { title: "client", lines: ["… timeout after 10 s", "retry with the SAME key"] },
        },
        {
          label: "Replay",
          narration:
            "The key is known and the body hash matches: the stored response is returned. No second order, no second stock reservation.",
          active: ["store", "resp"],
          done: ["client", "api"],
          panel: {
            title: "response",
            lines: [
              "201 Created",
              "Idempotent-Replayed: true",
              '{"id": 41, "status": "pending", …}',
            ],
          },
        },
        {
          label: "Misuse",
          narration:
            "The same key with a different body is a client bug, not a retry: 422, and nothing is processed.",
          active: ["store"],
          done: ["client", "api"],
          tone: "error",
          panel: {
            title: "response",
            lines: ["422 Unprocessable Entity", '{"error": {"code": "idempotency_key_reused", …}}'],
          },
        },
      ]}
    />
  )
}

export function DatabaseUrlViz() {
  return (
    <PipelineViz
      title="From DATABASE_URL to a connection"
      caption="One environment variable describes the whole connection, so the same code runs on SQLite on your laptop and PostgreSQL in production. Only the URL changes, never the settings file."
      nodes={[
        { id: "env", label: "DATABASE_URL", detail: ".env / host" },
        { id: "parse", label: "env.db()", detail: "django-environ" },
        { id: "settings", label: "DATABASES" },
        { id: "driver", label: "Driver", detail: "psycopg 3" },
        { id: "conn", label: "Connection", detail: "CONN_MAX_AGE" },
        { id: "db", label: "PostgreSQL" },
      ]}
      steps={[
        {
          label: "The variable",
          narration:
            "Credentials live in the environment (a .env file locally, the host's secret settings in production), never in Git.",
          active: ["env"],
          panel: {
            title: ".env",
            lines: ["DATABASE_URL=postgres://shop:s3cret@db.internal:5432/shoplite"],
          },
        },
        {
          label: "Parse",
          narration:
            "django-environ splits the URL into the pieces Django expects and picks the backend from the scheme.",
          active: ["parse"],
          done: ["env"],
          panel: {
            title: "settings.py",
            lines: ['DATABASES = {"default": env.db("DATABASE_URL")}'],
          },
        },
        {
          label: "Settings",
          narration:
            "The result is an ordinary DATABASES entry; postgres:// selects the PostgreSQL backend.",
          active: ["settings"],
          done: ["env", "parse"],
          panel: {
            title: "DATABASES['default']",
            lines: [
              "ENGINE = 'django.db.backends.postgresql'",
              "NAME = 'shoplite'   USER = 'shop'   HOST = 'db.internal'   PORT = 5432",
            ],
          },
        },
        {
          label: "Driver",
          narration:
            "The backend talks to the server through a driver package: psycopg for PostgreSQL, mysqlclient for MySQL; SQLite is built into Python.",
          active: ["driver"],
          done: ["env", "parse", "settings"],
          panel: { title: "requirements.txt", lines: ["psycopg[binary]>=3.2"] },
        },
        {
          label: "Reuse connections",
          narration:
            "Opening a connection costs a TCP + auth round trip. CONN_MAX_AGE=60 keeps it open for 60 s and reuses it for later requests in the same worker.",
          active: ["conn", "db"],
          done: ["env", "parse", "settings", "driver"],
          panel: {
            title: "settings.py",
            lines: ['DATABASES["default"]["CONN_MAX_AGE"] = 60   # 0 = close after every request'],
          },
        },
      ]}
    />
  )
}

export function MigrationTimelineViz() {
  return (
    <PipelineViz
      title="A model change becomes a database change"
      caption="Migrations are version control for the schema: a numbered file per change, committed with the code. migrate applies the ones the database hasn't recorded in django_migrations yet, in order."
      nodes={[
        { id: "model", label: "models.py", detail: "you edit" },
        { id: "make", label: "makemigrations" },
        { id: "file", label: "0002_….py", detail: "commit it" },
        { id: "sql", label: "sqlmigrate", detail: "preview SQL" },
        { id: "migrate", label: "migrate" },
        { id: "table", label: "django_migrations", detail: "applied list" },
      ]}
      steps={[
        {
          label: "Edit the model",
          narration:
            "You add a field. The database doesn't know yet; queries would fail with 'no such column'.",
          active: ["model"],
          panel: {
            title: "notes/models.py",
            lines: [
              "class Note(models.Model):",
              "    title = models.CharField(max_length=120)",
              "+   pinned = models.BooleanField(default=False)",
            ],
          },
        },
        {
          label: "makemigrations",
          narration:
            "Django compares your models with the last migration state and writes the difference as Python operations.",
          active: ["make"],
          done: ["model"],
          panel: {
            title: "terminal",
            lines: [
              "$ python manage.py makemigrations notes",
              "Migrations for 'notes':",
              "  notes/migrations/0002_note_pinned.py",
              "    + Add field pinned to note",
            ],
          },
        },
        {
          label: "The file",
          narration:
            "The migration is plain code with a dependency on the previous one. Commit it with the model change, so every machine gets the same schema.",
          active: ["file"],
          done: ["model", "make"],
          panel: {
            title: "0002_note_pinned.py",
            lines: [
              "dependencies = [('notes', '0001_initial')]",
              "operations = [",
              "    migrations.AddField(model_name='note', name='pinned',",
              "                        field=models.BooleanField(default=False)),",
              "]",
            ],
          },
        },
        {
          label: "Preview the SQL",
          narration:
            "sqlmigrate prints the SQL a migration will run on your database (here PostgreSQL), useful before touching a big production table. SQLite can't alter columns this way, so there Django rebuilds the table instead.",
          active: ["sql"],
          done: ["model", "make", "file"],
          panel: {
            title: "terminal (PostgreSQL)",
            lines: [
              "$ python manage.py sqlmigrate notes 0002",
              'ALTER TABLE "notes_note" ADD COLUMN "pinned" boolean DEFAULT false NOT NULL;',
              'ALTER TABLE "notes_note" ALTER COLUMN "pinned" DROP DEFAULT;',
            ],
          },
        },
        {
          label: "migrate",
          narration:
            "migrate runs every migration not yet applied, in dependency order, each in a transaction on PostgreSQL.",
          active: ["migrate"],
          done: ["model", "make", "file", "sql"],
          panel: {
            title: "terminal",
            lines: ["$ python manage.py migrate", "Applying notes.0002_note_pinned... OK"],
          },
        },
        {
          label: "Recorded",
          narration:
            "Applied migrations are recorded in the django_migrations table, so running migrate again does nothing. showmigrations lists them with [X].",
          active: ["table"],
          done: ["model", "make", "file", "sql", "migrate"],
          panel: {
            title: "terminal",
            lines: [
              "$ python manage.py showmigrations notes",
              "notes",
              " [X] 0001_initial",
              " [X] 0002_note_pinned",
            ],
          },
        },
      ]}
    />
  )
}
