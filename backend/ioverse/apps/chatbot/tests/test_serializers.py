from django.test import TestCase
from rest_framework.test import APIRequestFactory
from ..models import Conversation, Message
from ..serializers import MessageSerializer, ReadOnlyConversationSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class SerializerTestCase(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user1 = User.objects.create_user(username='john_doe', email='john@example.com', password='password123')
        cls.user2 = User.objects.create_user(username='jane_smith', email='jane@example.com', password='password456')
        cls.factory = APIRequestFactory()
        cls.conversation1 = Conversation.objects.create(user=cls.user1, title='Existing Conversation')

    def serialize_message(self, message):
        serializer = MessageSerializer(instance=message)
        return serializer.data

    def deserialize_message(self, data, user):
        request = self.factory.post('/messages/', data, format='json')
        request.user = user
        serializer = MessageSerializer(data=data, context={'request': request})
        return serializer

    def test_message_serialization(self):
        """Test serialization of a Message instance."""
        message = Message.objects.create(conversation=self.conversation1, sender='user', message_body='Hello AI!')
        serialized = self.serialize_message(message)
        self.assertEqual(serialized['id'], message.id)
        self.assertEqual(serialized['conversation_id'], self.conversation1.id)
        self.assertEqual(serialized['message_body'], 'Hello AI!')
        self.assertEqual(serialized['sender'], 'user')
        self.assertIsNotNone(serialized['timestamp'])

    def test_message_validation_new_conversation(self):
        """Test validation of a message without conversation_id (new conversation)."""
        data = {'message_body': 'This is a new message.'}
        serializer = self.deserialize_message(data, self.user1)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_message_validation_existing_conversation(self):
        """Test validation of a message with a valid conversation_id."""
        data = {'conversation_id': self.conversation1.id, 'message_body': 'Continuing the conversation.'}
        serializer = self.deserialize_message(data, self.user1)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_message_validation_invalid_conversation(self):
        """Test validation of a message with an invalid conversation_id."""
        data = {'conversation_id': 999, 'message_body': 'Invalid conversation.'}
        serializer = self.deserialize_message(data, self.user1)
        self.assertFalse(serializer.is_valid())
        self.assertIn('conversation_id', serializer.errors)
        self.assertEqual(serializer.errors['conversation_id'][0], 'Invalid conversation ID.')

    def test_message_validation_empty_body(self):
        """Test validation of an empty message_body."""
        data = {'message_body': '   '}
        serializer = self.deserialize_message(data, self.user1)
        self.assertFalse(serializer.is_valid())
        self.assertIn('message_body', serializer.errors)
        self.assertEqual(serializer.errors['message_body'][0], 'Message content cannot be empty.')

    def test_message_validation_exceeds_max_length(self):
        """Test validation of a message that exceeds the maximum allowed length."""
        data = {'message_body': 'A' * 1001}
        serializer = self.deserialize_message(data, self.user1)
        self.assertFalse(serializer.is_valid())
        self.assertIn('message_body', serializer.errors)
        self.assertEqual(serializer.errors['message_body'][0], 'Message content exceeds the maximum allowed length.')

    def test_read_only_conversation_serialization(self):
        """Test serialization of a Conversation with nested messages."""
        msg1 = Message.objects.create(conversation=self.conversation1, sender='user', message_body='Hello AI!')
        msg2 = Message.objects.create(conversation=self.conversation1, sender='ai', message_body='Hello John!')
        serializer = ReadOnlyConversationSerializer(instance=self.conversation1)
        serialized = serializer.data
        self.assertEqual(serialized['id'], self.conversation1.id)
        self.assertEqual(serialized['title'], 'Existing Conversation')
        self.assertEqual(serialized['user_username'], self.user1.username)
        self.assertIsNotNone(serialized['created_at'])
        self.assertIsNotNone(serialized['updated_at'])
        self.assertEqual(len(serialized['messages']), 2)
        self.assertEqual(serialized['messages'][0]['message_body'], 'Hello AI!')
        self.assertEqual(serialized['messages'][1]['message_body'], 'Hello John!')

    # Test cases for __str__ methods of models
    def test_conversation_str_representation(self):
        """Test the __str__ method of the Conversation model."""
        expected_str = f"Conversation {self.conversation1.id} with {self.user1.username}"
        self.assertEqual(str(self.conversation1), expected_str)

    def test_message_str_representation(self):
        """Test the __str__ method of the Message model."""
        message = Message.objects.create(conversation=self.conversation1, sender='user', message_body='Hello AI!')
        expected_str = "User: Hello AI!"
        self.assertEqual(str(message), expected_str)
