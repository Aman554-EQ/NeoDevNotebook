import pytest
from django.urls import reverse

from notes.models import Note

pytestmark = pytest.mark.django_db


def test_list_shows_notes_and_an_empty_state(client):
    response = client.get(reverse("notes:list"))
    assert response.status_code == 200
    assert "No notes yet." in response.content.decode()

    Note.objects.create(title="Groceries", body="milk, eggs")
    assert "Groceries" in client.get(reverse("notes:list")).content.decode()


def test_search_matches_title_or_body(client):
    Note.objects.create(title="Groceries", body="milk")
    Note.objects.create(title="Ideas", body="buy more milk crates")
    Note.objects.create(title="Trip", body="tickets")
    page = client.get(reverse("notes:list"), {"q": "milk"}).context["page"]
    assert sorted(n.title for n in page) == ["Groceries", "Ideas"]


def test_list_is_paginated(client):
    Note.objects.bulk_create(Note(title=f"note {i}") for i in range(12))
    first = client.get(reverse("notes:list")).context["page"]
    second = client.get(reverse("notes:list"), {"page": 2}).context["page"]
    assert (len(first), len(second)) == (10, 2)


def test_list_runs_a_fixed_number_of_queries(client, django_assert_num_queries):
    Note.objects.bulk_create(Note(title=f"note {i}") for i in range(10))
    # count for the paginator + one SELECT for the page, however many notes there are
    with django_assert_num_queries(2):
        client.get(reverse("notes:list"))


def test_create_saves_and_redirects_with_a_message(client):
    response = client.post(
        reverse("notes:create"), {"title": "  Groceries ", "body": "milk"}, follow=True
    )
    assert response.redirect_chain == [(reverse("notes:list"), 302)]
    assert Note.objects.get().title == "Groceries"  # stripped by clean_title
    assert "Saved “Groceries”." in response.content.decode()


def test_create_rejects_a_short_title(client):
    response = client.post(reverse("notes:create"), {"title": "ab"})
    assert response.status_code == 200
    assert response.context["form"].errors == {"title": ["Use at least 3 characters."]}
    assert not Note.objects.exists()


def test_edit_updates_the_note(client):
    note = Note.objects.create(title="Draft")
    client.post(reverse("notes:edit", args=[note.pk]), {"title": "Final", "pinned": "on"})
    note.refresh_from_db()
    assert (note.title, note.pinned) == ("Final", True)


def test_edit_missing_note_is_404(client):
    assert client.get(reverse("notes:edit", args=[999])).status_code == 404


def test_delete_needs_post(client):
    note = Note.objects.create(title="Keep me")
    assert client.get(reverse("notes:delete", args=[note.pk])).status_code == 405
    client.post(reverse("notes:delete", args=[note.pk]))
    assert not Note.objects.exists()


def test_forms_are_csrf_protected():
    from django.test import Client

    strict = Client(enforce_csrf_checks=True)
    assert strict.post(reverse("notes:create"), {"title": "Sneaky"}).status_code == 403


def test_health(client):
    assert client.get("/health/").json() == {"status": "ok"}
