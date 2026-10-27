from django.core.cache import cache

from .models import Category

CATEGORIES_KEY = "catalog:categories:v1"


def category_list():
    """Categories change rarely and appear on every page, so they are cached for an hour."""
    data = cache.get(CATEGORIES_KEY)
    if data is None:
        data = list(Category.objects.values("id", "name", "slug"))
        cache.set(CATEGORIES_KEY, data, timeout=3600)
    return data


def forget_categories():
    """Called whenever a category changes, so nobody sees a stale list."""
    cache.delete(CATEGORIES_KEY)
