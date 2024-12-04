from rest_framework import serializers

from django.contrib.auth import get_user_model

from .models import ImageGeneration
from ..chatbot.models import Conversation

import logging

logger = logging.getLogger('text_to_image_project')

User = get_user_model()

class ImageGenerationSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField( # Defaults to the current authenticated user
        default=serializers.CurrentUserDefault()
    )
    image_url = serializers.URLField(required=False, allow_null=True, read_only=True)
    image_file = serializers.ImageField(required=False, allow_null=True, read_only=True)
    image_data = serializers.CharField(write_only=True, required=False)
    created_at = serializers.DateTimeField(read_only=True)
    revised_prompt = serializers.CharField(required=False, allow_null=True, read_only=True)
    share_token = serializers.UUIDField(read_only=True)
    is_shared = serializers.BooleanField(required=False)
    shared_at = serializers.DateTimeField(read_only=True)
    expires_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = ImageGeneration
        fields = [
            'id',
            'user',
            'prompt',
            'image_data',
            'image_url',
            'image_file',
            'created_at',
            'model_used',
            'n',
            'quality',
            'response_format',
            'size',
            'style',
            'revised_prompt',
            'is_shared',
            'shared_at',
            'expires_at',
            'share_token',
        ]
        read_only_fields = [
            'id',
            'user',
            'image_url',
            'image_file',
            'created_at',
            'revised_prompt',
            'shared_at',
            'expires_at',
            'share_token',
        ]

    def validate(self, attrs):
        # Copy attrs to avoid modifying the original data
        data = attrs.copy()
        model_used = data.get('model_used', 'dall-e-2')  # Default to 'dall-e-2' if not provided
        prompt = data.get('prompt', '')
        n = data.get('n', 1)
        quality = data.get('quality')
        style = data.get('style')
        size = data.get('size', '512x512')

        # Validate 'prompt'
        if not prompt.strip():
            raise serializers.ValidationError({'prompt': 'Prompt cannot be empty.'})

        if model_used == 'dall-e-3':
            # For 'dall-e-3', prompt length must be <= 4000 characters
            if len(prompt) > 4000:
                raise serializers.ValidationError({'prompt': 'For dall-e-3, prompt length must be 4000 characters or fewer.'})
            # 'n' must be 1
            if n != 1:
                raise serializers.ValidationError({'n': 'For dall-e-3, only n=1 is supported.'})
            # 'quality' must be one of the allowed choices
            if quality not in dict(ImageGeneration.QUALITY_CHOICES):
                raise serializers.ValidationError({'quality': 'Invalid quality for dall-e-3.'})
            # 'style' must be one of the allowed choices
            if style not in dict(ImageGeneration.STYLE_CHOICES):
                raise serializers.ValidationError({'style': 'Invalid style for dall-e-3.'})
            # 'size' must be one of the allowed choices for dall-e-3
            if size not in dict(ImageGeneration.SIZE_CHOICES_DALLE_3):
                raise serializers.ValidationError({'size': 'Invalid size for dall-e-3.'})
        elif model_used == 'dall-e-2':
            # For 'dall-e-2', prompt length must be <= 1000 characters
            if len(prompt) > 1000:
                raise serializers.ValidationError({'prompt': 'For dall-e-2, prompt length must be 1000 characters or fewer.'})
            # 'quality' and 'style' should not be provided
            if quality:
                raise serializers.ValidationError({'quality': 'Quality is not supported for dall-e-2.'})
            if style:
                raise serializers.ValidationError({'style': 'Style is not supported for dall-e-2.'})
            # 'size' must be one of the allowed choices for dall-e-2
            if size not in dict(ImageGeneration.SIZE_CHOICES_DALLE_2):
                raise serializers.ValidationError({'size': 'Invalid size for dall-e-2.'})
            # 'n' must be between 1 and 10
            if not (1 <= n <= 10):
                raise serializers.ValidationError({'n': 'For dall-e-2, n must be between 1 and 10.'})
        else:
            raise serializers.ValidationError({'model_used': 'Invalid model selected.'})

        return attrs

class ImageGenerationListSerializer(serializers.ModelSerializer):
    image_thumbnail = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(read_only=True)
    image_url = serializers.URLField(required=False, allow_null=True, read_only=True)
    image_file = serializers.ImageField(required=False, allow_null=True, read_only=True)
    
    class Meta:
        model = ImageGeneration
        fields = [
            'id',
            'size',
            'style',
            'prompt',
            'quality',
            'is_shared',
            'shared_at',
            'expires_at',
            'share_token',
            'image_url',
            'image_file',
            'model_used',
            'created_at',
            'response_format',
            'image_thumbnail',
        ]

    def get_image_thumbnail(self, obj):
        # Return a small version or URL of the image for listing purposes
        if obj.image_file and hasattr(obj.image_file, 'url'):
            return obj.image_file.url
        elif obj.image_url:
            return obj.image_url
        else:
            return None

class ImageGenerationDetailSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    image_url = serializers.URLField(read_only=True)
    image_file = serializers.ImageField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    revised_prompt = serializers.CharField(read_only=True)
    share_token = serializers.UUIDField(read_only=True)
    is_shared = serializers.BooleanField(required=False)
    shared_at = serializers.DateTimeField(read_only=True)
    expires_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = ImageGeneration
        fields = [
            'id',
            'user',
            'prompt',
            'revised_prompt',
            'image_url',
            'image_file',
            'created_at',
            'model_used',
            'n',
            'quality',
            'response_format',
            'size',
            'style',
            'is_shared',
            'shared_at',
            'expires_at',
            'share_token',
        ]
        read_only_fields = [
            'id',
            'user',
            'revised_prompt',
            'image_url',
            'image_file',
            'created_at',
            'shared_at',
            'expires_at',
            'share_token',
        ]

    def update(self, instance, validated_data):
        # Allow updating 'is_shared' field
        is_shared = validated_data.get('is_shared', instance.is_shared)
        if is_shared != instance.is_shared:
            if is_shared:
                instance.share()
            else:
                instance.unshare()
        instance.save()
        return instance

class SharedImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ImageGeneration
        fields = ['image']

    def get_image(self, obj):
        # Conditionally return either the image URL or file path based on the response format
        if obj.response_format == 'url' and obj.image_url:
            return obj.image_url
        elif obj.response_format == 'b64_json' and obj.image_file:
            # Construct the absolute URI for the image file if using a file-based image
            return self.context['request'].build_absolute_uri(obj.image_file.url)
        return None
    
class UserSerializer(serializers.ModelSerializer):
    joined_date = serializers.DateTimeField(source='date_joined', format='%B %d, %Y')
    chats = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'api_key',
            'first_name',
            'last_name',
            'date_joined',
            'joined_date',
            'chats',
            'images'
        ]

    def get_chats(self, obj):
        return Conversation.objects.filter(user=obj).count()

    def get_images(self, obj):
        return ImageGeneration.objects.filter(user=obj).count()