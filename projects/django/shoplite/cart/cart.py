from decimal import Decimal

from catalog.models import Product

SESSION_KEY = "cart"


class Cart:
    """A guest-friendly cart kept in the session: {"<product id>": quantity}.

    Only ids and quantities are stored. Prices are always read from the database, so a
    tampered or stale session can never change what a customer pays.
    """

    def __init__(self, session):
        self.session = session
        self.items: dict[str, int] = session.get(SESSION_KEY, {})

    def add(self, product_id: int, quantity: int = 1) -> None:
        key = str(product_id)
        self.items[key] = max(1, self.items.get(key, 0) + quantity)
        self._save()

    def set(self, product_id: int, quantity: int) -> None:
        if quantity <= 0:
            self.remove(product_id)
        else:
            self.items[str(product_id)] = quantity
            self._save()

    def remove(self, product_id: int) -> None:
        self.items.pop(str(product_id), None)
        self._save()

    def clear(self) -> None:
        self.items = {}
        self._save()

    def lines(self):
        """[(product, quantity, line_total)] for products that are still for sale."""
        products = Product.objects.active().in_bulk([int(k) for k in self.items])
        return [
            (products[int(k)], qty, products[int(k)].price * qty)
            for k, qty in sorted(self.items.items())
            if int(k) in products
        ]

    def total(self) -> Decimal:
        return sum((line_total for _, _, line_total in self.lines()), Decimal("0.00"))

    def count(self) -> int:
        return sum(self.items.values())

    def _save(self):
        self.session[SESSION_KEY] = self.items
        self.session.modified = True  # nested changes aren't detected automatically
