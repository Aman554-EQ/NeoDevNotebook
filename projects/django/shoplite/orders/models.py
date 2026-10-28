from django.conf import settings
from django.db import models
from django.db.models import Q


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Awaiting payment"
        PAID = "paid", "Paid"
        SHIPPED = "shipped", "Shipped"
        CANCELLED = "cancelled", "Cancelled"

    # The state machine: which status may follow which. Anything else is refused.
    TRANSITIONS = {
        Status.PENDING: {Status.PAID, Status.CANCELLED},
        Status.PAID: {Status.SHIPPED},
        Status.SHIPPED: set(),
        Status.CANCELLED: set(),
    }

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="orders")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at", "-id"]
        indexes = [models.Index(fields=["user", "-created_at"])]

    def __str__(self):
        return f"Order #{self.pk} ({self.status})"

    def can_become(self, new_status) -> bool:
        return new_status in self.TRANSITIONS[self.Status(self.status)]


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey("catalog.Product", on_delete=models.PROTECT, related_name="+")
    quantity = models.PositiveIntegerField()
    # Copied at purchase time: later price changes must not rewrite old orders.
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["order", "product"], name="one_line_per_product"),
            models.CheckConstraint(condition=Q(quantity__gte=1), name="quantity_at_least_one"),
        ]

    @property
    def line_total(self):
        return self.unit_price * self.quantity


class IdempotencyKey(models.Model):
    """Remembers the response to a POST so a retried request gets the same answer, not a 2nd order."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    key = models.CharField(max_length=100)
    fingerprint = models.CharField(max_length=64)  # sha256 of the request body
    response_status = models.PositiveSmallIntegerField()
    response_body = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "key"], name="unique_key_per_user")]
