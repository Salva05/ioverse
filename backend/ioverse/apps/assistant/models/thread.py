from django.db import models
from .base import BaseModel
from django.core.exceptions import ValidationError
from ..validators import (
    validate_tool_resources,
    validate_metadata
)

def default_metadata():
    return {}

class Thread(BaseModel):
    """
    Represents a thread that contains messages and associated tool resources.
    """
    
    # Inherited Fields:
    # Owner (Django User)
    # id (CharField, primary_key=True)
    # object (CharField)
    # created_at (IntegerField)
    
    tool_resources = models.JSONField(
        null=True,
        blank=True,
        help_text="Resources available to the assistant's tools in this thread.",
        validators=[validate_tool_resources]
    )
    metadata = models.JSONField(
        default=default_metadata,
        help_text="A set of up to 16 key-value pairs for additional information.",
        validators=[validate_metadata]
    )

    def clean(self):
        """
        Model-level validation to ensure 'object' field is set to 'thread'.
        """
        super().clean()
        
        if self.object != 'thread':
            raise ValidationError({'object': "The 'object' field must be set to 'thread'."})
        
    def save(self, *args, **kwargs):
        """
        Override the save method to ensure 'object' is set to 'thread' if not provided.
        """
        self.object = 'thread'  # Force 'object' to 'thread'
        super().save(*args, **kwargs)
        
    def __str__(self):
        return f"Thread {self.id} of {self.owner.username}"

    class Meta:
        verbose_name = "Thread"
        verbose_name_plural = "Threads"
