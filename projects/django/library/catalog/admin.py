from django.contrib import admin

from .models import Author, Book, Loan


@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    search_fields = ["name"]


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ["title", "author", "published_year", "copies"]
    list_filter = ["published_year"]
    search_fields = ["title", "isbn", "author__name"]
    list_select_related = ["author"]


@admin.register(Loan)
class LoanAdmin(admin.ModelAdmin):
    list_display = ["book", "borrower", "borrowed_at", "due_at", "returned_at"]
    list_filter = ["returned_at"]
