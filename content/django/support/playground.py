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


def setup(*, apps=(), templates=None, middleware=None, **overrides):
    """Configure Django in memory: an SQLite database, the script's urlpatterns, optional templates.

    apps:       extra INSTALLED_APPS, e.g. ["rest_framework"]
    templates:  {"name.html": "template source"} served by an in-memory template loader
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
                    "loaders": [("django.template.loaders.locmem.Loader", templates or {})],
                    "context_processors": [
                        "django.template.context_processors.request",
                        "django.contrib.auth.context_processors.auth",
                        "django.contrib.messages.context_processors.messages",
                    ],
                },
            }
        ],
        # Fast hashing keeps examples quick. Never use MD5 for real passwords.
        PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"],
        USE_TZ=True,
        TIME_ZONE="UTC",
    )
    config.update(overrides)
    settings.configure(**config)
    django.setup()


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
        last = traceback.format_exception_only(err[0], err[1])[-1].strip()
        print(f"  {word}  {test._testMethodName}: {last}")

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
