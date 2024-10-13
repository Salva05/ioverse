from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from rest_framework import authentication, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import JSONParser, FormParser

from .serializers import MessageSerializer
from .models import Conversation

import logging

logger = logging.getLogger(__name__)

class MessageCreate(APIView):
    """
    Hanldes incoming POST requests (user messages), routing it's body 
    into chatbot_modules and returns a message representing the AI's reponse
    - If 'conversation_id' is provided, associates the message with the existing conversation.
    - If not, creates a new conversation and associates the message with it.
    
    * Requires token authentication.
    """
    
    throttle_classes = [UserRateThrottle]   # DRF rate limiting for API requests
    permission_classes = [permissions.IsAuthenticated]  # Sets permission requirements for accessing the view
    parser_classes = [JSONParser, FormParser]   # Enables the parsing of JSON
    
    # authentication_classes = [authentication.TokenAuthentication]
    # permission_classes = [permissions.IsAdminUser]

    def post(self, request, format=None):
        user = request.user
        data = request.data.copy() # Make a mutable copy of the request data
        
        # Establislh if is first message of the conversation
        # checking if request.data.conversation_id is present
        conversation_id = data.get('conversation_id', None)
        if conversation_id:
            try:
                # Fetch the conversation
                conversation = Conversation.objects.get(id=conversation_id, user=user)
                logger.debug(f"Found existing conversation: {conversation.id} for user: {user.username}")
            except Conversation.DoesNotExist:
                logger.error(f"Invalid conversation ID: {conversation_id} for user: {user.username}")
                return Response(
                    {"conversation_id": ["Invalid conversation ID."]},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if last message was from user or AI
            last_message = conversation.messages.last()
            if last_message and last_message.sender == 'user':
                sender = 'ai'
            else:
                sender = 'user'
        else:
            # No conversation_id provided; this is the first message in a new conversation
            sender = 'user'
        
        # Prepare data for the serializer
        # The 'sender' is determined by the backend and should not be provided by the client
        serializer_data = {
            "conversation_id": conversation_id,  # Serializer will handle 'None' cases 
        }
        
        if 'message_body' in data:
            serializer_data['message_body'] = data['message_body']
    
        serializer = MessageSerializer(
            data=serializer_data,
            context={'request': request}
        )
        
        if serializer.is_valid(): # Perform validation
            try:
                with transaction.atomic():
                    message = serializer.save(sender=sender)    # pass the sender
                logger.info(f"Message {message.id} created in conversation {message.conversation.id} by {sender}")
                return Response(
                    MessageSerializer(message).data,
                    status=status.HTTP_201_CREATED
                )
            except ValidationError as e:
                logger.error(f"Validation error during message creation: {e.detail}")
                return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.exception("Unexpected error during message creation.")
                return Response(
                    {"detail": "An unexpected error"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            logger.error(f"Serializer validation error: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)