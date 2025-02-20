from ..services.abstract_ai_service import AbstractAIService
from ..exceptions import MessageLengthException
from .chat_logic_service import ChatLogicService
from tenacity import retry, stop_after_attempt, wait_exponential
from typing import Any, Union, Type, Dict
from pydantic import BaseModel
import logging
import openai

logger = logging.getLogger("chatbot_project")
chat_logger = logging.getLogger("chat_log")

class Chatbot:
    def __init__(self, ai_service: AbstractAIService, chat_logic: ChatLogicService, model: str = "gpt-4", history = None):
        """
        Initializes the Chatbot instance with the provided AI service and model.
        """
        self.ai_service = ai_service
        self.chat_logic = chat_logic
        self.model = model
        self.chat_history = history or self.chat_logic.prepare_initial_history()
        logger.info("Chatbot initialized with model %s", model)
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    def get_response(self, prompt: str) -> str:
        """
        Adds the user's prompt to the chat history and generates a response.
        """
        temp_history = self.chat_history.copy()
        self.chat_history = self.chat_logic.append_user_message(temp_history, prompt)
        chat_logger.info(f"User: {prompt}")
        try:
            response = self.ai_service.chat_completion(self.model, temp_history)
        except Exception as e:
            logger.error(f"Error during AI service call: {e}")
            raise  # Let the exception propagate for the retry decorator
        temp_history = self.chat_logic.append_assistant_message(temp_history, response)
        self.chat_history = temp_history  # Update chat history after successful response to avoid duplicate entries if retry happens
        chat_logger.info(f"Assistant: {response}")
        return response

    @retry(stop=stop_after_attempt(1), wait=wait_exponential(multiplier=1, min=4, max=10))
    def get_structured_output(
        self,
        prompt: str, 
        response_format: Union[Type[BaseModel], Dict[str, Any]],
        model = "gpt-4o-2024-08-06",
        **kwargs
    ) -> Any:
        """
        Generates a single structured output and parses it into the receiving object before returning it.
        """
        self.chat_history = self.chat_logic.append_user_message(self.chat_history, prompt)
        chat_logger.info(f"User: {prompt}")
        try:
            response = self.ai_service.structured_output(
                model=model,
                messages=self.chat_history,
                response_format=response_format,
                **kwargs
            )
        except openai.APIError as e:
            # Check for token limit reached
            error_message = str(e)
            if "Could not parse response content as the length limit was reached" in error_message:
                raise MessageLengthException(message=f"Generation interrupted due to finished tokens.")
            else:
                print("OpenAI API error occurred:", error_message)
            raise
        except Exception as e:
            logger.error(f"Error during AI service call: {e}")
            raise

        chat_logger.info(f"Assistant: {response}")

        # Extract the parsed structured output
        assistant_message = response.choices[0].message

        # Handle generation interruption for token limit
        if hasattr(assistant_message, 'finish_reason') and assistant_message.finish_reason == "length":
            raise MessageLengthException(message=f"Generation interrupted due to finished tokens.")
        # Handle possible refusal
        elif hasattr(assistant_message, 'refusal') and assistant_message.refusal:
            refusal_message = assistant_message.refusal
            logger.warning(f"Assistant refused to respond: {refusal_message}")
            return None
        elif hasattr(assistant_message, 'parsed') and assistant_message.parsed:
            parsed_output = assistant_message.parsed
            return parsed_output
        else:
            logger.error("Unexpected response format received from the assistant.")
            return None
    
    def clear_history(self):
        """
        Clears the chat history, retaining only the system message.
        """
        self.chat_history = self.chat_logic.prepare_initial_history()
        logger.info("Chat history cleared.")
        
    def reset(self, system_instructions):
        """
        Reset the chat history and redefine the system instructions
        """
        self.chat_history = [{"role": "system", "content": system_instructions}]