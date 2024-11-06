from django.test import TestCase
from django.core.exceptions import ValidationError
from apps.assistant.models.assistant import Assistant
from apps.assistant.models.thread import Thread
from apps.assistant.models.message import Message
from apps.assistant.models.vectorstore import VectorStore
from apps.assistant.models.vectorstorefile import VectorStoreFile

class AssistantModelTest(TestCase):
    def test_assistant_creation_success(self):
        assistant = Assistant.objects.create(
            name="Test Assistant",
            description="A helpful assistant.",
            model="gpt-4",
            instructions="Assist with queries.",
            temperature=0.5,
            top_p=0.9,
            response_format={"format": "json"}
        )
        self.assertEqual(assistant.object, 'assistant')
        self.assertEqual(assistant.temperature, 0.5)
        self.assertEqual(assistant.top_p, 0.9)

    def test_assistant_invalid_object(self):
        assistant = Assistant(
            name="Invalid Assistant",
            description="Invalid object field.",
            model="gpt-4",
            instructions="Assist with queries.",
            temperature=0.5,
            top_p=0.9,
            response_format={"format": "json"},
            object="invalid_object"
        )
        with self.assertRaises(ValidationError) as context:
            assistant.full_clean()
        self.assertIn("object", context.exception.message_dict)

    def test_assistant_temperature_out_of_range(self):
        assistant = Assistant(
            name="Low Temp Assistant",
            description="Temperature below range.",
            model="gpt-4",
            instructions="Assist with queries.",
            temperature=-0.1,
            top_p=0.9,
            response_format={"format": "json"}
        )
        with self.assertRaises(ValidationError):
            assistant.full_clean()


class ThreadModelTest(TestCase):
    def test_thread_creation_success(self):
        thread = Thread.objects.create(
            tool_resources={"tool_key": "tool_value"},
            metadata={"source": "unit_test"}
        )
        self.assertEqual(thread.object, 'thread')
        self.assertEqual(thread.tool_resources, {"tool_key": "tool_value"})
        self.assertEqual(thread.metadata, {"source": "unit_test"})

    def test_thread_invalid_object(self):
        thread = Thread(
            tool_resources={"tool_key": "tool_value"},
            metadata={"source": "unit_test"},
            object="invalid_object"
        )
        with self.assertRaises(ValidationError):
            thread.full_clean()


class MessageModelTest(TestCase):
    def setUp(self):
        self.thread = Thread.objects.create(
            tool_resources={"tool_key": "tool_value"},
            metadata={"source": "unit_test"}
        )

    def test_message_creation_success(self):
        content = [
            {
                'type': 'text',
                'text': {'value': 'Hello!'},
                'annotations': []
            }
        ]
        message = Message.objects.create(
            thread_id=self.thread.id,
            status='completed',
            role='assistant',
            content=content,
            metadata={"source": "unit_test"}
        )
        self.assertEqual(message.object, 'thread.message')
        self.assertEqual(message.status, 'completed')
        self.assertEqual(message.role, 'assistant')
        self.assertEqual(message.content, content)

    def test_message_invalid_object(self):
        message = Message(
            thread_id=self.thread.id,
            status='completed',
            role='assistant',
            content=[],
            object='invalid_object'
        )
        with self.assertRaises(ValidationError):
            message.full_clean()

    def test_message_missing_incomplete_details(self):
        message = Message(
            thread_id=self.thread.id,
            status='incomplete',
            role='assistant',
            content=[]
            # incomplete_details not provided
        )
        with self.assertRaises(ValidationError):
            message.full_clean()


