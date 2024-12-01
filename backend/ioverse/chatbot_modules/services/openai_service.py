import openai
from typing import List, Dict, Union, Type
from pydantic import BaseModel
from .abstract_ai_service import AbstractAIService
import logging
from openai import OpenAI

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
            raise  # Handler will take care of this exception in the re-tries
        
    def structured_output(
        self, 
        model: str, 
        messages: List[Dict[str, str]],
        response_format: Union[Type[BaseModel], Dict]
    ):
        completion = openai.beta.chat.completions.parse(
            model=model,
            messages=messages,
            response_format=response_format
        )
        return completion