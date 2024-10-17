from rest_framework.decorators import action
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Message, Conversation
from .serializers import MessageSerializer, ReadOnlyConversationSerializer
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

class ConversationViewSet(viewsets.ModelViewSet):
    
    queryset = Conversation.objects.all()
    serializer_class = ReadOnlyConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    # Custom queryset to filter by owner
    def get_queryset(self):
        return Conversation.objects.filter(user = self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def share(self, request, pk=None):
        """
        Custom action to share a conversation.
        Sets `is_shared` to True and returns the shareable URL.
        """
        conversation = self.get_object()
        
        if not conversation.is_shared:
            # Share the conversation
            conversation.share()

        # Build the absolute URL for sharing
        share_url = request.build_absolute_url(
            reverse('shared-conversation-detail', args=[conversation.share_token])
        )
        return response({'share_url': share_url}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def unshare(self, request, pk=None):
        """
        Custom action to unshare a conversation.
        Sets 'is_shared' to False
        """
        conversation = self.get_object()
        
        if conversation.is_shared:
            conversation.unshare()
            return Response({'detail': 'Conversation unshared successfully'}, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'Conversation is not shared.'}, status=status.HTTP_400_BAD_REQUEST)
        
class SharedConversationView(APIView):
    permission_classes = [permissions.AllowAny] # Public access
    
    def get(self, request, share_token, format=None):
        """
        Retrieve a shared conversation using the 'share_token'
        Only returns the covnversation if 'is_shared=True'
        """
        conversation = get_object_or_404(Conversation, share_token=share_token, is_shared=True)
        
        # Check for expiration
        if conversation.expires_at and timezone.now() > conversation.expires_at:
            conversation.unshare()
            return Response({'detail': 'This shared link has expired'}, status=status.HTTP_200_OK)

        serializer = ReadOnlyConversationSerializer(conversation)
        return Response(serializer.data, status=status.HTTP_200_OK)
    