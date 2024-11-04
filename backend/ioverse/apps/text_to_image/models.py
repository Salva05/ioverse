# models.py

import os
import uuid
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.exceptions import ValidationError

class ImageGeneration(models.Model):
    """
    Model representing an image generated by a user using the AI service.
    """

    # Model Choices
    MODEL_CHOICES = (
        ('dall-e-2', 'DALL-E 2'),
        ('dall-e-3', 'DALL-E 3'),
    )

    QUALITY_CHOICES = (
        ('standard', 'Standard'),
        ('hd', 'HD'),
    )

    RESPONSE_FORMAT_CHOICES = (
        ('url', 'URL'),
        ('b64_json', 'Base64 JSON'),
    )

    SIZE_CHOICES_DALLE_2 = (
        ('256x256', '256x256'),
        ('512x512', '512x512'),
        ('1024x1024', '1024x1024'),
    )

    SIZE_CHOICES_DALLE_3 = (
        ('1024x1024', '1024x1024'),
        ('1792x1024', '1792x1024'),
        ('1024x1792', '1024x1792'),
    )

    STYLE_CHOICES = (
        ('vivid', 'Vivid'),
        ('natural', 'Natural'),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='image_generations',
        verbose_name="User",
        help_text="The user who generated this image."
    )
    prompt = models.TextField(
        verbose_name="Prompt",
        help_text="The text prompt used to generate the image."
    )
    image_file = models.ImageField(
        upload_to='generated_images/',
        verbose_name="Image File",
        help_text="The generated image file.",
        null=True,
        blank=True
    )
    image_url = models.URLField(
        max_length=500,
        verbose_name="Image URL",
        help_text="The URL of the generated image.",
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Created At",
        help_text="The date and time when the image was generated.",
        db_index=True
    )
    model_used = models.CharField(
        max_length=20,
        choices=MODEL_CHOICES,
        default='dall-e-2',
        verbose_name="Model Used",
        help_text="The AI model used to generate the image."
    )
    n = models.PositiveSmallIntegerField(
        default=1,
        verbose_name="Number of Images",
        help_text="The number of images generated."
    )
    quality = models.CharField(
        max_length=20,
        choices=QUALITY_CHOICES,
        verbose_name="Quality",
        help_text="The quality setting used during generation. Only supported for 'dall-e-3'.",
        null=True,
        blank=True
    )
    response_format = models.CharField(
        max_length=20,
        choices=RESPONSE_FORMAT_CHOICES,
        default="url",
        verbose_name="Response Format",
        help_text="The response format (e.g., 'url', 'b64_json').",
        db_index=True
    )
    size = models.CharField(
        max_length=20,
        verbose_name="Image Size",
        help_text="The size of the generated image.",
        default="1024x1024"
    )
    style = models.CharField(
        max_length=20,
        choices=STYLE_CHOICES,
        verbose_name="Style",
        help_text="The style setting used during generation. Only supported for 'dall-e-3'.",
        null=True,
        blank=True
    )
    revised_prompt = models.TextField(
        verbose_name="Revised Prompt",
        help_text="The revised prompt used by the AI model, if any.",
        null=True,
        blank=True
    )
    is_shared = models.BooleanField(
        default=False,
        verbose_name="Is Shared",
        help_text="Indicates whether the image is shared publicly."
    )
    shared_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Shared At",
        help_text="The date and time when the image was shared."
    )
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Expires At",
        help_text="The date and time when the shared image expires."
    )
    share_token = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
        verbose_name="Share Token",
        help_text="Unique token for sharing the image."
    )

    def share(self, duration_hours=None):
        """
        Method to share the image publicly.
        """
        self.is_shared = True
        self.shared_at = timezone.now()
        if duration_hours:
            self.expires_at = timezone.now() + timezone.timedelta(hours=duration_hours)
        self.save()

    def unshare(self):
        """
        Method to unshare the image.
        """
        self.is_shared = False
        self.shared_at = None
        self.expires_at = None
        self.save()

    def clean(self):
        super().clean()

        # Validate 'n'
        if not (1 <= self.n <= 10):
            raise ValidationError({'n': "The number of images 'n' must be between 1 and 10."})

        if self.model_used == 'dall-e-3':
            # For 'dall-e-3', 'n' must be 1
            if self.n != 1:
                raise ValidationError({'n': "For 'dall-e-3', only n=1 is supported."})
            # 'quality' and 'style' are supported
            if not self.quality:
                self.quality = 'standard'  # Default value
            if self.quality not in dict(self.QUALITY_CHOICES):
                raise ValidationError({'quality': "Invalid quality for 'dall-e-3'."})
            if not self.style:
                self.style = 'vivid'  # Default value
            if self.style not in dict(self.STYLE_CHOICES):
                raise ValidationError({'style': "Invalid style for 'dall-e-3'."})
            # Validate 'size'
            if self.size not in dict(self.SIZE_CHOICES_DALLE_3):
                raise ValidationError({'size': "Invalid size for 'dall-e-3'."})
            # Validate prompt length
            if len(self.prompt) > 4000:
                raise ValidationError({'prompt': "For 'dall-e-3', prompt length must be 4000 characters or fewer."})
        elif self.model_used == 'dall-e-2':
            # 'quality' and 'style' should be None
            if self.quality:
                raise ValidationError({'quality': "Quality is only supported for 'dall-e-3'."})
            if self.style:
                raise ValidationError({'style': "Style is only supported for 'dall-e-3'."})
            # Validate 'size'
            if self.size not in dict(self.SIZE_CHOICES_DALLE_2):
                raise ValidationError({'size': "Invalid size for 'dall-e-2'."})
            # Validate prompt length
            if len(self.prompt) > 1000:
                raise ValidationError({'prompt': "For 'dall-e-2', prompt length must be 1000 characters or fewer."})
        else:
            raise ValidationError({'model_used': "Invalid model selected."})

    def delete(self, *args, **kwargs):
        # If the image file exists, delete it
        if self.image_file and os.path.isfile(self.image_file.path):
            os.remove(self.image_file.path)
        
        # Call the superclass delete method
        super().delete(*args, **kwargs)
        
    def __str__(self):
        return f"Image {self.id} by {self.user.username}"

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Image Generation"
        verbose_name_plural = "Image Generations"
