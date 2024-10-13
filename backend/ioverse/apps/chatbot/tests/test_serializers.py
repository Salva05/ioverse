from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIRequestFactory
from ..models import Conversation, Message
from ..serializers import MessageSerializer, ReadOnlyConversationSerializer

class SerializerTestCase(TestCase):
    @classmethod    # class-level data set up
    def setUpTestData(cls):
        # Create test users
        cls.user1 = User.objects.create_user(username='john_doe', email='john@example.com', password='password123')
        cls.user2 = User.objects.create_user(username='jane_smith', email='jane@example.com', password='password456')
        
        # Initialize APIRequestFactory
        cls.factory = APIRequestFactory()
        
        # Create an existing conversation for user1
        cls.conversation1 = Conversation.objects.create(user=cls.user1, title='Existing Conversation')
        
    def serialize_message(self, message):
        serializer = MessageSerializer(instance=message)
        return serializer.data
    
    def deserialize_message(self, data, user):
        request = self.factory.post('/messages/', data, format='json')  # mock endpoint
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
    
    def test_message_creation_new_conversation(self):
        """Test creating a message without conversation_id (new conversation)."""
        data = {'message_body': 'This is a new message.'}
        serializer = self.deserialize_message(data, self.user1)
        
        self.assertTrue(serializer.is_valid(), serializer.errors)
        message = serializer.save()
        
        # Verify conversation creation
        self.assertEqual(message.conversation.user, self.user1)
        self.assertEqual(message.conversation.title, 'New Conversation')    # This is using the mock title from the serializer
        self.assertEqual(message.sender, 'user')
        self.assertEqual(message.message_body, 'This is a new message.')
    
    def test_message_creation_existing_conversation(self):
        """Test creating a message with a valid conversation_id."""
        data = {'conversation_id': self.conversation1.id, 'message_body': 'Continuing the conversation.'}
        serializer = self.deserialize_message(data, self.user1)
        
        self.assertTrue(serializer.is_valid(), serializer.errors)
        message = serializer.save()
        
        # Verify association with existing conversation
        self.assertEqual(message.conversation, self.conversation1)
        self.assertEqual(message.sender, 'user')
        self.assertEqual(message.message_body, 'Continuing the conversation.')
    
    def test_message_creation_invalid_conversation(self):
        """Test creating a message with an invalid conversation_id."""
        data = {'conversation_id': 999, 'message_body': 'Invalid conversation.'}
        serializer = self.deserialize_message(data, self.user1)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('conversation_id', serializer.errors)
        self.assertEqual(serializer.errors['conversation_id'][0], 'Invalid conversation ID.')
    
    def test_read_only_conversation_serialization(self):
        """Test serialization of a Conversation with nested messages."""
        # Create messages
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
