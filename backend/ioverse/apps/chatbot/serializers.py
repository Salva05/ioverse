from rest_framework import serializers

from .models import Message, Conversation
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
from django.db import transaction

from datetime import timedelta
import logging
import bleach

logger = logging.getLogger(__name__)

class MessageSerializer(serializers.ModelSerializer):
    conversation_id = serializers.IntegerField(required=False, allow_null=True)  # e.g. first message of the conversation
    sender = serializers.CharField(read_only=True)  # 'user' or 'ai'
    message_body = serializers.CharField(
        required=True,
        allow_blank=False,
        allow_null=False,
        error_messages={
            'required': 'Message content is required.',
            'blank': 'Message content cannot be empty.',
            'null': 'Message content cannot be null.',
            'max_length': 'Message content exceeds the maximum allowed length.',
        }
    )
        
    class Meta:
        model = Message
        fields = ['id', 'conversation_id', 'message_body', 'sender', 'timestamp']
        read_only_fields = ['id', 'sender', 'timestamp']

    def validate_conversation_id(self, value):
        """
        Ensures the conversation exists and belongs to the authenticated user.
        """
        if value is None:
            return value  # No conversation ID provided;
        user = self.context['request'].user
        if not Conversation.objects.filter(id=value, user=user).exists():
            logger.error(f"Invalid conversation ID: {value} for user: {user.username}")
            raise serializers.ValidationError("Invalid conversation ID.")
        return value
    
    def validate_message_body(self, value):
        """
        Field-level validation for 'message_body':
        - Sanitizes input to prevent XSS.
        - Ensures content is not empty.
        - Checks for maximum length.
        """
        # Sanitize input to prevent XSS
        cleaned_content = bleach.clean(value).strip()
        
        # This exception should not be raised, as the frontend implements logics to prevent submission of empty messages
        if not cleaned_content:
            logging.error("A message containing an empty body has been sent.")
            raise serializers.ValidationError("Message content cannot be empty.")
        
        if len(cleaned_content) > 1000:
            logging.warning(f"Message prevented from submission: exceeded maximum allowed length")
            raise serializers.ValidationError("Message content exceeds the maximum allowed length.")
        
        return cleaned_content
    
    def validate(self, data):
        """
        Object-level validation:
        - Performs rate limiting based on the authenticated user.
        """
        # Perform default validation
        data = super().validate(data)
        
        user = self.context['request'].user
        
         # Rate Limiting: Prevent users from sending messages too frequently
        time_threshold = timezone.now() - timedelta(seconds=10)  # 10-second window
        recent_messages = Message.objects.filter(
            conversation__user=user,
            sender='user',
            timestamp__gte=time_threshold
        )
        if recent_messages.count() >= 10:
            logger.error(f"User {user.username} has sent too many messages.")
            raise serializers.ValidationError("Too many messages have been sent in a short period of time.")
        
        return data
        
    def create(self, validated_data):
        """
        Handles the creation of a Message instance:
        - Associates the message with an existing conversation or creates a new one.
        - Sets the sender as 'user'.
        """
        user = self.context['request'].user
        conversation_id = validated_data.pop('conversation_id', None)
        
        with transaction.atomic():
            if conversation_id:
                try:
                    conversation = Conversation.objects.get(id=conversation_id, user=user)
                    logger.debug(f"Found existing conversation: {conversation.id} for user: {user.username}")
                except Conversation.DoesNotExist:
                    logger.error(f"Conversation ID {conversation_id} does not exist for user: {user.username}")
                    raise serializers.ValidationError("Invalid conversation ID.")
            else:
                # Create a new conversation for the user
                conversation = Conversation.objects.create(user=user, title='New Conversation') # Mock title for now
                logger.debug(f"Created new conversation: {conversation.id} for user: {user.username}")

            # Create the message
            message = Message.objects.create(
                conversation=conversation,
                sender='user',
                **validated_data
            )
            logger.debug(f"Created message: {message.id} for conversation: {conversation.id}")
    
        return message
    
class ReadOnlyConversationSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Conversation
        fields = ['id', 'title', 'user_username', 'created_at', 'updated_at', 'messages']
        read_only_fields = fields