class VectorStoreModelTest(TestCase):
    def test_vectorstore_creation_success(self):
        vector_store = VectorStore.objects.create(
            name="Test VectorStore",
            usage_bytes=100000,
            file_counts={
                'in_progress': 0,
                'completed': 50,
                'cancelled': 0,
                'failed': 0,
                'total': 50
            },
            status='completed',
            expires_after={
                'anchor': 'last_active_at',
                'days': 30,
                'expires_at': None,
                'last_active_at': 1700000000
            },
            metadata={"purpose": "testing"}
        )
        self.assertEqual(vector_store.object, 'vector_store')
        self.assertEqual(vector_store.status, 'completed')
        self.assertEqual(vector_store.name, "Test VectorStore")
        self.assertEqual(vector_store.usage_bytes, 100000)

    def test_vectorstore_invalid_object(self):
        vector_store = VectorStore(
            name="Invalid VectorStore",
            usage_bytes=100000,
            file_counts={
                'in_progress': 0,
                'completed': 50,
                'cancelled': 0,
                'failed': 0,
                'total': 50
            },
            status='completed',
            expires_after={
                'anchor': 'last_active_at',
                'days': 30,
                'expires_at': None,
                'last_active_at': 1700000000
            },
            object='invalid_object'
        )
        with self.assertRaises(ValidationError):
            vector_store.full_clean()

    def test_vectorstore_invalid_status(self):
        vector_store = VectorStore(
            name="Invalid Status VectorStore",
            usage_bytes=100000,
            file_counts={
                'in_progress': 0,
                'completed': 50,
                'cancelled': 0,
                'failed': 0,
                'total': 50
            },
            status='unknown_status',
            expires_after={
                'anchor': 'last_active_at',
                'days': 30,
                'expires_at': None,
                'last_active_at': 1700000000
            }
        )
        with self.assertRaises(ValidationError):
            vector_store.full_clean()


class VectorStoreFileModelTest(TestCase):
    def setUp(self):
        self.vector_store = VectorStore.objects.create(
            name="Test VectorStore",
            usage_bytes=100000,
            file_counts={
                'in_progress': 0,
                'completed': 50,
                'cancelled': 0,
                'failed': 0,
                'total': 50
            },
            status='completed',
            expires_after={
                'anchor': 'last_active_at',
                'days': 30,
                'expires_at': None,
                'last_active_at': 1700000000
            },
            metadata={"purpose": "testing"}
        )

    def test_vectorstorefile_creation_success_static(self):
        chunking_strategy = {
            'type': 'static',
            'static': {
                'max_chunk_size_tokens': 800,
                'chunk_overlap_tokens': 400
            }
        }
        vector_store_file = VectorStoreFile.objects.create(
            vector_store_id=self.vector_store.id,
            usage_bytes=50000,
            status='completed',
            chunking_strategy=chunking_strategy,
            metadata={"file_type": "text"}
        )
        self.assertEqual(vector_store_file.object, 'vector_store.file')
        self.assertEqual(vector_store_file.status, 'completed')
        self.assertEqual(vector_store_file.vector_store_id, self.vector_store.id)
        self.assertEqual(vector_store_file.chunking_strategy, chunking_strategy)

    def test_vectorstorefile_invalid_object(self):
        vector_store_file = VectorStoreFile(
            vector_store_id=self.vector_store.id,
            usage_bytes=50000,
            status='completed',
            chunking_strategy={},
            object='invalid_object'
        )
        with self.assertRaises(ValidationError):
            vector_store_file.full_clean()

    def test_vectorstorefile_invalid_status(self):
        chunking_strategy = {
            'type': 'static',
            'static': {
                'max_chunk_size_tokens': 800,
                'chunk_overlap_tokens': 400
            }
        }
        vector_store_file = VectorStoreFile(
            vector_store_id=self.vector_store.id,
            usage_bytes=50000,
            status='unknown_status',
            chunking_strategy=chunking_strategy,
            metadata={}
        )
        with self.assertRaises(ValidationError):
            vector_store_file.full_clean()

    def test_vectorstorefile_invalid_chunking_strategy(self):
        # Exceeding chunk_overlap_tokens
        chunking_strategy = {
            'type': 'static',
            'static': {
                'max_chunk_size_tokens': 800,
                'chunk_overlap_tokens': 500  # Should not exceed 400
            }
        }
        vector_store_file = VectorStoreFile(
            vector_store_id=self.vector_store.id,
            usage_bytes=50000,
            status='completed',
            chunking_strategy=chunking_strategy,
            metadata={}
        )
        with self.assertRaises(ValidationError):
            vector_store_file.full_clean()
