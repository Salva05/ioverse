from rest_framework import routers
from .views import MessageViewSet, ConversationViewSet

router = routers.DefaultRouter()
router.register(r'messages', MessageViewSet, basename='messages')
router.register(r'conversations', ConversationViewSet, basename='conversations')

urlpatterns = router.urls
