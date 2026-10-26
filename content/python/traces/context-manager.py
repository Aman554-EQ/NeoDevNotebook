class Timer:
    def __enter__(self):
        print("enter")
        return self

    def __exit__(self, exc_type, exc, tb):
        print("exit, error:", exc_type.__name__ if exc_type else None)
        return False  # don't swallow the exception


with Timer():
    print("working")

try:
    with Timer():
        raise ValueError("boom")
except ValueError:
    print("handled outside")
