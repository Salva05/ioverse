from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator

from assistant_modules.common.models import (
    ChunkingStrategy,
    ExpiresAfter,
    validate_metadata,
)

class VectorStoreCreateParams(BaseModel):
    file_ids: Optional[List[str]] = Field(
        default=None,
        description="A list of File IDs that the vector store should use."
    )
    name: Optional[str] = Field(
        default=None,
        description="The name of the vector store."
    )
    expires_after: Optional[ExpiresAfter] = Field(
        default=None,
        description="The expiration policy for a vector store."
    )
    chunking_strategy: Optional[ChunkingStrategy] = Field(
        default=None,
        description="The chunking strategy used to chunk the file(s)."
    )
    metadata: Optional[Dict[str, str]] = Field(
        default=None,
        description="Metadata key-value pairs attached to the vector store."
    )

    @field_validator('metadata')
    def validate_metadata_field(cls, v):
        return validate_metadata(v)

class VectorStoreUpdateParams(BaseModel):
    name: Optional[str] = Field(
        default=None,
        description="The name of the vector store."
    )
    expires_after: Optional[ExpiresAfter] = Field(
        default=None,
        description="The expiration policy for a vector store."
    )
    metadata: Optional[Dict[str, str]] = Field(
        default=None,
        description="Metadata key-value pairs attached to the vector store."
    )

    @field_validator('metadata')
    def validate_metadata_field(cls, v):
        return validate_metadata(v)

class VectorStoreFileCreateParams(BaseModel):
    vector_store_id: str = Field(
        ...,
        description="The ID of the vector store for which to create a File."
    )
    file_id: str = Field(
        ...,
        description="A File ID that the vector store should use."
    )
    chunking_strategy: Optional[ChunkingStrategy] = Field(
        default=None,
        description="The chunking strategy used to chunk the file(s)."
    )

class VectorStoreFileBatchCreateParams(BaseModel):
    file_ids: List[str] = Field(
        ...,
        description="A list of File IDs that the vector store should use."
    )
    chunking_strategy: Optional[ChunkingStrategy] = Field(
        default=None,
        description="The chunking strategy used to chunk the file(s)."
    )
