from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.assistant.serializers import VectorStoreSerializer, VectorStoreCreateSerializer, VectorStoreUpdateSerializer
from apps.assistant.services.vectorstore_services import VectorStoreIntegrationService
from pydantic import ValidationError
from django.core.exceptions import ObjectDoesNotExist

class VectorStoreCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        input_serializer = VectorStoreCreateSerializer(data=request.data)
        if input_serializer.is_valid():
            service = VectorStoreIntegrationService()
            try:
                django_vector_store = service.create_vector_store(input_serializer.validated_data, request.user)
                
                # Serialize the created VectorStore using the output serializer
                output_serializer = VectorStoreSerializer(django_vector_store)
                
                return Response(output_serializer.data, status=status.HTTP_201_CREATED)
            except ValidationError as ve:
                return Response({"errors": ve.errors()}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VectorStoreRetrieveView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, vector_store_id):
        service = VectorStoreIntegrationService()
        try:
            django_vector_store = service.retrieve_vector_store(vector_store_id, request.user)
            return Response(VectorStoreSerializer(django_vector_store).data, status=status.HTTP_200_OK)
        except ObjectDoesNotExist:
            return Response({"error": "VectorStore not found."}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as ve:
            return Response({"errors": ve.errors()}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VectorStoreListView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        service = VectorStoreIntegrationService()
        try:
            # Extract query parameters
            params = {
                'limit': request.query_params.get('limit', 20),
                'order': request.query_params.get('order', 'desc'),
                'after': request.query_params.get('after', None),
                'before': request.query_params.get('before', None),
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
            django_vector_stores = service.list_vector_stores(request.user, **params)

            
            # Serialize each VectorStore instance
            serialized_vector_stores = [VectorStoreSerializer(vs).data for vs in django_vector_stores]
            return Response(serialized_vector_stores, status=status.HTTP_200_OK)
        
        except ValidationError as ve:
            return Response({"errors": ve.errors()}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VectorStoreUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, vector_store_id):
        input_serializer = VectorStoreUpdateSerializer(data=request.data, partial=True)
        if input_serializer.is_valid():
            service = VectorStoreIntegrationService()
            try:
                django_vector_store = service.update_vector_store(vector_store_id, input_serializer.validated_data, request.user)
                
                # Serialize the created VectorStore using the output serializer
                output_serializer = VectorStoreSerializer(django_vector_store)

                return Response(output_serializer.data, status=status.HTTP_200_OK)
            except ObjectDoesNotExist:
                return Response({"error": "VectorStore not found."}, status=status.HTTP_404_NOT_FOUND)
            except ValidationError as ve:
                return Response({"errors": ve.errors()}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VectorStoreDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, vector_store_id):
        service = VectorStoreIntegrationService()
        try:
            response = service.delete_vector_store(vector_store_id, request.user)
            return Response(response, status=status.HTTP_204_NO_CONTENT)
        except ObjectDoesNotExist:
            return Response({"error": "VectorStore not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
