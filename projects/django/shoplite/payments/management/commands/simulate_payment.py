"""Play the payment provider locally: send a signed webhook for a payment to a running server.

    python manage.py simulate_payment pay_abc123            # payment.succeeded
    python manage.py simulate_payment pay_abc123 --fail     # payment.failed
"""

import urllib.request

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from payments import provider
from payments.models import Payment


class Command(BaseCommand):
    help = "Send a signed FakePay webhook for a payment to a running ShopLite server."

    def add_arguments(self, parser):
        parser.add_argument("payment_ref")
        parser.add_argument("--fail", action="store_true", help="send payment.failed instead")
        parser.add_argument("--url", default="http://127.0.0.1:8000/api/v1/payments/webhook/")

    def handle(self, payment_ref, fail, url, **options):
        payment = Payment.objects.filter(provider_ref=payment_ref).first()
        if payment is None:
            raise CommandError(f"No payment {payment_ref}")
        kind = "payment.failed" if fail else "payment.succeeded"
        body = provider.event(kind, payment.provider_ref, str(payment.amount))
        request = urllib.request.Request(
            url,
            data=body,
            method="POST",
            headers={
                "Content-Type": "application/json",
                provider.SIGNATURE_HEADER: provider.sign(body, settings.PAYMENTS_WEBHOOK_SECRET),
            },
        )
        with urllib.request.urlopen(request, timeout=10) as response:  # noqa: S310 - local URL
            self.stdout.write(f"{response.status} {response.read().decode()}")
