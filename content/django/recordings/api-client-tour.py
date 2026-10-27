"""Lesson 05: what an API client (Postman, curl, HTTPie) sends, and what comes back."""

import os

from _kit import emit, http
from playground import setup

# The token comes from the environment, as it would from a .env file. This one is a fake.
os.environ["REPORTS_API_TOKEN"] = "fake-token-for-learning-123"
setup(middleware=["django.middleware.common.CommonMiddleware"])

from django.http import HttpResponse, JsonResponse  # noqa: E402
from django.test import Client  # noqa: E402
from django.urls import path  # noqa: E402

SALES = [
    {"month": "2026-01", "units": 16},
    {"month": "2026-02", "units": 20},
]


def reports(request):
    expected = f"Bearer {os.environ['REPORTS_API_TOKEN']}"
    if request.headers.get("Authorization") != expected:
        response = JsonResponse({"error": "Send Authorization: Bearer <token>."}, status=401)
        response["WWW-Authenticate"] = "Bearer"
        return response
    rows = [r for r in SALES if r["month"] == request.GET.get("month", r["month"])]
    if "text/csv" in request.headers.get("Accept", ""):
        lines = ["month,units", *(f"{r['month']},{r['units']}" for r in rows)]
        return HttpResponse("\n".join(lines) + "\n", content_type="text/csv")
    return JsonResponse({"results": rows})


urlpatterns = [path("api/reports/", reports)]
c = Client()
token = {"Authorization": "Bearer fake-token-for-learning-123"}

emit(
    "http",
    "An API client's view of one endpoint",
    [
        http(c, "GET", "/api/reports/", label="No token", note="Without credentials the API answers 401 Unauthorized, and WWW-Authenticate names the scheme it expects."),
        http(c, "GET", "/api/reports/", headers={"Authorization": "Bearer wrong"}, label="Wrong token", note="A wrong token is also 401. In Postman, put the real one in an environment variable instead of pasting it into every request."),
        http(c, "GET", "/api/reports/", headers=token, label="Authorized", note="With the right Authorization header: 200 OK and JSON."),
        http(c, "GET", "/api/reports/?month=2026-02", headers=token, label="Query parameter", note="Filters travel in the query string (Postman's Params tab builds it for you)."),
        http(c, "GET", "/api/reports/", headers={**token, "Accept": "text/csv"}, label="Accept header", note="The Accept header asks for a format. This endpoint can also answer in CSV: same data, different representation."),
    ],
)
