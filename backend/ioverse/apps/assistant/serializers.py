from rest_framework import serializers
from apps.assistant.models import Assistant as DjangoAssistant, Message, VectorStore
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

class VectorStoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = VectorStore
        fields = [
            'id',
            'object',
            'created_at',
            'name',
            'usage_bytes',
            'file_counts',
            'status',
            'expires_after',
            'expires_at',
            'last_active_at',
            'metadata',
        ]
        read_only_fields = ['id', 'object', 'created_at']
       
class ExpiresAfterSerializer(serializers.Serializer):
    anchor = serializers.CharField(
        required=True,
        help_text="Anchor timestamp after which the expiration policy applies. Supported anchors: last_active_at."
    )
    days = serializers.IntegerField(
        required=True,
        help_text="The number of days after the anchor time that the vector store will expire."
    ) 

class AutoChunkingStrategySerializer(serializers.Serializer):
    type = serializers.CharField(
        help_text="Must be 'auto'.",
        default="auto"
    )

class StaticChunkingStrategySerializer(serializers.Serializer):
    type = serializers.CharField(
        help_text="Must be 'static'.",
        default="static"
    )
    static = serializers.DictField(
        child=serializers.IntegerField(),
        help_text="Static chunking parameters."
    )
    max_chunk_size_tokens = serializers.IntegerField(
        required=True,
        min_value=100,
        max_value=4096,
        help_text="The maximum number of tokens in each chunk. Must be between 100 and 4096."
    )
    chunk_overlap_tokens = serializers.IntegerField(
        required=True,
        help_text="The number of tokens that overlap between chunks. Must not exceed half of max_chunk_size_tokens."
    )
    
class VectorStoreCreateSerializer(serializers.Serializer):
    file_ids = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True,
        help_text="List of file IDs to include in the vector store."
    )
    name = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="The name of the vector store."
    )
    expires_after = ExpiresAfterSerializer(
        required=False,
        help_text="Expiration policy for the vector store."
    )
    chunking_strategy = serializers.DictField(
        child=serializers.CharField(),
        required=False,
        help_text="Strategy for chunking data in the vector store. Can be 'auto' or 'static'."
    )
    metadata = serializers.DictField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True,
        help_text="Metadata with a maximum of 16 key-value pairs for the vector store."
    )

    def validate_chunking_strategy(self, value):
        """Validate the chunking_strategy field based on the type."""
        strategy_type = value.get("type")
        if strategy_type == "auto":
            AutoChunkingStrategySerializer(data=value).is_valid(raise_exception=True)
        elif strategy_type == "static":
            StaticChunkingStrategySerializer(data=value).is_valid(raise_exception=True)
        else:
            raise serializers.ValidationError("Invalid chunking strategy type. Must be 'auto' or 'static'.")
        return value

class VectorStoreUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="The name of the vector store."
    )
    expires_after = ExpiresAfterSerializer(
        required=False,
        help_text="Expiration policy for the vector store."
    )
    metadata = serializers.DictField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True,
        help_text="Metadata with a maximum of 16 key-value pairs for the vector store."
    )