import unittest
from unittest.mock import MagicMock
from assistant_modules.thread.parameters import ThreadCreateParams
from assistant_modules.common.models import Message, TextContentPart, TextContent
from assistant_modules.thread.services import ThreadService, ThreadObject

class TestThreadService(unittest.TestCase):
    def setUp(self):
        self.service = ThreadService(api_key="mock_api_key")
        self.service.client = MagicMock()

    def test_create_thread(self):
        # Arrange
        text_content = TextContent(value='Hello, assistant!', annotations=[])
        text_part = TextContentPart(type='text', text=text_content)
        message = Message(
            role='user',
            content=[text_part],
            metadata={'message_id': 'msg001'}
        )
        thread_params = ThreadCreateParams(
            messages=[message],
            metadata={'thread_topic': 'Greeting'}
        )
        self.service.client.create_thread.return_value = {
            'id': 'thread_abc123',
            'object': 'thread',
            'created_at': 1699061776,
            'metadata': {'thread_topic': 'Greeting'},
            'tool_resources': {}
        }

        # Act
        thread = self.service.create_thread(thread_params)

        # Assert
        self.assertIsInstance(thread, ThreadObject)
        self.assertEqual(thread.id, 'thread_abc123')
        self.assertEqual(thread.metadata, {'thread_topic': 'Greeting'})

if __name__ == '__main__':
    unittest.main()
