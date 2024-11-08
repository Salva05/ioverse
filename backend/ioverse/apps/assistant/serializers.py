from rest_framework import serializers
from apps.assistant.models import Assistant as DjangoAssistant, Message
from apps.assistant.models import Thread

class AssistantSerializer(serializers.ModelSerializer):
    class Meta:
        model = DjangoAssistant
        fields = [
            'id',
            'object',
            'created_at',
            'name',
            'description',
            'model',
            'instructions',
            'tools',
            'tool_resources',
            'temperature',
            'top_p',
            'response_format',
            'metadata',
        ]
        read_only_fields = ['id', 'object', 'created_at']

class ThreadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Thread
        fields = [
            'id',
            'object',
            'created_at',
            'tool_resources',
            'metadata',
        ]
        read_only_fields = ['id', 'object', 'created_at']

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = [
            'id',
            'object',
            'created_at',
            'thread_id',
            'role',
            'content',
            'attachments',
            'metadata',
            'assistant_id',
            'run_id',
            'incomplete_details',
            'completed_at',
            'incomplete_at'
        ]
        read_only_fields = ['id', 'object', 'created_at']
