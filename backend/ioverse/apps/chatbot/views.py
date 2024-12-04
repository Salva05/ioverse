from rest_framework.decorators import action
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from rest_framework.views import APIView

from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.conf import settings
from django.utils import timezone

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.platypus.flowables import HRFlowable

from ioverse.exceptions import MissingApiKeyException
from .models import Message, Conversation
from .serializers import MessageSerializer, ReadOnlyConversationSerializer, SharedConversationSerializer
from .services.chat_service import ChatService
import logging
import html
import re

logger = logging.getLogger(__name__)

class MessageViewSet(viewsets.ModelViewSet):
    
    queryset = Message.objects.all()    # For efficency will apply constraints later on..
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [UserRateThrottle]   # Apply rate limiting 
    
    # Override create method to use ChatService
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        # Retrieve the OpenAI api key for the user
        api_key = getattr(request.user, 'api_key', None)
        if not api_key:
            raise MissingApiKeyException()
        
        if serializer.is_valid():
            try:
                # Extract validated data
                message_body = serializer.validated_data['message_body']
                conversation_id = serializer.validated_data.get('conversation_id')
                
                # Process the message through ChatService
                chat_service = ChatService(api_key=api_key)
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
    
    serializer_class = ReadOnlyConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    # Custom queryset to filter by owner
    def get_queryset(self):
        return Conversation.objects.filter(user = self.request.user)
    
    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        """
        Custom action to share a conversation.
        Sets `is_shared` to True and returns the shareable URL.
        """
        conversation = self.get_object()
        hours = request.data.get('hours')
        if not hours:
            return Response({'error': 'Hours duration is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            hours = int(hours)
            if hours < 1 or hours > 72:
                raise ValueError
        except ValueError:
            return Response({'error': "Hours must be an integer between 1 and 72"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not conversation.is_shared:
            # Share the conversation
            conversation.share(duration_hours=hours)

        # Build the frontend share URL
        share_url = f"{settings.FRONTEND_URL}/shared-conversation/{conversation.share_token}/"
        
        return Response(
            {
                'share_url': share_url,
                'shared_at': conversation.shared_at,
                'expires_at': conversation.expires_at,
            }, 
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
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
        
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """
        Custom action to download a conversation as a PDF with improved styling and Markdown support.
        """
        conversation = self.get_object()

        # Retrieve the messages of the conversation
        messages = Message.objects.filter(conversation_id=conversation.id).order_by('timestamp')

        # Create a file-like HTTP response to hold the PDF
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="conversation_{conversation.id}.pdf"'

        # Create a PDF document using ReportLab
        doc = SimpleDocTemplate(
            response,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )
        story = []  # List to hold the PDF elements

        # Styles and formatting
        styles = getSampleStyleSheet()
        
        # Define a more professional base style
        base_style = ParagraphStyle(
            'BaseStyle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=12,
            leading=15,
            textColor=colors.black,
            alignment=TA_LEFT,
        )
        
        # Style for user messages
        user_style = ParagraphStyle(
            'UserStyle',
            parent=base_style,
            textColor=colors.darkblue,  # Subtle color for differentiation
            leftIndent=10,
            spaceBefore=6,
            spaceAfter=6,
        )
        
        # Style for AI messages
        ai_style = ParagraphStyle(
            'AIStyle',
            parent=base_style,
            textColor=colors.darkgreen,  # Subtle color for differentiation
            leftIndent=10,
            spaceBefore=6,
            spaceAfter=6,
        )
        
        # Style for the conversation title
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Title'],
            fontName='Helvetica-Bold',
            fontSize=16,
            leading=20,
            textColor=colors.black,
            alignment=TA_LEFT,
            spaceAfter=20,
        )
        
        # Add conversation title
        story.append(Paragraph(conversation.title, title_style))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.grey))
        story.append(Spacer(1, 12))  # Adds space after the title

        # Function to convert Markdown to ReportLab-compatible HTML
        def markdown_to_reportlab(text):
            # Decode HTML entities
            text = html.unescape(text)
            
            # Convert Markdown to HTML tags
            text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
            text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', text)
            text = re.sub(r'__(.*?)__', r'<u>\1</u>', text)
            text = re.sub(r'`(.*?)`', r'<font face="Courier">\1</font>', text)
            
            # Replace <br> tags and newline characters with <br/>
            text = re.sub(r'(<br\s*\/?>|\n)', '<br/>', text)
            
            return text

        # Loop through the messages and format them
        for msg in messages:
            # Process Markdown in the message body
            formatted_message = markdown_to_reportlab(msg.message_body)
            
            if msg.sender.lower() == 'user':
                # User message formatting with a label
                content = f'<b>User:</b> {formatted_message}'
                story.append(Paragraph(content, user_style))
            else:
                # AI message formatting with a label
                content = f'<b>AI:</b> {formatted_message}'
                story.append(Paragraph(content, ai_style))
            
            # Subtle separator between messages
            story.append(Spacer(1, 4))
            story.append(HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey))
            story.append(Spacer(1, 8))

        # Build the PDF document
        doc.build(story)

        return response
    
    @action(detail=True, methods=['patch'])
    def rename(self, request, pk=None):
        conversation = self.get_object()
        new_title = request.data.get('new_title', None)
        
        if not new_title:
            return Response({'error': 'Title is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        conversation.title = new_title
        conversation.save()
        
        return Response({'success': 'Title updated successfully'}, status=status.HTTP_200_OK)
        
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

        serializer = SharedConversationSerializer(conversation)
        return Response(serializer.data, status=status.HTTP_200_OK)
