def grade(score):
    if score >= 90:
        return "A"
    elif score >= 75:
        return "B"
    return "C"


for s in (95, 80, 40):
    print(s, grade(s))
