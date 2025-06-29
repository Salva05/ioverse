from django.contrib.auth.models import AbstractUser
from django.db import models

class Account(AbstractUser):
    api_key = models.CharField(
        max_length=255,   
        help_text="The API key of openai"
    )
    admin_key = models.CharField(
        max_length=255,
        help_text="Admin-level API key for analytics",
        blank=True,
        default='',
    )

    @property
    def has_admin_key(self) -> bool:
        """
        True when the user has set a non-empty Admin API key.
        """
        return bool(self.admin_key)
        
    def __str__(self):
        return self.username