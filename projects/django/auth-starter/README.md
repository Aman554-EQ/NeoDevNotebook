# Auth starter (Django sessions + JWT)

A starting point for real projects: a custom user model that signs in with email, signup, login,
logout and password reset for the website (sessions), plus register, JWT login, refresh, logout
and "me" endpoints for API clients. Security settings switch on automatically when `DEBUG` is off.
It is the third guided project of the NeoDevNotebook Django module.

## Run it

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate    macOS/Linux: source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env          # fake values for local development
python manage.py migrate
python manage.py runserver
```

- Website: http://127.0.0.1:8000/signup/ , `/login/`, `/profile/`, `/password-reset/`
  (the reset email is printed in the terminal running the server)
- API: `POST /api/auth/register/`, `POST /api/auth/token/` (email + password),
  `POST /api/auth/token/refresh/`, `POST /api/auth/logout/`, `GET /api/me/`
  with `Authorization: Bearer <access token>`

## Test it

```bash
python -m pytest
```

## Before production

```bash
DJANGO_DEBUG=false DJANGO_SECRET_KEY=<a long random value> DJANGO_ALLOWED_HOSTS=example.com \
  python manage.py check --deploy
```
