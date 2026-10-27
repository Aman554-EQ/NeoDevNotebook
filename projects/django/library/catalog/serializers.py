import datetime

from django.utils import timezone
from rest_framework import serializers

from .models import Author, Book, Loan


class AuthorSerializer(serializers.ModelSerializer):
    book_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Author
        fields = ["id", "name", "book_count"]


class BookSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.name", read_only=True)
    available = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = [
            "id",
            "title",
            "isbn",
            "author",
            "author_name",
            "published_year",
            "copies",
            "available",
        ]

    def get_available(self, book) -> int:
        on_loan = getattr(book, "on_loan", None)
        if on_loan is None:  # not annotated, e.g. the response right after a create
            on_loan = book.loans.filter(returned_at__isnull=True).count()
        return book.copies - on_loan

    def validate_isbn(self, value):
        if len(value) != 13 or not value.isdigit():
            raise serializers.ValidationError("ISBN must be 13 digits.")
        return value

    def validate_published_year(self, value):
        if value > timezone.now().year:
            raise serializers.ValidationError("Year can't be in the future.")
        return value


class LoanSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source="book.title", read_only=True)

    class Meta:
        model = Loan
        fields = ["id", "book", "book_title", "borrowed_at", "due_at", "returned_at"]
        read_only_fields = ["borrowed_at", "due_at", "returned_at"]


def due_date(days: int) -> datetime.datetime:
    return timezone.now() + datetime.timedelta(days=days)
