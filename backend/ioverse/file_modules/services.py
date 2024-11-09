import logging
from pydantic import ValidationError
from typing import List, Optional, Dict, Any
from .operations import FileClient
from .parameters import FileUploadParams, FileRetrieveDeleteParams
from .core import FileObject

logger = logging.getLogger('file_service')

class FileService:
    def __init__(self):
        self.client = FileClient()

    def upload_file(self, params: FileUploadParams) -> FileObject:
        """
        Uploads a file to OpenAI API with a specified purpose.
        """
        try:
            response = self.client.upload_file(file=params.file, purpose=params.purpose)
            file_data = response.model_dump()

            # Validate and convert to FileObject model
            uploaded_file = FileObject.model_validate(file_data)
            logger.info(f"File uploaded: {uploaded_file.id}")
            return uploaded_file
        except (ValidationError, Exception) as e:
            logger.error(f"Error uploading file: {str(e)}")
            raise

    def list_files(self) -> List[FileObject]:
        """
        Lists files with optional filters such as purpose, limit, order, and pagination cursor.
        """
        try:
            response = self.client.list_file()
            response_data = response.model_dump()

            # Validate and convert response data to list of FileObject models
            files = [FileObject.model_validate(file) for file in response_data.get('data', [])]
            logger.info("Files listed successfully.")
            return files
        except (ValidationError, Exception) as e:
            logger.error(f"Error listing files: {str(e)}")
            raise

    def retrieve_file(self, file_id) -> FileObject:
        """
        Retrieves a specific file by ID from OpenAI API.
        """
        try:
            # Call client to retrieve file
            response = self.client.retrieve_file(file_id)
            file_data = response.model_dump()

            # Validate and convert to FileObject model
            file = FileObject.model_validate(file_data)
            logger.info(f"File retrieved: {file.id}")
            return file
        except (ValidationError, Exception) as e:
            logger.error(f"Error retrieving file: {str(e)}")
            raise

    def delete_file(self, file_id) -> Dict[str, Any]:
        """
        Deletes a specific file by ID from OpenAI API.
        """
        try:
            # Call client to delete file
            response = self.client.delete_file(file_id)
            logger.info(f"File deleted: {file_id}")
            return response.model_dump()
        except Exception as e:
            logger.error(f"Error deleting file: {str(e)}")
            raise
