from rest_framework import status
from rest_framework.exceptions import APIException, ValidationError
from rest_framework.response import Response
from rest_framework.views import exception_handler


class Conflict(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "The request conflicts with the current state."
    default_code = "conflict"


def api_exception_handler(exc, context):
    """Every API error has the same shape:

    {"error": {"code": "...", "message": "...", "details": {...}, "request_id": "..."}}

    Clients can branch on `code`, show `message`, and quote `request_id` in a bug report.
    """
    response = exception_handler(exc, context)
    if response is None:
        return None  # an unexpected exception: Django returns a plain 500 and logs it
    request = context.get("request")
    if isinstance(exc, ValidationError):
        code, message, details = "validation_error", "Some fields are invalid.", response.data
    else:
        data = response.data if isinstance(response.data, dict) else {}
        detail = data.get("detail", exc)
        code = getattr(detail, "code", None) or getattr(exc, "default_code", "error")
        message, details = str(detail), {}
    body = {
        "error": {
            "code": code,
            "message": message,
            "details": details,
            "request_id": getattr(request, "request_id", None),
        }
    }
    return Response(body, status=response.status_code, headers=_keep_headers(response))


def _keep_headers(response):
    keep = ("WWW-Authenticate", "Retry-After", "Allow")
    return {k: response[k] for k in keep if response.has_header(k)}
