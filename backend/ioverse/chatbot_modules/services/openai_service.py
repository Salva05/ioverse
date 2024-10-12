import openai
from typing import List, Dict
from services.abstract_ai_service import AbstractAIService
import logging

logger = logging.getLogger("chatbot_project")

class OpenAIService(AbstractAIService):
    def __init__(self, api_key: str):
        openai.api_key = api_key

    def chat_completion(self, model: str, messages: List[Dict[str, str]]) -> str:
        try:
            response = openai.chat.completions.create(model=model, messages=messages)
            return response.choices[0].message.content
        except openai.OpenAIError as e:
            logger.error(f"OpenAI API error: {e}")
            raise RuntimeError(f"OpenAI API error: {e}")