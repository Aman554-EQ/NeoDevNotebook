from django import forms

from .models import Note


class NoteForm(forms.ModelForm):
    class Meta:
        model = Note
        fields = ["title", "body", "pinned"]
        widgets = {"body": forms.Textarea(attrs={"rows": 6})}

    def clean_title(self):
        title = self.cleaned_data["title"].strip()
        if len(title) < 3:
            raise forms.ValidationError("Use at least 3 characters.")
        return title
