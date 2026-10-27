# Notes (Django MVT)

A small server-rendered notes app: list, search, create, edit, delete and pin notes.
It is the first guided project of the NeoDevNotebook Django module.

## Run it

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate    macOS/Linux: source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env          # fake values for local development
python manage.py migrate
python manage.py createsuperuser   # optional, for /admin/
python manage.py runserver
```

Open http://127.0.0.1:8000/. `GET /health/` returns `{"status": "ok"}`.

## Test it

```bash
python -m pytest
```

## Layout

| Path                    | What it holds                                    |
| ----------------------- | ------------------------------------------------ |
| `config/settings.py`    | settings, read from environment variables        |
| `config/urls.py`        | root URLs: admin, health check, the notes app    |
| `notes/models.py`       | the `Note` model                                 |
| `notes/forms.py`        | `NoteForm` with title validation                 |
| `notes/views.py`        | list (search + pagination), create, edit, delete |
| `notes/templates/notes` | `base.html`, `note_list.html`, `note_form.html`  |
| `notes/tests/`          | model and view tests (pytest-django)             |
