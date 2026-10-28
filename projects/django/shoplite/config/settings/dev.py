"""Local development: debug pages, console email, relaxed hosts."""

from .base import *  # noqa: F403

DEBUG = True
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
