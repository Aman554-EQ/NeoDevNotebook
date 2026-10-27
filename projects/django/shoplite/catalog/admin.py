from django.contrib import admin

from .models import Category, Product
from .services import forget_categories


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug": ["name"]}

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        forget_categories()


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "price", "stock", "is_active"]
    list_filter = ["category", "is_active"]
    list_editable = ["price", "stock", "is_active"]
    search_fields = ["name"]
    prepopulated_fields = {"slug": ["name"]}
    list_select_related = ["category"]
