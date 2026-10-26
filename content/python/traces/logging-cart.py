import logging
import sys

logging.basicConfig(stream=sys.stdout, level=logging.DEBUG, format="%(levelname)s %(name)s: %(message)s")
log = logging.getLogger("cart")


def total(prices):
    log.debug("got %d prices", len(prices))
    result = sum(prices)
    if result > 100:
        log.warning("large order: %s", result)
    return result


print(total([40, 70]))
