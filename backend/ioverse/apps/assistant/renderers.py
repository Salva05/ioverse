from rest_framework.renderers import BaseRenderer
import json

class SSEEventRenderer(BaseRenderer):
    """
    Renderer for Server-Sent Events (SSE).
    """
    media_type = 'text/event-stream'
    format = 'sse'
    charset = None  # SSE does not use character encoding

    def render(self, data, accepted_media_type=None, renderer_context=None):
        """
        Convert the data to an SSE-compatible string format.
        """
        if isinstance(data, dict):
            # For dictionaries, convert to JSON and wrap in an SSE format
            return f"data: {json.dumps(data)}\n\n".encode("utf-8")
        elif isinstance(data, str):
            # If the data is already a string, wrap it directly
            return f"data: {data}\n\n".encode("utf-8")
        else:
            # For other data types, default to empty SSE message
            return b"data: \n\n"