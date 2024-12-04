import unittest
from unittest.mock import MagicMock
from assistant_modules.assistant.parameters import AssistantParams
from assistant_modules.common.models import AllowedModels, Assistant
from assistant_modules.assistant.services import AssistantService

class TestAssistantService(unittest.TestCase):
    def setUp(self):
        self.service = AssistantService(api_key="mock_api_key")
        self.service.client = MagicMock()

    def test_create_assistant(self):
        # Arrange
        assistant_params = AssistantParams(
            model=AllowedModels.GPT_4,
            name="Test Assistant",
            description="A test assistant",
            instructions="You are a helpful assistant.",
            tools=[],
            metadata={"purpose": "testing"}
        )
        self.service.client.create_assistant.return_value = {
            'id': 'asst_abc123',
            'object': 'assistant',
            'created_at': 1699061776,
            'name': 'Test Assistant',
            'description': 'A test assistant',
            'model': 'gpt-4',
            'instructions': 'You are a helpful assistant.',
            'tools': [],
            'metadata': {'purpose': 'testing'},
            'temperature': 1.0,
            'top_p': 1.0,
            'response_format': 'auto'
        }

        # Act
        assistant = self.service.create_assistant(assistant_params)

        # Assert
        self.assertIsInstance(assistant, Assistant)
        self.assertEqual(assistant.id, 'asst_abc123')
        self.assertEqual(assistant.name, 'Test Assistant')
        self.assertEqual(assistant.model, 'gpt-4')
        self.assertEqual(assistant.metadata, {'purpose': 'testing'})

if __name__ == '__main__':
    unittest.main()
