from django.contrib.auth.forms import UserCreationForm
from django import forms
from .models import Account

class AccountCreationForm(UserCreationForm):
    class Meta:
        model = Account
        fields = ['username', 'email', 'api_key']
        help_texts = {
            'api_key': 'Provide your OpenAI API key.',
        }
