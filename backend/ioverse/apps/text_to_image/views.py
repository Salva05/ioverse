from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import ImageGeneration
from .serializers import (
    ImageGenerationSerializer,
    ImageGenerationDetailSerializer,
    ImageGenerationListSerializer
)
from .services.image_creation_service import ImageCreationService
from .services.image_generation_service import ImageGenerationService
import logging

logger = logging.getLogger('text_to_image_project')

class ImageGenerationViewSet(viewsets.ModelViewSet):
    """
    A viewset that provides the standard actions for ImageGeneration,
    along with a custom 'generate' action to create images without saving.
    """
    permission_classes = [permissions.IsAuthenticated]
    queryset = ImageGeneration.objects.all()
    serializer_class = ImageGenerationSerializer  # Default serializer

    # Initialize the ImageGenerationService
    image_generation_service = ImageGenerationService()

    def get_queryset(self):
        """
        Retrieve ImageGeneration objects for the authenticated user.
        """
        return ImageGeneration.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        """
        Return the appropriate serializer class based on the action.
        """
        if self.action == 'list':
            return ImageGenerationListSerializer
        elif self.action == 'retrieve':
            return ImageGenerationDetailSerializer
        elif self.action == 'create':
            return ImageGenerationSerializer
        return ImageGenerationDetailSerializer

    def create(self, request, *args, **kwargs):
        """
        Save a generated image selected by the user.
        """
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            try:
                image_creation_service = ImageCreationService()
                image_generation = image_creation_service.process_image_generation(
                    user=request.user,
                    validated_data=serializer.validated_data
                )
                output_serializer = ImageGenerationDetailSerializer(
                    image_generation, context={'request': request}
                )
                logger.info(f"Image saved successfully for user {request.user.username}.")
                return Response(output_serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                logger.exception(f"Unexpected error during image saving: {e}")
                return Response(
                    {"detail": "An unexpected error occurred."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            logger.error(f"Serializer validation error: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=False, methods=['post'])
    def generate(self, request):
        """
        Generate images based on the prompt and options provided in the request.
        Returns the image data (URLs or Base64 data) to the frontend without saving them in the database.
        """
        response = self.image_generation_service.generate_images(request.data)
        return response
            
    def destroy(self, request, *args, **kwargs):
        """
        Delete an ImageGeneration instance.
        """
        image_generation = self.get_object()
        image_generation.delete()
        logger.info(f"ImageGeneration {image_generation.id} deleted by user {request.user.username}.")
        return Response(status=status.HTTP_204_NO_CONTENT)
