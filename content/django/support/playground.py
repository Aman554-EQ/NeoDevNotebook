"""playground.py: run Django from a single file while you learn.

A real project spreads its setup over settings.py, urls.py and manage.py. To try one idea at a
time, it is handier to keep everything in one script. Save this file next to your examples and
start each example with:

    from playground import setup
    setup()

Models, views and `urlpatterns` you define in that script then work as if they lived in an app
called "shop". Requires: python -m pip install "Django>=5.2,<5.3"
"""

import sys
import traceback
import unittest

import django
from django.apps import AppConfig
from django.conf import settings


class PlaygroundApp(AppConfig):
    """Makes the script you run (the __main__ module) a Django app labelled "shop"."""

    name = "__main__"
    label = "shop"
    default_auto_field = "django.db.models.BigAutoField"

    def import_models(self):
        # A script has no models.py: its own classes are the models (so `migrate` creates them).
        self.models = self.apps.all_models[self.label]
        self.models_module = self.module


def setup(*, apps=(), templates=None, middleware=None, script_tags=False, **overrides):
    """Configure Django in memory: an SQLite database, the script's urlpatterns, optional templates.

    apps:       extra INSTALLED_APPS, e.g. ["rest_framework"]
    templates:  {"name.html": "template source"} served by an in-memory template loader
    script_tags: True if the script defines custom template filters/tags
                (register = template.Library()); they become available in every template
    middleware: replaces the default MIDDLEWARE list
    overrides:  any other setting, e.g. DEBUG=False or REST_FRAMEWORK={...}
    """
    config = dict(
        DEBUG=True,
        # A fake key for learning only. Real projects read SECRET_KEY from the environment.
        SECRET_KEY="playground-not-a-real-secret",
        ALLOWED_HOSTS=["testserver", "localhost", "127.0.0.1"],
        ROOT_URLCONF="__main__",
        INSTALLED_APPS=[
            "django.contrib.contenttypes",
            "django.contrib.auth",
            "django.contrib.sessions",
            "django.contrib.messages",
            *apps,
            "playground.PlaygroundApp",
        ],
        MIDDLEWARE=middleware
        if middleware is not None
        else [
            "django.middleware.security.SecurityMiddleware",
            "django.contrib.sessions.middleware.SessionMiddleware",
            "django.middleware.common.CommonMiddleware",
            "django.middleware.csrf.CsrfViewMiddleware",
            "django.contrib.auth.middleware.AuthenticationMiddleware",
            "django.contrib.messages.middleware.MessageMiddleware",
        ],
        DATABASES={"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}},
        TEMPLATES=[
            {
                "BACKEND": "django.template.backends.django.DjangoTemplates",
                "OPTIONS": {
                    "loaders": [
                        ("django.template.loaders.locmem.Loader", templates or {}),
                        "django.template.loaders.app_directories.Loader",  # e.g. the admin's
                    ],
                    "builtins": ["__main__"] if script_tags else [],
                    "context_processors": [
                        "django.template.context_processors.request",
                        "django.contrib.auth.context_processors.auth",
                        "django.contrib.messages.context_processors.messages",
                    ],
                },
            }
        ],
        STATIC_URL="static/",
        # Fast hashing keeps examples quick. Never use MD5 for real passwords.
        PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"],
        USE_TZ=True,
        TIME_ZONE="UTC",
    )
    config.update(overrides)
    settings.configure(**config)
    django.setup()


def postgres_database():
    """A brand-new PostgreSQL database for one example, dropped again when the script ends.

    Reads the server from the DATABASE_URL environment variable, e.g.
    postgres://user:password@localhost:5432/postgres. Use it as
    setup(DATABASES={"default": postgres_database()}). Your existing databases are never touched.
    Requires: python -m pip install "psycopg[binary]"
    """
    import atexit
    import os
    import uuid
    from urllib.parse import urlsplit

    import psycopg

    url = os.environ["DATABASE_URL"]
    server = urlsplit(url)
    name = f"playground_{uuid.uuid4().hex[:10]}"
    admin = psycopg.connect(url, autocommit=True)
    admin.execute(f'CREATE DATABASE "{name}"')

    def drop():
        from django.db import connections

        connections.close_all()
        admin.execute(f'DROP DATABASE IF EXISTS "{name}" WITH (FORCE)')
        admin.close()

    atexit.register(drop)
    return {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": name,
        "USER": server.username,
        "PASSWORD": server.password,
        "HOST": server.hostname,
        "PORT": server.port or 5432,
    }


def mongo_database():
    """A throwaway MongoDB database for one example, dropped again when the script ends.

    Uses a real server when MONGO_URL is set (e.g. mongodb://localhost:27017), otherwise mongomock,
    an in-memory stand-in with the same API. Requires: python -m pip install pymongo mongomock
    """
    import atexit
    import os
    import uuid

    import pymongo

    if os.environ.get("MONGO_URL"):
        client = pymongo.MongoClient(os.environ["MONGO_URL"])
    else:
        import mongomock

        client = mongomock.MongoClient()
    name = f"playground_{uuid.uuid4().hex[:10]}"
    atexit.register(client.drop_database, name)
    return client[name]


def migrate():
    """Create the tables of Django's built-in apps and of every model defined so far."""
    from django.core.management import call_command

    call_command("migrate", run_syncdb=True, verbosity=0)


class _Result(unittest.TestResult):
    """Prints one line per test (no timings, so the output is the same on every run)."""

    def addSuccess(self, test):
        super().addSuccess(test)
        print(f"  ok    {test._testMethodName}")

    def _bad(self, test, err, word):
        # The first line of the error is enough here; real runners show the full traceback.
        first = traceback.format_exception_only(err[0], err[1])[-1].strip().splitlines()[0]
        print(f"  {word}  {test._testMethodName}: {first}")

    def addFailure(self, test, err):
        super().addFailure(test, err)
        self._bad(test, err, "FAIL")

    def addError(self, test, err):
        super().addError(test, err)
        self._bad(test, err, "ERROR")


def run_tests(*cases):
    """Run Django TestCase classes against a fresh test database, like `manage.py test`."""
    from django.test.runner import DiscoverRunner
    from django.test.utils import setup_test_environment, teardown_test_environment

    from django.db import connection

    # Django never closes an in-memory SQLite connection. Drop it so the tests get their own
    # empty database (like `manage.py test`) instead of rows the script created earlier.
    if connection.connection is not None:
        connection.connection.close()
        connection.connection = None
    runner = DiscoverRunner(verbosity=0, interactive=False)
    setup_test_environment()
    old_config = runner.setup_databases()
    try:
        loader = unittest.defaultTestLoader
        suite = unittest.TestSuite(loader.loadTestsFromTestCase(case) for case in cases)
        result = _Result()
        suite.run(result)
    finally:
        runner.teardown_databases(old_config)
        teardown_test_environment()
    failed = len(result.failures) + len(result.errors)
    passed = result.testsRun - failed
    print(f"{passed} passed" + (f", {failed} failed" if failed else ""))
    return result.wasSuccessful()


if __name__ == "__main__":
    sys.exit("Import this file from your examples: from playground import setup")
