from django.urls import path, include
from rest_framework import routers
from .views import MessageViewSet, ConversationViewSet, SharedConversationView

router = routers.DefaultRouter()
router.register(r'messages', MessageViewSet, basename='messages')
router.register(r'conversations', ConversationViewSet, basename='conversations')

urlpatterns = [
    path('', include(router.urls)),
    path('shared/<uuid:share_token>/', SharedConversationView.as_view(), name='shared-conversation-detail'),
]
