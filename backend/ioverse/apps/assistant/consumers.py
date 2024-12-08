import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer


class AssistantConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        data = json.loads(text_data)
        prompt = data.get("prompt")

        # Simulate streaming chunks from OpenAI Assistant
        for chunk in self.generate_ai_chunks(prompt):
            await self.send(text_data=json.dumps({"chunk": chunk}))
            
    def generate_ai_chunks(self, prompt):
        # Example generator for streaming AI response, word by word
        response = "This is the first chunk of the AI response. Here's the second chunk. And finally, the third chunk."
        
        # Split the response into words and yield them one by one
        for word in response.split():
            yield word