from django.db import models
from django.core.exceptions import ValidationError
from .base import BaseModel
from ..validators import (
    validate_metadata,
    validate_vector_store_status,
    validate_expires_after,
    validate_file_counts
)

def default_metadata():
    return {}

class VectorStore(BaseModel):
    """
    Represents a vector store in the OpenAI Assistant API.
    """
    
    # Inherited Fields:
    # Owner (Django User)
    # id (CharField, primary_key=True)
    # object (CharField)
    # created_at (IntegerField)

    name = models.CharField(
        max_length=255,
        help_text="The name of the vector store."
    )
    usage_bytes = models.IntegerField(
        help_text="The total number of bytes used by the files in the vector store."
    )
    file_counts = models.JSONField(
        help_text="Counts of files in various statuses within the vector store.",
        validators=[validate_file_counts]
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('expired', 'Expired'),
            ('in_progress', 'In Progress'),
            ('completed', 'Completed'),
        ],
        help_text="The status of the vector store, which can be either expired, in_progress, or completed.",
        validators=[validate_vector_store_status]
    )
    expires_after = models.JSONField(
        help_text="The expiration policy for the vector store.",
        validators=[validate_expires_after]
    )
    metadata = models.JSONField(
        default=default_metadata,
        help_text="Set of 16 key-value pairs that can be attached to an object.",
        validators=[validate_metadata]
    )

    def clean(self):
        """
        Model-level validation to ensure 'object' field is set to 'vector_store' and other constraints.
        """
        super().clean()

        if self.object != 'vector_store':
            raise ValidationError({'object': "The 'object' field must be set to 'vector_store'."})

    def save(self, *args, **kwargs):
        """
        Override the save method to ensure 'object' is set to 'vector_store' before saving.
        """
        self.object = 'vector_store'  # Force 'object' to 'vector_store'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"VectorStore {self.name} ({self.id}) of {self.owner.username}"

    class Meta:
        verbose_name = "Vector Store"
        verbose_name_plural = "Vector Stores"
