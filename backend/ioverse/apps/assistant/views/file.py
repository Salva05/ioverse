from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.assistant.serializers import FileSerializer, FileCreateSerializer
from apps.assistant.services.file_services import FileIntegrationService
from pydantic import ValidationError
from django.core.exceptions import ObjectDoesNotExist

from ioverse.exceptions import MissingApiKeyException

class FileBaseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_api_key(self):
        """
        Method to retrieve API key for a given user.
        """
        api_key = getattr(self.request.user, 'api_key', None)
        if not api_key:
            raise MissingApiKeyException()
        return api_key
    
class FileCreateView(FileBaseView):
    def post(self, request):
        input_serializer = FileCreateSerializer(data=request.data)
        if input_serializer.is_valid():
            # Retrieve OpenAI API key
            api_key = self.get_api_key()
            service = FileIntegrationService(api_key=api_key)
            try:
                django_file = service.create_file(input_serializer.validated_data, request.user)
                
                # Serialize the created File using the output serializer
                output_serializer = FileSerializer(django_file)
                
                return Response(output_serializer.data, status=status.HTTP_201_CREATED)
            except ValidationError as ve:
                return Response({"errors": ve.errors()}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FileRetrieveView(FileBaseView):
    def get(self, request, file_id):
        # Retrieve OpenAI API key
        api_key = self.get_api_key()
        service = FileIntegrationService(api_key=api_key)
        
        try:
            django_file = service.retrieve_file(file_id, request.user)
            return Response(FileSerializer(django_file).data, status=status.HTTP_200_OK)
        except ObjectDoesNotExist:
            return Response({"error": "File not found."}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as ve:
            return Response({"errors": ve.errors()}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FileListView(FileBaseView):
    def get(self, request):
        # Retrieve OpenAI API key
        api_key = self.get_api_key()
        service = FileIntegrationService(api_key=api_key)
        
        try:   
            django_files = service.list_files(request.user)
            
            # Serialize each File instance
            serialized_files = [FileSerializer(file).data for file in django_files]
            return Response(serialized_files, status=status.HTTP_200_OK)

        except ValidationError as ve:
            return Response({"errors": ve.errors()}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FileDeleteView(FileBaseView):
    def delete(self, request, file_id):
        # Retrieve OpenAI API key
        api_key = self.get_api_key()
        service = FileIntegrationService(api_key=api_key)
        
        try:
            response = service.delete_file(file_id, request.user)
            return Response(response, status=status.HTTP_204_NO_CONTENT)
        except ObjectDoesNotExist:
            return Response({"error": "File not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
