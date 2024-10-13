from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth.models import User
from ..models import Conversation, Message
from django.utils import timezone

class MessageCreateViewTests(APITestCase):
    def setUp(self):
        # Create a user and authenticate the client
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
        # URL for creating messages
        self.url = reverse('message-create')
        
        # Create an existing conversation
        self.conversation = Conversation.objects.create(user=self.user, title='Existing Conversation')
        
    def test_create_message_new_conversation(self):
        """
        Test creating a message without providing conversation_id.
        A new conversation should be created.
        """
        data = {
            "message_body": "Hello, starting a new conversation!"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify that a new conversation was created
        self.assertEqual(Conversation.objects.filter(user=self.user).count(), 2)
        
        # Verify the user message details
        user_message_id = response.data['user_message']['id']
        user_message = Message.objects.get(id=user_message_id)
        self.assertEqual(user_message.message_body, data['message_body'])
        self.assertEqual(user_message.sender, 'user')
        self.assertEqual(user_message.conversation.user, self.user)
        
        # Verify the AI message details
        ai_message_id = response.data['ai_message']['id']
        ai_message = Message.objects.get(id=ai_message_id)
        self.assertEqual(ai_message.sender, 'ai')
        self.assertEqual(ai_message.conversation, user_message.conversation)
        
    def test_create_message_existing_conversation(self):
        """
        Test adding a message to an existing conversation.
        """
        data = {
            "message_body": "Continuing the existing conversation.",
            "conversation_id": self.conversation.id
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify the user message details
        user_message_id = response.data['user_message']['id']
        user_message = Message.objects.get(id=user_message_id)
        self.assertEqual(user_message.message_body, data['message_body'])
        self.assertEqual(user_message.sender, 'user')
        self.assertEqual(user_message.conversation, self.conversation)
        
        # Verify the AI message details
        ai_message_id = response.data['ai_message']['id']
        ai_message = Message.objects.get(id=ai_message_id)
        self.assertEqual(ai_message.sender, 'ai')
        self.assertEqual(ai_message.conversation, self.conversation)
        
    def test_create_message_invalid_conversation_id(self):
        """
        Test creating a message with an invalid conversation_id.
        """
        data = {
            "message_body": "This should fail due to invalid conversation ID.",
            "conversation_id": 999  # Assuming this ID does not exist
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('conversation_id', response.data)
        self.assertEqual(response.data['conversation_id'][0], "Invalid conversation ID.")
        
    def test_create_message_empty_body(self):
        """
        Test creating a message with an empty message_body.
        """
        data = {
            "message_body": "   ",  # Only whitespace
            "conversation_id": self.conversation.id
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('message_body', response.data)
        self.assertEqual(response.data['message_body'][0], "Message content cannot be empty.")
        
    def test_create_message_exceeds_max_length(self):
        """
        Test creating a message that exceeds the maximum allowed length.
        """
        data = {
            "message_body": "A" * 1001,  # 1001 characters
            "conversation_id": self.conversation.id
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('message_body', response.data)
        self.assertEqual(response.data['message_body'][0], "Message content exceeds the maximum allowed length.")
        
    def test_rate_limiting_exceeded(self):
        """
        Test sending too many messages in a short period to trigger rate limiting.
        """
        # Send 10 messages within 10 seconds
        for _ in range(10):
            Message.objects.create(
                conversation=self.conversation,
                sender='user',
                message_body='Spam message',
                timestamp=timezone.now()
            )
        
        data = {
            "message_body": "This should fail due to rate limiting.",
            "conversation_id": self.conversation.id
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', response.data)
        self.assertEqual(
            response.data['non_field_errors'][0],
            "Too many messages have been sent in a short period of time."
        )
        
    def test_sender_assignment_ai_after_user(self):
        """
        Test that the sender is set to 'ai' after the user sends a message.
        """
        # First, user sends a message
        data_user = {
            "message_body": "User message."
        }
        response_user = self.client.post(self.url, data_user, format='json')
        self.assertEqual(response_user.status_code, status.HTTP_201_CREATED)
        message_user = Message.objects.get(id=response_user.data['user_message']['id'])
        self.assertEqual(message_user.sender, 'user')
        
        # Mock AI sending a response by directly creating a message with sender='ai'
        data_ai = {
            "message_body": "ai response.",
            "conversation_id": message_user.conversation.id
        }
        # Simulate AI sending a message by forcing the sender
        # Since sender is read-only, this would normally be handled internally
        # So create message directly
        ai_message = Message.objects.create(
            conversation=message_user.conversation,
            sender='ai',
            message_body=data_ai['message_body']
        )
        self.assertEqual(ai_message.sender, 'ai')
        
        # Now, when user sends another message, sender should be 'user' again
        data_user_2 = {
            "message_body": "Another user message.",
            "conversation_id": message_user.conversation.id
        }
        response_user_2 = self.client.post(self.url, data_user_2, format='json')
        self.assertEqual(response_user_2.status_code, status.HTTP_201_CREATED)
        message_user_2 = Message.objects.get(id=response_user_2.data['user_message']['id'])
        self.assertEqual(message_user_2.sender, 'user')
        
    def test_sender_assignment_user_after_ai(self):
        """
        Test that the sender is set to 'user' after AI sends a message.
        """
        # Mock AI sends the first message
        ai_message = Message.objects.create(
            conversation=self.conversation,
            sender='ai',
            message_body='AI initiates the conversation.'
        )
        self.assertEqual(ai_message.sender, 'ai')
        
        # Now, user sends a message; sender should be 'user'
        data_user = {
            "message_body": "User responds."
        }
        response_user = self.client.post(self.url, data_user, format='json')
        self.assertEqual(response_user.status_code, status.HTTP_201_CREATED)
        message_user = Message.objects.get(id=response_user.data['user_message']['id'])
        self.assertEqual(message_user.sender, 'user')
        
    def test_create_message_without_message_body(self):
        """
        Test creating a message without providing message_body.
        """
        data = {
            "conversation_id": self.conversation.id
            # Missing 'message_body'
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('message_body', response.data)
        self.assertEqual(response.data['message_body'][0], "Message content is required.")
