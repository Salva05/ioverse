from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator

from assistant_modules.common.models import (
    AllowedModels,
    AssistantToolType as ToolType,
    ToolResources,
    ResponseFormatType,
    validate_metadata,
)

class AssistantParams(BaseModel):
    model: AllowedModels
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
    instructions: Optional[str] = Field(
        default=None,
        max_length=256000,
        description="The system instructions used by the assistant (max 256,000 characters).",
    )
    tools: List[ToolType] = Field(
        default_factory=list,
        max_items=128,
        description="List of tools enabled on the assistant (max 128 tools).",
    )
    tool_resources: Optional[ToolResources] = None
    temperature: Optional[float] = Field(
        default=1.0,
        ge=0,
        le=2,
        description="Sampling temperature between 0 and 2.",
    )
    top_p: Optional[float] = Field(
        default=1.0,
        ge=0,
        le=1,
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

class AssistantListParam(BaseModel):
    limit: Optional[int] = Field(
        default=20,
        ge=1,
        le=100,
        description="A limit on the number of objects to be returned. Limit can range between 1 and 100. Default is 20.",
    )
    order: Optional[str] = Field(
        default="desc",
        description="Sort order by the created_at timestamp of the objects. 'asc' for ascending order and 'desc' for descending order.",
    )
    after: Optional[str] = Field(
        default=None,
        description="A cursor for pagination. after is an object ID defining your place in the list. Use to fetch the next page.",
    )
    before: Optional[str] = Field(
        default=None,
        description="A cursor for pagination. before is an object ID defining your place in the list. Use to fetch the previous page.",
    )

    @field_validator('order')
    def validate_order(cls, v):
        if v not in {"asc", "desc"}:
            raise ValueError("order must be 'asc' or 'desc'.")
        return v