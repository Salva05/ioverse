# models/assistant.py

from django.db import models
from django.core.exceptions import ValidationError
from .base import BaseModel
from ..validators import (
    validate_tools,
    validate_tool_resources,
    validate_response_format,
    validate_metadata,
    validate_temperature,
    validate_top_p
)

def default_response_format():
    return "auto"

def default_tools():
    return []

class Assistant(BaseModel):
    """
    Represents an OpenAI Assistant that can call models and use tools.
    """
    
    # Inherited Fields:
    # Owner (Django User)
    # id (CharField, primary_key=True)
    # object (CharField)
    # created_at (IntegerField)
    
    name = models.CharField(
        max_length=256,
        null=True,
        blank=True,
        help_text="The name of the assistant (max 256 characters)."
    )
    description = models.CharField(
        max_length=512,
        null=True,
        blank=True,
        help_text="The description of the assistant (max 512 characters)."
    )
    model = models.CharField(
        max_length=100,
        help_text="The ID of the model to use (e.g., 'gpt-4')."
    )
    instructions = models.TextField(
        max_length=256000,
        null=True,
        blank=True,
        help_text="System instructions for the assistant (max 256,000 characters)."
    )
    tools = models.JSONField(
        default=default_tools,
        help_text="A list of tools enabled on the assistant (max 128).",
        validators=[validate_tools]
    )
    tool_resources = models.JSONField(
        null=True,
        blank=True,
        help_text="JSON object containing resources used by the assistant's tools.",
        validators=[validate_tool_resources]
    )
    temperature = models.FloatField(
        default=1,
        null=True,
        blank=True,
        help_text="Sampling temperature for responses, between 0 (deterministic) and 2 (highly random).",
        validators=[validate_temperature]
    )
    top_p = models.FloatField(
        default=1,
        null=True,
        blank=True,
        help_text="Nucleus sampling probability mass for responses, between 0 and 1.",
        validators=[validate_top_p]
    )
    response_format = models.JSONField(
        default=default_response_format,
        help_text="Specifies the format that the model must output.",
        validators=[validate_response_format]
    )
    metadata = models.JSONField(
        default=dict,
        validators=[validate_metadata],
        help_text="Additional metadata for the assistant."
    )
    
    def clean(self):
        """
        Model-level validation to ensure 'object' field is set to 'assistant'.
        """
        super().clean()

        if self.object != 'assistant':
            raise ValidationError({'object': "The 'object' field must be set to 'assistant'."})
        
    def save(self, *args, **kwargs):
        """
        Override the save method to ensure 'object' is set to 'assistant' if not provided.
        """
        self.object = 'assistant'  # Force 'object' to 'assistant'
        super().save(*args, **kwargs)
        
    def __str__(self):
        return f"{self.name if self.name else self.id} of {self.owner.username}"

    class Meta:
        verbose_name = "Assistant"
        verbose_name_plural = "Assistants"
