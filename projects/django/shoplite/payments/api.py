import json
import logging
from decimal import Decimal

from django.conf import settings
from django.db import IntegrityError, transaction
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiResponse, extend_schema, inline_serializer
from rest_framework import serializers, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.exceptions import Conflict
from orders.models import Order
from orders.services import InvalidTransition, mark_paid

from . import provider
from .models import Payment, WebhookEvent

logger = logging.getLogger("shoplite.payments")

PaymentOut = inline_serializer(
    "PaymentStarted",
    {"payment": serializers.CharField(), "amount": serializers.CharField(), "status": serializers.CharField()},
)
WebhookIn = inline_serializer(
    "PaymentEvent",
    {"id": serializers.CharField(), "type": serializers.CharField(), "data": serializers.DictField()},
)
WebhookOut = inline_serializer("WebhookResult", {"status": serializers.CharField()})


class StartPayment(APIView):
    """POST /api/v1/orders/<id>/pay/ : create a payment with the provider for a pending order."""

    permission_classes = [IsAuthenticated]

    @extend_schema(request=None, responses={201: PaymentOut})
    def post(self, request, order_id):
        order = get_object_or_404(Order.objects.filter(user=request.user), pk=order_id)
        if order.status != Order.Status.PENDING:
            raise Conflict(f"Order is {order.status}; only pending orders can be paid.")
        payment = Payment.objects.create(
            order=order, provider_ref=provider.new_payment_ref(), amount=order.total
        )
        body = {
            "payment": payment.provider_ref,
            "amount": str(payment.amount),
            "status": payment.status,
        }
        return Response(body, status=status.HTTP_201_CREATED)


class PaymentWebhook(APIView):
    """POST /api/v1/payments/webhook/ : the provider tells us a payment succeeded or failed.

    No login: the caller proves who it is with the signature. Always answer quickly with 2xx once
    the event is safely handled; providers retry on errors and timeouts, so handlers must be
    idempotent (the WebhookEvent table makes a repeated delivery a no-op).
    """

    permission_classes = [AllowAny]
    authentication_classes = []  # no session, so no CSRF check either: the signature is the auth
    throttle_classes = []

    @extend_schema(
        request=WebhookIn,
        responses={200: WebhookOut, 400: OpenApiResponse(description="Bad or stale signature")},
    )
    def post(self, request):
        raw = request.body  # verify the exact bytes that were signed, before parsing
        try:
            provider.verify(
                raw,
                request.headers.get(provider.SIGNATURE_HEADER, ""),
                settings.PAYMENTS_WEBHOOK_SECRET,
                settings.PAYMENTS_WEBHOOK_TOLERANCE_SECONDS,
            )
        except provider.SignatureError as exc:
            logger.warning("rejected webhook: %s", exc)
            body = {"error": {"code": "bad_signature", "message": str(exc), "details": {}}}
            return Response(body, status=status.HTTP_400_BAD_REQUEST)

        event = json.loads(raw)
        try:
            with transaction.atomic():
                WebhookEvent.objects.create(event_id=event["id"], type=event["type"])
                outcome = self.apply(event)
        except IntegrityError:
            return Response({"status": "duplicate"})  # already processed: acknowledge and stop
        return Response({"status": outcome})

    def apply(self, event) -> str:
        data = event["data"]
        payment = (
            Payment.objects.select_for_update()
            .select_related("order")
            .filter(provider_ref=data["payment"])
            .first()
        )
        if payment is None:
            logger.error("webhook for unknown payment %s", data["payment"])
            return "unknown payment"
        if event["type"] == "payment.failed":
            payment.status = Payment.Status.FAILED
            payment.save(update_fields=["status"])
            return "recorded failure"
        if event["type"] != "payment.succeeded":
            return "ignored"
        if Decimal(data["amount"]) != payment.amount:
            logger.error("amount mismatch for %s", payment.provider_ref)
            return "amount mismatch"
        payment.status = Payment.Status.SUCCEEDED
        payment.save(update_fields=["status"])
        try:
            mark_paid(payment.order)
        except InvalidTransition:
            return "order not pending"  # e.g. cancelled meanwhile: a refund job would pick it up
        return "order paid"
