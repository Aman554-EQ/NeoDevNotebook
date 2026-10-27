from django.db.models import Prefetch
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import mixins, serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from core.exceptions import Conflict
from core.permissions import IsOwnerOrStaff

from .idempotency import idempotent
from .models import Order, OrderItem
from .services import OrderError, cancel_order, place_order, ship_order


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = OrderItem
        fields = ["product", "product_name", "quantity", "unit_price"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ["id", "status", "total", "items", "created_at"]


class LineInput(serializers.Serializer):
    product = serializers.IntegerField(min_value=1)
    quantity = serializers.IntegerField(min_value=1, max_value=100)


class PlaceOrderInput(serializers.Serializer):
    items = LineInput(many=True, allow_empty=False)


class OrderViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """Customers list and read their own orders; staff see every order."""

    queryset = Order.objects.none()  # for the schema generator; see get_queryset
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrStaff]
    filterset_fields = ["status"]
    ordering_fields = ["created_at", "total"]

    def get_throttles(self):
        self.throttle_scope = "orders" if self.action == "create" else None
        return super().get_throttles()

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Order.objects.none()
        # Any page costs the same few queries: the orders, then all their items with products
        # (prefetch), plus the paginator COUNT. Never one query per order.
        items = Prefetch("items", queryset=OrderItem.objects.select_related("product"))
        orders = Order.objects.prefetch_related(items)
        return orders if self.request.user.is_staff else orders.filter(user=self.request.user)

    @extend_schema(
        request=PlaceOrderInput,
        responses={201: OrderSerializer},
        parameters=[
            OpenApiParameter(
                "Idempotency-Key",
                location=OpenApiParameter.HEADER,
                required=True,
                description="A unique value per checkout attempt. Retries reuse it.",
            )
        ],
    )
    @idempotent
    def create(self, request):
        data = PlaceOrderInput(data=request.data)
        data.is_valid(raise_exception=True)
        lines = [(line["product"], line["quantity"]) for line in data.validated_data["items"]]
        try:
            order = place_order(request.user, lines)
        except OrderError as exc:
            raise Conflict(str(exc)) from exc
        order = self.get_queryset().get(pk=order.pk)
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        return self._change(cancel_order)

    @action(detail=True, methods=["post"], permission_classes=[IsAdminUser])
    def ship(self, request, pk=None):
        return self._change(ship_order)

    def _change(self, service):
        order = self.get_object()
        try:
            service(order)
        except OrderError as exc:
            raise Conflict(str(exc)) from exc
        return Response(OrderSerializer(self.get_queryset().get(pk=order.pk)).data)
