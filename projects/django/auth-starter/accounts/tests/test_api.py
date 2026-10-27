import pytest
from django.core.cache import cache
from rest_framework.test import APIClient

from accounts.models import User

pytestmark = pytest.mark.django_db
PASSWORD = "correct-horse-battery"


@pytest.fixture(autouse=True)
def fresh_throttle_counts():
    cache.clear()  # throttling counts live in the cache


@pytest.fixture
def api():
    return APIClient()


@pytest.fixture
def ada(db):
    return User.objects.create_user("ada@example.com", PASSWORD, display_name="Ada")


def tokens(api, email="ada@example.com", password=PASSWORD):
    return api.post("/api/auth/token/", {"email": email, "password": password}).json()


def test_register_returns_the_user_without_the_password(api):
    response = api.post(
        "/api/auth/register/", {"email": "grace@example.com", "password": PASSWORD}
    )
    assert response.status_code == 201
    assert set(response.json()) == {"id", "email", "display_name"}
    assert User.objects.get().check_password(PASSWORD)


def test_register_validates_email_and_password(api, ada):
    response = api.post("/api/auth/register/", {"email": "ada@example.com", "password": "123"})
    assert response.status_code == 400
    body = response.json()
    assert body["email"] == ["user with this email address already exists."]
    assert "This password is too short. It must contain at least 8 characters." in body["password"]


def test_register_is_throttled(api):
    codes = [
        api.post("/api/auth/register/", {"email": f"u{i}@example.com", "password": PASSWORD})
        .status_code
        for i in range(6)
    ]
    assert codes == [201] * 5 + [429]


def test_login_returns_an_access_and_a_refresh_token(api, ada):
    pair = tokens(api)
    assert set(pair) == {"access", "refresh"}
    assert pair["access"].count(".") == 2  # header.payload.signature


def test_bad_credentials_are_401(api, ada):
    response = api.post("/api/auth/token/", {"email": "ada@example.com", "password": "nope"})
    assert response.status_code == 401


def test_me_requires_a_valid_bearer_token(api, ada):
    assert api.get("/api/me/").status_code == 401
    api.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens(api)['access']}")
    assert api.get("/api/me/").json()["email"] == "ada@example.com"
    api.credentials(HTTP_AUTHORIZATION="Bearer not.a.token")
    assert api.get("/api/me/").status_code == 401


def test_me_can_update_the_display_name_but_not_the_email(api, ada):
    api.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens(api)['access']}")
    body = api.patch("/api/me/", {"display_name": "Countess", "email": "x@example.com"}).json()
    assert (body["display_name"], body["email"]) == ("Countess", "ada@example.com")


def test_refresh_rotates_and_blacklists_the_old_token(api, ada):
    old = tokens(api)["refresh"]
    rotated = api.post("/api/auth/token/refresh/", {"refresh": old}).json()
    assert set(rotated) == {"access", "refresh"} and rotated["refresh"] != old
    # The old refresh token was blacklisted when it was rotated.
    assert api.post("/api/auth/token/refresh/", {"refresh": old}).status_code == 401


def test_logout_blacklists_the_refresh_token(api, ada):
    refresh = tokens(api)["refresh"]
    assert api.post("/api/auth/logout/", {"refresh": refresh}).status_code == 200
    assert api.post("/api/auth/token/refresh/", {"refresh": refresh}).status_code == 401


def test_tokens_signed_with_another_key_are_rejected(api, ada, settings):
    import jwt

    claims = {"user_id": str(ada.id), "token_type": "access"}
    forged = jwt.encode(claims, "a-guessed-key-that-is-long-enough-for-hs256", "HS256")
    api.credentials(HTTP_AUTHORIZATION=f"Bearer {forged}")
    assert api.get("/api/me/").status_code == 401


def test_health(api):
    assert api.get("/health/").json() == {"status": "ok"}
