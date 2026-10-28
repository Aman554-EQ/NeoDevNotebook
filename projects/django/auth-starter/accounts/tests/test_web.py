import re

import pytest
from django.core import mail
from django.urls import reverse

from accounts.models import User

pytestmark = pytest.mark.django_db
PASSWORD = "correct-horse-battery"


def test_signup_creates_a_user_and_logs_them_in(client):
    response = client.post(
        reverse("signup"),
        {"email": "Ada@Example.com", "password1": PASSWORD, "password2": PASSWORD},
    )
    assert response.status_code == 302 and response.url == reverse("profile")
    user = User.objects.get()
    assert user.email == "Ada@example.com"  # the domain part is normalised
    assert user.password.startswith("pbkdf2_sha256$")  # a hash, never the password
    assert client.get(reverse("profile")).status_code == 200


def test_signup_rejects_weak_and_mismatched_passwords(client):
    response = client.post(
        reverse("signup"), {"email": "ada@example.com", "password1": "123", "password2": "456"}
    )
    assert "password2" in response.context["form"].errors
    assert not User.objects.exists()


def test_profile_requires_login(client):
    response = client.get(reverse("profile"))
    assert response.status_code == 302
    assert response.url == f"{reverse('login')}?next={reverse('profile')}"


def test_login_and_logout(client):
    User.objects.create_user("ada@example.com", PASSWORD)
    response = client.post(reverse("login"), {"username": "ada@example.com", "password": PASSWORD})
    assert response.url == reverse("profile")
    assert "sessionid" in client.cookies
    client.post(reverse("logout"))
    assert client.get(reverse("profile")).status_code == 302


def test_wrong_password_is_rejected_without_saying_which_part_was_wrong(client):
    User.objects.create_user("ada@example.com", PASSWORD)
    response = client.post(reverse("login"), {"username": "ada@example.com", "password": "nope"})
    assert response.status_code == 200
    assert "Please enter a correct email address and password" in response.content.decode()


def test_password_reset_round_trip(client):
    User.objects.create_user("ada@example.com", PASSWORD)
    client.post(reverse("password_reset"), {"email": "ada@example.com"})
    assert len(mail.outbox) == 1
    link = re.search(r"http://testserver(/reset/\S+/)", mail.outbox[0].body).group(1)

    # The emailed link redirects to a "set-password" URL that hides the token.
    form_page = client.get(link, follow=True)
    new = "a-brand-new-passphrase"
    client.post(form_page.redirect_chain[-1][0], {"new_password1": new, "new_password2": new})
    assert client.login(username="ada@example.com", password=new)


def test_reset_for_unknown_email_sends_nothing_but_looks_the_same(client):
    response = client.post(reverse("password_reset"), {"email": "nobody@example.com"})
    assert response.url == reverse("password_reset_done")  # no account enumeration
    assert mail.outbox == []


def test_security_settings_switch_on_when_debug_is_off(monkeypatch):
    import importlib

    import config.settings as settings_module

    monkeypatch.setenv("DJANGO_DEBUG", "false")
    monkeypatch.setenv("DJANGO_SECRET_KEY", "fake-prod-key-for-this-test-only-0123456789")
    try:
        prod = importlib.reload(settings_module)
        assert prod.SESSION_COOKIE_SECURE and prod.CSRF_COOKIE_SECURE
        assert prod.SECURE_HSTS_SECONDS == 31536000
    finally:
        monkeypatch.undo()
        importlib.reload(settings_module)
