"""Lesson 19: a ModelViewSet + router: full CRUD with pagination, filtering, search and ordering."""

from _kit import emit, http
from playground import migrate, setup

setup(
    apps=["rest_framework", "django_filters"],
    REST_FRAMEWORK={
        "DEFAULT_AUTHENTICATION_CLASSES": [],
        "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
        "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
        "UNAUTHENTICATED_USER": None,
        "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
        "PAGE_SIZE": 2,
        "DEFAULT_FILTER_BACKENDS": [
            "django_filters.rest_framework.DjangoFilterBackend",
            "rest_framework.filters.SearchFilter",
            "rest_framework.filters.OrderingFilter",
        ],
    },
)

from django.db import models  # noqa: E402
from django.test import Client  # noqa: E402
from rest_framework import routers, serializers, viewsets  # noqa: E402


class Book(models.Model):
    title = models.CharField(max_length=100)
    author = models.CharField(max_length=100)
    year = models.IntegerField()


class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ["id", "title", "author", "year"]


class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.order_by("id")
    serializer_class = BookSerializer
    filterset_fields = ["author"]
    search_fields = ["title"]
    ordering_fields = ["year", "title"]


router = routers.DefaultRouter()
router.register("books", BookViewSet)
urlpatterns = router.urls
migrate()
Book.objects.bulk_create(
    [
        Book(title="Dune", author="Herbert", year=1965),
        Book(title="Emma", author="Austen", year=1815),
        Book(title="Persuasion", author="Austen", year=1817),
    ]
)
c = Client()

emit(
    "http",
    "One ViewSet, every CRUD operation",
    [
        http(c, "GET", "/books/", label="List (page 1)", note="The router made /books/ from register('books', ...). PAGE_SIZE is 2, so the list is paginated: count, next, previous, results."),
        http(c, "GET", "/books/?page=2", label="Page 2", note="Follow 'next' to get the rest. Clients never need to know the page size."),
        http(c, "GET", "/books/?author=Austen&ordering=-year", label="Filter + order", note="?author= comes from filterset_fields (django-filter); ?ordering=-year from OrderingFilter. Both are whitelisted per view."),
        http(c, "GET", "/books/?search=dun", label="Search", note="SearchFilter does a case-insensitive contains match on search_fields."),
        http(c, "POST", "/books/", json_body={"title": "Mansfield Park", "author": "Austen", "year": 1814}, label="Create", note="POST to the list URL: 201 Created with the new object."),
        http(c, "GET", "/books/4/", label="Retrieve", note="The detail route /books/{pk}/ came from the same ViewSet."),
        http(c, "PATCH", "/books/4/", json_body={"year": 1815}, label="Partial update", note="PATCH changes only the fields sent (partial_update). PUT would require every field (update)."),
        http(c, "DELETE", "/books/4/", label="Delete", note="destroy: 204 No Content."),
        http(c, "GET", "/books/4/", label="Gone", note="Now it's a 404, from get_object() raising Http404."),
    ],
)
