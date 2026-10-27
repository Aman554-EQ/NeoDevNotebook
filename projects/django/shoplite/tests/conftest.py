from decimal import Decimal

import pytest
from django.core.cache import cache
from rest_framework.test import APIClient

from accounts.models import User
from catalog.models import Category, Product


@pytest.fixture(autouse=True)
def empty_cache():
    cache.clear()  # cached categories and throttle counters must not leak between tests


@pytest.fixture
def api():
    return APIClient()


@pytest.fixture
def customer(db):
    return User.objects.create_user("ada@example.com", "pass-for-tests-only")


@pytest.fixture
def other_customer(db):
    return User.objects.create_user("bob@example.com", "pass-for-tests-only")


@pytest.fixture
def staff(db):
    return User.objects.create_user("staff@example.com", "pass-for-tests-only", is_staff=True)


@pytest.fixture
def as_user(api):
    def login(user):
        api.force_authenticate(user)
        return api

    return login


@pytest.fixture
def catalog(db):
    books = Category.objects.create(name="Books", slug="books")
    games = Category.objects.create(name="Games", slug="games")
    return {
        "dune": Product.objects.create(
            category=books, name="Dune", slug="dune", price=Decimal("12.50"), stock=5
        ),
        "emma": Product.objects.create(
            category=books, name="Emma", slug="emma", price=Decimal("8.00"), stock=1
        ),
        "chess": Product.objects.create(
            category=games, name="Chess set", slug="chess", price=Decimal("30.00"), stock=2
        ),
        "hidden": Product.objects.create(
            category=games, name="Old stock", slug="old", price=Decimal("1.00"), stock=9, is_active=False
        ),
    }


def order_payload(*lines):
    return {"items": [{"product": p.pk, "quantity": q} for p, q in lines]}
