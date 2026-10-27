# Library REST API (Django + DRF)

Books, authors and loans as a JSON API: CRUD with ViewSets and routers, pagination, filtering,
search and ordering, token login, staff-only writes and members who only ever see their own loans.
It is the second guided project of the NeoDevNotebook Django module.

## Run it

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate    macOS/Linux: source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env          # fake values for local development
python manage.py migrate
python manage.py createsuperuser   # a staff user, who may add books
python manage.py runserver
```

- API root: http://127.0.0.1:8000/api/
- Interactive docs (Swagger UI): http://127.0.0.1:8000/api/docs/
- Get a token: `POST /api/auth/token/` with `username` and `password`, then send
  `Authorization: Token <token>` on later requests.
- Postman: import `openapi.yaml`, or the ready-made collection from the project page.

## Endpoints

| Method                | Path                      | Who                           |
| --------------------- | ------------------------- | ----------------------------- |
| GET                   | `/api/books/`             | anyone (filter, search, sort) |
| POST / PATCH / DELETE | `/api/books/…`            | staff                         |
| GET                   | `/api/authors/`           | anyone                        |
| GET / POST            | `/api/loans/`             | the member (own loans only)   |
| POST                  | `/api/loans/<id>/return/` | the member                    |
| POST                  | `/api/auth/token/`        | anyone (login)                |
| GET                   | `/health/`                | load balancers                |

## Test it

```bash
python -m pytest
```
