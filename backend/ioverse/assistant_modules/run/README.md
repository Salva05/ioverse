## Run Entity and Usage

The `Run` entity and its related components follow a schema specific to OpenAI Assistant's Run Structure, differing from other Assistant entities in this module. Unlike other models, the `Run` and `RunStep` entities does not need to be included as models in the application. Instead, it serves as a mapping layer, linking the application to the available instruments within OpenAI Assistant's Run domain.

### Usage of Run and Run Step Entities

The `Run` and `RunStep` entities are standalone classes that require an API key to be provided upon instantiation.

Each method in these classes accepts a dictionary of keyword arguments (`**kwargs`). Some keyword arguments are mandatory, as per the API’s requirements, and are handled internally within the class methods.

### EventHandler Usage
The `EventHandler` class bridges OpenAI Assistant's streaming events with the WebSocket connection, ensuring real-time updates are sent to the client. It extends `AssistantEventHandler` and captures key events during streaming, sending structured JSON messages via WebSocket.

#### Purpose
- **Capture Events:** Handles events like text creation, text deltas (chunks), and tool calls.
- **Send Updates:** Transmits these events as JSON messages to the client in real-time.

#### Initialization
The `EventHandler` is initialized with:
- **`websocket_send`:** A reference to the WebSocket's `send` method for transmitting messages.
- **`loop`:** The current event loop to schedule asynchronous operations.

#### Overridden Methods
- **`on_text_created(self, text: Text) -> None`**
  - Triggered when text generation starts.
  - Sends a `"start"` message: `{ "type": "start", "message": "Assistant started generating text." }`.

- **`on_text_delta(self, delta: TextDelta, snapshot: Text)`**
  - Triggered for each text chunk generated.
  - Sends a `"chunk"` message: `{ "type": "chunk", "message": "<text chunk>" }`.

- **`on_tool_call_created(self, tool_call: ToolCall)`**
  - Triggered when a tool is invoked.
  - Sends a `"tool_call"` message: `{ "type": "tool_call", "message": "<tool type>" }`.

- **`on_tool_call_delta(self, delta: ToolCallDelta, snapshot: ToolCall)`**
  - Triggered for tool updates (e.g., code inputs/outputs).
  - Sends `"code_input"` or `"code_output"` messages.

#### Integration
The `EventHandler` is passed to the `Run.stream` method, which uses it to capture and forward streaming events to the WebSocket client.

### Error Handling

Error handling is managed by a custom decorator defined in `helpers.py`. This decorator centralizes error management, but any additional error handling may be needed at the calling point of the method, based on specific application needs.