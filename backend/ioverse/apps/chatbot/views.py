from django.apps import apps
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from rest_framework import authentication, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import JSONParser, FormParser

from .serializers import MessageSerializer
from .models import Conversation
from .models import Message
from chatbot_modules.core.chatbot import Chatbot

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
        
        # Establish if it's first message of the conversation
        # checking if request.data.conversation_id is present
        conversation_id = data.get('conversation_id', None)
        if conversation_id:
            try:
                # Ensure the conversation_id exists, if it has been passed in the request
                conversation = Conversation.objects.get(id=conversation_id, user=user)
                logger.debug(f"Found existing conversation: {conversation.id} for user: {user.username}")
            except Conversation.DoesNotExist:
                logger.error(f"Invalid conversation ID: {conversation_id} for user: {user.username}")
                return Response(
                    {"conversation_id": ["Invalid conversation ID."]},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Prepare data for the serializer
        serializer_data = {
            "conversation_id": conversation_id,  # Serializer will handle 'None' cases 
        }
        
        if 'message_body' in data:  # Handle cases where msg is empty, passing it to serializer
            serializer_data['message_body'] = data['message_body']
    
        serializer = MessageSerializer(
            data=serializer_data,
            context={'request': request}
        )
        
        if serializer.is_valid(): # Perform validation
            try:
                with transaction.atomic():
                    # Save the user message
                    user_message = serializer.save()
                    
                # Access the shared components from AppConfig
                chatbot_app_config = apps.get_app_config('chatbot')
                ai_service = chatbot_app_config.ai_service
                chat_logic = chatbot_app_config.chat_logic
                
                # Reconstruct chat history from conversation messages
                conversation = user_message.conversation
                history = self.build_chat_history(conversation)
                
                # Create a new Chatbot instance per conversation
                chatbot = Chatbot(ai_service, chat_logic, history=history)
                
                # Get the AI's response
                ai_response_text = chatbot.get_response(user_message.message_body)
                
                with transaction.atomic():
                    # Save the AI's response as a new message
                    ai_message = Message.objects.create(
                        conversation=conversation,
                        sender='ai',
                        message_body=ai_response_text
                        )
                    
                # Return both messages
                response_data = {
                    'user_message': MessageSerializer(user_message).data,
                    'ai_message': MessageSerializer(ai_message).data
                }
                logger.debug(f"Message {user_message.id} created in conversation {user_message.conversation.id}")
                return Response(response_data, status=status.HTTP_201_CREATED)
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
        
    def build_chat_history(self, conversation):
        # Reconstruct the chat history from the conversation messages
        chatbot_app_config = apps.get_app_config('chatbot')
        chat_logic = chatbot_app_config.chat_logic

        # Start with the default system message
        history = chat_logic.prepare_initial_history()

        # Append existing messages in the conversation to the history
        messages = conversation.messages.order_by('timestamp')
        for message in messages:
            role = 'user' if message.sender == 'user' else 'assistant'
            content = message.message_body
            history.append({'role': role, 'content': content})
        return history