import unittest
from unittest.mock import MagicMock
from assistant_modules.vector_stores.services import VectorStoreService
from assistant_modules.vector_stores.parameters import (
    VectorStoreCreateParams,
    VectorStoreUpdateParams,
    VectorStoreFileCreateParams,
    VectorStoreFileBatchCreateParams,
)
from assistant_modules.common.models import ExpiresAfter, ChunkingStrategy

class TestVectorStoreService(unittest.TestCase):
    def setUp(self):
        self.service = VectorStoreService()
        # Mock the client methods to avoid actual API calls
        self.service.client = MagicMock()

    def test_create_vector_store(self):
        # Arrange
        create_params = VectorStoreCreateParams(
            name="Test Vector Store",
            file_ids=["file-abc123"],
            expires_after=ExpiresAfter(anchor="last_active_at", days=30),
            metadata={"project": "test_project"}
        )
        self.service.client.create_vector_store.return_value = {
            'id': 'vs_abc123',
            'object': 'vector_store',
            'created_at': 1699061776,
            'name': 'Test Vector Store',
            'metadata': {'project': 'test_project'}
        }

        # Act
        vector_store = self.service.create_vector_store(create_params)

        # Assert
        self.assertEqual(vector_store.id, 'vs_abc123')
        self.assertEqual(vector_store.name, 'Test Vector Store')
        self.assertEqual(vector_store.metadata['project'], 'test_project')

    def test_retrieve_vector_store(self):
        # Arrange
        self.service.client.retrieve_vector_store.return_value = {
            'id': 'vs_abc123',
            'object': 'vector_store',
            'created_at': 1699061776,
            'name': 'Test Vector Store',
            'status': 'completed'
        }

        # Act
        vector_store = self.service.retrieve_vector_store('vs_abc123')

        # Assert
        self.assertEqual(vector_store.id, 'vs_abc123')
        self.assertEqual(vector_store.status, 'completed')

    def test_update_vector_store(self):
        # Arrange
        update_params = VectorStoreUpdateParams(
            name="Updated Vector Store",
            metadata={"updated": "true"}
        )
        self.service.client.update_vector_store.return_value = {
            'id': 'vs_abc123',
            'object': 'vector_store',
            'created_at': 1699061776,
            'name': 'Updated Vector Store',
            'metadata': {'updated': 'true'}
        }

        # Act
        vector_store = self.service.update_vector_store('vs_abc123', update_params)

        # Assert
        self.assertEqual(vector_store.name, 'Updated Vector Store')
        self.assertEqual(vector_store.metadata['updated'], 'true')

    def test_delete_vector_store(self):
        # Arrange
        self.service.client.delete_vector_store.return_value = {
            'id': 'vs_abc123',
            'object': 'vector_store.deleted',
            'deleted': True
        }

        # Act
        response = self.service.delete_vector_store('vs_abc123')

        # Assert
        self.assertTrue(response['deleted'])

    def test_list_vector_stores(self):
        # Arrange
        self.service.client.list_vector_stores.return_value = {
            'object': 'list',
            'data': [
                {
                    'id': 'vs_abc123',
                    'object': 'vector_store',
                    'created_at': 1699061776,
                    'name': 'Vector Store 1',
                },
                {
                    'id': 'vs_def456',
                    'object': 'vector_store',
                    'created_at': 1699061777,
                    'name': 'Vector Store 2',
                },
            ]
        }

        # Act
        vector_stores = self.service.list_vector_stores()

        # Assert
        self.assertEqual(len(vector_stores), 2)
        self.assertEqual(vector_stores[0].name, 'Vector Store 1')
        self.assertEqual(vector_stores[1].name, 'Vector Store 2')

    def test_create_vector_store_file(self):
        # Arrange
        create_params = VectorStoreFileCreateParams(
            file_id="file-abc123",
            chunking_strategy=ChunkingStrategy(
                type="static",
                static={
                    "max_chunk_size_tokens": 800,
                    "chunk_overlap_tokens": 400
                }
            )
        )
        self.service.client.create_vector_store_file.return_value = {
            'id': 'file-abc123',
            'object': 'vector_store.file',
            'created_at': 1699061776,
            'vector_store_id': 'vs_abc123',
            'status': 'in_progress',
            'usage_bytes': 0,
        }

        # Act
        vector_store_file = self.service.create_vector_store_file('vs_abc123', create_params)

        # Assert
        self.assertEqual(vector_store_file.id, 'file-abc123')
        self.assertEqual(vector_store_file.status, 'in_progress')

    def test_create_vector_store_file_batch(self):
        # Arrange
        batch_params = VectorStoreFileBatchCreateParams(
            file_ids=["file-abc123", "file-abc456"],
            chunking_strategy=ChunkingStrategy(type="auto")
        )
        self.service.client.create_vector_store_file_batch.return_value = {
            'id': 'vsfb_abc123',
            'object': 'vector_store.file_batch',
            'created_at': 1699061776,
            'vector_store_id': 'vs_abc123',
            'status': 'in_progress',
            'file_counts': {
                'in_progress': 2,
                'completed': 0,
                'failed': 0,
                'cancelled': 0,
                'total': 2,
            }
        }

        # Act
        batch = self.service.create_vector_store_file_batch('vs_abc123', batch_params)

        # Assert
        self.assertEqual(batch.id, 'vsfb_abc123')
        self.assertEqual(batch.status, 'in_progress')
        self.assertEqual(batch.file_counts.total, 2)

if __name__ == '__main__':
    unittest.main()
