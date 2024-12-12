import json
from pathlib import Path
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async

from .models.file import File
from file_modules.services import FileService
from assistant_modules.run.run import Run
from apps.assistant.services.file_services import FileIntegrationService
from assistant_modules.run.stream_handler import AsyncEventHandler

import logging

logger = logging.getLogger(__name__)
User = get_user_model()
         
async def on_file_content_created(file_id, api_key, user, is_image = True):
    """
    Callback for saving created files and it's content locally.
    :param file_id: The ID of the created file.
    :param api_key: The API key for accessing external services.
    :param user: The user to associate with the file.
    :param is_image: A flag to indicate whether the file is an image or not
    """
    try:
        service = FileIntegrationService(api_key=api_key)
        file_service = FileService(api_key=api_key)
        
        openai_file = await sync_to_async(file_service.retrieve_file)(file_id=file_id)
        
        sanitized_filename = Path(openai_file.filename).name
        
        # Create local file (wrapped in sync_to_async)
        file = await sync_to_async(File.objects.create)(
            id=openai_file.id,
            bytes=openai_file.bytes,
            created_at=openai_file.created_at,
            filename=sanitized_filename,
            object=openai_file.object,
            purpose=openai_file.purpose,
            owner=user
        )
        
        # Get the content of the file (the image)
        file_content = service.get_content(file_id, file.filename, user)
        
        if is_image:
            # Update the file with the image content
            file.image_file = file_content
        else:
            # Update the file with the content (could not be an image) retrieved
            print(file_content)
            file.file_content = file_content
            
        await sync_to_async(file.save)()
    except Exception as e:
        logger.error(f"An error occurred while saving the image file locally: {str(e)}")   
    
class OpenAIStreamingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            thread_id = data.get("thread_id")
            assistant_id = data.get("assistant_id")
            instructions = data.get("instructions")
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({"error": "Invalid JSON"}))
            return

        if not thread_id or not assistant_id:
            await self.send(text_data=json.dumps({"error": "Missing required parameters"}))
            return

        # Stream OpenAI Assistant responses
        await self.stream_openai_response(thread_id, assistant_id, instructions)

    async def stream_openai_response(self, thread_id, assistant_id, instructions):  # instruction for future usage
        # Access the API key from the authenticated user
        user = self.scope.get('user')
        if not user.is_authenticated:
            await self.send(text_data=json.dumps({"error": "Authentication required"}))
            return

        api_key = await self.get_user_api_key(user)
        if not api_key:
            await self.send(text_data=json.dumps({"error": "API key not found"}))
            return

        # Run class for API calls and API key
        run = Run(api_key=api_key)

        # EventHandler to manage the stream
        event_handler = AsyncEventHandler(
            websocket_send=self.send, 
            on_file_content_created=on_file_content_created,
            api_key=api_key,
            user=user
        )

        kwargs = {
            'thread_id': thread_id,
            'assistant_id': assistant_id,
        }

        try:
            await run.stream(event_handler=event_handler, **kwargs)
            
            # Retrieve the final messages after the stream ends
            messages = await event_handler.get_final_messages()

            # Serialize and send messages
            serialized_messages = [message.model_dump() for message in messages]
            
            # Send the final generated messages and signal end of generation
            await self.send(text_data=json.dumps({
                "type": "end",
                "data": serialized_messages
            }))
        except Exception as e:
            await self.send(text_data=json.dumps({"type": "error", "message": str(e)}))

    @sync_to_async
    def get_user_api_key(self, user):
        """
        Retrieve the API key from the authenticated user.
        """
        return getattr(user, 'api_key', None)