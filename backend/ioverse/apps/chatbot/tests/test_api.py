from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from ..models import Conversation, Message
from unittest.mock import patch
from django.contrib.auth import get_user_model

User = get_user_model()

class MessageCreateViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.url = reverse('messages-list')
        self.conversation = Conversation.objects.create(user=self.user, title='Existing Conversation')

    @patch('apps.chatbot.services.chat_service.Chatbot.get_response')
    def test_create_message_new_conversation(self, mock_get_response):
        """Test creating a message without providing conversation_id."""
        
        mock_get_response.return_value = 'Mock AI response'
        data = {"message_body": "Hello, starting a new conversation!"}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Conversation.objects.filter(user=self.user).count(), 2)
        user_message_id = response.data['user_message']['id']
        user_message = Message.objects.get(id=user_message_id)
        self.assertEqual(user_message.message_body, data['message_body'])
        self.assertEqual(user_message.sender, 'user')
        ai_message_id = response.data['ai_message']['id']
        ai_message = Message.objects.get(id=ai_message_id)
        self.assertEqual(ai_message.sender, 'ai')
        self.assertEqual(ai_message.message_body, 'Mock AI response')

    @patch('apps.chatbot.services.chat_service.Chatbot.get_response')
    def test_create_message_existing_conversation(self, mock_get_response):
        """Test adding a message to an existing conversation."""
        mock_get_response.return_value = 'Mock AI response'
        data = {
            "message_body": "Continuing the existing conversation.",
            "conversation_id": self.conversation.id
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user_message_id = response.data['user_message']['id']
        user_message = Message.objects.get(id=user_message_id)
        self.assertEqual(user_message.message_body, data['message_body'])
        self.assertEqual(user_message.sender, 'user')
        self.assertEqual(user_message.conversation, self.conversation)
        ai_message_id = response.data['ai_message']['id']
        ai_message = Message.objects.get(id=ai_message_id)
        self.assertEqual(ai_message.sender, 'ai')
        self.assertEqual(ai_message.conversation, self.conversation)
        self.assertEqual(ai_message.message_body, 'Mock AI response')

    def test_create_message_invalid_conversation_id(self):
        """Test creating a message with an invalid conversation_id."""
        data = {
            "message_body": "This should fail due to invalid conversation ID.",
            "conversation_id": 999  # Non-existent ID
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('conversation_id', response.data)
        self.assertEqual(response.data['conversation_id'][0], "Invalid conversation ID.")

    def test_create_message_empty_body(self):
        """Test creating a message with an empty message_body."""
        data = {
            "message_body": "   ",
            "conversation_id": self.conversation.id
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('message_body', response.data)
        self.assertEqual(response.data['message_body'][0], "Message content cannot be empty.")

    def test_create_message_exceeds_max_length(self):
        """Test creating a message that exceeds the maximum allowed length."""
        data = {
            "message_body": "A" * 1001,
            "conversation_id": self.conversation.id
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('message_body', response.data)
        self.assertEqual(response.data['message_body'][0], "Message content exceeds the maximum allowed length.")
    
    @patch('apps.chatbot.services.chat_service.Chatbot.get_response')
    def test_rate_limiting_exceeded(self, mock_get_response):
        """Test that the 11th request is rate-limited."""
        
        mock_get_response.return_value = 'Mock AI response'
        data = {"message_body": "Test message.", "conversation_id": self.conversation.id}

        # Authenticate the client before sending requests
        self.client.force_authenticate(user=self.user)

        # Send 10 valid requests
        for _ in range(10):
            self.client.post(self.url, data, format='json')

        # The 11th request should be rate-limited - failed
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertIn('detail', response.data)
        self.assertTrue('Request was throttled' in str(response.data['detail']))


    def test_create_message_without_message_body(self):
        """Test creating a message without providing message_body."""
        data = {"conversation_id": self.conversation.id}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('message_body', response.data)
        self.assertEqual(response.data['message_body'][0], "Message content is required.")
