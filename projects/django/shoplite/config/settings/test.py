"""Tests: the fake values from .env.example, fast hashing, no throttling surprises.

Set SHOPLITE_TEST_DATABASE_URL (e.g. a local PostgreSQL) to run the suite against it, including
the concurrency test that needs real row locks. Otherwise tests use SQLite.
"""

from pathlib import Path

import environ

# Load the fake values first so they win over anything in a developer's own .env.
environ.Env.read_env(Path(__file__).resolve().parent.parent.parent / ".env.example")

from .base import *  # noqa: E402, F403
from .base import REST_FRAMEWORK, env  # noqa: E402

DEBUG = False
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]  # speed; tests only
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
CACHES = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}
if env("SHOPLITE_TEST_DATABASE_URL", default=""):
    DATABASES = {"default": env.db("SHOPLITE_TEST_DATABASE_URL")}
else:
    DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}}
REST_FRAMEWORK = {
    **REST_FRAMEWORK,
    "DEFAULT_THROTTLE_RATES": {"anon": "1000/minute", "user": "1000/minute", "orders": "5/minute"},
}
LOGGING["loggers"]["shoplite"]["level"] = "WARNING"  # noqa: F405
