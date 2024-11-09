from pydantic import BaseModel, Field, ConfigDict
from typing import Union, BinaryIO, Literal, Optional, Any

class FileUploadParams(BaseModel):
    """
    Parameters for performing file upload operations
    over the File API of OpenAI.
    """
    
    file: Any = Field(
        ...,
        description="The file object to be uploaded."
    )
    purpose: Literal["assistants", "vision", "batch", "fine-tune"] = Field(
        ...,
        description="The intended purpose of the uploaded file. Use 'assistants' for Assistants and Message files, "
                    "'vision' for Assistants image file inputs, 'batch' for Batch API, and 'fine-tune' for Fine-tuning."
    )
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
class FileListParams(BaseModel):
    """
    Parameters for listing files through the File API of OpenAI.
    Allows filtering, limiting, ordering, and pagination of file listings.
    """

    purpose: Optional[str] = Field(
        None,
        description="Optional. Only return files with the given purpose (e.g., 'assistants', 'fine-tune')."
    )
    limit: Optional[int] = Field(
        10000,
        description="Optional. Limits the number of objects returned, ranging between 1 and 10,000. Default is 10,000."
    )
    order: Optional[Literal["asc", "desc"]] = Field(
        "desc",
        description="Optional. Sort order by the created_at timestamp of the objects. 'asc' for ascending, 'desc' for descending. Default is 'desc'."
    )
    after: Optional[str] = Field(
        None,
        description="Optional. A cursor for pagination, using an object ID to define the starting point in the list."
    )
    
class FileRetrieveDeleteParams(BaseModel):
    """
    Parameters for retrieving or deleting a specific file through the File API of OpenAI.
    Requires the file ID to retrieve the corresponding file object.
    """
    
    file_id: str = Field(
        ...,
        description="The ID of the file to be retrieved/deleted."
    )