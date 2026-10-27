from decimal import Decimal

import pytest

from catalog.models import Product
from orders.models import Order
from orders.services import InvalidTransition, OrderError, OutOfStock, cancel_order, place_order

from .conftest import order_payload

pytestmark = pytest.mark.django_db


def stock(product):
    return Product.objects.get(pk=product.pk).stock


# --- the service layer -------------------------------------------------------------------


def test_place_order_reserves_stock_and_copies_prices(customer, catalog):
    order = place_order(customer, [(catalog["dune"].pk, 2), (catalog["emma"].pk, 1)])
    assert order.total == Decimal("33.00")
    assert stock(catalog["dune"]) == 3 and stock(catalog["emma"]) == 0
    assert [i.unit_price for i in order.items.order_by("product__name")] == [
        Decimal("12.50"),
        Decimal("8.00"),
    ]


def test_duplicate_lines_are_merged(customer, catalog):
    order = place_order(customer, [(catalog["dune"].pk, 1), (catalog["dune"].pk, 2)])
    assert order.items.get().quantity == 3


def test_out_of_stock_changes_nothing(customer, catalog):
    with pytest.raises(OutOfStock, match="Only 1 left of Emma"):
        place_order(customer, [(catalog["dune"].pk, 1), (catalog["emma"].pk, 2)])
    assert not Order.objects.exists()
    assert stock(catalog["dune"]) == 5  # the whole transaction rolled back


@pytest.mark.parametrize("items", [[], [(1, 0)]])
def test_empty_or_zero_quantity_orders_are_refused(customer, catalog, items):
    with pytest.raises(OrderError):
        place_order(customer, items)


def test_inactive_products_cannot_be_ordered(customer, catalog):
    with pytest.raises(OrderError, match="not available"):
        place_order(customer, [(catalog["hidden"].pk, 1)])


def test_cancel_returns_stock_and_is_final(customer, catalog):
    order = place_order(customer, [(catalog["chess"].pk, 2)])
    cancel_order(order)
    assert stock(catalog["chess"]) == 2
    with pytest.raises(InvalidTransition):
        cancel_order(order)


def test_state_machine():
    order = Order(status=Order.Status.PENDING)
    assert order.can_become(Order.Status.PAID) and not order.can_become(Order.Status.SHIPPED)
    assert not Order(status=Order.Status.SHIPPED).can_become(Order.Status.CANCELLED)


# --- the API -----------------------------------------------------------------------------


def post_order(client, payload, key="key-1"):
    return client.post("/api/v1/orders/", payload, format="json", HTTP_IDEMPOTENCY_KEY=key)


def test_create_order(as_user, customer, catalog):
    response = post_order(as_user(customer), order_payload((catalog["dune"], 2)))
    assert response.status_code == 201
    body = response.json()
    assert body["status"] == "pending" and body["total"] == "25.00"
    assert body["items"] == [
        {"product": catalog["dune"].pk, "product_name": "Dune", "quantity": 2, "unit_price": "12.50"}
    ]


def test_orders_need_a_token(api, catalog):
    response = post_order(api, order_payload((catalog["dune"], 1)))
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "not_authenticated"


def test_validation_errors_use_the_standard_shape(as_user, customer, catalog):
    response = post_order(as_user(customer), {"items": [{"product": catalog["dune"].pk, "quantity": 0}]})
    assert response.status_code == 400
    error = response.json()["error"]
    assert error["code"] == "validation_error"
    # Nested list errors are keyed by the index of the bad line.
    assert error["details"] == {
        "items": {"0": {"quantity": ["Ensure this value is greater than or equal to 1."]}}
    }
    assert len(error["request_id"]) == 32


def test_out_of_stock_is_409(as_user, customer, catalog):
    response = post_order(as_user(customer), order_payload((catalog["emma"], 5)))
    assert response.status_code == 409
    assert response.json()["error"]["message"] == "Only 1 left of Emma."


def test_customers_see_only_their_orders_staff_see_all(as_user, customer, other_customer, staff, catalog):
    mine = place_order(customer, [(catalog["dune"].pk, 1)])
    place_order(other_customer, [(catalog["dune"].pk, 1)])
    assert [o["id"] for o in as_user(customer).get("/api/v1/orders/").json()["results"]] == [mine.pk]
    assert as_user(other_customer).get(f"/api/v1/orders/{mine.pk}/").status_code == 404
    assert as_user(staff).get("/api/v1/orders/").json()["count"] == 2


def test_order_list_query_budget(as_user, customer, catalog, django_assert_num_queries):
    Product.objects.filter(pk=catalog["chess"].pk).update(stock=10)
    for _ in range(3):
        place_order(customer, [(catalog["dune"].pk, 1), (catalog["chess"].pk, 1)])
    client = as_user(customer)
    with django_assert_num_queries(3):  # COUNT, orders, items+products (prefetch): not 1 + N
        client.get("/api/v1/orders/")


def test_cancel_via_api_and_only_staff_can_ship(as_user, customer, staff, catalog):
    order = place_order(customer, [(catalog["dune"].pk, 1)])
    assert as_user(customer).post(f"/api/v1/orders/{order.pk}/ship/").status_code == 403
    response = as_user(customer).post(f"/api/v1/orders/{order.pk}/cancel/")
    assert response.json()["status"] == "cancelled"
    conflict = as_user(staff).post(f"/api/v1/orders/{order.pk}/ship/")
    assert conflict.status_code == 409
    assert conflict.json()["error"]["code"] == "conflict"


def test_order_creation_is_throttled(as_user, customer, catalog):
    client = as_user(customer)
    codes = [post_order(client, order_payload((catalog["dune"], 1)), key=f"k{i}").status_code for i in range(6)]
    assert codes[:5] == [201] * 5 and codes[5] == 429  # test settings: 5/minute


# --- the web checkout --------------------------------------------------------------------


def test_cart_checkout_flow(client, customer, catalog):
    client.post(f"/cart/add/{catalog['dune'].pk}/", {"quantity": 2})
    client.post(f"/cart/add/{catalog['chess'].pk}/")
    cart = client.get("/cart/")
    assert cart.context["total"] == Decimal("55.00")

    assert client.post("/checkout/").url.startswith("/login/")  # must log in first
    client.force_login(customer)
    response = client.post("/checkout/", follow=True)
    order = Order.objects.get()
    assert response.redirect_chain[-1][0] == f"/orders/{order.pk}/"
    assert order.total == Decimal("55.00")
    assert client.get("/cart/").context["lines"] == []


def test_cart_prices_come_from_the_database(client, catalog):
    client.post(f"/cart/add/{catalog['dune'].pk}/")
    Product.objects.filter(pk=catalog["dune"].pk).update(price=Decimal("99.00"))
    assert client.get("/cart/").context["total"] == Decimal("99.00")


def test_other_peoples_order_pages_are_404(client, customer, other_customer, catalog):
    order = place_order(customer, [(catalog["dune"].pk, 1)])
    client.force_login(other_customer)
    assert client.get(f"/orders/{order.pk}/").status_code == 404
