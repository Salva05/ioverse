from django.db import models
from django.core.exceptions import ValidationError
from .base import BaseModel
from ..validators import (
    validate_metadata,
    validate_vector_store_file_status,
    validate_last_error,
    validate_chunking_strategy
)

def default_metadata():
    return {}

class VectorStoreFile(BaseModel):
    """
    Represents a file attached to a vector store in the OpenAI Assistant API.
    """
    
    # Inherited Fields:
    # Owner (Django User)
    # id (CharField, primary_key=True)
    # object (CharField)
    # created_at (IntegerField)
    
    usage_bytes = models.IntegerField(
        help_text="The total vector store usage in bytes. Note that this may be different from the original file size."
    )
    vector_store_id = models.CharField(
        max_length=100,
        help_text="The ID of the vector store that the File is attached to."
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('in_progress', 'In Progress'),
            ('completed', 'Completed'),
            ('cancelled', 'Cancelled'),
            ('failed', 'Failed'),
        ],
        help_text="The status of the vector store file, which can be either in_progress, completed, cancelled, or failed. A status of completed indicates that the vector store file is ready for use.",
        validators=[validate_vector_store_file_status]
    )
    last_error = models.JSONField(
        null=True,
        blank=True,
        help_text="The last error associated with this vector store file. Will be null if there are no errors.",
        validators=[validate_last_error]
    )
    chunking_strategy = models.JSONField(
        help_text="The strategy used to chunk the file.",
        validators=[validate_chunking_strategy]
    )
    metadata = models.JSONField(
        default=default_metadata,
        help_text="Set of 16 key-value pairs that can be attached to an object.",
        validators=[validate_metadata]
    )

    def clean(self):
        """
        Model-level validation to ensure 'object' field is set to 'vector_store.file' and other constraints.
        """
        super().clean()

        if self.object != 'vector_store.file':
            raise ValidationError({'object': "The 'object' field must be set to 'vector_store.file'."})

    def save(self, *args, **kwargs):
        """
        Override the save method to ensure 'object' is set to 'vector_store.file' before saving.
        """
        self.object = 'vector_store.file'  # Force 'object' to 'vector_store.file'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"VectorStoreFile {self.id} attached to VectorStore {self.vector_store_id}"

    class Meta:
        verbose_name = "Vector Store File"
        verbose_name_plural = "Vector Store Files"
