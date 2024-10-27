from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ImageGenerationViewSet

router = DefaultRouter()
router.register(r'image-generations', ImageGenerationViewSet, basename='image-generation')

urlpatterns = [
    path('', include(router.urls)),
]
