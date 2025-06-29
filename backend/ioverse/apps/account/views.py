from rest_framework import permissions, generics, status
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response

from .serializers import UserSerializer, UserRegistrationSerializer, AdminKeySetSerializer
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
User = get_user_model()

class UserRegistrationView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)

        return Response(
            {
                "message": "User registration failed",
                "errors": serializer.errors
            }, 
            status=status.HTTP_400_BAD_REQUEST
        )
        
class CurrentUserView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            send_mail(
                subject="Password Reset Request",
                message="Click the link to reset your password.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            return Response({"message": "Password reset email sent."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)
    
class AdminKeySetView(generics.UpdateAPIView):
    """
    PATCH /users/admin-key/   {"admin_key": "sk-admin-..."}
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class    = AdminKeySetSerializer

    def get_object(self):
        return self.request.user