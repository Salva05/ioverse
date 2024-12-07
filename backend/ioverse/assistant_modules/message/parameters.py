from typing import Any, Dict, List, Optional, Union, Literal

from pydantic import BaseModel, Field, field_validator

from assistant_modules.common.models import (
    ContentPartType,
    Attachment,
    validate_metadata,
)

# Message Create Parameters
class MessageCreateParams(BaseModel):
    role: Literal['user', 'assistant'] = Field(
        ...,
        description="The role of the entity that is creating the message."
    )
    content: Union[str, List[Any]] = Field(
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

# Message Update Parameters
class MessageUpdateParams(BaseModel):
    metadata: Optional[Dict[str, str]] = Field(
        default=None,
        description="Metadata key-value pairs to update in the message."
    )

    @field_validator('metadata')
    def validate_metadata_field(cls, v):
        return validate_metadata(v)
