import logging
from typing import Any, Dict, List, Optional
from .operations import VectorStoreClient
from .parameters import (
    VectorStoreCreateParams,
    VectorStoreUpdateParams,
    VectorStoreFileCreateParams,
    VectorStoreFileBatchCreateParams,
)
from assistant_modules.common.models import (
    VectorStore,
    VectorStoreFile,
    VectorStoreFileBatch,
)
from pydantic import ValidationError

logger = logging.getLogger('vector_store_service')

class VectorStoreService:
    def __init__(self):
        self.client = VectorStoreClient()
    
    # Vector Stores
    def create_vector_store(self, params: VectorStoreCreateParams) -> VectorStore:
        try:
            vector_store_data = params.model_dump(exclude_unset=True)
            response = self.client.create_vector_store(**vector_store_data)
            vector_store = VectorStore.model_validate(response)
            logger.info(f"Vector store created: {vector_store.id}")
            return vector_store
        except (ValidationError, Exception) as e:
            logger.error(f"Error creating vector store: {str(e)}")
            raise
    
    def list_vector_stores(self, limit: int = 20, order: str = 'desc', after: Optional[str] = None, before: Optional[str] = None) -> List[VectorStore]:
        try:
            params = {
                'limit': limit,
                'order': order,
                'after': after,
                'before': before,
            }
            params = {k: v for k, v in params.items() if v is not None}
            response = self.client.list_vector_stores(**params)
            vector_stores = [VectorStore.model_validate(item) for item in response.get('data', [])]
            logger.info("Vector stores listed.")
            return vector_stores
        except (ValidationError, Exception) as e:
            logger.error(f"Error listing vector stores: {str(e)}")
            raise
    
    def retrieve_vector_store(self, vector_store_id: str) -> VectorStore:
        try:
            response = self.client.retrieve_vector_store(vector_store_id)
            vector_store = VectorStore.model_validate(response)
            logger.info(f"Vector store retrieved: {vector_store.id}")
            return vector_store
        except (ValidationError, Exception) as e:
            logger.error(f"Error retrieving vector store: {str(e)}")
            raise
    
    def update_vector_store(self, vector_store_id: str, params: VectorStoreUpdateParams) -> VectorStore:
        try:
            update_data = params.model_dump(exclude_unset=True)
            response = self.client.update_vector_store(vector_store_id, **update_data)
            vector_store = VectorStore.model_validate(response)
            logger.info(f"Vector store updated: {vector_store.id}")
            return vector_store
        except (ValidationError, Exception) as e:
            logger.error(f"Error updating vector store: {str(e)}")
            raise
    
    def delete_vector_store(self, vector_store_id: str) -> Dict[str, Any]:
        try:
            response = self.client.delete_vector_store(vector_store_id)
            logger.info(f"Vector store deleted: {vector_store_id}")
            return response
        except Exception as e:
            logger.error(f"Error deleting vector store: {str(e)}")
            raise
    
    # Vector Store Files
    def create_vector_store_file(self, vector_store_id: str, params: VectorStoreFileCreateParams) -> VectorStoreFile:
        try:
            file_data = params.model_dump(exclude_unset=True)
            response = self.client.create_vector_store_file(vector_store_id, **file_data)
            vector_store_file = VectorStoreFile.model_validate(response)
            logger.info(f"Vector store file created: {vector_store_file.id}")
            return vector_store_file
        except (ValidationError, Exception) as e:
            logger.error(f"Error creating vector store file: {str(e)}")
            raise
    
    def list_vector_store_files(self, vector_store_id: str, limit: int = 20, order: str = 'desc', after: Optional[str] = None, before: Optional[str] = None, filter: Optional[str] = None) -> List[VectorStoreFile]:
        try:
            params = {
                'limit': limit,
                'order': order,
                'after': after,
                'before': before,
                'filter': filter,
            }
            params = {k: v for k, v in params.items() if v is not None}
            response = self.client.list_vector_store_files(vector_store_id, **params)
            vector_store_files = [VectorStoreFile.model_validate(item) for item in response.get('data', [])]
            logger.info(f"Vector store files listed for vector store: {vector_store_id}")
            return vector_store_files
        except (ValidationError, Exception) as e:
            logger.error(f"Error listing vector store files: {str(e)}")
            raise
    
    def retrieve_vector_store_file(self, vector_store_id: str, file_id: str) -> VectorStoreFile:
        try:
            response = self.client.retrieve_vector_store_file(vector_store_id, file_id)
            vector_store_file = VectorStoreFile.model_validate(response)
            logger.info(f"Vector store file retrieved: {vector_store_file.id}")
            return vector_store_file
        except (ValidationError, Exception) as e:
            logger.error(f"Error retrieving vector store file: {str(e)}")
            raise
    
    def delete_vector_store_file(self, vector_store_id: str, file_id: str) -> Dict[str, Any]:
        try:
            response = self.client.delete_vector_store_file(vector_store_id, file_id)
            logger.info(f"Vector store file deleted: {file_id}")
            return response 
        except Exception as e:
            logger.error(f"Error deleting vector store file: {str(e)}")
            raise
    
    # Vector Store File Batches
    def create_vector_store_file_batch(self, vector_store_id: str, params: VectorStoreFileBatchCreateParams) -> VectorStoreFileBatch:
        try:
            batch_data = params.model_dump(exclude_unset=True)
            response = self.client.create_vector_store_file_batch(vector_store_id, **batch_data)
            batch = VectorStoreFileBatch.model_validate(response)
            logger.info(f"Vector store file batch created: {batch.id}")
            return batch
        except (ValidationError, Exception) as e:
            logger.error(f"Error creating vector store file batch: {str(e)}")
            raise
    
    def retrieve_vector_store_file_batch(self, vector_store_id: str, batch_id: str) -> VectorStoreFileBatch:
        try:
            response = self.client.retrieve_vector_store_file_batch(vector_store_id, batch_id)
            batch = VectorStoreFileBatch.model_validate(response)
            logger.info(f"Vector store file batch retrieved: {batch.id}")
            return batch
        except (ValidationError, Exception) as e:
            logger.error(f"Error retrieving vector store file batch: {str(e)}")
            raise
    
    def cancel_vector_store_file_batch(self, vector_store_id: str, batch_id: str) -> VectorStoreFileBatch:
        try:
            response = self.client.cancel_vector_store_file_batch(vector_store_id, batch_id)
            batch = VectorStoreFileBatch.model_validate(response)
            logger.info(f"Vector store file batch cancelled: {batch.id}")
            return batch
        except (ValidationError, Exception) as e:
            logger.error(f"Error cancelling vector store file batch: {str(e)}")
            raise
    
    def list_vector_store_file_batch_files(self, vector_store_id: str, batch_id: str, limit: int = 20, order: str = 'desc', after: Optional[str] = None, before: Optional[str] = None, filter: Optional[str] = None) -> List[VectorStoreFile]:
        try:
            params = {
                'limit': limit,
                'order': order,
                'after': after,
                'before': before,
                'filter': filter,
            }
            params = {k: v for k, v in params.items() if v is not None}
            response = self.client.list_vector_store_file_batch_files(vector_store_id, batch_id, **params)
            files = [VectorStoreFile.model_validate(item) for item in response.get('data', [])]
            logger.info(f"Files listed for vector store file batch: {batch_id}")
            return files
        except (ValidationError, Exception) as e:
            logger.error(f"Error listing files in vector store file batch: {str(e)}")
            raise
