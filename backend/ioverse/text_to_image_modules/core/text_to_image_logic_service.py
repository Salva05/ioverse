import logging
from typing import List
from ..exceptions import InvalidResponseError

logger = logging.getLogger('text_to_image_log')

class TextToImageLogicService:
    def prepare_prompt(self, prompt: str) -> str:
        return prompt.strip()

    def process_response(self, response) -> List[str]:
        if response and hasattr(response, 'data') and response.data:
            images_data = []
            for image_data in response.data:
                if image_data.url:
                    images_data.append(image_data.url)
                elif image_data.b64_json:
                    images_data.append(image_data.b64_json)
                else:
                    logger.error("Invalid image data format")
                    raise InvalidResponseError("Invalid image data format")

                if image_data.revised_prompt:
                    logger.info(f"Revised prompt used: {image_data.revised_prompt}")
            return images_data
        else:
            msg = "Invalid response format: 'data' key missing or unrecognized format in response"
            logger.error(msg, exc_info=True)
            raise InvalidResponseError(msg)