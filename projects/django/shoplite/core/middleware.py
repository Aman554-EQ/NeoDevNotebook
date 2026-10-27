import logging
import re
import time
import uuid

from .log import request_id_var

logger = logging.getLogger("shoplite.requests")
SAFE_ID = re.compile(r"^[A-Za-z0-9-]{8,64}$")


class RequestIDMiddleware:
    """Gives every request an id (or keeps a valid one from the caller) and logs its timing.

    The id goes into every log line written while handling the request and back to the client
    in the X-Request-ID header, so a user's bug report can be matched to the server logs.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        incoming = request.headers.get("X-Request-ID", "")
        request.request_id = incoming if SAFE_ID.match(incoming) else uuid.uuid4().hex
        token = request_id_var.set(request.request_id)
        start = time.perf_counter()
        try:
            response = self.get_response(request)
            elapsed_ms = (time.perf_counter() - start) * 1000
            logger.info(
                "%s %s -> %s in %.1fms",
                request.method,
                request.path,
                response.status_code,
                elapsed_ms,
            )
            response["X-Request-ID"] = request.request_id
            return response
        finally:
            request_id_var.reset(token)


class SecurityHeadersMiddleware:
    """Headers Django doesn't set by itself. (SecurityMiddleware covers HSTS, nosniff, referrer.)"""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        response.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
        response.setdefault("Cross-Origin-Opener-Policy", "same-origin")
        if response.get("Content-Type", "").startswith("text/html"):
            response.setdefault(
                "Content-Security-Policy",
                "default-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'",
            )
        return response
