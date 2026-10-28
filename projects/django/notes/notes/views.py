from django.contrib import messages
from django.core.paginator import Paginator
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_http_methods, require_POST

from .forms import NoteForm
from .models import Note

PAGE_SIZE = 10


def note_list(request):
    query = request.GET.get("q", "").strip()
    notes = Note.objects.all()
    if query:
        notes = notes.filter(Q(title__icontains=query) | Q(body__icontains=query))
    page = Paginator(notes, PAGE_SIZE).get_page(request.GET.get("page"))
    return render(request, "notes/note_list.html", {"page": page, "query": query})


@require_http_methods(["GET", "POST"])
def note_create(request):
    form = NoteForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        note = form.save()
        messages.success(request, f"Saved “{note.title}”.")
        return redirect("notes:list")
    return render(request, "notes/note_form.html", {"form": form})


@require_http_methods(["GET", "POST"])
def note_edit(request, pk):
    note = get_object_or_404(Note, pk=pk)
    form = NoteForm(request.POST or None, instance=note)
    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, f"Updated “{note.title}”.")
        return redirect("notes:list")
    return render(request, "notes/note_form.html", {"form": form, "note": note})


@require_POST
def note_delete(request, pk):
    note = get_object_or_404(Note, pk=pk)
    note.delete()
    messages.success(request, f"Deleted “{note.title}”.")
    return redirect("notes:list")
