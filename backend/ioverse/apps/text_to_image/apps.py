from django.apps import AppConfig

class TextToImageConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.text_to_image'

    def ready(self):
        # Configuration of the text_to_image app
        from text_to_image_modules.config.settings import get_settings
        from text_to_image_modules.services.openai_service import OpenAIService
        from text_to_image_modules.core.text_to_image_logic_service import TextToImageLogicService

        # Initialize shared services
        settings = get_settings()
        self.ai_service = OpenAIService(settings.openai_api_key)
        self.logic_service = TextToImageLogicService()
