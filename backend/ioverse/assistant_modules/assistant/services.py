import logging
from typing import Any, Dict
from .operations import AssistantClient
from .parameters import AssistantParams, AssistantListParam, AssistantParamsUpdate
from assistant_modules.common.models import Assistant
from pydantic import ValidationError

logger = logging.getLogger('assistant_service')

# OpenAI's response for an assistant whose response_format is set to json_schema
# weirdly contains a trailing '_' in the "schema" field that is not accepted 
# when the same response is sent back to OpenAI, causing an error        
def remove_trailing_underscore(response_dict: dict) -> dict:
    """
    Removes the trailing underscore from the `schema_` key in the
    `response_format` -> `json_schema` of the given response dictionary.
    """
    if 'response_format' in response_dict and 'json_schema' in response_dict['response_format']:
        schema = response_dict['response_format']['json_schema']
        if 'schema_' in schema:
            schema['schema'] = schema.pop('schema_')  # Rename key from 'schema_' to 'schema'
    return response_dict
    
            
class AssistantService:
    def __init__(self):
        self.client = AssistantClient()

    def create_assistant(self, params: AssistantParams) -> Assistant:
        try:
            assistant_data = params.model_dump(exclude_unset=False)
            response = self.client.create_assistant(**assistant_data)
        
            # Convert OpenAI Assistant instance to dict
            response_dict = response.model_dump()
            response_dict = remove_trailing_underscore(response_dict)

            assistant = Assistant.model_validate(response_dict)
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
            
            # Convert OpenAI Assistant instance to dict
            response_dict = response.model_dump()
            
            # Check and fix trailing underscore in `response_format` -> `json_schema` -> `schema_`
            if 'response_format' in response_dict and 'json_schema' in response_dict['response_format']:
                schema = response_dict['response_format']['json_schema']
                if 'schema_' in schema:
                    schema['schema'] = schema.pop('schema_')  # Rename key from 'schema_' to 'schema'    
            
            assistant = Assistant.model_validate(response_dict)
            logger.info(f"Assistant retrieved: {assistant.id}")
            return assistant
        except ValidationError as ve:
            logger.error(f"Validation error retrieving assistant: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error retrieving assistant: {str(e)}")
            raise

    def list_assistants(self, params: AssistantListParam) -> list[Assistant]:
        try:
            list_params = params.model_dump(exclude_unset=False)
            response = self.client.list_assistants(**list_params)

            # Convert OpenAI Assistant List instance to dict 
            response_dict = response.model_dump()
            for item in response_dict['data']:
                item = remove_trailing_underscore(item)
                        
            # Map each item to the Assistant model
            assistants = [Assistant.model_validate(item) for item in response_dict['data']]
            
            logger.info(f"{len(assistants)} assistants retrieved successfully.")
            return assistants
        except ValidationError as ve:
            logger.error(f"Validation error listing assistants: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error listing assistants: {str(e)}")
            raise
        
    def update_assistant(self, assistant_id: str, params: AssistantParamsUpdate) -> Assistant:
        try:
            assistant_data = params.model_dump(exclude_unset=True)
            assistant_data = {k: v for k, v in assistant_data.items() if v is not None or v == ""}
            response = self.client.update_assistant(assistant_id, **assistant_data)
            
            # Convert OpenAI Assistant instance to dict
            response_dict = response.model_dump()
            response_dict = remove_trailing_underscore(response_dict)
                    
            assistant = Assistant.model_validate(response_dict)
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
            return result.model_dump()
        except Exception as e:
            logger.error(f"Error deleting assistant: {str(e)}")
            raise
