from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, render

from .models import Order


@login_required
def order_detail(request, pk):
    # Filtering by the user makes someone else's order a 404, not a data leak.
    order = get_object_or_404(Order.objects.filter(user=request.user), pk=pk)
    items = order.items.select_related("product")
    return render(request, "orders/detail.html", {"order": order, "items": items})
