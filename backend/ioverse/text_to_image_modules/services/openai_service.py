import openai
from openai import OpenAI
from typing import Dict, Any
from .abstract_ai_service import AbstractAIService
from ..config.settings import get_settings
import logging

logger = logging.getLogger('text_to_image_log')

class OpenAIService(AbstractAIService):
    def __init__(self, api_key: str = None):
        settings = get_settings()
        # openai.api_key = api_key or settings.openai_api_key
        self.client = OpenAI()

    def generate_image(self, prompt: str, **kwargs) -> Dict[str, Any]:
        # Remove any items with None values from kwargs
        filtered_kwargs = {key: value for key, value in kwargs.items() if value is not None}
        
        try:
            response = self.client.images.generate(
                prompt=prompt,
                **filtered_kwargs
            )
            return response
        except openai.OpenAIError as e:
            logger.error(f"OpenAI API error: {e}")
            raise