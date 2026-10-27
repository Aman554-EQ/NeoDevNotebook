from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ["product", "quantity", "unit_price"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "status", "total", "created_at"]
    list_filter = ["status"]
    search_fields = ["user__email"]
    inlines = [OrderItemInline]
    list_select_related = ["user"]
    # Status changes go through the services (stock, payments), not free-form edits.
    readonly_fields = ["user", "status", "total"]
