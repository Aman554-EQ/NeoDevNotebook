from django.conf import settings
from django.db import models
from django.db.models import Count, Q


class Author(models.Model):
    name = models.CharField(max_length=120, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class BookQuerySet(models.QuerySet):
    def with_availability(self):
        """Adds `on_loan` (open loans) so `available` needs no extra query per book."""
        return self.annotate(on_loan=Count("loans", filter=Q(loans__returned_at__isnull=True)))


class Book(models.Model):
    title = models.CharField(max_length=200)
    isbn = models.CharField(max_length=13, unique=True)
    author = models.ForeignKey(Author, on_delete=models.PROTECT, related_name="books")
    published_year = models.PositiveIntegerField()
    copies = models.PositiveIntegerField(default=1)

    objects = BookQuerySet.as_manager()

    class Meta:
        ordering = ["title"]
        indexes = [models.Index(fields=["published_year"])]

    def __str__(self):
        return self.title


class Loan(models.Model):
    book = models.ForeignKey(Book, on_delete=models.PROTECT, related_name="loans")
    borrower = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="loans"
    )
    borrowed_at = models.DateTimeField(auto_now_add=True)
    due_at = models.DateTimeField()
    returned_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-borrowed_at"]
        constraints = [
            # The database itself refuses a second open loan of the same book by the same member.
            models.UniqueConstraint(
                fields=["book", "borrower"],
                condition=Q(returned_at__isnull=True),
                name="one_open_loan_per_book_and_member",
            )
        ]

    def __str__(self):
        return f"{self.book} -> {self.borrower}"
