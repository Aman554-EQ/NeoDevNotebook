"""Lesson 22: discovering an API: OPTIONS metadata and the OpenAPI schema from drf-spectacular."""

from _kit import emit, http
from playground import migrate, setup

setup(
    apps=["rest_framework", "drf_spectacular"],
    REST_FRAMEWORK={
        "DEFAULT_AUTHENTICATION_CLASSES": [],
        "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
        "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
        "UNAUTHENTICATED_USER": None,
        "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    },
    SPECTACULAR_SETTINGS={"TITLE": "Books API", "VERSION": "1.0.0"},
)

from django.db import models  # noqa: E402
from django.test import Client  # noqa: E402
from django.urls import path  # noqa: E402
from drf_spectacular.views import SpectacularAPIView  # noqa: E402
from rest_framework import generics, serializers  # noqa: E402


class Book(models.Model):
    title = models.CharField(max_length=100, help_text="The title as printed on the cover.")
    year = models.IntegerField()


class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ["id", "title", "year"]


class BookList(generics.ListCreateAPIView):
    """List every book, or add one."""

    queryset = Book.objects.order_by("id")
    serializer_class = BookSerializer


urlpatterns = [
    path("api/books/", BookList.as_view()),
    path("api/schema/", SpectacularAPIView.as_view()),
]
migrate()
c = Client()

emit(
    "http",
    "How a client discovers what an API accepts",
    [
        http(c, "OPTIONS", "/api/books/", label="OPTIONS", note="DRF answers OPTIONS with metadata: the view's name and description, and for POST every field with its type, whether it's required and its limits."),
        http(c, "GET", "/api/schema/?format=json", label="OpenAPI schema", note="drf-spectacular generates an OpenAPI document from your serializers and views. Swagger UI, ReDoc and Postman (Import → OpenAPI) all read it."),
    ],
)
