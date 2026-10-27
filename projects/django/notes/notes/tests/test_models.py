import pytest

from notes.models import Note

pytestmark = pytest.mark.django_db


def test_str_is_the_title():
    assert str(Note(title="Groceries")) == "Groceries"


def test_pinned_notes_come_first():
    Note.objects.create(title="older pinned", pinned=True)
    Note.objects.create(title="newer plain")
    assert [n.title for n in Note.objects.all()] == ["older pinned", "newer plain"]


def test_absolute_url_points_at_the_edit_page():
    note = Note.objects.create(title="Trip")
    assert note.get_absolute_url() == f"/{note.pk}/edit/"
