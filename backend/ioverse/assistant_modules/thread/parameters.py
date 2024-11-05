from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator

from assistant_modules.common.models import (
    ThreadToolType as ToolType,
    ToolResources,
    Message,
    validate_metadata,
)

class ThreadCreateParams(BaseModel):
    messages: Optional[List[Message]] = Field(
        default=None,
        description="A list of messages to start the thread with."
    )
    tool_resources: Optional[ToolResources] = Field(
        default=None,
        description="Resources made available to the assistant's tools in this thread."
    )
    metadata: Optional[Dict[str, str]] = Field(
        default=None,
        description="Metadata key-value pairs attached to the thread."
    )

    @field_validator('metadata')
    def validate_metadata_field(cls, v):
        return validate_metadata(v)

class ThreadUpdateParams(BaseModel):
    tool_resources: Optional[ToolResources] = Field(
        default=None,
        description="Resources made available to the assistant's tools in this thread."
    )
    metadata: Optional[Dict[str, str]] = Field(
        default=None,
        description="Metadata key-value pairs attached to the thread."
    )

    @field_validator('metadata')
    def validate_metadata_field(cls, v):
        return validate_metadata(v)
