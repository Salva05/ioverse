from typing_extensions import override
from openai import AsyncAssistantEventHandler
from openai.types.beta.threads import Text, TextDelta
from openai.types.beta.threads.runs import ToolCall, ToolCallDelta
from openai.types.beta.assistant_stream_event import ThreadRunCreated, ThreadRunFailed
from openai.types.beta.threads.message import Message
from openai.types.beta.threads.text_content_block import TextContentBlock
from openai.types.beta.threads.file_path_annotation import FilePathAnnotation

import json
import logging

logger = logging.getLogger(__name__)

class AsyncEventHandler(AsyncAssistantEventHandler):
    def __init__(self, websocket_send, on_file_content_created, api_key, user):
        """
        Initializes the AsyncEventHandler with the following parameters:

        - websocket_send: A coroutine for sending messages via WebSocket (e.g., self.send from the WebSocket consumer).
        - on_image_created: A callback function to handle saving images created during events.
        - api_key: An API key for invoking external services or APIs within the callback functions.
        - user: The local user instance to associate with saved file objects or events.

        :param websocket_send: The WebSocket send coroutine.
        :param on_file_content_created: Callback for processing created files and contents.
        :param api_key: API key for accessing external services.
        :param user: User instance for associating files or events.
        """
        super().__init__()
        self.websocket_send = websocket_send
        self.on_file_content_created = on_file_content_created
        self.api_key = api_key
        self.user = user

    @override
    async def on_event(self, event):
        """
        Called when a Run object is created and generation starts.
        Signals asynchronously via WebSocket.
        """
        if isinstance(event, ThreadRunFailed):
            await self.websocket_send(
            text_data=json.dumps({
                "type": "error",
                "message": event.data.last_error.message
            })
        )
        if isinstance(event, ThreadRunCreated):
            await self.websocket_send(
            text_data=json.dumps({
                "type": "start",
                "message": "Run created"
            })
        )
        return await super().on_event(event)
    
    @override
    async def on_run_step_created(self, run_step):
        return await super().on_run_step_created(run_step)
    
    @override
    async def on_text_delta(self, delta: TextDelta, snapshot: Text):
        """
        Called for each text delta (chunk) generated.
        Sends the chunk message asynchronously via WebSocket.
        """
        await self.websocket_send(
            text_data=json.dumps({
                "type": "chunk",
                "message": delta.value
            })
        )

    @override
    async def on_message_created(self, message):
        """
        Called when a message is created
        Sends the snapshot of the message at the given moment via WebSocket
        """
        await self.websocket_send(
            text_data=json.dumps({
                "type": "message_creation",
                "data": message.model_dump()
            })
        )

    @override
    async def on_message_done(self, message: Message) -> None:
        """
        Called when a message is completed
        Saves the file and its content to the local database
        and sends the message via WebSocket
        """
        # Check for file_path annotations
        file_path_annotations = []

        for content_block in message.content:
            # Check if the content block is a TextContentBlock
            if isinstance(content_block, TextContentBlock):
                for annotation in content_block.text.annotations:
                    # Check if the annotation is of type file_path
                    if isinstance(annotation, FilePathAnnotation):
                        file_path_annotations.append(annotation)

        if file_path_annotations:
            for annotation in file_path_annotations:
                file_id = annotation.file_path.file_id
                await self.on_file_content_created(file_id, self.api_key, self.user, is_image=False)

        # Send the message via WebSocket
        await self.websocket_send(
            text_data=json.dumps({
                "type": "message_done",
                "data": message.model_dump()
            })
        )

    @override
    async def on_image_file_done(self, image_file):
        """
        Called when an image file block is finished
        Saves the file and it's content (image) to local database
        and sends the image file representation via WebSocket
        """
        await self.on_file_content_created(image_file.file_id, self.api_key, self.user, is_image=True)
        
        await self.websocket_send(
            text_data=json.dumps({
                "type": "image_file_done",
                "data": self.current_message_snapshot.model_dump(),
                "image_file": image_file.model_dump()
            })
        )
        return await super().on_image_file_done(image_file)
    
    @override
    async def on_tool_call_created(self, tool_call: ToolCall):
        """
        Called when a tool call is created.
        Sends a tool call message asynchronously via WebSocket.
        """
        await self.websocket_send(
            text_data=json.dumps({
                "type": "tool_call",
                "message": tool_call.type
            })
        )

    @override
    async def on_tool_call_delta(self, delta: ToolCallDelta, snapshot: ToolCall):
        """
        Called for each delta in a tool call.
        Sends code input/output asynchronously via WebSocket if available.
        """
        try:
            if delta.type == "code_interpreter" and delta.code_interpreter:
                if delta.code_interpreter.input:
                    await self.websocket_send(
                        text_data=json.dumps({
                            "type": "code_input",
                            "message": delta.code_interpreter.input
                        })
                    )
                if delta.code_interpreter.outputs:
                    logs = [
                        output.logs
                        for output in delta.code_interpreter.outputs
                        if output.type == "logs"
                    ]
                    if logs:
                        await self.websocket_send(
                            text_data=json.dumps({
                                "type": "code_output",
                                "message": logs
                            })
                        )
        except Exception as e:
            print(f"Exception in on_tool_call_delta: {e}")
            raise
