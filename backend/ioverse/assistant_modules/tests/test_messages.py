import unittest
from unittest.mock import MagicMock
from assistant_modules.messages.services import MessageService
from assistant_modules.messages.parameters import MessageCreateParams
from assistant_modules.common.models import TextContentPart, TextContent, MessageObject

class TestMessageService(unittest.TestCase):
    def setUp(self):
        self.service = MessageService()
        self.service.client = MagicMock()

    def test_create_message(self):
        # Arrange
        text_content = TextContent(value='Hello, how does AI work?', annotations=[])
        text_part = TextContentPart(type='text', text=text_content)
        message_params = MessageCreateParams(
            role='user',
            content=[text_part],
            metadata={'user_id': 'user_123'}
        )
        self.service.client.create_message.return_value = {
            'id': 'msg_abc123',
            'object': 'thread.message',
            'created_at': 1699061776,
            'role': 'user',
            'content': [{
                'type': 'text',
                'text': {
                    'value': 'Hello, how does AI work?',
                    'annotations': []
                }
            }],
            'attachments': [],
            'metadata': {'user_id': 'user_123'},
            'thread_id': 'thread_abc123',
        }

        # Act
        message = self.service.create_message('thread_abc123', message_params)

        # Assert
        self.assertIsInstance(message, MessageObject)
        self.assertEqual(message.id, 'msg_abc123')
        self.assertEqual(message.role, 'user')
        self.assertEqual(message.content[0].type, 'text')
        self.assertEqual(message.content[0].text.value, 'Hello, how does AI work?')
        self.assertEqual(message.metadata, {'user_id': 'user_123'})
        self.assertEqual(message.thread_id, 'thread_abc123')

if __name__ == '__main__':
    unittest.main()
