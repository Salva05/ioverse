from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from .models import Message
from .serializers import MessageSerializer
from .services.chat_service import ChatService
import logging

logger = logging.getLogger(__name__)

class MessageViewSet(viewsets.ModelViewSet):
    
    queryset = Message.objects.all()    # For efficency will apply constraints later on..
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [UserRateThrottle]   # Apply rate limiting 
    
    # Override create method to use ChatService
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                # Extract validated data
                message_body = serializer.validated_data['message_body']
                conversation_id = serializer.validated_data.get('conversation_id')
                
                # Process the message through ChatService
                chat_service = ChatService()
                user_message, ai_message = chat_service.process_user_message(
                    user=request.user,
                    message_body=message_body,
                    conversation_id=conversation_id
                )
                
                # Serialize the messages
                user_message_data = MessageSerializer(user_message).data
                ai_message_data = MessageSerializer(ai_message).data
                
                # Return the response
                response_data = {
                    'user_message': user_message_data,
                    'ai_message': ai_message_data
                }
                return Response(response_data, status=status.HTTP_201_CREATED)
            except Exception as e:
                logger.exception(f"Unexpected error during message processing: {e}")
                return Response(
                    {"detail": "An unexpected error occurred."},    # sensitive information not sent to client
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            logger.error(f"Serializer validation error: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
