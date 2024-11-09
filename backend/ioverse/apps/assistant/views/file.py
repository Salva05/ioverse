from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.assistant.serializers import FileSerializer, FileCreateSerializer
from apps.assistant.services.file_services import FileIntegrationService
from pydantic import ValidationError
from django.core.exceptions import ObjectDoesNotExist


class FileCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        input_serializer = FileCreateSerializer(data=request.data)
        if input_serializer.is_valid():
            service = FileIntegrationService()
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


class FileRetrieveView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, file_id):
        service = FileIntegrationService()
        try:
            django_file = service.retrieve_file(file_id, request.user)
            return Response(FileSerializer(django_file).data, status=status.HTTP_200_OK)
        except ObjectDoesNotExist:
            return Response({"error": "File not found."}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as ve:
            return Response({"errors": ve.errors()}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FileListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        service = FileIntegrationService()
        try:   
            django_files = service.list_files(request.user)
            
            # Serialize each File instance
            serialized_files = [FileSerializer(file).data for file in django_files]
            return Response(serialized_files, status=status.HTTP_200_OK)

        except ValidationError as ve:
            return Response({"errors": ve.errors()}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FileDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, file_id):
        service = FileIntegrationService()
        try:
            response = service.delete_file(file_id, request.user)
            return Response(response, status=status.HTTP_204_NO_CONTENT)
        except ObjectDoesNotExist:
            return Response({"error": "File not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
