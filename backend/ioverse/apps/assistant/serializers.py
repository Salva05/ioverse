from rest_framework import serializers
from apps.assistant.models import Assistant as DjangoAssistant

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

# Validation applied by pydantic / django models