import time
import logging
from typing import Any, Dict

from django.urls import reverse

from assistant_modules.vector_store.services import VectorStoreService
from assistant_modules.vector_store.parameters import (
    VectorStoreFileBatchCreateParams,
)
from pydantic import ValidationError

logger = logging.getLogger(__name__)

class VectorStoreBatchIntegrationService:
    def __init__(self):
        self.vector_store_service = VectorStoreService()
        
    def create_vector_store_batch(self, vector_store_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Creates a Vector Store Batch in OpenAI.
        """
        try:
            params = VectorStoreFileBatchCreateParams(**data)
            batch = self.vector_store_service.create_vector_store_file_batch(params)

             # Add the sse_url to the model instance
            batch.sse_url = reverse(
                'vector_store_batch-status',
                kwargs={
                    'vector_store_id': batch.vector_store_id,
                    'batch_id': batch.id,
                }
            )

            logger.info(f"Vector Store Batch created: {batch.id}")
            return batch.model_dump()

        except ValidationError as ve:
            logger.error(f"Pydantic validation error: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error creating Vector Store Batch: {e}")
            raise
        
    def poll_vector_store_batch_status(self, vector_store_id: str, batch_id: str, polling_interval=5, timeout=300):
        """
        Polls the status of a vector store batch operation.

        Args:
            vector_store_id (str): The ID of the vector store hosting the batch.
            batch_id (str): The ID of the batch to poll.
            polling_interval (int): Time (in seconds) to wait between polls.
            timeout (int): Maximum time (in seconds) to poll before giving up.

        Yields:
            JSON: Progress updates for the vector store.
        """
        start_time = time.time()

        while True:
            # Timeout handling
            if time.time() - start_time > timeout:
                yield {"status": "timeout", "message": "Polling timed out"}
                break
            try:
                # Poll vector store status
                vector_store_batch_pydantic = self.vector_store_service.retrieve_vector_store_file_batch(vector_store_id, batch_id)
                
                # If completed, update Django model
                if vector_store_batch_pydantic.status == "completed":
                    yield vector_store_batch_pydantic.model_dump()
                    break
                else:
                    yield vector_store_batch_pydantic.model_dump()
            except Exception as e:
                logger.error(f"Error while polling Vector Store Batch {batch_id}: {e}")
                yield {"status": "error", "message": str(e)}
                break

            # Delay
            time.sleep(polling_interval)