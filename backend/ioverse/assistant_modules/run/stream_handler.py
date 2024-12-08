from typing_extensions import override
from openai import AssistantEventHandler
from openai.types.beta.threads import Text, TextDelta
from openai.types.beta.threads.runs import ToolCall, ToolCallDelta
import json
import asyncio

class EventHandler(AssistantEventHandler):
    def __init__(self, websocket_send, loop):
        """
        Initializes the EventHandler with a reference to the WebSocket send method and the event loop.
        
        :param websocket_send: The WebSocket send coroutine (self.send from the consumer)
        :param loop: The running event loop
        """
        super().__init__()  # Initialize the base class
        self.websocket_send = websocket_send
        self.loop = loop
        
    @override
    def on_text_created(self, text: Text) -> None:
        """
        Called when text generation starts.
        Schedules an asynchronous send via the event loop.
        """
        asyncio.run_coroutine_threadsafe(
            self.websocket_send(
                text_data=json.dumps({
                    "type": "start",
                    "message": "Assistant started generating text."
                })
            ),
            self.loop
        )

    @override
    def on_text_delta(self, delta: TextDelta, snapshot: Text):
        """
        Called for each text delta (chunk) generated.
        Schedules an asynchronous send via the event loop.
        """
        asyncio.run_coroutine_threadsafe(
            self.websocket_send(
                text_data=json.dumps({
                    "type": "chunk",
                    "message": delta.value
                })
            ),
            self.loop
        )

    @override
    def on_tool_call_created(self, tool_call: ToolCall):
        """
        Called when a tool call is created.
        Schedules an asynchronous send via the event loop.
        """
        asyncio.run_coroutine_threadsafe(
            self.websocket_send(
                text_data=json.dumps({
                    "type": "tool_call",
                    "message": tool_call.type
                })
            ),
            self.loop
        )

    @override
    def on_tool_call_delta(self, delta: ToolCallDelta, snapshot: ToolCall):
        """
        Called for each delta in a tool call.
        Schedules asynchronous sends via the event loop.
        """
        try:
            if delta.type == "code_interpreter" and delta.code_interpreter:
                if delta.code_interpreter.input:
                    asyncio.run_coroutine_threadsafe(
                        self.websocket_send(
                            text_data=json.dumps({
                                "type": "code_input",
                                "message": delta.code_interpreter.input
                            })
                        ),
                        self.loop
                    )
                if delta.code_interpreter.outputs:
                    logs = [output.logs for output in delta.code_interpreter.outputs if output.type == "logs"]
                    if logs:
                        asyncio.run_coroutine_threadsafe(
                            self.websocket_send(
                                text_data=json.dumps({
                                    "type": "code_output",
                                    "message": logs
                                })
                            ),
                            self.loop
                        )
        except Exception as e:
            print(f"Exception in on_tool_call_delta: {e}")
            raise