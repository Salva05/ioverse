from pydantic import BaseModel, Field, field_validator
from typing import Literal

class FileObject(BaseModel):
    """
    Represents a document that has been uploaded to OpenAI.
    """

    id: str = Field(
        ...,
        min_length=1,
        description="The file identifier, which can be referenced in the API endpoints.",
    )
    bytes: int = Field(
        ...,
        ge=1,
        description="The size of the file, in bytes. Must be a positive integer."
    )
    created_at: int = Field(
        ...,
        ge=0,
        description="The Unix timestamp (in seconds) for when the file was created."
    )
    filename: str = Field(
        ...,
        min_length=1,
        description="The name of the file. Must be a non-empty string."
    )
    object: Literal["file"] = Field(
        default="file",
        description="The object type, which is always 'file'."
    )
    purpose: Literal["assistants", "assistants_output", "batch", "batch_output", "fine-tune", "fine-tune-results", "vision"] = Field(
        ...,
        description="The intended purpose of the file. Supported values are 'assistants', 'assistants_output', 'batch', 'batch_output', 'fine-tune', 'fine-tune-results', and 'vision'."
    )

    @field_validator("id", "filename")
    def non_empty_string(cls, value):
        if not value.strip():
            raise ValueError("Field cannot be empty or whitespace.")
        return value
