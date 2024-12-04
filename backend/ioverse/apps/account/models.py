from django.contrib.auth.models import AbstractUser
from django.db import models

class Account(AbstractUser):
    api_key = models.CharField(
        max_length=100,   
        help_text="The API key of openai"
    )

    def __str__(self):
        return self.username