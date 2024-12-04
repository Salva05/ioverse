import logging
import openai
from typing import Dict, Any

from .operations import ThreadClient
from .parameters import ThreadCreateParams, ThreadUpdateParams
from .exceptions import ThreadNotFoundException
from assistant_modules.common.models import ThreadObject
from pydantic import ValidationError

logger = logging.getLogger('thread_service')

class ThreadService:
    def __init__(self, api_key: str):
        self.client = ThreadClient(api_key=api_key)
        
    def create_thread(self, params: ThreadCreateParams) -> ThreadObject:
        try:
            thread_data = params.model_dump(exclude_unset=True)
            response = self.client.create_thread(**thread_data)
            print(response)
            # Convert OpenAI Thread instance to dict
            response_dict = response.model_dump()
            
            thread = ThreadObject.model_validate(response_dict)
            logger.info(f"Thread created: {thread.id}")
            return thread
        except ValidationError as ve:
            logger.error(f"Validation error creating thread: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error creating thread: {str(e)}")
            raise

    def retrieve_thread(self, thread_id: str) -> ThreadObject:
        try:
            response = self.client.retrieve_thread(thread_id)
            
            # Convert OpenAI Thread instance to dict
            response_dict = response.model_dump()
            
            thread = ThreadObject.model_validate(response_dict)
            logger.info(f"Thread retrieved: {thread.id}")
            return thread
        except ValidationError as ve:
            logger.error(f"Validation error retrieving thread: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error retrieving thread: {str(e)}")
            raise

    def check_thread_existence(self, thread_id: str) -> None:
        try:
            response = self.client.retrieve_thread(thread_id=thread_id)
        except openai.NotFoundError as e:
            raise ThreadNotFoundException(f"Thread with ID {thread_id} not found") from e
        except Exception as e:
            logger.error(f"Error checking thread existence for {thread_id}: {str(e)}")
            raise
            
    
    def update_thread(self, thread_id: str, params: ThreadUpdateParams) -> ThreadObject:
        try:
            thread_data = params.model_dump(exclude_unset=True)
            response = self.client.update_thread(thread_id, **thread_data)
            
            # Convert OpenAI Thread instance to dict
            response_dict = response.model_dump()
            
            thread = ThreadObject.model_validate(response_dict)
            logger.info(f"Thread updated: {thread.id}")
            return thread
        except ValidationError as ve:
            logger.error(f"Validation error updating thread: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error updating thread: {str(e)}")
            raise

    def delete_thread(self, thread_id: str) -> Dict[str, Any]:
        try:
            result = self.client.delete_thread(thread_id)
            logger.info(f"Thread deleted: {thread_id}")
            return result.model_dump()
        except Exception as e:
            logger.error(f"Error deleting thread: {str(e)}")
            raise
