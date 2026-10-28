"""Two customers race for the last items. Needs PostgreSQL: SQLite has no row locks.

Run with SHOPLITE_TEST_DATABASE_URL=postgres://user:pass@localhost:5432/shoplite_test
"""

import threading
from decimal import Decimal

import pytest
from django.db import connection

from accounts.models import User
from catalog.models import Category, Product
from orders.models import Order
from orders.services import OutOfStock, place_order

pytestmark = [
    pytest.mark.django_db(transaction=True),  # real commits, so threads see each other's work
    pytest.mark.skipif(connection.vendor != "postgresql", reason="needs PostgreSQL row locks"),
]


def test_concurrent_checkouts_never_oversell():
    category = Category.objects.create(name="Books", slug="books")
    product = Product.objects.create(
        category=category, name="Dune", slug="dune", price=Decimal("10.00"), stock=3
    )
    buyers = [User.objects.create_user(f"buyer{i}@example.com", "x") for i in range(8)]
    results = []
    start = threading.Barrier(len(buyers))

    def buy(user):
        start.wait()  # everyone checks out at the same moment
        try:
            place_order(user, [(product.pk, 1)])
            results.append("ok")
        except OutOfStock:
            results.append("sold out")
        finally:
            connection.close()  # each thread has its own connection

    threads = [threading.Thread(target=buy, args=(u,)) for u in buyers]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    assert sorted(results) == ["ok"] * 3 + ["sold out"] * 5
    assert Product.objects.get(pk=product.pk).stock == 0
    assert Order.objects.count() == 3
