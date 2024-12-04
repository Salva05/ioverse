import logging

from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.assistant.serializers import MessageSerializer, MessageCreationSerializer, MessageUpdateSerializer
from apps.assistant.services.message_services import MessageIntegrationService
from pydantic import ValidationError
from django.core.exceptions import ObjectDoesNotExist

from ioverse.exceptions import MissingApiKeyException

logger = logging.getLogger(__name__)

class MessageBaseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_api_key(self):
        """
        Method to retrieve API key for a given user.
        """
        api_key = getattr(self.request.user, 'api_key', None)
        if not api_key:
            raise MissingApiKeyException()
        return api_key
    
class MessageCreateView(MessageBaseView):
    def post(self, request, thread_id):
        input_serializer = MessageCreationSerializer(data=request.data)
        
        # Retrieve OpenAI API key
        api_key = self.get_api_key()
        service = MessageIntegrationService(api_key=api_key)
        
        if input_serializer.is_valid():
            try:
                django_message = service.create_message(thread_id, input_serializer.validated_data, request.user)
                output_serializer = MessageSerializer(django_message)
                return Response(output_serializer.data, status=status.HTTP_201_CREATED)
            except ValidationError as ve:
                logger.error(f"Validation error: {ve}")
                return Response({"errors": ve.errors()}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Error creating message: {e}")
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MessageRetrieveView(MessageBaseView):
    def get(self, request, thread_id, message_id):
        # Retrieve OpenAI API key
        api_key = self.get_api_key()
        service = MessageIntegrationService(api_key=api_key)
        
        try:
            django_message = service.retrieve_message(thread_id, message_id, request.user)
            if django_message:
                return Response(MessageSerializer(django_message).data, status=status.HTTP_200_OK)
            return Response({"error": "Message not found."}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as ve:
            logger.error(f"Pydantic validation error: {ve}")
            return Response({"errors": ve.errors()}, status=status.HTTP_400_BAD_REQUEST)
        except ObjectDoesNotExist:
            logger.error(f"Message with ID {message_id} does not exist in Django DB.")
            return Response({"error": "Message not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error retrieving message: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MessageUpdateView(MessageBaseView):
    def put(self, request, thread_id, message_id):
        input_serializer = MessageUpdateSerializer(data=request.data, partial=True)
         
        # Retrieve OpenAI API key
        api_key = self.get_api_key()
        service = MessageIntegrationService(api_key=api_key)
        
        if input_serializer.is_valid():
            try:
                django_message = service.update_message(thread_id, message_id, input_serializer.validated_data, request.user)
                output_serializer = MessageSerializer(django_message)
                return Response(output_serializer.data, status=status.HTTP_200_OK)
            except ObjectDoesNotExist:
                logger.error(f"Message with ID {message_id} does not exist in Django DB.")
                return Response({"error": "Message not found."}, status=status.HTTP_404_NOT_FOUND)
            except ValidationError as ve:
                logger.error(f"Validation error: {ve}")
                return Response({"errors": ve.errors()}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Error updating message: {e}")
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MessageDeleteView(MessageBaseView):
    def delete(self, request, thread_id, message_id):        
        # Retrieve OpenAI API key
        api_key = self.get_api_key()
        service = MessageIntegrationService(api_key=api_key)
        
        try:
            response = service.delete_message(thread_id, message_id, request.user)
            return Response(response, status=status.HTTP_204_NO_CONTENT)
        except ObjectDoesNotExist:
            logger.error(f"Message with ID {message_id} does not exist in Django DB.")
            return Response({"error": "Message not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error deleting message: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MessageListView(MessageBaseView):
    def get(self, request, thread_id):                
        # Retrieve OpenAI API key
        api_key = self.get_api_key()
        service = MessageIntegrationService(api_key=api_key)
        
        limit = request.query_params.get('limit', 20)
        order = request.query_params.get('order', 'desc')
        after = request.query_params.get('after', None)
        before = request.query_params.get('before', None)
        run_id = request.query_params.get('run_id', None)
        
        try:
            messages = service.list_messages(
                thread_id=thread_id,
                user=request.user,
                limit=int(limit),
                order=order,
                after=after,
                before=before,
                run_id=run_id
            )
            serializer = MessageSerializer(messages, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValidationError as ve:
            logger.error(f"Pydantic validation error: {ve}")
            return Response({"errors": ve.errors()}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error listing messages: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
