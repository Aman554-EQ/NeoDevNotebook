import pytest

from catalog.models import Product
from orders.idempotency import fingerprint
from orders.models import Order

from .conftest import order_payload

pytestmark = pytest.mark.django_db


def post(client, payload, **headers):
    return client.post("/api/v1/orders/", payload, format="json", headers=headers)


def test_the_key_is_required(as_user, customer, catalog):
    response = post(as_user(customer), order_payload((catalog["dune"], 1)))
    assert response.status_code == 400
    assert response.json()["error"]["code"] == "idempotency_key_required"


def test_a_retry_replays_the_first_response_without_a_second_order(as_user, customer, catalog):
    client = as_user(customer)
    payload = order_payload((catalog["dune"], 2))
    first = post(client, payload, **{"Idempotency-Key": "checkout-42"})
    retry = post(client, payload, **{"Idempotency-Key": "checkout-42"})
    assert (first.status_code, retry.status_code) == (201, 201)
    assert retry.json() == first.json()
    assert retry["Idempotent-Replayed"] == "true"
    assert Order.objects.count() == 1
    assert Product.objects.get(pk=catalog["dune"].pk).stock == 3  # reserved once, not twice


def test_same_key_with_a_different_body_is_422(as_user, customer, catalog):
    client = as_user(customer)
    post(client, order_payload((catalog["dune"], 1)), **{"Idempotency-Key": "k"})
    response = post(client, order_payload((catalog["dune"], 3)), **{"Idempotency-Key": "k"})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "idempotency_key_reused"


def test_keys_belong_to_one_user(as_user, customer, other_customer, catalog):
    payload = order_payload((catalog["dune"], 1))
    post(as_user(customer), payload, **{"Idempotency-Key": "same"})
    response = post(as_user(other_customer), payload, **{"Idempotency-Key": "same"})
    assert response.status_code == 201 and "Idempotent-Replayed" not in response
    assert Order.objects.count() == 2


def test_failures_are_not_stored_so_a_fixed_retry_works(as_user, customer, catalog):
    client = as_user(customer)
    payload = order_payload((catalog["emma"], 2))  # only 1 in stock
    assert post(client, payload, **{"Idempotency-Key": "k"}).status_code == 409
    Product.objects.filter(pk=catalog["emma"].pk).update(stock=5)  # restocked
    assert post(client, payload, **{"Idempotency-Key": "k"}).status_code == 201


def test_fingerprint_ignores_key_order():
    assert fingerprint({"a": 1, "b": [1, 2]}) == fingerprint({"b": [1, 2], "a": 1})
    assert fingerprint({"a": 1}) != fingerprint({"a": 2})
