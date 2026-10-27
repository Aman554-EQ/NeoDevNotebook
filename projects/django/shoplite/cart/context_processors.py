from .cart import SESSION_KEY


def cart(request):
    """`cart_count` in every template, without a database query."""
    items = request.session.get(SESSION_KEY, {}) if hasattr(request, "session") else {}
    return {"cart_count": sum(items.values())}
