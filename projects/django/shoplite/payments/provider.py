"""FakePay: a stand-in for a real payment provider (Stripe, PayPal, ...).

Real providers work the same way: you create a payment, the customer pays on their page, and the
provider calls your webhook URL with a signed event. The signature header looks like

    FakePay-Signature: t=1700000000,v1=<hex HMAC-SHA256 of "<t>.<raw body>" with the shared secret>

Signing the timestamp too means an attacker can't replay an old, genuinely signed event later.
"""

import hashlib
import hmac
import json
import time
import uuid

SIGNATURE_HEADER = "FakePay-Signature"


class SignatureError(Exception):
    pass


def new_payment_ref() -> str:
    return f"pay_{uuid.uuid4().hex[:24]}"


def sign(body: bytes, secret: str, timestamp: int | None = None) -> str:
    timestamp = int(time.time()) if timestamp is None else timestamp
    mac = hmac.new(secret.encode(), f"{timestamp}.".encode() + body, hashlib.sha256).hexdigest()
    return f"t={timestamp},v1={mac}"


def verify(body: bytes, header: str, secret: str, tolerance: int, now: int | None = None) -> None:
    """Raise SignatureError unless `header` is a fresh, valid signature of `body`."""
    try:
        parts = dict(item.split("=", 1) for item in header.split(","))
        timestamp, received = int(parts["t"]), parts["v1"]
    except (KeyError, ValueError) as exc:
        raise SignatureError("malformed signature header") from exc
    now = int(time.time()) if now is None else now
    if abs(now - timestamp) > tolerance:
        raise SignatureError("timestamp outside the tolerance window")
    expected = sign(body, secret, timestamp).split("v1=", 1)[1]
    # compare_digest takes the same time whatever the input, so timing leaks nothing.
    if not hmac.compare_digest(expected, received):
        raise SignatureError("signature mismatch")


def event(event_type: str, payment_ref: str, amount: str) -> bytes:
    payload = {
        "id": f"evt_{uuid.uuid4().hex[:24]}",
        "type": event_type,
        "data": {"payment": payment_ref, "amount": amount},
    }
    return json.dumps(payload).encode()
