import math
import re
from datetime import date, timedelta
from itertools import accumulate

due = date(2026, 10, 26) + timedelta(days=30)
print(due.isoformat(), due.strftime("%A"))
totals = list(accumulate([5, 10, 20]))
print(totals, math.isqrt(totals[-1]))
emails = re.findall(r"[\w.]+@[\w.]+", "ada@x.io, bo@y.org")
print(emails)
