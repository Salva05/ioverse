from django.db import transaction
from django.apps import apps
from ..models import Conversation, Message
from chatbot_modules.core.chatbot import Chatbot
import logging

logger = logging.getLogger(__name__)

class ChatService:
    def __init__(self):
        # Access shared components from AppConfig
        chatbot_app_config = apps.get_app_config('chatbot')
        self.ai_service = chatbot_app_config.ai_service
        self.chat_logic = chatbot_app_config.chat_logic

    def process_user_message(self, user, message_body, conversation_id=None):
        """
        Handles processing of a user message:
        - Saves the message.
        - Retrieves or creates the conversation.
        - Reconstructs chat history.
        - Gets AI response.
        - Saves AI message.
        """
        with transaction.atomic():
            # Retrieve or create conversation
            conversation = self.get_or_create_conversation(user, conversation_id)

            # Save user message
            user_message = Message.objects.create(
                conversation=conversation,
                sender='user',
                message_body=message_body
            )

            # Reconstruct chat history
            history = self.build_chat_history(conversation)

            # Create Chatbot instance
            chatbot = Chatbot(self.ai_service, self.chat_logic, history=history)

            # Get AI response
            ai_response_text = chatbot.get_response(user_message.message_body)

            # Save AI message
            ai_message = Message.objects.create(
                conversation=conversation,
                sender='ai',
                message_body=ai_response_text
            )

        return user_message, ai_message

    def get_or_create_conversation(self, user, conversation_id):
        if conversation_id:
            conversation = Conversation.objects.get(id=conversation_id, user=user)
            logger.debug(f"Found existing conversation: {conversation.id} for user: {user.username}")
        else:
            conversation = Conversation.objects.create(user=user, title='New Conversation')
            logger.debug(f"Created new conversation: {conversation.id} for user: {user.username}")
        return conversation

    def build_chat_history(self, conversation):
        # Reconstruct the chat history from the conversation messages
        history = self.chat_logic.prepare_initial_history()
        messages = conversation.messages.order_by('timestamp')
        for message in messages:
            role = 'user' if message.sender == 'user' else 'assistant'
            content = message.message_body
            history.append({'role': role, 'content': content})
        return history
