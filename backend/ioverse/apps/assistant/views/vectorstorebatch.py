from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import StreamingHttpResponse
from pydantic import ValidationError

import json

from apps.assistant.serializers import VectorStoreBatchCreateSerializer, VectorStoreBatchSerializer
from apps.assistant.services.vectorstorebatch_services import VectorStoreBatchIntegrationService

from ioverse.exceptions import MissingApiKeyException
from ..renderers import SSEEventRenderer
from ..permissions import IsAuthenticatedWithQueryToken

class VectorStoreBatchBaseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_api_key(self):
        """
        Method to retrieve API key for a given user.
        """
        api_key = getattr(self.request.user, 'api_key', None)
        if not api_key:
            raise MissingApiKeyException()
        return api_key

class VectorStoreBacthCreateView(VectorStoreBatchBaseView):
    def post(self, request):
        input_serializer = VectorStoreBatchCreateSerializer(data=request.data)
        if input_serializer.is_valid():
            # Retrieve OpenAI API key
            api_key = self.get_api_key()
            service = VectorStoreBatchIntegrationService(api_key=api_key)
            
            try:
                vector_store_id = input_serializer.validated_data.get("vector_store_id")
                response = service.create_vector_store_batch(vector_store_id, input_serializer.validated_data)
                
                response["sse_url"] = request.build_absolute_uri(response["sse_url"])
                output_serializer = VectorStoreBatchSerializer(response)

                return Response(output_serializer.data, status=status.HTTP_201_CREATED)
            except ValidationError as ve:
                return Response({"errors": ve.errors()}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VectorStoreBatchStatusStreamView(APIView):
    permission_classes = [IsAuthenticatedWithQueryToken]
    renderer_classes = [SSEEventRenderer]
    polling_interval = 1  # seconds
    timeout = 500  # seconds

    def get(self, request, *args, **kwargs):
        vector_store_id = kwargs.get("vector_store_id")
        batch_id = kwargs.get("batch_id")
        
        # Retrieve OpenAI API key
        api_key = getattr(self.request.user, 'api_key', None)
        if not api_key:
            raise MissingApiKeyException()
        
        service = VectorStoreBatchIntegrationService(api_key=api_key)

        def event_stream():
            for update in service.poll_vector_store_batch_status(
                vector_store_id=vector_store_id,
                batch_id=batch_id,
                polling_interval=self.polling_interval,
                timeout=self.timeout,
            ):
                yield f"data: {json.dumps(update)}\n\n"

        response = StreamingHttpResponse(event_stream(), content_type="text/event-stream")
        response['Cache-Control'] = 'no-cache'
        return response