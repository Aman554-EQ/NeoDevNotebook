import hashlib
import json

from django.db import IntegrityError, transaction
from rest_framework import status
from rest_framework.response import Response

from .models import IdempotencyKey

HEADER = "Idempotency-Key"


def fingerprint(data) -> str:
    """The same JSON body always gives the same hash, whatever the key order."""
    canonical = json.dumps(data, sort_keys=True, separators=(",", ":"), default=str)
    return hashlib.sha256(canonical.encode()).hexdigest()


def error(code, message, http_status):
    return Response({"error": {"code": code, "message": message, "details": {}}}, status=http_status)


def idempotent(handler):
    """Run `handler(request)` at most once per (user, Idempotency-Key).

    - first request: run it; store the status and body if it succeeded
    - retry with the same key and body: replay the stored response (header Idempotent-Replayed)
    - same key, different body: 422, because that is a client bug, not a retry
    Failed attempts are not stored, so the client can fix the problem and retry with the key.
    """

    def wrapper(view, request, *args, **kwargs):
        key = request.headers.get(HEADER, "").strip()
        if not key or len(key) > 100:
            return error("idempotency_key_required", f"Send a unique {HEADER} header (max 100 chars).", 400)
        digest = fingerprint(request.data)
        previous = IdempotencyKey.objects.filter(user=request.user, key=key).first()
        if previous:
            return _replay(previous, digest)
        try:
            with transaction.atomic():
                response = handler(view, request, *args, **kwargs)
                if 200 <= response.status_code < 300:
                    IdempotencyKey.objects.create(
                        user=request.user,
                        key=key,
                        fingerprint=digest,
                        response_status=response.status_code,
                        response_body=response.data,
                    )
                return response
        except IntegrityError:
            # A concurrent request with the same key committed first; its work stands, ours was
            # rolled back with this transaction. Answer exactly as it did.
            return _replay(IdempotencyKey.objects.get(user=request.user, key=key), digest)

    return wrapper


def _replay(record, digest):
    if record.fingerprint != digest:
        return error(
            "idempotency_key_reused",
            "This Idempotency-Key was already used with a different request body.",
            status.HTTP_422_UNPROCESSABLE_ENTITY,
        )
    return Response(record.response_body, status=record.response_status, headers={"Idempotent-Replayed": "true"})
