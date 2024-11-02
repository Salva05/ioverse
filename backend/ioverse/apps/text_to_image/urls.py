from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ImageGenerationViewSet, SharedImageView

router = DefaultRouter()
router.register(r'image-generations', ImageGenerationViewSet, basename='image-generation')

urlpatterns = [
    path('', include(router.urls)),
    path('shared/<uuid:share_token>/', SharedImageView.as_view(), name='shared-image'),
]
