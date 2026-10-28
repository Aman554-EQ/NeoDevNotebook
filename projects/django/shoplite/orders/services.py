"""Order business rules. Views (web and API) call these functions; they never touch stock directly.

Keeping the rules here means one tested place decides how orders are placed, paid, shipped and
cancelled, whichever door the request came through.
"""

import logging
from collections import Counter
from decimal import Decimal

from django.db import transaction
from django.db.models import F

from catalog.models import Product

from .models import Order, OrderItem

logger = logging.getLogger("shoplite.orders")


class OrderError(Exception):
    """A business rule said no. The message is safe to show to the customer."""


class OutOfStock(OrderError):
    pass


class InvalidTransition(OrderError):
    pass


def place_order(user, items) -> Order:
    """Create an order from [(product_id, quantity), ...] and reserve its stock atomically.

    Either everything happens (order, lines, stock decrements) or nothing does.
    """
    wanted = Counter()
    for product_id, quantity in items:
        if quantity < 1:
            raise OrderError("Quantities must be at least 1.")
        wanted[int(product_id)] += quantity
    if not wanted:
        raise OrderError("Your cart is empty.")

    with transaction.atomic():
        # Lock the product rows (in id order, so two orders never wait on each other in a cycle).
        # Another checkout for the same products waits here until we commit or roll back.
        products = Product.objects.select_for_update().filter(pk__in=wanted, is_active=True).order_by("pk")
        found = {p.pk: p for p in products}
        missing = sorted(set(wanted) - set(found))
        if missing:
            raise OrderError(f"Product {missing[0]} is not available.")
        for pk, qty in wanted.items():
            if found[pk].stock < qty:
                raise OutOfStock(f"Only {found[pk].stock} left of {found[pk].name}.")

        total = sum((found[pk].price * qty for pk, qty in wanted.items()), Decimal("0.00"))
        order = Order.objects.create(user=user, total=total)
        OrderItem.objects.bulk_create(
            OrderItem(order=order, product=found[pk], quantity=qty, unit_price=found[pk].price)
            for pk, qty in sorted(wanted.items())
        )
        for pk, qty in wanted.items():
            # F() makes the database do the arithmetic: no read-modify-write race.
            Product.objects.filter(pk=pk).update(stock=F("stock") - qty)
    logger.info("order %s placed by user %s, total %s", order.pk, user.pk, total)
    return order


def _transition(order: Order, new_status) -> Order:
    if not order.can_become(new_status):
        raise InvalidTransition(f"An order that is {order.status} can't become {new_status}.")
    order.status = new_status
    order.save(update_fields=["status", "updated_at"])
    return order


def cancel_order(order: Order) -> Order:
    """Cancel a pending order and put its stock back."""
    with transaction.atomic():
        order = Order.objects.select_for_update().get(pk=order.pk)
        _transition(order, Order.Status.CANCELLED)
        for item in order.items.all():
            Product.objects.filter(pk=item.product_id).update(stock=F("stock") + item.quantity)
    return order


def mark_paid(order: Order) -> Order:
    with transaction.atomic():
        order = Order.objects.select_for_update().get(pk=order.pk)
        return _transition(order, Order.Status.PAID)


def ship_order(order: Order) -> Order:
    with transaction.atomic():
        order = Order.objects.select_for_update().get(pk=order.pk)
        return _transition(order, Order.Status.SHIPPED)
