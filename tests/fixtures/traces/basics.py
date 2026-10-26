def double(n):
    return n * 2


total = 0
for i in range(2):
    total += double(i)
print("total", total)
try:
    int("x")
except ValueError:
    print("caught")
