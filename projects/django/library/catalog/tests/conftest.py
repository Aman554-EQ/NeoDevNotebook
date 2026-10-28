import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from catalog.models import Author, Book


@pytest.fixture
def api():
    return APIClient()


@pytest.fixture
def member(db):
    return get_user_model().objects.create_user("ada", password="pass-for-tests-only")


@pytest.fixture
def other_member(db):
    return get_user_model().objects.create_user("bob", password="pass-for-tests-only")


@pytest.fixture
def staff(db):
    return get_user_model().objects.create_user(
        "librarian", password="pass-for-tests-only", is_staff=True
    )


@pytest.fixture
def as_user(api):
    """Authenticate the API client as a user: as_user(member)."""

    def login(user):
        api.force_authenticate(user)
        return api

    return login


@pytest.fixture
def books(db):
    herbert = Author.objects.create(name="Frank Herbert")
    austen = Author.objects.create(name="Jane Austen")
    return [
        Book.objects.create(
            title="Dune", isbn="9780441172719", author=herbert, published_year=1965, copies=2
        ),
        Book.objects.create(
            title="Emma", isbn="9780141439587", author=austen, published_year=1815, copies=1
        ),
        Book.objects.create(
            title="Persuasion", isbn="9780141439686", author=austen, published_year=1817
        ),
    ]
