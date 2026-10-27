"""Helpers for recordings (not shown to learners). Each recording prints one JSON document.

kinds:
  http  a list of request/response exchanges made with Django's test client
  orm   ORM expressions, the SQL Django ran for each, and the result
  sql   tables plus SQL queries run on SQLite, with their result rows
"""

import json

SHOWN_RESPONSE_HEADERS = (
    "Content-Type",
    "Location",
    "Allow",
    "WWW-Authenticate",
    "Retry-After",
    "ETag",
    "X-Request-ID",
    "Idempotent-Replayed",
    "Set-Cookie",
)


def _body(raw: bytes, content_type: str) -> str:
    text = raw.decode("utf-8", errors="replace")
    if "json" in content_type and text:
        return json.dumps(json.loads(text), indent=2, ensure_ascii=False)
    return text if len(text) <= 600 else text[:600] + "\n…"


def http(client, method, url, *, label, note, json_body=None, headers=None, extra_shown=()):
    """Make a request with the test client and describe it like an API tool would."""
    headers = dict(headers or {})
    kwargs = {"headers": headers}
    request_body = None
    if json_body is not None:
        kwargs["data"] = json.dumps(json_body)
        kwargs["content_type"] = "application/json"
        headers = {"Content-Type": "application/json", **headers}
        request_body = json.dumps(json_body, indent=2, ensure_ascii=False)
    response = getattr(client, method.lower())(url, **kwargs)
    shown = {}
    for name in (*SHOWN_RESPONSE_HEADERS, *extra_shown):
        if response.has_header(name):
            value = response[name]
            if name == "Set-Cookie":
                value = value.split(";")[0][:40] + "; …"
            shown[name] = value
    for cookie in response.cookies.values():
        shown.setdefault("Set-Cookie", f"{cookie.key}=…; HttpOnly" if cookie["httponly"] else f"{cookie.key}=…")
    content_type = response.get("Content-Type", "")
    return {
        "label": label,
        "note": note,
        "request": {"method": method.upper(), "url": url, "headers": headers, "body": request_body},
        "response": {
            "status": response.status_code,
            "reason": response.reason_phrase,
            "headers": shown,
            "body": _body(response.content, content_type),
            "size": len(response.content),
        },
    }


def orm(expr, namespace, *, label, note):
    """Evaluate an ORM expression and capture the SQL it ran. The shown code is the run code."""
    from django.db import connection
    from django.db.models.query import QuerySet
    from django.test.utils import CaptureQueriesContext

    with CaptureQueriesContext(connection) as ctx:
        value = eval(expr, namespace)  # noqa: S307 - recordings are trusted, checked-in code
        if isinstance(value, QuerySet):
            value = list(value)
    return {
        "label": label,
        "note": note,
        "python": expr,
        "sql": [q["sql"] for q in ctx.captured_queries],
        "result": repr(value),
    }


def table(conn, name):
    cur = conn.execute(f"SELECT * FROM {name}")  # noqa: S608 - fixed table names
    return {"name": name, "columns": [c[0] for c in cur.description], "rows": [list(r) for r in cur]}


def query(conn, sql, *, label, note, uses=()):
    cur = conn.execute(sql)
    return {
        "label": label,
        "note": note,
        "sql": sql.strip(),
        "uses": list(uses),
        "columns": [c[0] for c in cur.description],
        "rows": [list(r) for r in cur],
    }


def emit(kind, title, steps, **extra):
    print(json.dumps({"kind": kind, "title": title, **extra, "steps": steps}, ensure_ascii=False))
