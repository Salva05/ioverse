from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.assistant.serializers import AssistantSerializer
from apps.assistant.services.assistant_services import AssistantIntegrationService
from pydantic import ValidationError
from django.core.exceptions import ObjectDoesNotExist

class AssistantCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        service = AssistantIntegrationService()
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

class AssistantRetrieveView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, assistant_id):
        service = AssistantIntegrationService()
        try:
            django_assistant = service.retrieve_assistant(assistant_id, request.user)
            if django_assistant:
                return Response(AssistantSerializer(django_assistant).data, status=status.HTTP_200_OK)
            return Response({"error": "Assistant not found."}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as ve:
            return Response({"errors": ve.errors()}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AssistantListView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        service = AssistantIntegrationService()  
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
        
class AssistantUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, assistant_id):
        serializer = AssistantSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            service = AssistantIntegrationService()
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
    
class AssistantDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, assistant_id):
        service = AssistantIntegrationService()
        try:
            service.delete_assistant(assistant_id, request.user)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ObjectDoesNotExist:
            return Response({"error": "Assistant not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)