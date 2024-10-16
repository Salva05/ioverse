from django.db import transaction
from django.apps import apps
from ..models import Conversation, Message
from chatbot_modules.core.chatbot import Chatbot
import logging
import openai

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
            conversation = self.get_or_create_conversation(user, conversation_id, message_body)

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

            # Update the conversation
            conversation.save(update_fields=["updated_at"])
            
        return user_message, ai_message

    def get_or_create_conversation(self, user, conversation_id, first_message):
        if conversation_id:
            conversation = Conversation.objects.get(id=conversation_id, user=user)
            logger.debug(f"Found existing conversation: {conversation.id} for user: {user.username}")
        else:
            title = self.generate_conversation_title(first_message)
            conversation = Conversation.objects.create(user=user, title=title)
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

    def generate_conversation_title(self, first_message: str) -> str:
        """
        Generates a title for the conversation based on the first message

        Args:
            first_message (str): The user's first message in the conversation.

        Returns:
            str: A generated title for the conversation.
        """
        system_prompt = (
            "You are an assistant specialized in generating concise, relevant, and descriptive titles for conversations. "
            "Your task is to analyze the user's initial message and create a suitable title that accurately reflects the topic and intent of the conversation.\n\n"
            "**Guidelines:**\n"
            "1. **Conciseness:** The title should be no longer than 5 words.\n"
            "2. **Relevance:** Ensure the title directly relates to the main topic of the user's message.\n"
            "3. **Clarity:** Use clear and straightforward language without jargon.\n"
            "4. **Capitalization:** Capitalize the first letter of each major word.\n"
            "5. **Avoid Redundancy:** Do not include phrases like 'Conversation about' or 'Discussion on.'\n\n"
            "**Format:**\n"
            "- The title should be presented as a single line of text without any additional commentary or punctuation at the end.\n\n"
            "**Example:**\n\n"
            "- **User Message:** \"I'm planning to launch an online store for handmade jewelry. Can you suggest some effective marketing strategies?\"\n\n"
            "- **Generated Title:** \"Marketing Strategies\""
        )
        user_prompt = f"User Message: \"{first_message}\"\n\nTitle:"
        
        try:
            response = openai.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                max_tokens=20,        
                temperature=0.5,      # Balanced creativity and accuracy
                n=1,
            )
            title = response.choices[0].message.content.strip()
            return title
        except Exception as e:
            logger.error(f"Title generation failed: {e}")
            return "Untitled Conversation"