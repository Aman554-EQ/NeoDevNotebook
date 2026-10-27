"""Lesson 12: the N+1 problem and the two cures, measured by counting the real queries."""

from _kit import emit, orm
from playground import migrate, setup

setup()

from django.db import models  # noqa: E402
from django.db.models import Count  # noqa: E402


class Author(models.Model):
    name = models.CharField(max_length=100)


class Tag(models.Model):
    name = models.CharField(max_length=30)


class Book(models.Model):
    title = models.CharField(max_length=100)
    author = models.ForeignKey(Author, on_delete=models.CASCADE, related_name="books")
    tags = models.ManyToManyField(Tag, related_name="books")


migrate()
herbert = Author.objects.create(name="Herbert")
austen = Author.objects.create(name="Austen")
le_guin = Author.objects.create(name="Le Guin")
classic, scifi = Tag.objects.create(name="classic"), Tag.objects.create(name="sci-fi")
for title, author, tags in [
    ("Dune", herbert, [classic, scifi]),
    ("Emma", austen, [classic]),
    ("The Dispossessed", le_guin, [scifi]),
]:
    Book.objects.create(title=title, author=author).tags.set(tags)

ns = {"Book": Book, "Author": Author, "Count": Count}
emit(
    "orm",
    "N+1 queries and how to avoid them",
    [
        orm('[(b.title, b.author.name) for b in Book.objects.order_by("id")]', ns, label="N+1", note="One query for the books, then one more per book the moment the loop touches b.author: 1 + N queries. With 100 books on a page, 101 round trips."),
        orm('[(b.title, b.author.name) for b in Book.objects.select_related("author").order_by("id")]', ns, label="select_related", note="select_related follows a ForeignKey (or OneToOne) with a JOIN: the same result in one query, however many books."),
        orm('[(b.title, [t.name for t in b.tags.all()]) for b in Book.objects.order_by("id")]', ns, label="N+1 on many-to-many", note="Many-to-many can't be one JOIN without duplicating rows, so the naive loop again costs one query per book."),
        orm('[(b.title, [t.name for t in b.tags.all()]) for b in Book.objects.prefetch_related("tags").order_by("id")]', ns, label="prefetch_related", note="prefetch_related runs one extra query for all the tags (WHERE book_id IN (...)) and joins them in Python: 2 queries in total, not 1 + N."),
        orm('list(Author.objects.annotate(n=Count("books")).order_by("name").values_list("name", "n"))', ns, label="Count in the database", note="Need only a number per author? Let the database count with annotate instead of loading every book."),
        orm('[b.title for b in Book.objects.only("title").order_by("id")]', ns, label="only()", note="only() loads just the columns you need. Touching another field later costs an extra query per object, so use it deliberately."),
    ],
)
