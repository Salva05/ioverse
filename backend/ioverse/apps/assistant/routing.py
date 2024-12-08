from django.urls import path

from . import consumers

websocket_urlpatterns = [
    path("ws/assistant/stream", consumers.AssistantConsumer.as_asgi()),
]