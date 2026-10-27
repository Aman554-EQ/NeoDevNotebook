from django.contrib.auth.forms import UserCreationForm

from .models import User


class SignupForm(UserCreationForm):
    """Django's signup form (two passwords + validators) for our email-based user."""

    class Meta:
        model = User
        fields = ["email", "display_name"]
