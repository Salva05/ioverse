import logging
from typing import Any, Dict, List
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist
from django.core.files.uploadedfile import InMemoryUploadedFile, TemporaryUploadedFile
from file_modules.services import FileService
from file_modules.parameters import FileUploadParams
from apps.assistant.models import File as DjangoFile
from pydantic import ValidationError

logger = logging.getLogger(__name__)

class FileIntegrationService:
    def __init__(self, api_key: str):
        self.file_service = FileService(api_key=api_key)

    @transaction.atomic
    def create_file(self, data: Dict[str, Any], user) -> DjangoFile:
        """
        Creates a File both in OpenAI and Django database.
        """
        try:
            # extract image_file and / or image_url if are provided
            image_file = data.pop('image_file', None)
            image_url = data.pop('image_url', None)
            
            # Pass the file as a (filename, file_object) tuple
            uploaded_file = data['file']
            if isinstance(uploaded_file, InMemoryUploadedFile) or isinstance(uploaded_file, TemporaryUploadedFile):
                # Convert TemporaryUploadedFile or InMemoryUploadedFile to a tuple
                uploaded_file.seek(0)  # Ensure the file pointer is at the start
                data['file'] = (uploaded_file.name, uploaded_file.read())  # Read into memory as bytes
                            
            # Validate and transform data using Pydantic
            params = FileUploadParams(**data)
            file_pydantic = self.file_service.upload_file(params)

            # Map Pydantic model to Django model
            django_file = DjangoFile.objects.create(
                id=file_pydantic.id,
                bytes=file_pydantic.bytes,
                created_at=file_pydantic.created_at,
                filename=file_pydantic.filename,
                object=file_pydantic.object,
                purpose=file_pydantic.purpose,
                owner=user
            )
            
            try:
                if image_file and isinstance(image_file, (InMemoryUploadedFile, TemporaryUploadedFile)):
                    django_file.image_file = image_file
                if image_url:
                    django_file.image_url = image_url
                django_file.save()
            except Exception as e:
                logger.error(f"Error saving image: {e}")
                raise e
                
            logger.info(f"File created in Django DB: {django_file.id}")
            return django_file

        except ValidationError as ve:
            logger.error(f"Pydantic validation error: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error creating file: {e}")
            raise

    def retrieve_file(self, file_id: str, user) -> DjangoFile:
        """
        Retrieves a File from OpenAI and updates the Django database.
        """
        try:
            file_pydantic = self.file_service.retrieve_file(file_id)
            django_file = DjangoFile.objects.get(id=file_id, owner=user)

            # Update Django model fields
            django_file.bytes = file_pydantic.bytes
            django_file.created_at = file_pydantic.created_at
            django_file.object = file_pydantic.object
            django_file.purpose = file_pydantic.purpose
            django_file.save()
            
            logger.info(f"File retrieved and updated in Django DB: {django_file.id}")
            return django_file

        except ObjectDoesNotExist:
            logger.error(f"File with ID {file_id} does not exist in Django DB.")
            raise
        except ValidationError as ve:
            logger.error(f"Pydantic validation error: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error retrieving file: {e}")
            raise

    @transaction.atomic
    def delete_file(self, file_id: str, user) -> Dict[str, Any]:
        """
        Deletes a File from OpenAI and Django database.
        """
        try:
            result = self.file_service.delete_file(file_id)
            django_file = DjangoFile.objects.get(id=file_id, owner=user)
            django_file.delete()
            logger.info(f"File deleted from Django DB: {file_id}")
            return result

        except ObjectDoesNotExist:
            logger.error(f"File with ID {file_id} does not exist in Django DB.")
            raise
        except Exception as e:
            logger.error(f"Error deleting file: {e}")
            raise

    def list_files(self, user) -> List[DjangoFile]:
        """
        Lists Files from OpenAI and updates the Django database.
        """
        try:
            files_pydantic = self.file_service.list_files()
            django_files = []
            ids = []

            with transaction.atomic():
                for file_pydantic in files_pydantic:
                    ids.append(file_pydantic.id)
                    
                    django_file, created = DjangoFile.objects.update_or_create(
                        id=file_pydantic.id,
                        owner=user,
                        defaults={
                            'id': file_pydantic.id,
                            'bytes': file_pydantic.bytes,
                            'created_at': file_pydantic.created_at,
                            'object': file_pydantic.object,
                            'purpose': file_pydantic.purpose,
                        }
                    )
                    
                    # Log creation or update
                    if created:
                        logger.info(f"New file added to Django DB: {django_file.id}")
                    else:
                        logger.info(f"Existing file updated in Django DB: {django_file.id}")
                    
                    django_files.append(django_file)

                # Remove any files not returned by the OpenAI API
                DjangoFile.objects.filter(owner=user).exclude(id__in=ids).delete()
            
            return django_files

        except ValidationError as ve:
            logger.error(f"Pydantic validation error in listing files: {ve}")
            raise
        except Exception as e:
            logger.error(f"Error listing files: {e}")
            raise
    
    def get_content(self, file_id, file_name, user):
        """
        Returns the content associated with a given file uploaded to OpenAI or other file services.
        Supports image, CSV, Excel, and other file types.
        """
        import mimetypes
        from django.core.files.base import ContentFile
        from pathlib import Path

        try:
            response = self.file_service.get_content(file_id=file_id)

            if hasattr(response, 'content'):
                file_content = response.content
            else:
                raise ValueError("Unable to retrieve file content from the response.")

            # Sanitize the file_name to prevent path traversal
            file_name = Path(file_name).name  # Extracts only the base name
        
            # Guess the file type using mimetypes
            mime_type, encoding = mimetypes.guess_type(file_name)
            if not mime_type:
                logger.warning(f"Could not determine MIME type for file_id={file_id}. Assuming binary.")
                mime_type = 'application/octet-stream'

            # If the file is an image, ensure the extension matches the content
            if mime_type.startswith('image/'):
                import imghdr
                image_type = imghdr.what(None, h=file_content)
                if not image_type:
                    logger.warning(f"File content for file_id={file_id} is not a recognized image format.")
                else:
                    # Ensure the filename has the correct extension for the image
                    file_extension = f".{image_type}"
                    if not file_name.endswith(file_extension):
                        file_name = f"{Path(file_name).stem}{file_extension}"
            else:
                # If not an image, ensure the file has an appropriate extension
                if not Path(file_name).suffix:
                    # Add a generic extension based on MIME type
                    file_extension = mimetypes.guess_extension(mime_type) or '.bin'
                    file_name = f"{file_name}{file_extension}"

            return ContentFile(file_content, name=file_name)

        except Exception as e:
            logger.error(f"Error while retrieving file content: {str(e)}")
            return None