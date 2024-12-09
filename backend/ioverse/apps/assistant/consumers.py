import json
from channels.generic.websocket import AsyncWebsocketConsumer
from assistant_modules.run.run import Run
from assistant_modules.run.stream_handler import AsyncEventHandler
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async

User = get_user_model()

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
        event_handler = AsyncEventHandler(self.send)

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