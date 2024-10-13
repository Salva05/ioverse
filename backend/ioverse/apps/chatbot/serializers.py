from rest_framework import serializers
from .models import Message, Conversation
from django.core.exceptions import ObjectDoesNotExist
import logging

logger = logging.getLogger(__name__)

class MessageSerializer(serializers.ModelSerializer):
    conversation_id = serializers.IntegerField(required=False)  # e.g. first message of the conversation
    sender = serializers.CharField(source='get_sender_display', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'conversation_id', 'message_body', 'sender', 'timestamp']
        read_only_fields = ['id', 'sender', 'timestamp']

    def validate_conversation_id(self, value):
        user = self.context['request'].user
        if not Conversation.objects.filter(id=value, user=user).exists():
            logger.error(f"Invalid conversation ID: {value} for user: {user.username}")
            raise serializers.ValidationError("Invalid conversation ID.")
        return value
    
    def create(self, validated_data):
        user = self.context['request'].user
        conversation_id = validated_data.pop('conversation_id', None)

        if conversation_id:
            conversation = Conversation.objects.get(id=conversation_id, user=user)
            logger.debug(f"Found existing conversation: {conversation.id} for user: {user.username}")
        else:
            conversation = Conversation.objects.create(user=user, title='New Conversation')  # Mock title
            logger.debug(f"Created new conversation: {conversation.id} for user: {user.username}")

        message = Message.objects.create(
            conversation=conversation,
            sender='user',  # Mock logic, need to conditionally insert the AI as sender
            **validated_data
        )
        logger.debug(f"Created message: {message.id} in conversation: {conversation.id}")
        
        return message
    
class ReadOnlyConversationSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Conversation
        fields = ['id', 'title', 'user_username', 'created_at', 'updated_at', 'messages']
        read_only_fields = fields
