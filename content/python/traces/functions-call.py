def tax(amount, rate=0.2):
    return amount * rate


def total(price, qty):
    subtotal = price * qty
    return subtotal + tax(subtotal)


print(total(10, 3))
