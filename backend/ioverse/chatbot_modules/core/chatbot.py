from typing import List, Dict
from services.abstract_ai_service import AbstractAIService
from core.chat_logic_service import ChatLogicService
from tenacity import retry, stop_after_attempt, wait_exponential
import logging

logger = logging.getLogger("chatbot_project")
chat_logger = logging.getLogger("chat_log")

class Chatbot:
    def __init__(self, ai_service: AbstractAIService, chat_logic: ChatLogicService, model: str = "gpt-4"):
        """
        Initializes the Chatbot instance with the provided AI service and model.
        """
        self.ai_service = ai_service
        self.chat_logic = chat_logic
        self.model = model
        self.chat_history = self.chat_logic.prepare_initial_history()
        logger.info("Chatbot initialized with model %s", model)
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    def get_response(self, prompt: str) -> str:
        """
        Adds the user's prompt to the chat history and generates a response.
        """
        self.chat_history = self.chat_logic.append_user_message(self.chat_history, prompt)
        chat_logger.info(f"User: {prompt}")
        try:
            response = self.ai_service.chat_completion(self.model, self.chat_history)
        except RuntimeError as e:
            logger.error(e)
            response = "An error occurred while generating a response."
        self.chat_history = self.chat_logic.append_assistant_message(self.chat_history, response)
        chat_logger.info(f"Assistant: {response}")
        return response

    def clear_history(self):
        """
        Clears the chat history, retaining only the system message.
        """
        self.chat_history = self.chat_logic.prepare_initial_history()
        logger.info("Chat history cleared.")