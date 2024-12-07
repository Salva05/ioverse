import logging
from typing import Optional, Dict, Any, List

from .operations import MessageClient
from .parameters import MessageCreateParams, MessageUpdateParams
from assistant_modules.common.models import MessageObject
from pydantic import ValidationError

logger = logging.getLogger('message_service')

class MessageService:
    def __init__(self, api_key: str):
        self.client = MessageClient(api_key=api_key)

    def create_message(self, thread_id: str, params: MessageCreateParams) -> MessageObject:
        try:
            message_data = params.model_dump(exclude_unset=True)
            response = self.client.create_message(thread_id, **message_data)
            
            # Convert OpenAI Message instance to dict
            response_dict = response.model_dump()
            
            message = MessageObject.model_validate(response_dict)
            logger.info(f"Message created: {message.id}")
            return message
        except ValidationError as ve:
            logger.error(f"Validation error creating message: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error creating message: {str(e)}")
            raise

    def retrieve_message(self, thread_id: str, message_id: str) -> MessageObject:
        try:
            response = self.client.retrieve_message(thread_id, message_id)
            
            # Convert OpenAI Message instance to dict
            response_dict = response.model_dump()
            
            message = MessageObject.model_validate(response_dict)
            logger.info(f"Message retrieved: {message.id}")
            return message
        except ValidationError as ve:
            logger.error(f"Validation error retrieving message: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error retrieving message: {str(e)}")
            raise

    def update_message(self, thread_id: str, message_id: str, params: MessageUpdateParams) -> MessageObject:
        try:
            update_data = params.model_dump(exclude_unset=True)
            response = self.client.update_message(thread_id, message_id, **update_data)
            
            # Convert OpenAI Message instance to dict
            response_dict = response.model_dump()
            
            message = MessageObject.model_validate(response_dict)
            logger.info(f"Message updated: {message.id}")
            return message
        except ValidationError as ve:
            logger.error(f"Validation error updating message: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error updating message: {str(e)}")
            raise

    def delete_message(self, thread_id: str, message_id: str) -> Dict[str, Any]:
        try:
            result = self.client.delete_message(thread_id, message_id)
            logger.info(f"Message deleted: {message_id}")
            return result.model_dump()
        except Exception as e:
            logger.error(f"Error deleting message: {str(e)}")
            raise

    def list_messages(
        self, 
        thread_id: str, 
        limit: int = 20, 
        order: str = 'desc', 
        after: Optional[str] = None, 
        before: Optional[str] = None, 
        run_id: Optional[str] = None
    ) -> List[MessageObject]:
        try:
            params = {
                'limit': limit,
                'order': order,
                'after': after,
                'before': before,
                'run_id': run_id
            }
            # Remove None values
            params = {k: v for k, v in params.items() if v is not None}
            response = self.client.list_messages(thread_id, **params)
            
            # Convert OpenAI Message instance to dict
            response_dict = response.model_dump()
            
            messages = [MessageObject.model_validate(msg) for msg in response_dict.get('data', [])]
            logger.info(f"Messages listed for thread: {thread_id}")
            return messages
        except ValidationError as ve:
            logger.error(f"Validation error listing messages: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error listing messages: {str(e)}")
            raise
