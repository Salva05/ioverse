import logging
from typing import Any, Dict, List, Optional

from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist

from assistant_modules.vector_store.services import VectorStoreService
from assistant_modules.vector_store.parameters import (
    VectorStoreFileCreateParams
)
from apps.assistant.models import VectorStoreFile as DjangoVectorStoreFile
from ..helpers import serialize_pydantic_model
from pydantic import ValidationError

logger = logging.getLogger(__name__)

class VectorStoreFileIntegrationService:
    def __init__(self):
        self.vector_store_file_service = VectorStoreService()
    
    @transaction.atomic
    def create_vector_store_file(self, data: Dict[str, Any], user) -> DjangoVectorStoreFile:
        """
        Creates a VectorStoreFile both in OpenAI and Django database.
        """
        try:
            # Validate and transform data using Pydantic
            params = VectorStoreFileCreateParams(**data)
            
            vector_store_file_pydantic = self.vector_store_file_service.create_vector_store_file(params)
        
            # Map Pydantic model to Django model
            django_vector_store_file = DjangoVectorStoreFile.objects.create(
                id=vector_store_file_pydantic.id,
                object=vector_store_file_pydantic.object,
                created_at=vector_store_file_pydantic.created_at,
                usage_bytes=vector_store_file_pydantic.usage_bytes,
                status=vector_store_file_pydantic.status,
                vector_store_id=vector_store_file_pydantic.vector_store_id,
                last_error=vector_store_file_pydantic.last_error,
                chunking_strategy=vector_store_file_pydantic.chunking_strategy.model_dump() if vector_store_file_pydantic.chunking_strategy else None,
                owner=user
            )
            logger.info(f"VectorStoreFile created in Django DB: {django_vector_store_file.id}")
            return django_vector_store_file

        except ValidationError as ve:
            logger.error(f"Pydantic validation error: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error creating VectorStore: {e}")
            raise

    def retrieve_vector_store_file(self, vector_store_file_id: str, user) -> DjangoVectorStoreFile:
        """
        Retrieves a VectorStoreFile from OpenAI and updates the Django database.
        """
        try:
            vector_store_file_pydantic = self.vector_store_file_service.retrieve_vector_store_file(vector_store_file_id)
            django_vector_store_file = DjangoVectorStoreFile.objects.get(id=vector_store_file_id, owner=user)

            # Update Django model fields
            django_vector_store_file.object = vector_store_file_pydantic.object
            django_vector_store_file.created_at = vector_store_file_pydantic.created_at
            django_vector_store_file.usage_bytes = vector_store_file_pydantic.usage_bytes
            django_vector_store_file.vector_store_id = vector_store_file_pydantic.vector_store_id
            django_vector_store_file.status = vector_store_file_pydantic.status
            django_vector_store_file.chunking_strategy = vector_store_file_pydantic.chunking_strategy.model_dump() if vector_store_file_pydantic.chunking_strategy else None,
            django_vector_store_file.last_error = vector_store_file_pydantic.last_error.model_dump() if vector_store_file_pydantic.last_error else None
            django_vector_store_file.save()
            
            logger.info(f"VectorStore retrieved and updated in Django DB: {django_vector_store_file.id}")
            return django_vector_store_file

        except ObjectDoesNotExist:
            logger.error(f"VectorStoreFile with ID {vector_store_file_id} does not exist in Django DB.")
            raise
        except ValidationError as ve:
            logger.error(f"Pydantic validation error: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error retrieving VectorStore: {e}")
            raise

    @transaction.atomic
    def delete_vector_store_file(self, vector_store_file_id: str, user) -> Dict[str, Any]:
        """
        Deletes a VectorStoreFile from OpenAI and Django database.
        """
        try:
            result = self.vector_store_file_service.delete_vector_store_file(vector_store_file_id)
            
            django_vector_store_file = DjangoVectorStoreFile.objects.get(id=vector_store_file_id, owner=user)
            django_vector_store_file.delete()
            
            logger.info(f"VectorStoreFile deleted from Django DB: {vector_store_file_id}")
            return result

        except ObjectDoesNotExist:
            logger.error(f"VectorStoreFile with ID {vector_store_file_id} does not exist in Django DB.")
            raise
        except Exception as e:
            logger.error(f"Error deleting VectorStore: {e}")
            raise

    def list_vector_store_files(
        self, 
        user,
        vector_store_id,
        limit: int = 20, 
        order: str = 'desc',
        after: Optional[str] = None, 
        before: Optional[str] = None,
        filter: Optional[str] = None,
    ) -> List[DjangoVectorStoreFile]:
        """
        Lists VectorStoresFile from OpenAI and ensures the Django database is up-to-date.
        """
        try:
            vector_store_files_pydantic = self.vector_store_file_service.list_vector_store_files(vector_store_id, limit=limit, order=order, after=after, before=before, filter=filter)
            
            # List of Vector Store File IDs from API call to track valid records
            ids = []
            django_vector_store_files = []
            
            with transaction.atomic():
                for vsf_pydantic in vector_store_files_pydantic:
                    ids.append(vsf_pydantic.id)
                    
                    django_vector_store_file, created = DjangoVectorStoreFile.objects.update_or_create(
                        id=vsf_pydantic.id,
                        owner=user,
                        defaults={
                            'id': vsf_pydantic.id,
                            'object': vsf_pydantic.object,
                            'created_at': vsf_pydantic.created_at,
                            'usage_bytes': vsf_pydantic.usage_bytes,
                            'status': vsf_pydantic.status,
                            'last_error': vsf_pydantic.last_error.model_dump() if vsf_pydantic.last_error else None,
                            'chunking_strategy': vsf_pydantic.chunking_strategy.model_dump() if vsf_pydantic.chunking_strategy else None,
                            'vector_store_id': vsf_pydantic.vector_store_id,
                            'owner': user
                        }
                    )
                    django_vector_store_files.append(django_vector_store_file)
                
                # Delete any DjangoVectorStoreFile entries for this user not in the API's returned IDs
                DjangoVectorStoreFile.objects.filter(owner=user).exclude(id__in=ids).delete()

                logger.info(f"Listed {len(django_vector_store_files)} VectorStoresFile for user: {user.id}")
                return django_vector_store_files

        except ValidationError as ve:
            logger.error(f"Pydantic validation error: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error listing VectorStoresFile: {e}")
            raise
