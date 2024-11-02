from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ImageGenerationViewSet, SharedImageView, CurrentUserView

router = DefaultRouter()
router.register(r'image-generations', ImageGenerationViewSet, basename='image-generation')

urlpatterns = [
    path('', include(router.urls)),
    path('shared/<uuid:share_token>/', SharedImageView.as_view(), name='shared-image'),
    path('api/current-user/', CurrentUserView.as_view(), name='current-user'),
]
