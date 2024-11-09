from django.db import models
from .base import BaseModel

class File(BaseModel):
    """
    Represents a file uploaded to OpenAI. This model maps directly 
    to the structure provided by the OpenAI API for file objects.
    """

    # Size of the file in bytes
    bytes = models.PositiveIntegerField(
        help_text="The size of the file in bytes. Must be a positive integer."
    )
    
    # Name of the file
    filename = models.CharField(
        max_length=255,
        help_text="The name of the file."
    )
    
    # Available purposes of the file
    PURPOSE_CHOICES = [
        ("assistants", "Assistants"),
        ("assistants_output", "Assistants Output"),
        ("batch", "Batch"),
        ("batch_output", "Batch Output"),
        ("fine-tune", "Fine-tune"),
        ("fine-tune-results", "Fine-tune Results"),
        ("vision", "Vision"),
    ]
    purpose = models.CharField(
        max_length=20,
        choices=PURPOSE_CHOICES,
        help_text="The intended purpose of the file, with choices including 'assistants', 'fine-tune', and 'vision'."
    )

    def __str__(self):
        return f"{self.filename} ({self.id})"

    class Meta:
        verbose_name = "File"
        verbose_name_plural = "Files"
