import logging
from typing import Any, Dict, List, Optional

from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist

from assistant_modules.vector_store.services import VectorStoreService
from assistant_modules.vector_store.parameters import (
    VectorStoreCreateParams,
    VectorStoreUpdateParams
)
from apps.assistant.models import VectorStore as DjangoVectorStore
from ..helpers import serialize_pydantic_model
from pydantic import ValidationError

logger = logging.getLogger(__name__)

class VectorStoreIntegrationService:
    def __init__(self):
        self.vector_store_service = VectorStoreService()
    
    @transaction.atomic
    def create_vector_store(self, data: Dict[str, Any], user) -> DjangoVectorStore:
        """
        Creates a VectorStore both in OpenAI and Django database.
        """
        try:
            # Validate and transform data using Pydantic
            params = VectorStoreCreateParams(**data)
            
            # Use vector_store_service to create VectorStore in OpenAI
            vector_store_pydantic = self.vector_store_service.create_vector_store(params)

            # Serialize FileCounts Pydantic obejct
            serialized_file_counts = serialize_pydantic_model(vector_store_pydantic.file_counts)
            
            # Map Pydantic model to Django model
            django_vector_store = DjangoVectorStore.objects.create(
                id=vector_store_pydantic.id,
                object=vector_store_pydantic.object,
                created_at=vector_store_pydantic.created_at,
                name=vector_store_pydantic.name,
                usage_bytes=vector_store_pydantic.usage_bytes,
                file_counts=serialized_file_counts,
                status=vector_store_pydantic.status,
                expires_after=vector_store_pydantic.expires_after.model_dump() if vector_store_pydantic.expires_after else None,
                expires_at=vector_store_pydantic.expires_at,
                last_active_at=vector_store_pydantic.last_active_at,
                metadata=vector_store_pydantic.metadata,
                owner=user
            )
            logger.info(f"VectorStore created in Django DB: {django_vector_store.id}")
            return django_vector_store

        except ValidationError as ve:
            logger.error(f"Pydantic validation error: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error creating VectorStore: {e}")
            raise

    def retrieve_vector_store(self, vector_store_id: str, user) -> DjangoVectorStore:
        """
        Retrieves a VectorStore from OpenAI and updates the Django database.
        """
        try:
            # Use vector_store_service to retrieve VectorStore from OpenAI
            vector_store_pydantic = self.vector_store_service.retrieve_vector_store(vector_store_id)
            
            # Retrieve Django model instance
            django_vector_store = DjangoVectorStore.objects.get(id=vector_store_id, owner=user)
            
            # Serialize FileCounts Pydantic obejct
            serialized_file_counts = serialize_pydantic_model(vector_store_pydantic.file_counts)
            
            # Update Django model fields
            django_vector_store.object = vector_store_pydantic.object
            django_vector_store.created_at = vector_store_pydantic.created_at
            django_vector_store.name = vector_store_pydantic.name
            django_vector_store.usage_bytes = vector_store_pydantic.usage_bytes
            django_vector_store.file_counts = serialized_file_counts
            django_vector_store.status = vector_store_pydantic.status
            django_vector_store.expires_after = vector_store_pydantic.expires_after.model_dump() if vector_store_pydantic.expires_after else None
            django_vector_store.metadata = vector_store_pydantic.metadata
            django_vector_store.save()
            
            logger.info(f"VectorStore retrieved and updated in Django DB: {django_vector_store.id}")
            return django_vector_store

        except ObjectDoesNotExist:
            logger.error(f"VectorStore with ID {vector_store_id} does not exist in Django DB.")
            raise
        except ValidationError as ve:
            logger.error(f"Pydantic validation error: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error retrieving VectorStore: {e}")
            raise

    @transaction.atomic
    def update_vector_store(self, vector_store_id: str, data: Dict[str, Any], user) -> DjangoVectorStore:
        """
        Updates an existing VectorStore in OpenAI and Django database.
        """
        try:
            # Validate and transform data using Pydantic
            params = VectorStoreUpdateParams(**data)
            
            # Use vector_store_service to update VectorStore in OpenAI
            vector_store_pydantic = self.vector_store_service.update_vector_store(vector_store_id, params)
            
            # Retrieve Django model instance
            django_vector_store = DjangoVectorStore.objects.get(id=vector_store_id, owner=user)
            
            # Serialize FileCounts Pydantic obejct
            serialized_file_counts = serialize_pydantic_model(vector_store_pydantic.file_counts)
            
            # Update Django model fields
            django_vector_store.name = vector_store_pydantic.name
            django_vector_store.expires_after = vector_store_pydantic.expires_after.model_dump() if vector_store_pydantic.expires_after else None
            django_vector_store.metadata = vector_store_pydantic.metadata
            django_vector_store.file_counts = serialized_file_counts
            django_vector_store.status = vector_store_pydantic.status
            django_vector_store.save()
            
            logger.info(f"VectorStore updated in Django DB: {django_vector_store.id}")
            return django_vector_store

        except ObjectDoesNotExist:
            logger.error(f"VectorStore with ID {vector_store_id} does not exist in Django DB.")
            raise
        except ValidationError as ve:
            logger.error(f"Pydantic validation error: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error updating VectorStore: {e}")
            raise

    @transaction.atomic
    def delete_vector_store(self, vector_store_id: str, user) -> Dict[str, Any]:
        """
        Deletes a VectorStore from OpenAI and Django database.
        """
        try:
            # Use vector_store_service to delete VectorStore in OpenAI
            result = self.vector_store_service.delete_vector_store(vector_store_id)
            
            # Retrieve and delete Django model instance
            django_vector_store = DjangoVectorStore.objects.get(id=vector_store_id, owner=user)
            django_vector_store.delete()
            
            logger.info(f"VectorStore deleted from Django DB: {vector_store_id}")
            return result

        except ObjectDoesNotExist:
            logger.error(f"VectorStore with ID {vector_store_id} does not exist in Django DB.")
            raise
        except Exception as e:
            logger.error(f"Error deleting VectorStore: {e}")
            raise

    def list_vector_stores(
        self, 
        user,
        limit: int = 20, 
        order: str = 'desc', 
        after: Optional[str] = None, 
        before: Optional[str] = None
    ) -> List[DjangoVectorStore]:
        """
        Lists VectorStores from OpenAI and ensures the Django database is up-to-date.
        """
        try:
            # Use vector_store_service to list VectorStores from OpenAI
            vector_stores_pydantic = self.vector_store_service.list_vector_stores(limit=limit, order=order, after=after, before=before)
            
            # List of Vector Store IDs from API call to track valid records
            ids = []
            django_vector_stores = []
            
            with transaction.atomic():
                for vs_pydantic in vector_stores_pydantic:
                    ids.append(vs_pydantic.id)
                    
                    # Serialize FileCounts and ExpiresAfter Pydantic obejcts
                    serialized_file_counts = serialize_pydantic_model(vs_pydantic.file_counts)
                    
                    django_vector_store, created = DjangoVectorStore.objects.update_or_create(
                        id=vs_pydantic.id,
                        owner=user,
                        defaults={
                            'id': vs_pydantic.id,
                            'object': vs_pydantic.object,
                            'created_at': vs_pydantic.created_at,
                            'name': vs_pydantic.name,
                            'usage_bytes': vs_pydantic.usage_bytes,
                            'file_counts': serialized_file_counts,
                            'status': vs_pydantic.status,
                            'expires_after': vs_pydantic.expires_after.model_dump() if vs_pydantic.expires_after else None,
                            'expires_at':vs_pydantic.expires_at,
                            'last_active_at': vs_pydantic.last_active_at,
                            'metadata': vs_pydantic.metadata,
                            'owner': user
                        }
                    )
                    django_vector_stores.append(django_vector_store)
                
                # Delete any DjangoVectorStore entries for this user not in the API's returned IDs
                DjangoVectorStore.objects.filter(owner=user).exclude(id__in=ids).delete()

                logger.info(f"Listed {len(django_vector_stores)} VectorStores for user: {user.id}")
                return django_vector_stores

        except ValidationError as ve:
            logger.error(f"Pydantic validation error: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error listing VectorStores: {e}")
            raise
