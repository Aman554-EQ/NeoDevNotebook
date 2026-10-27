from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import Q
from django.urls import reverse


class Category(models.Model):
    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(unique=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "categories"

    def __str__(self):
        return self.name


class ProductQuerySet(models.QuerySet):
    def active(self):
        return self.filter(is_active=True)


class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="products")
    name = models.CharField(max_length=120)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    # Money is Decimal, never float: 0.1 + 0.2 must be exactly 0.3.
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = ProductQuerySet.as_manager()

    class Meta:
        ordering = ["name"]
        indexes = [models.Index(fields=["category", "is_active"])]
        constraints = [
            models.CheckConstraint(condition=Q(price__gte=0), name="product_price_not_negative"),
        ]

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("product-detail", args=[self.slug])
