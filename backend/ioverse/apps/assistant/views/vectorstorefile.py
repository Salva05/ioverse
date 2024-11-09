from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.assistant.serializers import VectorStoreFileSerializer, VectorStoreFileCreateSerializer
from apps.assistant.services.vectorstorefile_services import VectorStoreFileIntegrationService
from pydantic import ValidationError
from django.core.exceptions import ObjectDoesNotExist

class VectorStoreFileCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        input_serializer = VectorStoreFileCreateSerializer(data=request.data)
        if input_serializer.is_valid():
            service = VectorStoreFileIntegrationService()
            try:
                django_vector_store_file = service.create_vector_store_file(input_serializer.validated_data, request.user)
                
                # Serialize the created VectorStore using the output serializer
                output_serializer = VectorStoreFileSerializer(django_vector_store_file)
                
                return Response(output_serializer.data, status=status.HTTP_201_CREATED)
            except ValidationError as ve:
                return Response({"errors": ve.errors()}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VectorStoreFileRetrieveView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, vector_store_file_id):
        service = VectorStoreFileIntegrationService()
        try:
            django_vector_store_file = service.retrieve_vector_store_file(vector_store_file_id, request.user)
            return Response(VectorStoreFileSerializer(django_vector_store_file).data, status=status.HTTP_200_OK)
        except ObjectDoesNotExist:
            return Response({"error": "VectorStoreFile not found."}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as ve:
            return Response({"errors": ve.errors()}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VectorStoreFileListView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, vector_store_id):
        service = VectorStoreFileIntegrationService()
        try:
            # Extract query parameters
            params = {
                'limit': request.query_params.get('limit', 20),
                'order': request.query_params.get('order', 'desc'),
                'after': request.query_params.get('after', None),
                'before': request.query_params.get('before', None),
                'filter': request.query_params.get('filter', None),
            }
            # Clean params by removing None values
            params = {k: v for k, v in params.items() if v is not None}
            
            # Convert 'limit' to integer
            try:
                params["limit"] = int(params["limit"])
                if not (1 <= params["limit"] <= 100):
                    raise ValueError
            except ValueError:
                return Response(
                    {"error": "Invalid 'limit' value. Must be an integer between 1 and 100."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            django_vector_store_files = service.list_vector_store_files(request.user, vector_store_id, **params)

            
            # Serialize each VectorStoreFile instance
            serialized_vector_store_files = [VectorStoreFileSerializer(vs).data for vs in django_vector_store_files]
            return Response(serialized_vector_store_files, status=status.HTTP_200_OK)
        
        except ValidationError as ve:
            return Response({"errors": ve.errors()}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VectorStoreFileDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, vector_store_file_id):
        service = VectorStoreFileIntegrationService()
        try:
            
            response = service.delete_vector_store_file(vector_store_file_id, request.user)
            return Response(response, status=status.HTTP_204_NO_CONTENT)
        except ObjectDoesNotExist:
            return Response({"error": "VectorStoreFile not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
