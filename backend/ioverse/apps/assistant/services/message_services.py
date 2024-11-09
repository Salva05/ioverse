import logging
from typing import Any, Dict, List, Optional

from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist

from assistant_modules.message.services import MessageService
from assistant_modules.message.parameters import (
    MessageCreateParams,
    MessageUpdateParams
)
from apps.assistant.models import Message as DjangoMessage
from ..helpers import serialize_pydantic_list
from pydantic import ValidationError

logger = logging.getLogger(__name__)

class MessageIntegrationService:
    def __init__(self):
        self.message_service = MessageService()
    
    @transaction.atomic
    def create_message(self, thread_id: str, data: Dict[str, Any], user) -> DjangoMessage:
        """
        Creates a Message both in OpenAI and Django database.
        """
        try:
            # Validate and transform data using Pydantic
            params = MessageCreateParams(**data)
            
            # Use assistant_modules to create Message in OpenAI
            message_pydantic = self.message_service.create_message(thread_id, params)
        
            # Serialize content parts
            serialized_content = serialize_pydantic_list(message_pydantic.content)
        
            # Serialize the attachments list if it's not empty
            serialized_attachments = serialize_pydantic_list(message_pydantic.attachments)
        
            # Map Pydantic model to Django model
            django_message = DjangoMessage.objects.create(
                id=message_pydantic.id,
                object=message_pydantic.object,
                created_at=message_pydantic.created_at,
                thread_id=message_pydantic.thread_id,
                role=message_pydantic.role,
                content=serialized_content,
                attachments=serialized_attachments,
                metadata=message_pydantic.metadata,
                owner=user,
                assistant_id=message_pydantic.assistant_id,
                run_id=message_pydantic.run_id,
                incomplete_details=message_pydantic.incomplete_details,
                completed_at=message_pydantic.completed_at,
                incomplete_at=message_pydantic.incomplete_at
            )
            logger.info(f"Message created in Django DB: {django_message.id}")
            return django_message

        except ValidationError as ve:
            logger.error(f"Pydantic validation error: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error creating message: {e}")
            raise

    def retrieve_message(self, thread_id: str, message_id: str, user) -> DjangoMessage:
        """
        Retrieves a Message from OpenAI and updates the Django database.
        """
        try:
            # Use assistant_modules to retrieve Message from OpenAI
            message_pydantic = self.message_service.retrieve_message(thread_id, message_id)
            
            # Retrieve Django model instance
            django_message = DjangoMessage.objects.get(id=message_id, thread_id=thread_id, owner=user)
            
            # Serialize content parts
            serialized_content = serialize_pydantic_list(message_pydantic.content)
        
            # Serialize the attachments list if it's not empty
            serialized_attachments = serialize_pydantic_list(message_pydantic.attachments)
        
            # Update Django model fields
            django_message.object = message_pydantic.object
            django_message.created_at = message_pydantic.created_at
            django_message.role = message_pydantic.role
            django_message.content = serialized_content
            django_message.attachments = serialized_attachments
            django_message.metadata = message_pydantic.metadata
            django_message.assistant_id = message_pydantic.assistant_id
            django_message.run_id = message_pydantic.run_id
            django_message.incomplete_details = message_pydantic.incomplete_details
            django_message.completed_at = message_pydantic.completed_at
            django_message.incomplete_at = message_pydantic.incomplete_at
            django_message.save()
            
            logger.info(f"Message retrieved and updated in Django DB: {django_message.id}")
            return django_message

        except ObjectDoesNotExist:
            logger.error(f"Message with ID {message_id} does not exist in Django DB.")
            raise
        except ValidationError as ve:
            logger.error(f"Pydantic validation error: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error retrieving message: {e}")
            raise

    @transaction.atomic
    def update_message(self, thread_id: str, message_id: str, data: Dict[str, Any], user) -> DjangoMessage:
        """
        Updates an existing Message in OpenAI and Django database.
        """
        try:
            # Validate and transform data using Pydantic
            params = MessageUpdateParams(**data)
            
            # Use assistant_modules to update Message in OpenAI
            message_pydantic = self.message_service.update_message(thread_id, message_id, params)
            
            # Retrieve Django model instance
            django_message = DjangoMessage.objects.get(id=message_id, thread_id=thread_id, owner=user)
            
            # Serialize content parts
            serialized_content = serialize_pydantic_list(message_pydantic.content)
        
            # Serialize the attachments list if it's not empty
            serialized_attachments = serialize_pydantic_list(message_pydantic.attachments)
            
            # Update Django model fields
            django_message.object = message_pydantic.object
            django_message.created_at = message_pydantic.created_at
            django_message.role = message_pydantic.role
            django_message.content = serialized_content
            django_message.attachments = serialized_attachments
            django_message.metadata = message_pydantic.metadata
            django_message.assistant_id = message_pydantic.assistant_id
            django_message.run_id = message_pydantic.run_id
            django_message.incomplete_details = message_pydantic.incomplete_details
            django_message.completed_at = message_pydantic.completed_at
            django_message.incomplete_at = message_pydantic.incomplete_at
            django_message.save()
            
            logger.info(f"Message updated in Django DB: {django_message.id}")
            return django_message

        except ObjectDoesNotExist:
            logger.error(f"Message with ID {message_id} does not exist in Django DB.")
            raise
        except ValidationError as ve:
            logger.error(f"Pydantic validation error: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error updating message: {e}")
            raise

    @transaction.atomic
    def delete_message(self, thread_id: str, message_id: str, user) -> Dict[str, Any]:
        """
        Deletes a Message from OpenAI and Django database.
        """
        try:
            # Use assistant_modules to delete Message in OpenAI
            result = self.message_service.delete_message(thread_id, message_id)
            
            # Retrieve and delete Django model instance
            django_message = DjangoMessage.objects.get(id=message_id, thread_id=thread_id, owner=user)
            django_message.delete()
            
            logger.info(f"Message deleted from Django DB: {message_id}")
            return result

        except ObjectDoesNotExist:
            logger.error(f"Message with ID {message_id} does not exist in Django DB.")
            raise
        except Exception as e:
            logger.error(f"Error deleting message: {e}")
            raise

    def list_messages(
        self, 
        thread_id: str, 
        user,
        limit: int = 20, 
        order: str = 'desc', 
        after: Optional[str] = None, 
        before: Optional[str] = None, 
        run_id: Optional[str] = None
    ) -> List[DjangoMessage]:
        """
        Lists Messages from OpenAI and ensures the Django database is up-to-date.
        """
        try:
            # Use assistant_modules to list Messages from OpenAI
            messages_pydantic = self.message_service.list_messages(
                thread_id=thread_id,
                limit=limit,
                order=order,
                after=after,
                before=before,
                run_id=run_id
            )
            
            # Iterate through messages and update/create Django models
            django_messages = []
            ids = []    # Stores the ids of API models for later batch deletion of Django's one
            
            for msg_pydantic in messages_pydantic:
                ids.append(msg_pydantic.id)
                # Serialize content parts
                serialized_content = serialize_pydantic_list(msg_pydantic.content)
            
                # Serialize the attachments list if it's not empty
                serialized_attachments = serialize_pydantic_list(msg_pydantic.attachments)
                django_message, created = DjangoMessage.objects.update_or_create(
                    id=msg_pydantic.id,
                    thread_id=thread_id,
                    owner=user,
                    defaults={
                        'id': msg_pydantic.id,
                        'object': msg_pydantic.object,
                        'created_at': msg_pydantic.created_at,
                        'role': msg_pydantic.role,
                        'content': serialized_content,
                        'attachments': serialized_attachments,
                        'metadata': msg_pydantic.metadata,
                        'assistant_id': msg_pydantic.assistant_id,
                        'run_id': msg_pydantic.run_id,
                        'incomplete_details': msg_pydantic.incomplete_details,
                        'completed_at': msg_pydantic.completed_at,
                        'incomplete_at': msg_pydantic.incomplete_at,
                        'owner': user
                    }
                )
                django_messages.append(django_message)
            
            # Delete any Message entries for this user not in the API's returned IDs
            DjangoMessage.objects.filter(owner=user).exclude(id__in=ids).delete()
            
            logger.info(f"Listed {len(django_messages)} messages for thread: {thread_id}")
            return django_messages

        except ValidationError as ve:
            logger.error(f"Pydantic validation error: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error listing messages: {e}")
            raise
