import logging
from io import BytesIO
from typing import Any, Dict, List
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist
from django.core.files.uploadedfile import InMemoryUploadedFile
from file_modules.services import FileService
from file_modules.parameters import FileUploadParams
from apps.assistant.models import File as DjangoFile
from pydantic import ValidationError

logger = logging.getLogger(__name__)

class FileIntegrationService:
    def __init__(self):
        self.file_service = FileService()

    @transaction.atomic
    def create_file(self, data: Dict[str, Any], user) -> DjangoFile:
        """
        Creates a File both in OpenAI and Django database.
        """
        try:
            
            # Pass the file as a (filename, file_object) tuple
            if isinstance(data['file'], InMemoryUploadedFile):
                data['file'] = (data['file'].name, data['file'])
                            
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
            django_file.filename = file_pydantic.filename
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
                            'filename': file_pydantic.filename,
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
