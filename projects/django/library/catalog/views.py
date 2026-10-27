from django.conf import settings
from django.db import transaction
from django.db.models import Count
from django.utils import timezone
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Author, Book, Loan
from .permissions import IsBorrower, IsStaffOrReadOnly
from .serializers import AuthorSerializer, BookSerializer, LoanSerializer, due_date


class AuthorViewSet(viewsets.ModelViewSet):
    # Explicit order_by: Meta.ordering is ignored once a query has GROUP BY (Count).
    queryset = Author.objects.annotate(book_count=Count("books")).order_by("name")
    serializer_class = AuthorSerializer
    permission_classes = [IsStaffOrReadOnly]
    search_fields = ["name"]


class BookViewSet(viewsets.ModelViewSet):
    # select_related: each book's author comes in the same query (no N+1 on the list).
    queryset = Book.objects.select_related("author").with_availability().order_by("title")
    serializer_class = BookSerializer
    permission_classes = [IsStaffOrReadOnly]
    filterset_fields = ["author", "published_year"]
    search_fields = ["title", "author__name"]
    ordering_fields = ["title", "published_year"]


class LoanViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Loan.objects.none()  # tells the schema generator the model; see get_queryset
    serializer_class = LoanSerializer
    permission_classes = [IsAuthenticated, IsBorrower]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):  # OpenAPI schema generation
            return Loan.objects.none()
        # Members only ever see their own loans, so anyone else's id is simply a 404.
        return Loan.objects.filter(borrower=self.request.user).select_related("book")

    def perform_create(self, serializer):
        book_id = serializer.validated_data["book"].pk
        with transaction.atomic():
            # Lock the book row so two simultaneous requests can't both take the last copy.
            book = Book.objects.select_for_update().get(pk=book_id)
            open_loans = book.loans.filter(returned_at__isnull=True)
            if open_loans.filter(borrower=self.request.user).exists():
                raise ValidationError({"book": ["You already have this book."]})
            if open_loans.count() >= book.copies:
                raise ValidationError({"book": ["No copies available right now."]})
            serializer.save(
                borrower=self.request.user, book=book, due_at=due_date(settings.LOAN_DAYS)
            )

    @action(detail=True, methods=["post"], url_path="return")
    def return_book(self, request, pk=None):
        loan = self.get_object()
        if loan.returned_at:
            return Response({"detail": "Already returned."}, status=status.HTTP_409_CONFLICT)
        loan.returned_at = timezone.now()
        loan.save(update_fields=["returned_at"])
        return Response(self.get_serializer(loan).data)
