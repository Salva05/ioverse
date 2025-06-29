from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

from ..chatbot.models import Conversation
from ..text_to_image.models import ImageGeneration


User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    joined_date = serializers.DateTimeField(source='date_joined', format='%B %d, %Y')
    chats = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()

    has_admin_key = serializers.SerializerMethodField(read_only=True)
    admin_key = serializers.CharField(required=False,
                                        allow_blank=True,
                                        write_only=True)
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'api_key',
            'has_admin_key',
            'admin_key',
            'first_name',
            'last_name',
            'date_joined',
            'joined_date',
            'chats',
            'images'
        ]
        extra_kwargs = {
            'api_key':  {'write_only': True},
        }

    def get_chats(self, obj):
        return Conversation.objects.filter(user=obj).count()

    def get_images(self, obj):
        return ImageGeneration.objects.filter(user=obj).count()
    
    def get_has_admin_key(self, obj):
        return obj.has_admin_key
    
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    api_key = serializers.CharField(write_only=True)
    admin_key = serializers.CharField(write_only=True, required=False,
                                             allow_blank=False)
    
    class Meta:
        model = User
        fields = ['username', 'password', 'api_key', 'admin_key', 'password_confirm', 'email']
        
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate_api_key(self, value):
        from .utils import verify_openai_api_key
        result = verify_openai_api_key(value)
        if not result["valid"]:
            raise serializers.ValidationError(result["message"])
        return value
    
    def validate_admin_key(self, value):
        from .utils import verify_openai_admin_key
        # This runs only when the field is present (DRF skips if omitted)
        result = verify_openai_admin_key(value)
        if not result["valid"]:
            raise serializers.ValidationError(result["message"])
        return value
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        admin_key = validated_data.pop('admin_key', '')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            api_key=validated_data['api_key'],
            admin_key= admin_key,
            password=validated_data['password']
        )
        return user

class AdminKeySetSerializer(serializers.Serializer):
    admin_key = serializers.CharField(
        write_only=True,
        required=True,
        allow_blank=False
    )

    def validate_admin_key(self, value):
        from .utils import verify_openai_admin_key
        result = verify_openai_admin_key(value)
        if not result["valid"]:
            raise serializers.ValidationError(result["message"])
        return value

    def update(self, instance, validated_data):
        instance.admin_key = validated_data["admin_key"]
        instance.save(update_fields=["admin_key"])
        return instance

    def to_representation(self, instance):
        return {"has_admin_key": instance.has_admin_key}