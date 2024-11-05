import logging
from typing import Optional, Dict, Any

from .operations import ThreadClient
from .parameters import ThreadCreateParams, ThreadUpdateParams
from assistant_modules.common.models import ThreadObject
from pydantic import ValidationError

logger = logging.getLogger('thread_service')

class ThreadService:
    def __init__(self):
        self.client = ThreadClient()

    def create_thread(self, params: ThreadCreateParams) -> ThreadObject:
        try:
            thread_data = params.model_dump(exclude_unset=True)
            response = self.client.create_thread(**thread_data)
            thread = ThreadObject.model_validate(response)
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
            thread = ThreadObject.model_validate(response)
            logger.info(f"Thread retrieved: {thread.id}")
            return thread
        except ValidationError as ve:
            logger.error(f"Validation error retrieving thread: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error retrieving thread: {str(e)}")
            raise

    def update_thread(self, thread_id: str, params: ThreadUpdateParams) -> ThreadObject:
        try:
            thread_data = params.model_dump(exclude_unset=True)
            response = self.client.update_thread(thread_id, **thread_data)
            thread = ThreadObject.model_validate(response)
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
            return result
        except Exception as e:
            logger.error(f"Error deleting thread: {str(e)}")
            raise
