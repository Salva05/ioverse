from enum import Enum
from typing import Any, Dict, List, Optional, Union, Literal

from pydantic import BaseModel, Field, field_validator

# Allowed Models
class AllowedModels(str, Enum):
    GPT_3_5_TURBO = 'gpt-3.5-turbo'
    GPT_4 = 'gpt-4'
    GPT_4O = 'gpt-4o'

# Base Tool
class BaseTool(BaseModel):
    type: str

# Tool Classes
class CodeInterpreterTool(BaseTool):
    type: Literal['code_interpreter']

class FileSearchToolOverrides(BaseModel):
    max_num_results: Optional[int] = Field(
        default=None,
        ge=1,
        le=50,
        description="The maximum number of results the file search tool should output. Default is 20 for gpt-4* models and 5 for gpt-3.5-turbo.",
    )
    ranking_options: Optional[Dict[str, Any]] = Field(
        default=None,
        description="The ranking options for the file search. If not specified, the file search tool will use the auto ranker and a score_threshold of 0.",
    )
    
class FileSearchTool(BaseTool):
    type: Literal['file_search']
    file_search: Optional[FileSearchToolOverrides] = Field(
        default=None,
        description="Overrides for the file search tool.",
    )

class FunctionTool(BaseTool):
    type: Literal['function']
    function: Dict[str, Any] = Field(
        ...,
        description="Details of the function tool.",
    )

AssistantToolType = Union[CodeInterpreterTool, FileSearchTool, FunctionTool]
ThreadToolType = Union[CodeInterpreterTool, FileSearchTool]

# Vector Store Models
class ChunkingStrategy(BaseModel):
    type: str  # 'static', 'auto', etc.
    static: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Parameters for static chunking strategy."
    )
    auto: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Parameters for auto chunking strategy."
    )

class ExpiresAfter(BaseModel):
    anchor: str = Field(
        ...,
        description="Anchor timestamp after which the expiration policy applies. Supported anchors: 'last_active_at'."
    )
    days: int = Field(
        ...,
        description="The number of days after the anchor time that the vector store will expire."
    )

class FileCounts(BaseModel):
    in_progress: int
    completed: int
    failed: int
    cancelled: int
    total: int

class ErrorDetails(BaseModel):
    code: str
    message: str

class VectorStore(BaseModel):
    id: str
    object: Literal['vector_store'] = 'vector_store'
    created_at: int
    name: Optional[str] = None
    usage_bytes: Optional[int] = None
    file_counts: Optional[FileCounts] = None
    status: Optional[str] = None
    expires_after: Optional[ExpiresAfter] = None
    expires_at: Optional[int] = None
    last_active_at: Optional[int] = None
    metadata: Optional[Dict[str, str]] = None

    @field_validator('metadata')
    def validate_metadata_field(cls, v):
        return validate_metadata(v)

class VectorStoreFile(BaseModel):
    id: str
    object: Literal['vector_store.file'] = 'vector_store.file'
    usage_bytes: int
    created_at: int
    vector_store_id: str
    status: str
    last_error: Optional[ErrorDetails] = None
    chunking_strategy: Optional[ChunkingStrategy] = None

class VectorStoreFileBatch(BaseModel):
    id: str
    object: Literal['vector_store.file_batch'] = 'vector_store.file_batch'
    created_at: int
    vector_store_id: str
    status: str
    file_counts: FileCounts

# Code Interpreter Resource
class CodeInterpreterResource(BaseModel):
    file_ids: List[str] = Field(
        default_factory=list,
        max_items=20,
        description="List of file IDs for the code_interpreter tool (max 20 files).",
    )

# File Search Resource
class FileSearchResource(BaseModel):
    vector_store_ids: Optional[List[str]] = Field(
        default=None,
        max_items=1,
        description="List of vector store IDs (max 1).",
    )
    vector_stores: Optional[List[VectorStore]] = Field(
        default=None,
        max_items=1,
        description="Helper to create and attach vector stores (max 1).",
    )

# Function tool overrides
class FunctionResource(BaseModel):
    description: Optional[str] = Field(
        default=None,
        max_length=512,
        description="A description of what the function does, used by the model to choose when and how to call the function.",
    )
    name: str = Field(
        ...,
        pattern=r'^[A-Za-z0-9_-]{1,64}$',
        description="The name of the function to be called. Must be a-z, A-Z, 0-9, or contain underscores and dashes, with a maximum length of 64.",
    )
    parameters: Optional[Dict[str, Any]] = Field(
        default=None,
        description="The parameters the functions accepts, described as a JSON Schema object.",
    )
    strict: Optional[bool] = Field(
        default=False,
        description="Whether to enable strict schema adherence when generating the function call.",
    )
    
# Tool Resources
class ToolResources(BaseModel):
    code_interpreter: Optional[CodeInterpreterResource] = None
    file_search: Optional[FileSearchResource] = None
    function: Optional[FunctionResource] = None

# Response Format Classes
class JsonSchemaResponseFormat(BaseModel):
    type: Literal['json_schema']
    json_schema: Dict[str, Any]
    strict: Optional[bool] = Field(default=False)


class JsonObjectResponseFormat(BaseModel):
    type: Literal['json_object']


ResponseFormatType = Union[Literal['auto'], JsonSchemaResponseFormat, JsonObjectResponseFormat]

