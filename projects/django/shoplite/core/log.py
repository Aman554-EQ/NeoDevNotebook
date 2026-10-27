import logging
from contextvars import ContextVar

# Set by RequestIDMiddleware for the duration of each request (safe with threads and async).
request_id_var: ContextVar[str] = ContextVar("request_id", default="-")


class RequestIDFilter(logging.Filter):
    """Adds `request_id` to every log record so the formatter can print it."""

    def filter(self, record):
        record.request_id = request_id_var.get()
        return True
