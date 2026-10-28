import pytest

pytestmark = pytest.mark.django_db


def borrow(client, book):
    return client.post("/api/loans/", {"book": book.id})


def test_loans_need_login(api, books):
    assert borrow(api, books[0]).status_code == 401


def test_borrow_reduces_availability(as_user, member, books):
    client = as_user(member)
    response = borrow(client, books[0])
    assert response.status_code == 201
    assert response.json()["book_title"] == "Dune"
    assert client.get(f"/api/books/{books[0].id}/").json()["available"] == 1


def test_cannot_borrow_the_same_book_twice(as_user, member, books):
    client = as_user(member)
    borrow(client, books[0])
    response = borrow(client, books[0])
    assert response.status_code == 400
    assert response.json() == {"book": ["You already have this book."]}


def test_cannot_borrow_when_no_copies_left(as_user, member, other_member, books):
    borrow(as_user(member), books[1])  # Emma has one copy
    response = borrow(as_user(other_member), books[1])
    assert response.json() == {"book": ["No copies available right now."]}


def test_members_see_only_their_own_loans(as_user, member, other_member, books):
    loan_id = borrow(as_user(member), books[0]).json()["id"]
    client = as_user(other_member)
    assert client.get("/api/loans/").json()["count"] == 0
    assert client.get(f"/api/loans/{loan_id}/").status_code == 404
    assert client.post(f"/api/loans/{loan_id}/return/").status_code == 404


def test_return_frees_the_copy_and_is_not_repeatable(as_user, member, other_member, books):
    client = as_user(member)
    loan_id = borrow(client, books[1]).json()["id"]
    response = client.post(f"/api/loans/{loan_id}/return/")
    assert response.status_code == 200
    assert response.json()["returned_at"] is not None
    assert client.post(f"/api/loans/{loan_id}/return/").status_code == 409
    assert borrow(as_user(other_member), books[1]).status_code == 201


def test_due_date_uses_the_configured_loan_period(as_user, member, books, settings):
    settings.LOAN_DAYS = 7
    loan = borrow(as_user(member), books[0]).json()
    from datetime import datetime

    borrowed = datetime.fromisoformat(loan["borrowed_at"])
    due = datetime.fromisoformat(loan["due_at"])
    assert round((due - borrowed).total_seconds() / 86400) == 7
