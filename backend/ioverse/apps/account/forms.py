from django.contrib.auth.forms import UserCreationForm
from django import forms
from .models import Account

class AccountCreationForm(UserCreationForm):
    class Meta:
        model = Account
        fields = ['username', 'email', 'api_key', 'admin_key']
        help_texts = {
            'api_key':  'Provide your user-level OpenAI API key.',
            'admin_key': '(Optional) Admin-level API key; leave blank if you’re not enabling the analytics feature yet.',
        }
