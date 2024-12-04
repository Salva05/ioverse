from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.assistant.serializers import VectorStoreSerializer, VectorStoreCreateSerializer, VectorStoreUpdateSerializer
from apps.assistant.services.vectorstore_services import VectorStoreIntegrationService

from ioverse.exceptions import MissingApiKeyException
from ..renderers import SSEEventRenderer
from ..permissions import IsAuthenticatedWithQueryToken

from pydantic import ValidationError
from django.core.exceptions import ObjectDoesNotExist
from django.http import StreamingHttpResponse
import logging
import json

logger = logging.getLogger(__name__)

class VectorStoreBaseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_api_key(self):
        """
        Method to retrieve API key for a given user.
        """
        api_key = getattr(self.request.user, 'api_key', None)
        if not api_key:
            raise MissingApiKeyException()
        return api_key
    
class VectorStoreCreateView(VectorStoreBaseView):
    def post(self, request):
        input_serializer = VectorStoreCreateSerializer(data=request.data)

        # Retrieve OpenAI API Key
        api_key = self.get_api_key()
        service = VectorStoreIntegrationService(api_key=api_key)
        
        if input_serializer.is_valid():
            
            try:
                result = service.create_vector_store(input_serializer.validated_data, request.user)
                # Check if SSE URL is included
                if result.get("sse_url"):
                    try:
                        # Build absolute URI for SSE URL
                        sse_url = request.build_absolute_uri(result["sse_url"])
                        vector_store_serialized = VectorStoreSerializer(result["vector_store"]).data
                        response_data = {
                            "vector_store": vector_store_serialized,
                            "sse_url": sse_url
                        }
                    except Exception as e:
                        logger.error(f"Error serializing vector store or generating SSE URL: {e}")
                        raise
                else:
                    try:
                        vector_store_serialized = VectorStoreSerializer(result["vector_store"]).data
                        response_data = vector_store_serialized
                    except Exception as e:
                        logger.error(f"Error serializing vector store: {e}")
                        raise
                return Response(response_data, status=status.HTTP_201_CREATED)
            except ValidationError as ve:
                return Response({"errors": ve.errors()}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VectorStoreRetrieveView(VectorStoreBaseView):
    def get(self, request, vector_store_id):
        # Retrieve OpenAI API Key
        api_key = self.get_api_key()
        service = VectorStoreIntegrationService(api_key=api_key)
        
        try:
            django_vector_store = service.retrieve_vector_store(vector_store_id, request.user)
            return Response(VectorStoreSerializer(django_vector_store).data, status=status.HTTP_200_OK)
        except ObjectDoesNotExist:
            return Response({"error": "VectorStore not found."}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as ve:
            return Response({"errors": ve.errors()}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VectorStoreListView(VectorStoreBaseView):
    def get(self, request):
        # Retrieve OpenAI API Key
        api_key = self.get_api_key()
        service = VectorStoreIntegrationService(api_key=api_key)
            
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

class VectorStoreUpdateView(VectorStoreBaseView):
    def put(self, request, vector_store_id):
        input_serializer = VectorStoreUpdateSerializer(data=request.data, partial=True)
        
        # Retrieve OpenAI API Key
        api_key = self.get_api_key()
        service = VectorStoreIntegrationService(api_key=api_key)
            
        if input_serializer.is_valid():
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

class VectorStoreDeleteView(VectorStoreBaseView):
    def delete(self, request, vector_store_id):
        # Retrieve OpenAI API Key
        api_key = self.get_api_key()
        service = VectorStoreIntegrationService(api_key=api_key)
        
        try:
            response = service.delete_vector_store(vector_store_id, request.user)
            return Response(response, status=status.HTTP_204_NO_CONTENT)
        except ObjectDoesNotExist:
            return Response({"error": "VectorStore not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VectorStoreStatusStreamView(APIView):
    permission_classes = [IsAuthenticatedWithQueryToken]
    renderer_classes = [SSEEventRenderer]
    polling_interval = 1  # seconds
    timeout = 300  # seconds

    def get(self, request, *args, **kwargs):
        vector_store_id = kwargs.get("vector_store_id")
        user = request.user
    
        # Retrieve OpenAI API key
        api_key = getattr(self.request.user, 'api_key', None)
        if not api_key:
            raise MissingApiKeyException()

        service = VectorStoreIntegrationService(api_key=api_key)

        def event_stream():
            for update in service.poll_vector_store_status(
                vector_store_id=vector_store_id,
                user=user,
                polling_interval=self.polling_interval,
                timeout=self.timeout,
            ):
                yield f"data: {json.dumps(update)}\n\n"

        response = StreamingHttpResponse(event_stream(), content_type="text/event-stream")
        response['Cache-Control'] = 'no-cache'
        return response