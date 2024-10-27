from django.apps import apps
from django.core.files.base import ContentFile
from ..models import ImageGeneration
from text_to_image_modules.text_to_image import TextToImage
import base64
import uuid
import logging

logger = logging.getLogger('text_to_image_log')

class TextToImageService:
    def __init__(self):
        text_to_image_app_config = apps.get_app_config('text_to_image')
        self.ai_service = text_to_image_app_config.ai_service
        self.logic_service = text_to_image_app_config.logic_service

    def process_image_generation(self, user, validated_data):
        image_generation = ImageGeneration.objects.create(
            user=user,
            prompt=validated_data['prompt'],
            model_used=validated_data.get('model_used', 'dall-e-3'),
            n=validated_data.get('n', 1),
            quality=validated_data.get('quality', 'standard'),
            response_format=validated_data.get('response_format', 'url'),
            size=validated_data.get('size', '1024x1024'),
            style=validated_data.get('style', 'vivid'),
        )

        text_to_image_generator = TextToImage(
            ai_service=self.ai_service,
            logic_service=self.logic_service,
            model=image_generation.model_used,
            n=image_generation.n,
            size=image_generation.size,
            quality=image_generation.quality,
            response_format=image_generation.response_format,
            style=image_generation.style,
        )

        try:
            image_data = text_to_image_generator.generate_image(image_generation.prompt)
            if image_generation.response_format == 'url':
                image_generation.image_url = image_data
            elif image_generation.response_format == 'b64_json':
                image_data_decoded = base64.b64decode(image_data)
                filename = f"{uuid.uuid4()}.png"
                image_file = ContentFile(image_data_decoded, name=filename)
                image_generation.image_file = image_file
            else:
                raise ValueError(f"Unsupported response_format: {image_generation.response_format}")
            image_generation.save()
            return image_generation
        except Exception as e:
            logger.error(f"Error during image generation: {e}")
            image_generation.delete()
            raise e
