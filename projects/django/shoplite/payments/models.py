from django.db import models


class Payment(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending"
        SUCCEEDED = "succeeded"
        FAILED = "failed"

    order = models.ForeignKey("orders.Order", on_delete=models.PROTECT, related_name="payments")
    provider_ref = models.CharField(max_length=40, unique=True)  # the provider's id, e.g. pay_...
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.provider_ref} ({self.status})"


class WebhookEvent(models.Model):
    """Every processed provider event. The unique id makes duplicate deliveries harmless."""

    event_id = models.CharField(max_length=60, unique=True)
    type = models.CharField(max_length=40)
    received_at = models.DateTimeField(auto_now_add=True)
