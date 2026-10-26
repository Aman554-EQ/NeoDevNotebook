def countdown(n):
    while n > 0:
        yield n
        n -= 1


for v in countdown(2):
    print(v)
