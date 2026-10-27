from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from catalog.models import Product
from orders.services import OrderError, place_order

from .cart import Cart


def cart_detail(request):
    cart = Cart(request.session)
    return render(request, "cart/detail.html", {"lines": cart.lines(), "total": cart.total()})


@require_POST
def cart_add(request, product_id):
    product = get_object_or_404(Product.objects.active(), pk=product_id)
    quantity = int(request.POST.get("quantity", 1) or 1)
    Cart(request.session).add(product.pk, max(1, min(quantity, 20)))
    messages.success(request, f"Added {product.name} to your cart.")
    return redirect("cart")


@require_POST
def cart_remove(request, product_id):
    Cart(request.session).remove(product_id)
    return redirect("cart")


@require_POST
@login_required
def checkout(request):
    cart = Cart(request.session)
    items = [(product.pk, qty) for product, qty, _ in cart.lines()]
    try:
        order = place_order(request.user, items)
    except OrderError as exc:
        messages.error(request, str(exc))
        return redirect("cart")
    cart.clear()
    messages.success(request, f"Order #{order.pk} placed. Total {order.total}.")
    return redirect("order-detail", pk=order.pk)