# Content Parts
class ContentPart(BaseModel):
    type: str

# Text Content for Message
class TextContent(BaseModel):
    value: str = Field(..., description="The text content of the message.")
    annotations: List[Any] = Field(
        default_factory=list, 
        description="Annotations for the text."
    )
    
class TextContentPart(ContentPart):
    type: Literal['text']
    text: TextContent

class ImageFile(BaseModel):
    file_id: str = Field(..., description="The File ID of the image in the message content.")
    detail: Optional[str] = Field(
        default='auto',
        description="Specifies the detail level of the image. Options are 'low', 'high', or 'auto'.",
    )

class ImageFileContentPart(ContentPart):
    type: Literal['image_file']
    image_file: ImageFile

class ImageURL(BaseModel):
    url: str = Field(..., description="The external URL of the image.")
    detail: Optional[str] = Field(
        default='auto',
        description="Specifies the detail level of the image. Options are 'low', 'high', or 'auto'.",
    )

class ImageURLContentPart(ContentPart):
    type: Literal['image_url']
    image_url: ImageURL

ContentPartType = Union[TextContentPart, ImageFileContentPart, ImageURLContentPart]

# Tool definitions for attachments
class Tool(BaseModel):
    type: str

class CodeInterpreterTool(Tool):
    type: Literal['code_interpreter']

class FileSearchTool(Tool):
    type: Literal['file_search']

AttachmentToolType = Union[CodeInterpreterTool, FileSearchTool]

# Attachment
class Attachment(BaseModel):
    file_id: Optional[str] = Field(
        default=None,
        description="The ID of the file to attach to the message."
    )
    tools: Optional[List[AttachmentToolType]] = Field(
        default=None,
        description="The tools to add this file to."
    )

# Message Model
class Message(BaseModel):
    role: Literal['user', 'assistant'] = Field(
        ...,
        description="The role of the entity that is creating the message."
    )
    content: Union[str, List[ContentPartType]] = Field(
        ...,
        description="Content of the message."
    )
    attachments: Optional[List[Attachment]] = Field(
        default=None,
        description="A list of files attached to the message."
    )
    metadata: Optional[Dict[str, str]] = Field(
        default=None,
        description="Metadata key-value pairs attached to the message."
    )

    @field_validator('metadata')
    def validate_metadata_field(cls, v):
        return validate_metadata(v)

# Assistant Model
class Assistant(BaseModel):
    id: str
    object: Literal['assistant'] = 'assistant'
    created_at: int
    name: Optional[str] = Field(
        default=None,
        max_length=256,
        description="The name of the assistant (max 256 characters).",
    )
    description: Optional[str] = Field(
        default=None,
        max_length=512,
        description="The description of the assistant (max 512 characters).",
    )
    model: str = Field(
        ...,
        description="ID of the model to use.",
    )
    instructions: Optional[str] = Field(
        default=None,
        max_length=256000,
        description="The system instructions used by the assistant (max 256,000 characters).",
    )
    tools: List[AssistantToolType] = Field(
        default_factory=list,
        max_items=128,
        description="List of tools enabled on the assistant (max 128 tools).",
    )
    tool_resources: Optional[ToolResources] = Field(
        default=None,
        description="Resources used by the assistant's tools.",
    )
    temperature: Optional[float] = Field(
        default=1.0,
        ge=0.0,
        le=2.0,
        description="Sampling temperature between 0 and 2.",
    )
    top_p: Optional[float] = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Nucleus sampling probability mass between 0 and 1.",
    )
    response_format: ResponseFormatType = 'auto'
    metadata: Optional[Dict[str, str]] = Field(
        default=None,
        description="Set of 16 key-value pairs attached to the assistant.",
    )

    @field_validator('metadata')
    def validate_metadata_field(cls, v):
        return validate_metadata(v)

    @field_validator('response_format')
    def validate_response_format(cls, v):
        if isinstance(v, str) and v != 'auto':
            raise ValueError(
                "response_format must be 'auto' or a valid response format object."
            )
        return v

# Thread Object, represents the structure returned by the API
class ThreadObject(BaseModel):
    id: str
    object: Literal['thread'] = 'thread'
    created_at: int
    metadata: Optional[Dict[str, str]] = Field(
        default=None,
        description="Set of 16 key-value pairs attached to the thread."
    )
    tool_resources: Optional[ToolResources] = Field(
        default=None,
        description="Resources made available to the assistant's tools in this thread."
    )

    @field_validator('metadata')
    def validate_metadata_field(cls, v):
        return validate_metadata(v)
    
# Message Object, represents the structure returned by the API
class MessageObject(Message):
    id: str
    object: Literal['thread.message'] = 'thread.message'
    created_at: int
    assistant_id: Optional[str] = None
    thread_id: str
    run_id: Optional[str] = None
    status: Optional[str] = None
    incomplete_details: Optional[Dict[str, Any]] = None
    completed_at: Optional[int] = None
    incomplete_at: Optional[int] = None

# Common metadata validator function
def validate_metadata(v):
    if v:
        if len(v) > 16:
            raise ValueError("Metadata can contain up to 16 key-value pairs.")
        for key, value in v.items():
            if len(key) > 64:
                raise ValueError(
                    "Metadata keys can be up to 64 characters long."
                )
            if len(value) > 512:
                raise ValueError(
                    "Metadata values can be up to 512 characters long."
                )
    return v
