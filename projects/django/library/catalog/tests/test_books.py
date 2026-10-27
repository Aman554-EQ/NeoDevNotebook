import pytest

from catalog.models import Author, Book

pytestmark = pytest.mark.django_db


def test_anyone_can_list_books_with_pagination(api, books):
    body = api.get("/api/books/").json()
    assert body["count"] == 3
    assert [b["title"] for b in body["results"]] == ["Dune", "Emma", "Persuasion"]
    assert body["results"][0] == {
        "id": books[0].id,
        "title": "Dune",
        "isbn": "9780441172719",
        "author": books[0].author_id,
        "author_name": "Frank Herbert",
        "published_year": 1965,
        "copies": 2,
        "available": 2,
    }


def test_filter_search_and_ordering(api, books):
    austen = Author.objects.get(name="Jane Austen")
    by_author = api.get("/api/books/", {"author": austen.id}).json()["results"]
    assert [b["title"] for b in by_author] == ["Emma", "Persuasion"]
    searched = api.get("/api/books/", {"search": "herbert"}).json()["results"]
    assert [b["title"] for b in searched] == ["Dune"]
    newest = api.get("/api/books/", {"ordering": "-published_year"}).json()["results"]
    assert [b["published_year"] for b in newest] == [1965, 1817, 1815]


def test_list_query_count_does_not_grow_with_books(api, books, django_assert_num_queries):
    # 1 COUNT for pagination + 1 SELECT joining authors and counting loans
    with django_assert_num_queries(2):
        api.get("/api/books/")


def test_only_staff_can_create(as_user, member, staff, books):
    payload = {
        "title": "Children of Dune",
        "isbn": "9780593098240",
        "author": books[0].author_id,
        "published_year": 1976,
    }
    assert as_user(member).post("/api/books/", payload).status_code == 403
    response = as_user(staff).post("/api/books/", payload)
    assert response.status_code == 201
    assert response.json()["available"] == 1


def test_anonymous_writes_are_rejected(api, books):
    assert api.delete(f"/api/books/{books[0].id}/").status_code == 401


def test_validation_errors_name_the_field(as_user, staff, books):
    response = as_user(staff).post(
        "/api/books/",
        {"title": "X", "isbn": "123", "author": books[0].author_id, "published_year": 3000},
    )
    assert response.status_code == 400
    assert response.json() == {
        "isbn": ["ISBN must be 13 digits."],
        "published_year": ["Year can't be in the future."],
    }


def test_partial_update_and_delete(as_user, staff, books):
    client = as_user(staff)
    response = client.patch(f"/api/books/{books[2].id}/", {"copies": 3})
    assert response.json()["copies"] == 3
    assert client.delete(f"/api/books/{books[2].id}/").status_code == 204
    assert not Book.objects.filter(pk=books[2].id).exists()


def test_authors_include_book_counts(api, books):
    authors = api.get("/api/authors/").json()["results"]
    assert [(a["name"], a["book_count"]) for a in authors] == [
        ("Frank Herbert", 1),
        ("Jane Austen", 2),
    ]


def test_token_login(api, member):
    response = api.post(
        "/api/auth/token/", {"username": "ada", "password": "pass-for-tests-only"}
    )
    token = response.json()["token"]
    api.credentials(HTTP_AUTHORIZATION=f"Token {token}")
    assert api.get("/api/loans/").status_code == 200


def test_schema_and_health(api):
    assert api.get("/api/schema/").status_code == 200
    assert api.get("/health/").json() == {"status": "ok"}
