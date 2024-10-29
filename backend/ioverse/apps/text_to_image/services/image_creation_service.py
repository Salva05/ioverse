import logging
import base64
import uuid
from django.core.files.base import ContentFile
from ..models import ImageGeneration

logger = logging.getLogger('text_to_image_log')

class ImageCreationService:
    """
    Service responsible for saving generated images based on user selection.
    Handles both URL and Base64 image data formats.
    """

    def process_image_generation(self, user, validated_data):
        """
        Save the generated image data to the database.

        Args:
            user (User): The authenticated user saving the image.
            validated_data (dict): Dictionary containing validated data including 'image_data'.

        Returns:
            ImageGeneration: The saved ImageGeneration instance.

        Raises:
            ValueError: If no image data is provided or response_format is unsupported.
            Exception: If an error occurs during saving the image.
        """
        image_data = validated_data.pop('image_data', None)
        if not image_data:
            logger.error("No image data provided for saving.")
            raise ValueError("No image data provided for saving.")

        image_generation = ImageGeneration.objects.create(
            user=user,
            prompt=validated_data['prompt'],
            model_used=validated_data.get('model_used', 'dall-e-2'),
            n=1,  # Saving a single image
            quality=validated_data.get('quality'),
            response_format=validated_data.get('response_format', 'url'),
            size=validated_data.get('size'),
            style=validated_data.get('style'),
        )

        try:
            if image_generation.response_format == 'url':
                image_generation.image_url = image_data
            elif image_generation.response_format == 'b64_json':
                image_data_decoded = base64.b64decode(image_data)
                filename = f"{uuid.uuid4()}.png"
                image_file = ContentFile(image_data_decoded, name=filename)
                image_generation.image_file = image_file
            else:
                logger.error(f"Unsupported response_format: {image_generation.response_format}")
                raise ValueError(f"Unsupported response_format: {image_generation.response_format}")
            image_generation.save()
            logger.info(f"Image saved successfully for user {user.username}.")
            return image_generation
        except Exception as e:
            logger.error(f"Error saving image: {e}")
            image_generation.delete()
            raise e
