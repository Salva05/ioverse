from rest_framework.permissions import BasePermission
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model

User = get_user_model()

class IsAuthenticatedWithQueryToken(BasePermission):
    """
    Custom permission to authenticate using a token passed in query parameters.
    Also populates `request.user` with the authenticated user.
    """
    def has_permission(self, request, view):
        token = request.GET.get("token", None)
        if not token:
            return False

        try:
            # Decode the token
            validated_token = UntypedToken(token)

            # Get the user from the token
            user_id = validated_token.get("user_id")
            user = User.objects.get(id=user_id)
            request.user = user  # Attach the user to the request
            return True
        except (InvalidToken, TokenError, User.DoesNotExist):
            request.user = AnonymousUser()
            return False
