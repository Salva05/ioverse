import unittest
from unittest.mock import patch
from assistant_modules.assistant.services import AssistantService
from assistant_modules.assistant.parameters import AssistantParams, AllowedModels
from assistant_modules.common.models import Assistant

class TestAssistantService(unittest.TestCase):
    def setUp(self):
        self.service = AssistantService()
        self.params = AssistantParams(
            model=AllowedModels.GPT_3_5_TURBO,
            name="Test Assistant",
            description="A test assistant",
            instructions="You are a helpful assistant.",
            tools=[],
            temperature=0.7,
            top_p=0.9,
            response_format='auto',
            metadata={"purpose": "testing"}
        )

    @patch('assistant_modules.assistant.operations.AssistantClient.create_assistant')
    def test_create_assistant(self, mock_create_assistant):
        # Mock the response from the OpenAI API
        mock_create_assistant.return_value = {
            'id': 'assistant-1234',
            'object': 'assistant',
            'created_at': 1699061776,
            'name': self.params.name,
            'description': self.params.description,
            'model': self.params.model.value,
            'instructions': self.params.instructions,
            'tools': [],
            'tool_resources': None,
            'metadata': self.params.metadata,
            'temperature': self.params.temperature,
            'top_p': self.params.top_p,
            'response_format': self.params.response_format
        }

        assistant = self.service.create_assistant(self.params)

        # Assertions to verify the assistant was created correctly
        self.assertIsInstance(assistant, Assistant)
        self.assertEqual(assistant.id, 'assistant-1234')
        self.assertEqual(assistant.name, self.params.name)
        self.assertEqual(assistant.description, self.params.description)
        self.assertEqual(assistant.model, self.params.model.value)
        self.assertEqual(assistant.metadata, self.params.metadata)

        # Verify that the create_assistant method was called with correct parameters
        mock_create_assistant.assert_called_once_with(**self.params.model_dump())

if __name__ == '__main__':
    unittest.main()
