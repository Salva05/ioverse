from urllib.parse import parse_qs
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.conf import settings
from jwt import decode as jwt_decode, exceptions as jwt_exceptions
from django.contrib.auth.models import AnonymousUser
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

@database_sync_to_async
def get_user_from_token(token):
    try:
        # Decode the token using the VERIFYING_KEY (public key)
        decoded_data = jwt_decode(
            token,
            settings.SIMPLE_JWT['VERIFYING_KEY'],
            algorithms=[settings.SIMPLE_JWT['ALGORITHM']],
            audience=None,
            issuer=None
        )
        
        user_id = decoded_data.get("user_id") or decoded_data.get("sub")
        if user_id is None:
            logger.warning("Token does not contain user_id or sub claim.")
            return AnonymousUser()
        
        user = User.objects.get(id=user_id)
        return user
    except (jwt_exceptions.InvalidTokenError, User.DoesNotExist) as e:
        logger.warning(f"Token validation failed: {e}")
        return AnonymousUser()

class JWTAuthMiddleware(BaseMiddleware):
    """
    Custom middleware that takes a JWT token from the query string and authenticates the user.
    """

    async def __call__(self, scope, receive, send):
        # Extract the token from query string
        query_string = scope.get("query_string", b"").decode()
        query_params = parse_qs(query_string)
        token_list = query_params.get("token", None)
        if token_list:
            token = token_list[0]
            user = await get_user_from_token(token)
            scope["user"] = user
            logger.debug(f"Authenticated user: {user.username if user.is_authenticated else 'AnonymousUser'}")
        else:
            scope["user"] = AnonymousUser()
            logger.debug("No token provided; AnonymousUser assigned.")
        return await super().__call__(scope, receive, send)

# Function to wrap the middleware
def JWTAuthMiddlewareStack(inner):
    return JWTAuthMiddleware(inner)
