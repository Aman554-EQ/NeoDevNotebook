from django.shortcuts import get_object_or_404, render

from .models import Product
from .services import category_list


def storefront(request):
    products = Product.objects.active().select_related("category")
    category = request.GET.get("category")
    if category:
        products = products.filter(category__slug=category)
    context = {"products": products, "categories": category_list(), "current": category}
    return render(request, "catalog/storefront.html", context)


def product_detail(request, slug):
    product = get_object_or_404(Product.objects.active(), slug=slug)
    return render(request, "catalog/product_detail.html", {"product": product})
