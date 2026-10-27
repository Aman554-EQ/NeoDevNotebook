"""Lesson 21: versioning, conditional requests (ETag/304), one error format and rate limits."""

from _kit import emit, http
from playground import migrate, setup

setup(
    apps=["rest_framework"],
    middleware=[
        "django.middleware.common.CommonMiddleware",
        "django.middleware.http.ConditionalGetMiddleware",  # adds ETag, answers 304
    ],
    REST_FRAMEWORK={
        "DEFAULT_AUTHENTICATION_CLASSES": [],
        "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
        "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
        "UNAUTHENTICATED_USER": None,
        "DEFAULT_VERSIONING_CLASS": "rest_framework.versioning.URLPathVersioning",
        "ALLOWED_VERSIONS": ["v1", "v2"],
        "EXCEPTION_HANDLER": "__main__.error_handler",
        "DEFAULT_THROTTLE_RATES": {"search": "2/day"},
    },
)

from django.db import models  # noqa: E402
from django.test import Client  # noqa: E402
from django.urls import path  # noqa: E402
from rest_framework import generics, serializers  # noqa: E402
from rest_framework.response import Response  # noqa: E402
from rest_framework.throttling import ScopedRateThrottle  # noqa: E402
from rest_framework.views import exception_handler  # noqa: E402


def error_handler(exc, context):
    """Every error in one shape, so clients need one code path for failures."""
    response = exception_handler(exc, context)
    if response is not None:
        detail = response.data.get("detail", response.data) if isinstance(response.data, dict) else response.data
        code = getattr(detail, "code", None) or getattr(exc, "default_code", "error")
        response.data = {"error": {"code": code, "message": str(detail)}}
    return response


class Product(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=8, decimal_places=2)


class ProductV1(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name", "price"]


class ProductV2(serializers.ModelSerializer):
    # v2 renamed a field. v1 clients keep working because they still get v1.
    price_eur = serializers.DecimalField(source="price", max_digits=8, decimal_places=2)

    class Meta:
        model = Product
        fields = ["id", "name", "price_eur"]


class ProductDetail(generics.RetrieveAPIView):
    queryset = Product.objects.all()

    def get_serializer_class(self):
        return ProductV2 if self.request.version == "v2" else ProductV1


class Search(generics.GenericAPIView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "search"

    def get(self, request, version):
        return Response({"results": list(Product.objects.values_list("name", flat=True))})


urlpatterns = [
    path("api/<str:version>/products/<int:pk>/", ProductDetail.as_view()),
    path("api/<str:version>/search/", Search.as_view()),
]
migrate()
Product.objects.create(name="Dune", price="12.50")
c = Client()
first = c.get("/api/v1/products/1/")

emit(
    "http",
    "API design details that save clients pain",
    [
        http(c, "GET", "/api/v1/products/1/", label="v1", note="The version is part of the URL. ConditionalGetMiddleware adds an ETag: a fingerprint of this exact response."),
        http(c, "GET", "/api/v2/products/1/", label="v2", note="v2 renamed price to price_eur. Old apps keep calling v1 and don't break; new apps use v2."),
        http(c, "GET", "/api/v1/products/1/", headers={"If-None-Match": first["ETag"]}, label="304 Not Modified", note="The client sends back the ETag it has. Nothing changed, so the answer is 304 with no body: the client reuses its cached copy."),
        http(c, "GET", "/api/v3/products/1/", label="Unknown version", note="Asking for a version that doesn't exist is a clear 404 in the standard error shape."),
        http(c, "GET", "/api/v1/products/99/", label="Not found", note="The same {error: {code, message}} shape for every failure, produced by one exception handler."),
        http(c, "GET", "/api/v1/search/", label="Search 1", note="Search is rate limited to 2 requests per day per client (tiny, to show the limit)."),
        http(c, "GET", "/api/v1/search/", label="Search 2", note="The second request is still within the limit."),
        http(c, "GET", "/api/v1/search/", label="429", note="The third gets 429 Too Many Requests, and Retry-After tells the client how many seconds to wait."),
    ],
)
