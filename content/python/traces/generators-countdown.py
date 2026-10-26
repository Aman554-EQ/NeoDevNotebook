def countdown(n):
    print("starting")
    while n > 0:
        yield n
        n -= 1


for value in countdown(3):
    print("got", value)
