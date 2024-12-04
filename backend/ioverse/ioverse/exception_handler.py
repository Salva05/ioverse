from rest_framework.views import exception_handler
from rest_framework.response import Response
from ioverse.exceptions import MissingApiKeyException
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Custom exception handler that processes both DRF and custom exceptions.
    """
    # Call to DRF's default exception handler first
    response = exception_handler(exc, context)

    if response is not None:
        logger.error(f"Exception: {exc} | Context: {context}")

    # Handle MissingApiKeyException
    if isinstance(exc, MissingApiKeyException):
        return Response(
            {'error': exc.default_detail},
            status=exc.status_code
        )

    # Add more custom exception handling as needed

    return response
