from django.db import models
from django.urls import reverse


class Note(models.Model):
    title = models.CharField(max_length=120)
    body = models.TextField(blank=True)
    pinned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Pinned notes first, then the most recently edited.
        ordering = ["-pinned", "-updated_at"]

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse("notes:edit", args=[self.pk])
