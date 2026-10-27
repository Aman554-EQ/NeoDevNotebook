"""Health checks, middleware, settings and auth: the parts every request relies on."""

from unittest import mock

import pytest
from django.db.utils import OperationalError

pytestmark = pytest.mark.django_db


def test_health_never_needs_the_database(client, django_assert_num_queries):
    with django_assert_num_queries(0):
        assert client.get("/health/").json() == {"status": "ok"}


def test_ready_checks_database_and_cache(client):
    body = client.get("/ready/").json()
    assert body == {"status": "ok", "checks": {"database": "ok", "cache": "ok"}}


def test_ready_is_503_when_the_database_is_down(client):
    with mock.patch("core.views.connection.cursor", side_effect=OperationalError("down")):
        response = client.get("/ready/")
    assert response.status_code == 503
    assert response.json()["checks"]["database"] == "error"


def test_every_response_has_a_request_id(client):
    generated = client.get("/health/")["X-Request-ID"]
    assert len(generated) == 32
    echoed = client.get("/health/", headers={"X-Request-ID": "abc-12345678"})["X-Request-ID"]
    assert echoed == "abc-12345678"
    unsafe = client.get("/health/", headers={"X-Request-ID": "<script>"})["X-Request-ID"]
    assert unsafe != "<script>"  # never reflect arbitrary input into headers


def test_requests_are_logged_with_their_id(client, caplog):
    with caplog.at_level("INFO", logger="shoplite.requests"):
        response = client.get("/health/")
    record = caplog.records[-1]
    assert record.getMessage().startswith("GET /health/ -> 200 in ")
    assert record.request_id == response["X-Request-ID"]


def test_security_headers(client, catalog):
    page = client.get("/")
    assert page["X-Content-Type-Options"] == "nosniff"
    assert page["X-Frame-Options"] == "DENY"
    assert "frame-ancestors 'none'" in page["Content-Security-Policy"]
    assert "Content-Security-Policy" not in client.get("/health/")  # JSON doesn't need it


def test_cors_allows_the_configured_front_end_on_the_api_only(client, catalog):
    origin = {"Origin": "http://localhost:5173"}
    assert client.get("/api/v1/products/", headers=origin)["Access-Control-Allow-Origin"] == origin["Origin"]
    assert "Access-Control-Allow-Origin" not in client.get("/", headers=origin)
    evil = client.get("/api/v1/products/", headers={"Origin": "https://evil.example"})
    assert "Access-Control-Allow-Origin" not in evil


def test_jwt_login_and_refresh(api, customer):
    pair = api.post("/api/v1/auth/token/", {"email": "ada@example.com", "password": "pass-for-tests-only"}).json()
    api.credentials(HTTP_AUTHORIZATION=f"Bearer {pair['access']}")
    assert api.get("/api/v1/orders/").status_code == 200
    refreshed = api.post("/api/v1/auth/token/refresh/", {"refresh": pair["refresh"]}).json()
    assert "access" in refreshed


def test_openapi_schema_is_valid(api):
    response = api.get("/api/schema/")
    assert response.status_code == 200
    assert b"/api/v1/orders/" in response.content


def test_production_settings_pass_the_deploy_check(monkeypatch):
    """`manage.py check --deploy` with the prod settings and fake production values."""
    import subprocess
    import sys

    env = {
        "DJANGO_SETTINGS_MODULE": "config.settings.prod",
        "DJANGO_SECRET_KEY": "fake-prod-key-only-for-this-test-0123456789abcdefghijklmnop",
        "DJANGO_ALLOWED_HOSTS": "shop.example.com",
    }
    result = subprocess.run(
        [sys.executable, "manage.py", "check", "--deploy", "--fail-level", "WARNING"],
        env={**__import__("os").environ, **env},
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, result.stdout + result.stderr
