from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.models import User

from .models import Message, Conversation

import logging
import bleach

logger = logging.getLogger(__name__)

class MessageSerializer(serializers.ModelSerializer):
    conversation_id = serializers.IntegerField(required=False, allow_null=True)
    sender = serializers.CharField(read_only=True)  # 'user' or 'ai'
    message_body = serializers.CharField(
        required=True,
        allow_blank=False,
        allow_null=False,
        error_messages={
            'required': 'Message content is required.',
            'blank': 'Message content cannot be empty.',
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
        if value is not None and not Conversation.objects.filter(id=value, user=self.context['request'].user).exists():
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
            raise serializers.ValidationError("Message content cannot be empty.")
        if len(cleaned_content) > 1000:
            raise serializers.ValidationError("Message content exceeds the maximum allowed length.")
        return cleaned_content
    
class ReadOnlyConversationSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Conversation
        fields = ['id', 'title', 'user_username', 'created_at', 'updated_at', 'messages', 'share_token', 'is_shared', 'shared_at', 'expires_at']
        read_only_fields = fields

class SharedConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Conversation
        fields = ['title', 'messages']
        
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['username', 'password', 'password_confirm', 'email']
        
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
        
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user