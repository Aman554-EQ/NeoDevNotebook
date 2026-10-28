def average(values):
    total = 0
    for i in range(1, len(values)):  # bug: should start at 0
        total += values[i]
    return total / len(values)


print(average([10, 20, 30]))
