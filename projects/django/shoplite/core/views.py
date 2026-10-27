from django.core.cache import cache
from django.db import connection
from django.http import JsonResponse


def health(request):
    """Liveness: the process is up and can answer. Never touches the database."""
    return JsonResponse({"status": "ok"})


def ready(request):
    """Readiness: dependencies work. A load balancer stops routing here while this is 503."""
    checks = {}
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        checks["database"] = "ok"
    except Exception:  # any failure means "not ready"; details go to the logs, not the client
        checks["database"] = "error"
    try:
        cache.set("ready-check", "1", timeout=5)
        checks["cache"] = "ok" if cache.get("ready-check") == "1" else "error"
    except Exception:
        checks["cache"] = "error"
    ok = all(v == "ok" for v in checks.values())
    body = {"status": "ok" if ok else "unavailable", "checks": checks}
    return JsonResponse(body, status=200 if ok else 503)
