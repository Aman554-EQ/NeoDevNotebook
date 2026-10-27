# ShopLite (Django capstone)

A small but production-shaped e-commerce backend: a server-rendered storefront with a session
cart, and a versioned JSON API with JWT auth. Orders can't oversell (row locks), checkout is
idempotent, and payments arrive by signed webhook. It is the capstone of the NeoDevNotebook
Django module; the project page walks through the PRD, design, build, hardening and tests.

## Run it

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate    macOS/Linux: source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env          # every value in it is a fake, safe for development
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Add categories and products in http://127.0.0.1:8000/admin/, then shop at http://127.0.0.1:8000/.

Pay for an order from the API, then play the payment provider:

```bash
# POST /api/v1/orders/<id>/pay/ returns {"payment": "pay_..."}
python manage.py simulate_payment pay_...          # sends a signed payment.succeeded webhook
```

## API

Docs: http://127.0.0.1:8000/api/docs/ · schema: `openapi.yaml` · Postman collection on the project
page. Every error looks like `{"error": {"code", "message", "details", "request_id"}}`.

| Method | Path                                      | Notes                                                           |
| ------ | ----------------------------------------- | --------------------------------------------------------------- |
| POST   | `/api/v1/auth/token/`, `…/refresh/`       | JWT login                                                       |
| GET    | `/api/v1/products/`                       | filter `category__slug`, `price__gte/lte`; `search`; `ordering` |
| GET    | `/api/v1/categories/`                     | cached                                                          |
| POST   | `/api/v1/orders/`                         | needs `Idempotency-Key`; throttled                              |
| GET    | `/api/v1/orders/`, `/api/v1/orders/<id>/` | own orders (staff: all)                                         |
| POST   | `/api/v1/orders/<id>/cancel/`, `…/ship/`  | ship is staff-only                                              |
| POST   | `/api/v1/orders/<id>/pay/`                | starts a payment                                                |
| POST   | `/api/v1/payments/webhook/`               | provider only, HMAC-signed                                      |
| GET    | `/health/`, `/ready/`                     | liveness, readiness (DB + cache)                                |

## Layout

```text
config/settings/   base.py (env-driven) · dev.py · test.py · prod.py (HTTPS, HSTS, secure cookies)
accounts/          custom user (email login, is_staff = staff role)
catalog/           categories, products, cached category list, storefront pages
cart/              session cart (ids + quantities only; prices always from the database)
orders/            models + state machine, services.py (all business rules), idempotency.py, API
payments/          FakePay provider (signing), webhook endpoint, simulate_payment command
core/              request-ID + security-header middleware, error format, health/ready, pagination
tests/             catalogue, orders, idempotency, payments, platform, concurrency (PostgreSQL)
```

## Test it

```bash
python -m pytest
# with PostgreSQL, including the "8 buyers, 3 items" race test:
SHOPLITE_TEST_DATABASE_URL=postgres://user:pass@localhost:5432/shoplite python -m pytest
```

## Production

Set `DJANGO_SETTINGS_MODULE=config.settings.prod` and real secrets, then
`python manage.py check --deploy`, `python manage.py collectstatic`, and serve with
`gunicorn config.wsgi` behind a reverse proxy that terminates HTTPS.
