import logging
from ..exceptions import InvalidResponseError

logger = logging.getLogger("text_to_image")

class TextToImageLogicService:
    def prepare_prompt(self, prompt: str) -> str:
        return prompt.strip()

    def process_response(self, response) -> str:
        if response and hasattr(response, 'data') and response.data:
            # Check if response_format is 'url' or 'b64_json'
            image_data = response.data[0]
            
            if hasattr(image_data, 'url'):
                return image_data.url  # Return the URL directly
            
            elif hasattr(image_data, 'b64_json'):
                return image_data.b64_json  # Return base64 JSON content

            if hasattr(image_data, 'revised_prompt'):
                logger.info(f"Revised prompt used: {image_data.revised_prompt}")
                
        msg = "Invalid response format: 'data' key missing or unrecognized format in response"
        logger.error(msg, exc_info=True)
        raise InvalidResponseError(msg)