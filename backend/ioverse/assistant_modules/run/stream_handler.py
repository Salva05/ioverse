from typing_extensions import override
from openai import AsyncAssistantEventHandler
from openai.types.beta.threads import Text, TextDelta
from openai.types.beta.threads.runs import ToolCall, ToolCallDelta
import json

class AsyncEventHandler(AsyncAssistantEventHandler):
    def __init__(self, websocket_send):
        """
        Initializes the EventHandler with a reference to the WebSocket send method.
        
        :param websocket_send: The WebSocket send coroutine (self.send from the consumer)
        """
        super().__init__()
        self.websocket_send = websocket_send

    @override
    async def on_text_created(self, text: Text) -> None:
        """
        Called when text generation starts.
        Sends a message asynchronously via WebSocket.
        """
        await self.websocket_send(
            text_data=json.dumps({
                "type": "start",
                "data": self.current_message_snapshot.model_dump()
            })
        )
    
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
