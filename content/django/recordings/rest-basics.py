"""Lesson 02: a tiny REST resource in plain Django, exercised like an API client would."""

import json

from _kit import emit, http
from playground import migrate, setup

setup(middleware=["django.middleware.common.CommonMiddleware"])

from django.db import models  # noqa: E402
from django.http import HttpResponse, JsonResponse  # noqa: E402
from django.test import Client  # noqa: E402
from django.urls import path  # noqa: E402
from django.views.decorators.csrf import csrf_exempt  # noqa: E402
from django.views.decorators.http import require_http_methods  # noqa: E402


class Book(models.Model):
    title = models.CharField(max_length=100)
    year = models.IntegerField()

    def as_dict(self):
        return {"id": self.pk, "title": self.title, "year": self.year}


def parse(request):
    try:
        data = json.loads(request.body)
        return {"title": str(data["title"]), "year": int(data["year"])}, None
    except (ValueError, KeyError, TypeError):
        return None, JsonResponse({"error": "Send JSON with a title and a year."}, status=400)


@csrf_exempt
@require_http_methods(["GET", "POST"])
def books(request):
    if request.method == "GET":
        return JsonResponse({"results": [b.as_dict() for b in Book.objects.order_by("id")]})
    data, error = parse(request)
    if error:
        return error
    book = Book.objects.create(**data)
    response = JsonResponse(book.as_dict(), status=201)
    response["Location"] = f"/api/books/{book.pk}/"
    return response


@csrf_exempt
@require_http_methods(["GET", "PUT", "DELETE"])
def book(request, pk):
    found = Book.objects.filter(pk=pk).first()
    if found is None:
        return JsonResponse({"error": f"Book {pk} not found."}, status=404)
    if request.method == "GET":
        return JsonResponse(found.as_dict())
    if request.method == "DELETE":
        found.delete()
        return HttpResponse(status=204)  # 204 No Content: no body at all
    data, error = parse(request)
    if error:
        return error
    Book.objects.filter(pk=pk).update(**data)
    found.refresh_from_db()
    return JsonResponse(found.as_dict())


urlpatterns = [path("api/books/", books), path("api/books/<int:pk>/", book)]
migrate()
Book.objects.create(title="Dune", year=1965)
c = Client()

emit(
    "http",
    "A books resource, one request at a time",
    [
        http(c, "GET", "/api/books/", label="List", note="GET on the collection URL reads every book. Safe: it changes nothing."),
        http(c, "POST", "/api/books/", json_body={"title": "Emma", "year": 1815}, label="Create", note="POST to the collection creates a new book. 201 Created, and Location says where the new resource lives."),
        http(c, "GET", "/api/books/2/", label="Read one", note="GET on an item URL reads one resource, identified by its id in the path."),
        http(c, "PUT", "/api/books/2/", json_body={"title": "Emma", "year": 1816}, label="Replace", note="PUT replaces the whole resource. Sending the same PUT twice leaves the same state: PUT is idempotent."),
        http(c, "DELETE", "/api/books/2/", label="Delete", note="DELETE removes it. 204 No Content: success, nothing to send back."),
        http(c, "DELETE", "/api/books/2/", label="Delete again", note="A second DELETE answers 404, but the server's state is the same as after the first: still no book 2. Idempotent means same effect, not same status code."),
        http(c, "POST", "/api/books/", json_body={"title": "No year"}, label="Bad input", note="Invalid input is the client's fault: 400 Bad Request with a message saying what to fix."),
        http(c, "PATCH", "/api/books/1/", json_body={"year": 1966}, label="Wrong method", note="This resource doesn't support PATCH: 405 Method Not Allowed, and the Allow header lists what is allowed."),
    ],
)
