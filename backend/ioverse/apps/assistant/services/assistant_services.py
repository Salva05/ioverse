import logging
from typing import Any, Dict

from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist

from assistant_modules.assistant.parameters import AssistantParams, AssistantListParam
from assistant_modules.assistant.services import AssistantService
from apps.assistant.models import Assistant as DjangoAssistant
from pydantic import ValidationError

logger = logging.getLogger(__name__)

class AssistantIntegrationService:
    def __init__(self):
        self.assistant_service = AssistantService()

    @transaction.atomic
    def create_assistant(self, data: Dict[str, Any], user) -> DjangoAssistant:
        """
        Creates an Assistant both in OpenAI and Django database.
        """
        try:
            # Validate and transform data using Pydantic
            params = AssistantParams(**data)
            
            # Use assistant_modules to create Assistant in OpenAI
            assistant_pydantic = self.assistant_service.create_assistant(params)
            
            # Map Pydantic model to Django model
            django_assistant = DjangoAssistant.objects.create(
                id=assistant_pydantic.id,
                object=assistant_pydantic.object,
                created_at=assistant_pydantic.created_at,
                owner=user,
                name=assistant_pydantic.name,
                description=assistant_pydantic.description,
                model=assistant_pydantic.model,
                instructions=assistant_pydantic.instructions,
                tools=assistant_pydantic.tools,
                tool_resources=assistant_pydantic.tool_resources.model_dump() if assistant_pydantic.tool_resources else None,
                temperature=assistant_pydantic.temperature,
                top_p=assistant_pydantic.top_p,
                response_format=assistant_pydantic.response_format,
                metadata=assistant_pydantic.metadata
            )
            logger.info(f"Assistant created in Django DB: {django_assistant.id}")
            return django_assistant

        except ValidationError as ve:
            logger.error(f"Pydantic validation error: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error creating assistant: {e}")
            raise

    def retrieve_assistant(self, assistant_id: str, user) -> DjangoAssistant:
        """
        Retrieves an Assistant from OpenAI and updates the Django database.
        """
        try:
            # Use assistant_modules to retrieve Assistant from OpenAI
            assistant_pydantic = self.assistant_service.retrieve_assistant(assistant_id)
            
            # Retrieve Django model instance
            django_assistant = DjangoAssistant.objects.get(id=assistant_id, owner=user)
            
            # Update Django model fields
            django_assistant.object = assistant_pydantic.object
            django_assistant.created_at = assistant_pydantic.created_at
            django_assistant.name = assistant_pydantic.name
            django_assistant.description = assistant_pydantic.description
            django_assistant.model = assistant_pydantic.model
            django_assistant.instructions = assistant_pydantic.instructions
            django_assistant.tools = assistant_pydantic.tools
            django_assistant.tool_resources = assistant_pydantic.tool_resources.dict() if assistant_pydantic.tool_resources else None
            django_assistant.temperature = assistant_pydantic.temperature
            django_assistant.top_p = assistant_pydantic.top_p
            django_assistant.response_format = assistant_pydantic.response_format
            django_assistant.metadata = assistant_pydantic.metadata
            django_assistant.save()
            
            logger.info(f"Assistant retrieved and updated in Django DB: {django_assistant.id}")
            return django_assistant

        except ObjectDoesNotExist:
            logger.error(f"Assistant with ID {assistant_id} does not exist in Django DB.")
            raise
        except ValidationError as ve:
            logger.error(f"Pydantic validation error: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error retrieving assistant: {e}")
            raise

    @transaction.atomic
    def update_assistant(self, assistant_id: str, data: Dict[str, Any], user) -> DjangoAssistant:
        """
        Updates an existing Assistant in OpenAI and Django database.
        """
        try:
            params = AssistantParams(**data)
            assistant_pydantic = self.assistant_service.update_assistant(assistant_id, params)
            django_assistant = DjangoAssistant.objects.get(id=assistant_id, owner=user)
            django_assistant.name = assistant_pydantic.name
            django_assistant.description = assistant_pydantic.description
            django_assistant.model = assistant_pydantic.model
            django_assistant.instructions = assistant_pydantic.instructions
            django_assistant.tools = assistant_pydantic.tools
            django_assistant.tool_resources = assistant_pydantic.tool_resources.dict() if assistant_pydantic.tool_resources else None
            django_assistant.temperature = assistant_pydantic.temperature
            django_assistant.top_p = assistant_pydantic.top_p
            django_assistant.response_format = assistant_pydantic.response_format
            django_assistant.metadata = assistant_pydantic.metadata
            django_assistant.save()
            logger.info(f"Assistant updated in Django DB: {django_assistant.id}")
            return django_assistant
        except ObjectDoesNotExist:
            logger.error(f"Assistant with ID {assistant_id} does not exist in Django DB.")
            raise
        except ValidationError as ve:
            logger.error(f"Pydantic validation error: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error updating assistant: {e}")
            raise
        
    @transaction.atomic
    def delete_assistant(self, assistant_id: str, user) -> Dict[str, Any]:
        """
        Deletes an Assistant from OpenAI and Django database.
        """
        try:
            result = self.assistant_service.delete_assistant(assistant_id)
            django_assistant = DjangoAssistant.objects.get(id=assistant_id, owner=user)
            django_assistant.delete()
            logger.info(f"Assistant deleted from Django DB: {assistant_id}")
            return result
        except ObjectDoesNotExist:
            logger.error(f"Assistant with ID {assistant_id} does not exist in Django DB.")
            raise
        except Exception as e:
            logger.error(f"Error deleting assistant: {e}")
            raise

    def list_assistants(self, data: Dict[str, Any], user) -> list[DjangoAssistant]:
        """
        List Assistants from OpenAI and update the Django database.
        """
        try:
            # Validate and transform data using Pydantic
            params = AssistantListParam(**data)
            
            # Use AssistantService to list Assistants from OpenAI
            assistants_pydantic = self.assistant_service.list_assistants(params)
            django_assistants = []
            
            for assistant_pydantic in assistants_pydantic:
                # Try to get an existing Assistant from the Django database
                django_assistant, created = DjangoAssistant.objects.update_or_create(
                    id=assistant_pydantic.id,
                    owner=user,
                    defaults={
                        'object': assistant_pydantic.object,
                        'created_at': assistant_pydantic.created_at,
                        'owner': user,
                        'name': assistant_pydantic.name,
                        'description': assistant_pydantic.description,
                        'model': assistant_pydantic.model,
                        'instructions': assistant_pydantic.instructions,
                        'tools': assistant_pydantic.tools,
                        'tool_resources': assistant_pydantic.tool_resources.model_dump() if assistant_pydantic.tool_resources else None,
                        'temperature': assistant_pydantic.temperature,
                        'top_p': assistant_pydantic.top_p,
                        'response_format': assistant_pydantic.response_format,
                        'metadata': assistant_pydantic.metadata,
                    }
                )
                
                # Log creation or update
                if created:
                    logger.info(f"New assistant added to Django DB: {django_assistant.id}")
                else:
                    logger.info(f"Existing assistant updated in Django DB: {django_assistant.id}")
                
                # Add to the list of Django assistant instances
                django_assistants.append(django_assistant)
            
            return django_assistants

        except ValidationError as ve:
            logger.error(f"Pydantic validation error in listing assistants: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error listing assistants: {e}")
            raise
            