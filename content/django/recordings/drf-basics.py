"""Lesson 18: a serializer and an APIView, called like a client would."""

from _kit import emit, http
from playground import migrate, setup

setup(
    apps=["rest_framework"],
    REST_FRAMEWORK={
        "DEFAULT_AUTHENTICATION_CLASSES": [],
        "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
        "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
        "UNAUTHENTICATED_USER": None,
    },
)

from django.db import models  # noqa: E402
from django.test import Client  # noqa: E402
from django.urls import path  # noqa: E402
from rest_framework import serializers, status  # noqa: E402
from rest_framework.response import Response  # noqa: E402
from rest_framework.views import APIView  # noqa: E402


class Book(models.Model):
    title = models.CharField(max_length=100)
    isbn = models.CharField(max_length=13, unique=True)
    year = models.IntegerField()


class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ["id", "title", "isbn", "year"]

    def validate_isbn(self, value):
        if len(value) != 13 or not value.isdigit():
            raise serializers.ValidationError("ISBN must be 13 digits.")
        return value


class BookList(APIView):
    def get(self, request):
        books = Book.objects.order_by("id")
        return Response(BookSerializer(books, many=True).data)

    def post(self, request):
        serializer = BookSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)  # 400 with field errors if not
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


urlpatterns = [path("api/books/", BookList.as_view())]
migrate()
c = Client()

emit(
    "http",
    "A DRF serializer validating real requests",
    [
        http(c, "POST", "/api/books/", json_body={"title": "Dune", "isbn": "9780441172719", "year": 1965}, label="Valid", note="The serializer turns JSON into validated Python data, save() creates the row, and the response is the serializer's output: 201 Created."),
        http(c, "POST", "/api/books/", json_body={"title": "", "isbn": "123", "year": "soon"}, label="Field errors", note="Every invalid field is reported at once, keyed by field name: required text can't be blank, your validate_isbn rule, and a type conversion error."),
        http(c, "POST", "/api/books/", json_body={"title": "Dune again", "isbn": "9780441172719", "year": 1965}, label="Unique", note="ModelSerializer copies the model's unique=True into a validator, so a duplicate ISBN is a 400, not a database crash."),
        http(c, "POST", "/api/books/", json_body={"isbn": "9780141439587"}, label="Missing fields", note="Required fields that are absent get 'This field is required.'"),
        http(c, "GET", "/api/books/", label="List", note="many=True serializes a whole QuerySet into a JSON list."),
    ],
)
