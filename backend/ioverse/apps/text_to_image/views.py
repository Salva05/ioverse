from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action

from django.shortcuts import get_object_or_404

from .models import ImageGeneration
from .serializers import (
    ImageGenerationSerializer,
    ImageGenerationDetailSerializer,
    ImageGenerationListSerializer
)
from .services.text_to_image_service import TextToImageService

import logging

logger = logging.getLogger('text_to_image_project')

class ImageGenerationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ImageGeneration.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'list':
            return ImageGenerationListSerializer
        elif self.action == 'retrieve':
            return ImageGenerationDetailSerializer
        elif self.action == 'create':
            return ImageGenerationSerializer
        return ImageGenerationDetailSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            try:
                text_to_image_service = TextToImageService()
                image_generation = text_to_image_service.process_image_generation(
                    user=request.user,
                    validated_data=serializer.validated_data
                )
                output_serializer = ImageGenerationDetailSerializer(
                    image_generation, context={'request': request}
                )
                return Response(output_serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                logger.exception(f"Unexpected error during image generation: {e}")
                return Response(
                    {"detail": "An unexpected error occurred."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            logger.error(f"Serializer validation error: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        image_generation = self.get_object()
        image_generation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
