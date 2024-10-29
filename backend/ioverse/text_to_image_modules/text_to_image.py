from typing import Optional
from .exceptions import InvalidResponseError
from .services.abstract_ai_service import AbstractAIService
from .core.text_to_image_logic_service import TextToImageLogicService
from tenacity import retry, stop_after_attempt, wait_exponential
import logging

logger = logging.getLogger('text_to_image_log')

class TextToImage:
    def __init__(
        self,
        ai_service: AbstractAIService,
        logic_service: TextToImageLogicService,
        model: str = "dall-e-2", 
        n: int = 1,
        size: str = "512x512",
        quality: str = None,
        response_format: str = "url",
        style: str = None
    ):
        self.ai_service = ai_service
        self.logic_service = logic_service
        self.n = n
        self.size = size
        self.model = model
        self.quality = quality
        self.response_format = response_format
        self.style = style
        
        logger.info("TextToImage initialized.")

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    def generate_image(self, prompt: str) -> Optional[str]:
        prepared_prompt = self.logic_service.prepare_prompt(prompt)
        try:
            response = self.ai_service.generate_image(
                model=self.model,
                prompt=prepared_prompt,
                n=self.n,
                size=self.size,
                quality=self.quality,
                response_format=self.response_format,
                style=self.style, 
            )
            image_data = self.logic_service.process_response(response)
            logger.info(f"{len(image_data)} image(s) generated.")
            return image_data
        except InvalidResponseError as e:
            logger.error(f"Invalid response: {e}", exc_info=True)
            raise
        except Exception as e:
            logger.error(f"Unexpected error during image generation: {e}", exc_info=True)
            raise

    def set_parameters(
        self,
        model: str = "dall-e-2",
        n: int = 1,
        size: str = "512x512",
        quality: str = None,
        response_format: str = "url",
        style: str = None
    ):
        self.n = n
        self.size = size
        self.model = model
        self.quality = quality
        self.response_format = response_format
        self.style = style
        logger.info(f"Parameters updated: n={n}, size={size}, model={model}, quality={quality}, response_format={response_format}, style={style}")
