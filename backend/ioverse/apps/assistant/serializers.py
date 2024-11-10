from rest_framework import serializers
from .validators import (
    validate_purpose,
    validate_metadata,
    validate_content,
    validate_attachments
)
from apps.assistant.models import (
    Assistant,
    Thread,
    Message,
    VectorStore,
    VectorStoreFile,
    File
)

# ======================
# Assistant
# ======================

class AssistantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assistant
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

# ======================
# Thread
# ======================

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

# ======================
# Message
# ======================

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = [
            'id',
            'object',
            'created_at',
            'assistant_id',
            'thread_id',
            'run_id',
            'role',
            'content',
            'attachments',
            'metadata',
        ]
        read_only_fields = ['id', 'object', 'created_at']
    
# ======================
# Message Creation
# ======================

class MessageCreationSerializer(serializers.Serializer):
    role = serializers.ChoiceField(
        choices=["user", "assistant"],
        required=True,
        help_text="The role of the entity that is creating the message."
    )
    content = serializers.JSONField(
        help_text="Content of the message, either a direct text string or an array of structured content parts.",
        validators=[validate_content]
    )
    attachments = serializers.ListField(
        child=serializers.DictField(
            child=serializers.JSONField(),
            help_text="Each attachment can have 'file_id' and 'tools' fields."
        ),
        required=False,
        allow_null=True,
        help_text="Optional array of file attachments with tool specifications.",
        validators=[validate_attachments]
    )
    metadata = serializers.DictField(
        child=serializers.CharField(),
        required=False,
        help_text="Optional set of 16 key-value pairs for additional object information. Keys max 64 chars, values max 512 chars.",
        validators=[validate_metadata]
    )

# ======================
# Message Update
# ======================

class MessageUpdateSerializer(serializers.Serializer):
    metadata = serializers.DictField(
        child=serializers.CharField(),
        required=False,
        help_text="Optional set of 16 key-value pairs for additional object information. Keys max 64 chars, values max 512 chars.",
        validators=[validate_metadata]
    )
    
# ======================
# Vector Store
# ======================

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

# ======================
# Vector Store Expiration
# ======================

class ExpiresAfterSerializer(serializers.Serializer):
    anchor = serializers.CharField(
        required=True,
        help_text="Anchor timestamp after which the expiration policy applies. Supported anchors: last_active_at."
    )
    days = serializers.IntegerField(
        required=True,
        help_text="The number of days after the anchor time that the vector store will expire."
    ) 

# ======================
# Vector Store Chunking Strategy
# ======================

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

# ======================
# Vector Store Creation
# ======================

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

# ======================
# Vector Store Update
# ======================

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

# ======================
# Vector Store File Creation
# ======================

class VectorStoreFileCreateSerializer(serializers.Serializer):
    vector_store_id = serializers.CharField(
        required=True,
        help_text="The ID of the vector store for which to create a File."
    )
    file_id = serializers.CharField(
        required=True,
        help_text="A File ID that the vector store should use. Useful for tools like file_search that can access files."
    )
    chunking_strategy = serializers.DictField(
        child=serializers.CharField(),
        required=False,
        help_text="The chunking strategy used to chunk the file(s). If not set, will use the auto strategy."
    )
    
# ======================
# Vector Store File
# ======================

class VectorStoreFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = VectorStoreFile
        fields = [
            'id',
            'object',
            'created_at',
            'usage_bytes',
            'last_error',
            'chunking_strategy',
            'metadata',
        ]
        read_only_fields = ['id', 'object', 'created_at']
        
# ======================
# File Creation
# ======================

class FileCreateSerializer(serializers.Serializer):
    """
    Serializer for creating a File object.
    Allows only specific fields needed for file creation.
    """
    file = serializers.FileField(
        allow_empty_file=False,
        required=True,
        help_text="The File object (not file name) to be uploaded."
    )
    purpose = serializers.CharField(
        required=True,
        help_text="The intended purpose of the uploaded file."
    )

    def validate_purpose(self, value):
        return validate_purpose(value)

# ======================
# File List 
# ======================

class FileListSerializer(serializers.Serializer):
    """
    Serializer for listing File objects with optional filtering and pagination.
    """

    purpose = serializers.CharField(
        required=False,
        help_text="Optional. Only return files with the given purpose."
    )
    limit = serializers.IntegerField(
        required=False,
        default=10000,
        min_value=1,
        max_value=10000,
        help_text="Optional. A limit on the number of objects to be returned. Defaults to 10,000."
    )
    order = serializers.ChoiceField(
        choices=['asc', 'desc'],
        required=False,
        default='desc',
        help_text="Optional. Sort order by the created_at timestamp of the objects. Defaults to 'desc'."
    )
    after = serializers.CharField(
        required=False,
        help_text="Optional. A cursor for pagination. Defines the starting point for the next page of results."
    )

    def validate_purpose(self, value):
        """
        Validate purpose using the standalone purpose validator function.
        """
        return validate_purpose(value)
    
# ======================
# File Retrieve
# ======================

class FileRetrieveDeleteSerializer(serializers.Serializer):
    """
    Serializer for retrieving or deleting File objects.
    """
    file_id = serializers.CharField(
        required=True,
        help_text="The ID of the file to use for this request."
    )
    
# ======================
# File
# ======================

class FileSerializer(serializers.ModelSerializer):
    """
    Serializer for representing a File object.
    Includes all fields specified by the OpenAI API for file objects.
    """
    class Meta:
        model = File
        fields = [
            'id',
            'bytes',
            'created_at',
            'filename',
            'object',
            'purpose',
        ]
        read_only_fields = ['id', 'created_at', 'object']
    def validate_purpose(self, value):
        return validate_purpose(value)
    
# ======================
# Generic JSON (Run and Run Step)
# ======================

class GenericJSONSerializer(serializers.Serializer):
    data = serializers.JSONField()