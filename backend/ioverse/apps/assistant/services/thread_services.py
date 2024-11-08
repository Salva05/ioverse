import logging
from typing import Any, Dict

from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist

from ..helpers import serialize_pydantic_list, serialize_pydantic_model
from assistant_modules.thread.services import ThreadService
from assistant_modules.thread.parameters import ThreadCreateParams, ThreadUpdateParams
from apps.assistant.models import Thread as DjangoThread
from pydantic import ValidationError

logger = logging.getLogger(__name__)

class ThreadIntegrationService:
    def __init__(self):
        self.thread_service = ThreadService()
        
    @transaction.atomic
    def create_thread(self, data: Dict[str, Any], user) -> DjangoThread:
        """
        Creates a Thread both in OpenAI and Django database.
        """
        try:
            # Validate and transform data using Pydantic
            params = ThreadCreateParams(**data)
            
            # Use assistant_modules to create Thread in OpenAI
            thread_pydantic = self.thread_service.create_thread(params)
            
            # Serialize tool_resources correctly using the new helper
            serialized_tool_resources = serialize_pydantic_model(thread_pydantic.tool_resources)
            
            # Map Pydantic model to Django model
            django_thread = DjangoThread.objects.create(
                id=thread_pydantic.id,
                object=thread_pydantic.object,
                created_at=thread_pydantic.created_at,
                tool_resources=serialized_tool_resources,
                metadata=thread_pydantic.metadata,
                owner=user
            )
            logger.info(f"Thread created in Django DB: {django_thread.id}")
            return django_thread

        except ValidationError as ve:
            logger.error(f"Pydantic validation error: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error creating thread: {e}")
            raise

    def retrieve_thread(self, thread_id: str, user) -> DjangoThread:
        """
        Retrieves a Thread from OpenAI and updates the Django database.
        """
        try:
            # Use assistant_modules to retrieve Thread from OpenAI
            thread_pydantic = self.thread_service.retrieve_thread(thread_id)
            
            # Retrieve Django model instance
            django_thread = DjangoThread.objects.get(id=thread_id, owner=user)
            
            # Serialize tool_resources correctly using the new helper
            serialized_tool_resources = serialize_pydantic_model(thread_pydantic.tool_resources)
            
            # Update Django model fields
            django_thread.id=thread_pydantic.id
            django_thread.object=thread_pydantic.object
            django_thread.created_at=thread_pydantic.created_at
            django_thread.tool_resources=serialized_tool_resources
            django_thread.metadata=thread_pydantic.metadata
            django_thread.save()
            
            logger.info(f"Thread retrieved and updated in Django DB: {django_thread.id}")
            return django_thread

        except ObjectDoesNotExist:
            logger.error(f"Thread with ID {thread_id} does not exist in Django DB.")
            raise
        except ValidationError as ve:
            logger.error(f"Pydantic validation error: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error retrieving thread: {e}")
            raise
    
    @transaction.atomic
    def update_thread(self, thread_id: str, data: Dict[str, Any], user) -> DjangoThread:
        """
        Updates an existing Thread in OpenAI and Django database.
        """
        try:
            params = ThreadUpdateParams(**data)
            thread_pydantic = self.thread_service.update_thread(thread_id, params)
            django_thread = DjangoThread.objects.get(id=thread_id, owner=user)
            
            # Serialize tool_resources correctly using the new helper
            serialized_tool_resources = serialize_pydantic_model(thread_pydantic.tool_resources)
            
            django_thread.id=thread_pydantic.id
            django_thread.object=thread_pydantic.object
            django_thread.created_at=thread_pydantic.created_at
            django_thread.tool_resources=serialized_tool_resources
            django_thread.metadata=thread_pydantic.metadata
            django_thread.save()
            logger.info(f"Thread updated in Django DB: {django_thread.id}")
            return django_thread
        except ObjectDoesNotExist:
            logger.error(f"Thread with ID {thread_id} does not exist in Django DB.")
            raise
        except ValidationError as ve:
            logger.error(f"Pydantic validation error: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error updating thread: {e}")
            raise
        
    @transaction.atomic
    def delete_thread(self, thread_id: str, user) -> Dict[str, Any]:
        """
        Deletes a Thread from OpenAI and Django database.
        """
        try:
            result = self.thread_service.delete_thread(thread_id)
            django_thread = DjangoThread.objects.get(id=thread_id, owner=user)
            django_thread.delete()
            logger.info(f"Thread deleted from Django DB: {thread_id}")
            return result
        except ObjectDoesNotExist:
            logger.error(f"Thread with ID {thread_id} does not exist in Django DB.")
            raise
        except Exception as e:
            logger.error(f"Error deleting thread: {e}")
            raise