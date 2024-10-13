from django.apps import AppConfig


class ChatbotConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.chatbot'

    def ready(self):
        # Configuration of the chatbot
        from chatbot_modules.config.settings import get_settings
        from chatbot_modules.services.openai_service import OpenAIService
        from chatbot_modules.core.chat_logic_service import ChatLogicService

        # Initialize shared services
        settings = get_settings()
        self.ai_service = OpenAIService(settings.openai_api_key)
        self.chat_logic = ChatLogicService()