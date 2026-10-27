import json
import time

import pytest
from django.conf import settings

from orders.models import Order
from orders.services import place_order
from payments import provider
from payments.models import Payment

pytestmark = pytest.mark.django_db
WEBHOOK = "/api/v1/payments/webhook/"


@pytest.fixture
def payment(as_user, customer, catalog):
    order = place_order(customer, [(catalog["dune"].pk, 2)])
    response = as_user(customer).post(f"/api/v1/orders/{order.pk}/pay/")
    assert response.status_code == 201
    return Payment.objects.get(provider_ref=response.json()["payment"])


def deliver(client, body: bytes, signature: str | None = None):
    signature = signature or provider.sign(body, settings.PAYMENTS_WEBHOOK_SECRET)
    return client.post(
        WEBHOOK, body, content_type="application/json", headers={provider.SIGNATURE_HEADER: signature}
    )


def test_start_payment_only_for_pending_own_orders(as_user, customer, other_customer, catalog):
    order = place_order(customer, [(catalog["dune"].pk, 1)])
    assert as_user(other_customer).post(f"/api/v1/orders/{order.pk}/pay/").status_code == 404
    body = as_user(customer).post(f"/api/v1/orders/{order.pk}/pay/").json()
    assert body["payment"].startswith("pay_") and body["amount"] == "12.50"


def test_succeeded_event_marks_the_order_paid(client, payment):
    body = provider.event("payment.succeeded", payment.provider_ref, "25.00")
    assert deliver(client, body).json() == {"status": "order paid"}
    payment.refresh_from_db()
    assert payment.status == "succeeded"
    assert Order.objects.get(pk=payment.order_id).status == "paid"


def test_duplicate_delivery_is_acknowledged_and_ignored(client, payment):
    body = provider.event("payment.succeeded", payment.provider_ref, "25.00")
    deliver(client, body)
    assert deliver(client, body).json() == {"status": "duplicate"}


def test_failed_event_keeps_the_order_pending(client, payment):
    body = provider.event("payment.failed", payment.provider_ref, "25.00")
    assert deliver(client, body).json() == {"status": "recorded failure"}
    assert Order.objects.get(pk=payment.order_id).status == "pending"


def test_wrong_amount_does_not_pay_the_order(client, payment):
    body = provider.event("payment.succeeded", payment.provider_ref, "0.01")
    assert deliver(client, body).json() == {"status": "amount mismatch"}
    assert Order.objects.get(pk=payment.order_id).status == "pending"


def test_unknown_payment_is_acknowledged(client, db):
    body = provider.event("payment.succeeded", "pay_doesnotexist", "1.00")
    assert deliver(client, body).json() == {"status": "unknown payment"}


@pytest.mark.parametrize(
    "make_signature, reason",
    [
        (lambda body: provider.sign(body, "whsec_wrong_secret_0123456789abcdef"), "signature mismatch"),
        (lambda body: provider.sign(body, settings.PAYMENTS_WEBHOOK_SECRET, int(time.time()) - 3600), "timestamp"),
        (lambda body: "garbage", "malformed"),
    ],
)
def test_bad_signatures_are_rejected(client, payment, make_signature, reason):
    body = provider.event("payment.succeeded", payment.provider_ref, "25.00")
    response = deliver(client, body, make_signature(body))
    assert response.status_code == 400
    assert reason in response.json()["error"]["message"]
    assert Order.objects.get(pk=payment.order_id).status == "pending"


def test_a_tampered_body_fails_verification(client, payment):
    body = provider.event("payment.succeeded", payment.provider_ref, "25.00")
    signature = provider.sign(body, settings.PAYMENTS_WEBHOOK_SECRET)
    tampered = json.dumps({**json.loads(body), "type": "payment.succeeded", "id": "evt_forged"}).encode()
    assert deliver(client, tampered, signature).status_code == 400


def test_verify_unit():
    body = b'{"x": 1}'
    header = provider.sign(body, "s" * 32, timestamp=1_000)
    provider.verify(body, header, "s" * 32, tolerance=300, now=1_100)
    with pytest.raises(provider.SignatureError):
        provider.verify(body, header, "s" * 32, tolerance=300, now=2_000)


def test_simulate_payment_command_sends_a_signed_event(payment):
    """The local provider simulator posts a correctly signed event (the network call is mocked)."""
    from io import StringIO
    from unittest import mock

    from django.core.management import call_command

    sent = {}

    class FakeResponse:
        status = 200

        def __enter__(self):
            return self

        def __exit__(self, *exc):
            return False

        def read(self):
            return b'{"status": "order paid"}'

    def fake_urlopen(request, timeout):
        sent["body"], sent["signature"] = request.data, request.get_header("Fakepay-signature")
        return FakeResponse()

    out = StringIO()
    with mock.patch("urllib.request.urlopen", fake_urlopen):
        call_command("simulate_payment", payment.provider_ref, stdout=out)
    provider.verify(sent["body"], sent["signature"], settings.PAYMENTS_WEBHOOK_SECRET, tolerance=300)
    assert json.loads(sent["body"])["type"] == "payment.succeeded"
    assert out.getvalue().startswith("200 ")
