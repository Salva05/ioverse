from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.assistant.serializers import AssistantSerializer
from apps.assistant.services.assistant_services import AssistantIntegrationService
from pydantic import ValidationError
from django.core.exceptions import ObjectDoesNotExist

from ioverse.exceptions import MissingApiKeyException

class AssistantBaseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_api_key(self):
        """
        Method to retrieve API key for a given user.
        """
        api_key = getattr(self.request.user, 'api_key', None)
        if not api_key:
            raise MissingApiKeyException()
        return api_key
    
class AssistantCreateView(AssistantBaseView):
    def post(self, request):
        # Retrieve OpenAI API key
        api_key = self.get_api_key()
        service = AssistantIntegrationService(api_key=api_key)
        
        try:
            django_assistant = service.create_assistant(request.data, request.user)
            return Response(
                AssistantSerializer(django_assistant).data,
                status=status.HTTP_201_CREATED,
            )
        except ValidationError as ve:
            return Response({"errors": ve.errors()}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AssistantRetrieveView(AssistantBaseView):
    def get(self, request, assistant_id):
        # Retrieve OpenAI API key
        api_key = self.get_api_key()
        service = AssistantIntegrationService(api_key=api_key)
        
        try:
            django_assistant = service.retrieve_assistant(assistant_id, request.user)
            if django_assistant:
                return Response(AssistantSerializer(django_assistant).data, status=status.HTTP_200_OK)
            return Response({"error": "Assistant not found."}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as ve:
            return Response({"errors": ve.errors()}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AssistantListView(AssistantBaseView):
    def get(self, request):
        # Retrieve OpenAI API key
        api_key = self.get_api_key()
        service = AssistantIntegrationService(api_key=api_key)
        
        try:
            # Pass query parameters to Pydantic model for validation
            params = request.query_params.dict()  # Convert QueryDict to a standard dict
            assistants = service.list_assistants(params, request.user)
            
            # Serialize each Django Assistant instance
            serialized_assistants = [AssistantSerializer(assistant).data for assistant in assistants]
            return Response(serialized_assistants, status=status.HTTP_200_OK)
        
        except ValidationError as ve:
            return Response({"errors": ve.errors()}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class AssistantUpdateView(AssistantBaseView):
    def put(self, request, assistant_id):
        serializer = AssistantSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            # Retrieve OpenAI API key
            api_key = self.get_api_key()
            service = AssistantIntegrationService(api_key=api_key)
            
            try:
                django_assistant = service.update_assistant(assistant_id, serializer.validated_data, request.user)
                return Response(AssistantSerializer(django_assistant).data, status=status.HTTP_200_OK)
            except ObjectDoesNotExist:
                return Response({"error": "Assistant not found."}, status=status.HTTP_404_NOT_FOUND)
            except ValidationError as ve:
                return Response({"errors": ve.errors()}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class AssistantDeleteView(AssistantBaseView):
    def delete(self, request, assistant_id):
        # Retrieve OpenAI API key
        api_key = self.get_api_key()
        service = AssistantIntegrationService(api_key=api_key)
        
        try:
            service.delete_assistant(assistant_id, request.user)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ObjectDoesNotExist:
            return Response({"error": "Assistant not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)