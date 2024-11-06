from django.db import models
from django.utils import timezone
from django.conf import settings

class BaseModel(models.Model):
    """
    Abstract base model that includes common fields for Assistant and Thread models.
    """
    id = models.CharField(
        primary_key=True,
        max_length=100,
        help_text="The unique identifier of the OpenAI API object."
    )
    object = models.CharField(
        max_length=50,
        help_text="The object type."
    )
    created_at = models.IntegerField(
        help_text="Unix timestamp (in seconds) for when the object was created.",
    )

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="%(class)s_owned",
        help_text="The user owning this model."
    )
    
    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        """
        Override save method to set default values for 'object' and 'created_at' if not provided.
        """
        if not self.created_at:
            self.created_at = int(timezone.now().timestamp())
        super().save(*args, **kwargs)
