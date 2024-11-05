import logging
from typing import Any, Dict
from .operations import AssistantClient
from .parameters import AssistantParams
from assistant_modules.common.models import Assistant
from pydantic import ValidationError

logger = logging.getLogger('assistant_service')


class AssistantService:
    def __init__(self):
        self.client = AssistantClient()

    def create_assistant(self, params: AssistantParams) -> Assistant:
        try:
            assistant_data = params.model_dump(exclude_unset=False)
            response = self.client.create_assistant(**assistant_data)
            assistant = Assistant.model_validate(response)
            logger.info(f"Assistant created: {assistant.id}")
            return assistant
        except ValidationError as ve:
            logger.error(f"Validation error creating assistant: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error creating assistant: {str(e)}")
            raise

    def retrieve_assistant(self, assistant_id: str) -> Assistant:
        try:
            response = self.client.retrieve_assistant(assistant_id)
            assistant = Assistant.model_validate(response)
            logger.info(f"Assistant retrieved: {assistant.id}")
            return assistant
        except ValidationError as ve:
            logger.error(f"Validation error retrieving assistant: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error retrieving assistant: {str(e)}")
            raise

    def update_assistant(self, assistant_id: str, params: AssistantParams) -> Assistant:
        try:
            assistant_data = params.model_dump(exclude_unset=True)
            response = self.client.update_assistant(assistant_id, **assistant_data)
            assistant = Assistant.model_validate(response)
            logger.info(f"Assistant updated: {assistant.id}")
            return assistant
        except ValidationError as ve:
            logger.error(f"Validation error updating assistant: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error updating assistant: {str(e)}")
            raise

    def delete_assistant(self, assistant_id: str) -> Dict[str, Any]:
        try:
            result = self.client.delete_assistant(assistant_id)
            logger.info(f"Assistant deleted: {assistant_id}")
            return result
        except Exception as e:
            logger.error(f"Error deleting assistant: {str(e)}")
            raise
