from django.db import models
from .base import BaseModel
import os

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

    # Only when purpose=vision or 'assistants_output'
    image_file = models.ImageField(
        upload_to='file_images/',
        verbose_name="Image File",
        help_text="The image associated with the file.",
        null=True,
        blank=True
    )
    image_url = models.URLField(
        max_length=500,
        verbose_name="Image URL",
        help_text="The URL of the image associated with the file.",
        null=True,
        blank=True
    )
    # image_file and this could be merged, but will keep distinct to keep the handling clear
    # this is used in cases the file arrives as an assistant_output generated file whose type is not 'image_file'
    file_content = models.FileField(
        upload_to='uploaded_files/',
        verbose_name="File",
        help_text="Upload images or other files.",
        null=True,
        blank=True,
    )
    def delete(self, *args, **kwargs):
        # If the image file exists, delete it
        if self.image_file and os.path.isfile(self.image_file.path):
            os.remove(self.image_file.path)
        
        # Call the superclass delete method
        super().delete(*args, **kwargs)
        
    def __str__(self):
        return f"{self.filename} ({self.id})"

    class Meta:
        verbose_name = "File"
        verbose_name_plural = "Files"
