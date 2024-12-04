import logging
from text_to_image_modules.services.openai_service import OpenAIService
from text_to_image_modules.core.text_to_image_logic_service import TextToImageLogicService
from text_to_image_modules.text_to_image import TextToImage
from rest_framework import status
from rest_framework.response import Response
from ..utils.handle_data import extract_data, validate_extracted_data
from text_to_image_modules.exceptions import InvalidResponseError

logger = logging.getLogger('text_to_image_log')

class ImageGenerationService:
    """
    Service responsible for generating images based on user prompts and options.
    Utilizes OpenAIService and TextToImageLogicService to interact with the AI model.
    """

    def __init__(self, api_key: str):
        """
        Initialize the ImageGenerationService with necessary AI and logic services.
        """
        self.ai_service = OpenAIService(api_key=api_key)
        self.logic_service = TextToImageLogicService()

    def generate_images(self, data):
        """
        Generate images based on provided data.

        Args:
            data (dict): Dictionary containing user input data.

        Returns:
            Response: DRF Response object with generated image URLs or Base64 data, or errors.
        """
        # Extract and validate data
        extracted_data = extract_data(data)
        errors = validate_extracted_data(extracted_data)
        if errors:
            logger.error(f"Validation errors: {errors}")
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        # Initialize TextToImage
        text_to_image_generator = TextToImage(
            ai_service=self.ai_service,
            logic_service=self.logic_service,
            model=extracted_data['model_used'],
            n=extracted_data['n'],
            size=extracted_data['size'],
            quality=extracted_data['quality'],
            response_format=extracted_data['response_format'],
            style=extracted_data['style'],
        )
        
        # Generate images
        try:
            image_data_list = text_to_image_generator.generate_image(extracted_data['prompt'])
            logger.info(f"{len(image_data_list)} image(s) generated successfully.")

            # Prepare the response data
            response_data = []
            for image_data in image_data_list:
                if extracted_data['response_format'] == 'url':
                    response_data.append({'image_url': image_data})
                elif extracted_data['response_format'] == 'b64_json':
                    response_data.append({'image_base64': image_data})
                else:
                    # This should not happen due to prior validation
                    logger.warning(f"Unhandled response_format: {extracted_data['response_format']}")

            return Response({'images': response_data}, status=status.HTTP_200_OK)

        except InvalidResponseError as e:
            logger.error(f"Invalid response from AI service: {e}")
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error during image generation: {e}", exc_info=True)
            return Response({'detail': 'Error during image generation.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
