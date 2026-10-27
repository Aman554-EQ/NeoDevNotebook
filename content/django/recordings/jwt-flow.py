"""Lesson 20: JWT login, an authenticated call, refresh, and object-level permissions."""

from _kit import emit, http
from playground import migrate, setup

setup(
    apps=["rest_framework", "rest_framework_simplejwt"],
    REST_FRAMEWORK={
        "DEFAULT_AUTHENTICATION_CLASSES": [
            "rest_framework_simplejwt.authentication.JWTAuthentication"
        ],
        "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
        "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    },
    # A fake signing key for learning; real projects read it from the environment.
    SIMPLE_JWT={"SIGNING_KEY": "fake-jwt-key-change-me-abcdefghijklmnopqrstuvwxyz0123456789"},
)

import json  # noqa: E402

from django.contrib.auth.models import User  # noqa: E402
from django.db import models  # noqa: E402
from django.test import Client  # noqa: E402
from django.urls import path  # noqa: E402
from rest_framework import generics, permissions, serializers  # noqa: E402
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView  # noqa: E402


class Note(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.CharField(max_length=200)


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "text"]


class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.owner_id == request.user.id


class NoteDetail(generics.RetrieveAPIView):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]


urlpatterns = [
    path("api/token/", TokenObtainPairView.as_view()),
    path("api/token/refresh/", TokenRefreshView.as_view()),
    path("api/notes/<int:pk>/", NoteDetail.as_view()),
]
migrate()
ada = User.objects.create_user("ada", password="correct-horse-battery")
bob = User.objects.create_user("bob", password="another-long-passphrase")
Note.objects.create(owner=ada, text="Ada's note")
Note.objects.create(owner=bob, text="Bob's note")

c = Client()
login = http(c, "POST", "/api/token/", json_body={"username": "ada", "password": "correct-horse-battery"}, label="Log in", note="Username and password are exchanged for two tokens: a short-lived access token and a longer-lived refresh token. (Tokens are shortened here; real ones are about 230 characters.)")
pair = json.loads(c.post("/api/token/", {"username": "ada", "password": "correct-horse-battery"}, content_type="application/json").content)
bearer = {"Authorization": f"Bearer {pair['access']}"}

emit(
    "http",
    "JWT authentication, request by request",
    [
        http(c, "GET", "/api/notes/1/", label="No token", note="IsAuthenticated rejects the anonymous request: 401, with WWW-Authenticate telling the client to use Bearer auth."),
        login,
        http(c, "GET", "/api/notes/1/", headers=bearer, label="Bearer token", note="The access token goes in the Authorization header. The server verifies the signature and expiry; no session, no database lookup for the token itself."),
        http(c, "GET", "/api/notes/2/", headers=bearer, label="Not the owner", note="Authenticated, but IsOwner's has_object_permission says no: 403 Forbidden. 401 means 'who are you?', 403 means 'I know, and no'."),
        http(c, "GET", "/api/notes/1/", headers={"Authorization": "Bearer not.a.valid-token"}, label="Bad token", note="A tampered or malformed token fails verification: 401 with a token_not_valid code."),
        http(c, "POST", "/api/token/refresh/", json_body={"refresh": pair["refresh"]}, label="Refresh", note="Before the access token expires, the refresh token buys a new one without asking for the password again."),
        http(c, "POST", "/api/token/", json_body={"username": "ada", "password": "wrong"}, label="Wrong password", note="Bad credentials: 401 with a deliberately vague message, so attackers can't tell which part was wrong."),
    ],
)
