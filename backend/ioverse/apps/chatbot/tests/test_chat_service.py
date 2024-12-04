from django.test import TestCase
from apps.chatbot.services.chat_service import ChatService
from django.contrib.auth import get_user_model

User = get_user_model()

class ChatServiceTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.chat_service = ChatService(api_key="test_api_key")

    def test_process_user_message_new_conversation(self):
        message_body = "Hello, AI!"
        user_message, ai_message = self.chat_service.process_user_message(
            user=self.user,
            message_body=message_body
        )

        # Test user's message
        self.assertEqual(user_message.sender, 'user')
        self.assertEqual(user_message.message_body, message_body)
        self.assertIsNotNone(user_message.conversation)

        # Test AI's response
        self.assertEqual(ai_message.sender, 'ai')
        self.assertEqual(ai_message.conversation, user_message.conversation)
        self.assertIsNotNone(ai_message.message_body)
