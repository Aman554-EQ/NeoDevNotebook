"""Lesson 11: common QuerySet operations and the exact SQL Django sends for each."""

from _kit import emit, orm
from playground import migrate, setup

setup()

from django.db import models  # noqa: E402
from django.db.models import Avg, Count, F, Q  # noqa: E402


class Author(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Book(models.Model):
    title = models.CharField(max_length=100)
    author = models.ForeignKey(Author, on_delete=models.CASCADE, related_name="books")
    year = models.IntegerField()
    copies = models.IntegerField(default=1)

    def __str__(self):
        return self.title


migrate()
herbert = Author.objects.create(name="Frank Herbert")
austen = Author.objects.create(name="Jane Austen")
Book.objects.create(title="Dune", author=herbert, year=1965, copies=3)
Book.objects.create(title="Emma", author=austen, year=1815, copies=1)
Book.objects.create(title="Persuasion", author=austen, year=1817, copies=2)

ns = {"Book": Book, "Author": Author, "Q": Q, "F": F, "Count": Count, "Avg": Avg}
emit(
    "orm",
    "QuerySets and the SQL behind them",
    [
        orm('str(Book.objects.filter(year__lt=1900).query)', ns, label="Lazy", note="Building a QuerySet runs no SQL: zero queries. .query only shows the SQL Django would send (without quoting the values)."),
        orm('Book.objects.filter(year__lt=1900).order_by("-year")', ns, label="filter + order_by", note="Iterating (here: list()) runs it. Field lookups like year__lt become WHERE clauses; order_by becomes ORDER BY."),
        orm('Book.objects.get(title="Dune")', ns, label="get", note="get() returns exactly one object. With no match it raises DoesNotExist; with two, MultipleObjectsReturned."),
        orm('Book.objects.filter(Q(year__lt=1816) | Q(copies__gte=3))', ns, label="Q objects (OR)", note="Keyword arguments are ANDed. For OR (or NOT, with ~Q) combine Q objects."),
        orm('Book.objects.filter(author__name="Jane Austen").values_list("title", flat=True)', ns, label="Across a relation", note="author__name follows the foreign key: Django writes the JOIN. values_list returns plain values instead of model objects."),
        orm('Author.objects.annotate(n=Count("books")).values("name", "n").order_by("name")', ns, label="annotate", note="annotate adds a computed column per row: here COUNT with GROUP BY, one row per author."),
        orm('Book.objects.aggregate(avg_year=Avg("year"), total=Count("id"))', ns, label="aggregate", note="aggregate summarises the whole QuerySet into one dict."),
        orm('Book.objects.filter(title="Dune").update(copies=F("copies") + 1)', ns, label="update with F()", note="One UPDATE for every matching row, and F() makes the database do the arithmetic: no read-modify-write race. Returns the number of rows changed."),
        orm('Book.objects.filter(year__gt=1900).exists()', ns, label="exists", note="exists() asks only 'is there at least one?' (LIMIT 1), far cheaper than len() or count() when that's all you need."),
        orm('Book.objects.order_by("title")[:2]', ns, label="Slicing", note="Slicing a QuerySet becomes LIMIT/OFFSET in SQL, not a Python slice of every row."),
    ],
)
