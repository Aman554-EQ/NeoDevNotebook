from rest_framework import serializers, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsStaffOrReadOnly

from .models import Category, Product
from .services import category_list, forget_categories


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]


class ProductSerializer(serializers.ModelSerializer):
    category_slug = serializers.SlugRelatedField(source="category", slug_field="slug", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "price",
            "stock",
            "category",
            "category_slug",
            "is_active",
        ]


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsStaffOrReadOnly]
    filterset_fields = {"category__slug": ["exact"], "price": ["gte", "lte"]}
    search_fields = ["name", "description"]
    ordering_fields = ["name", "price", "created_at"]
    lookup_field = "slug"

    def get_queryset(self):
        products = Product.objects.select_related("category").order_by("name")
        user = self.request.user
        # Customers never see inactive products; staff manage all of them.
        return products if user.is_authenticated and user.is_staff else products.active()


class CategoryList(APIView):
    permission_classes = [AllowAny]
    serializer_class = CategorySerializer

    def get(self, request):
        return Response(category_list())


class CategoryViewSet(viewsets.ModelViewSet):
    """Staff-only management; every change clears the cached list."""

    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsStaffOrReadOnly]
    lookup_field = "slug"

    def perform_create(self, serializer):
        serializer.save()
        forget_categories()

    def perform_update(self, serializer):
        serializer.save()
        forget_categories()

    def perform_destroy(self, instance):
        instance.delete()
        forget_categories()
