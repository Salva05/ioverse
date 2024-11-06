from django.db import models
from django.core.exceptions import ValidationError
from .base import BaseModel
from ..validators import (
    validate_metadata,
    validate_status,
    validate_role,
    validate_content,
    validate_attachments
)

def default_content():
    return []

def default_attachments():
    return []

class Message(BaseModel):
    """
    Represents a message within a thread in the OpenAI Assistant API.
    """
    
    # Inherited Fields:
    # Owner (Django User)
    # id (CharField, primary_key=True)
    # object (CharField)
    # created_at (IntegerField)

    thread_id = models.CharField(
        max_length=100,
        help_text="The thread ID that this message belongs to."
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('in_progress', 'In Progress'),
            ('incomplete', 'Incomplete'),
            ('completed', 'Completed'),
        ],
        help_text="The status of the message, which can be either in_progress, incomplete, or completed.",
        validators=[validate_status]
    )
    incomplete_details = models.JSONField(
        null=True,
        blank=True,
        help_text="Details about why the message is incomplete.",
        validators=[]  # Specific validators will be handled within validate_content or separate functions
    )
    incomplete_at = models.IntegerField(
        null=True,
        blank=True,
        help_text="The Unix timestamp (in seconds) for when the message was marked as incomplete."
    )
    complete_at = models.IntegerField(
        null=True,
        blank=True,
        help_text="The Unix timestamp (in seconds) for when the message was marked as complete."
    )
    role = models.CharField(
        max_length=20,
        choices=[
            ('user', 'User'),
            ('assistant', 'Assistant'),
        ],
        help_text="The entity that produced the message. One of user or assistant.",
        validators=[validate_role]
    )
    content = models.JSONField(
        default=default_content,
        help_text="The content of the message in array of text and/or images.",
        validators=[validate_content]
    )
    assistant_id = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        help_text="If applicable, the ID of the assistant that authored this message."
    )
    run_id = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        help_text="The ID of the run associated with the creation of this message. Value is null when messages are created manually using the create message or create thread endpoints."
    )
    attachments = models.JSONField(
        null=True,
        blank=True,
        default=default_attachments,
        help_text="A list of files attached to the message, and the tools they were added to.",
        validators=[validate_attachments]
    )
    metadata = models.JSONField(
        default=dict,
        help_text="Set of 16 key-value pairs that can be attached to an object.",
        validators=[validate_metadata]
    )

    def clean(self):
        """
        Model-level validation to ensure 'object' field is set to 'thread.message' and other constraints.
        """
        super().clean()

        if self.object != 'thread.message':
            raise ValidationError({'object': "The 'object' field must be set to 'thread.message'."})

        # Validate incomplete_details if status is 'incomplete'
        if self.status == 'incomplete':
            if not self.incomplete_details:
                raise ValidationError({'incomplete_details': "Incomplete details must be provided when status is 'incomplete'."})
            # Additional validations for incomplete_details structure can be implemented here

    def save(self, *args, **kwargs):
        """
        Override the save method to ensure 'object' is set to 'thread.message' if not provided.
        """
        self.object = 'thread.message'  # Force 'object' to 'thread.message'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Message {self.id} in Thread {self.thread_id}"

    class Meta:
        verbose_name = "Message"
        verbose_name_plural = "Messages"
