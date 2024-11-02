from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.decorators import throttle_classes

from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.conf import settings
from django.db.models import Q

from .models import ImageGeneration
from .serializers import (
    ImageGenerationSerializer,
    ImageGenerationDetailSerializer,
    ImageGenerationListSerializer,
    SharedImageSerializer,
    UserSerializer
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
    throttle_scope = 'images'
    
    # Initialize the ImageGenerationService
    image_generation_service = ImageGenerationService()

    def get_queryset(self):
        """
        Retrieve ImageGeneration objects for the authenticated user,
        excluding expired 'url' images.
        """
        user = self.request.user
        now = timezone.now()
        expiration_threshold = now - timezone.timedelta(minutes=60)
        
        return ImageGeneration.objects.filter(user=user).filter(
            Q(response_format='b64_json') |
            Q(response_format='url', created_at__gte=expiration_threshold)
        )

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
    
    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        """
        Custom action to share an image.
        Sets `is_shared` to True and returns the shareable URL.
        """
        image = self.get_object()
        hours = request.data.get('hours')
        if not hours:
            return Response({'error': 'Hours duration is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            hours = int(hours)
            if hours < 1 or hours > 72:
                raise ValueError
        except ValueError:
            return Response({'error': "Hours must be an integer between 1 and 72"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not image.is_shared:
            # Share the image
            image.share(duration_hours=hours)

        # Build the frontend share URL
        share_url = f"{settings.FRONTEND_URL}/shared-image/{image.share_token}/"
        
        return Response(
            {
                'share_url': share_url,
                'shared_at': image.shared_at,
                'expires_at': image.expires_at,
            }, 
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def unshare(self, request, pk=None):
        """
        Custom action to unshare an image.
        Sets 'is_shared' to False
        """
        image = self.get_object()
        
        if image.is_shared:
            image.unshare()
            return Response({'detail': 'Image unshared successfully'}, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'Image is not shared.'}, status=status.HTTP_400_BAD_REQUEST)
        
    def destroy(self, request, *args, **kwargs):
        """
        Delete an ImageGeneration instance.
        """
        image_generation = self.get_object()
        image_generation.delete()
        logger.info(f"ImageGeneration {image_generation.id} deleted by user {request.user.username}.")
        return Response(status=status.HTTP_204_NO_CONTENT)

class SharedImageView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, share_token, format=None):
        """
        Retrieve a shared image using the 'share_token'
        Only returns the image if 'is_shared=True'
        """
        image = get_object_or_404(ImageGeneration, share_token=share_token, is_shared=True)
        
        # Check for expiration
        if image.expires_at and timezone.now() > image.expires_at:
            image.unshare()
            return Response({'detail': 'This shared link has expired'}, status=status.HTTP_200_OK)

        serializer = SharedImageSerializer(image, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user