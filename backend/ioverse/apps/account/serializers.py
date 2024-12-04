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
    
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    api_key = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ['username', 'password', 'api_key', 'password_confirm', 'email']
        
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def validate_api_key(self, value):
        from .utils import verify_openai_api_key
        result = verify_openai_api_key(value)
        if not result["valid"]:
            raise serializers.ValidationError(result["message"])
        return value
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            api_key=validated_data['api_key'],
            password=validated_data['password']
        )
        return user