from django.utils import timezone
from ..models import ImageGeneration
import logging

logger = logging.getLogger('text_to_image_project')

def clean():
    """
    A helper function that cleans all the images stored in the
    database whose response_format is 'url' and the access 
    is expired (60 minutes as default of OpenAI API).
    """
    try:
        expiration_threshold = timezone.now() - timezone.timedelta(minutes=60)
        expired_images = ImageGeneration.objects.filter(
            response_format='url',
            created_at__lt=expiration_threshold
        )
        deleted_count, _ = expired_images.delete()
        if (deleted_count > 0):
            logger.info(f"Cleaned up {deleted_count} expired URL images.")
    except Exception as e:
        logger.exception(f"Error during cleanup: {e}")

import threading

def trigger_clean():
    """
    Triggers the clean function in a separate thread to avoid blocking.
    """
    cleanup_thread = threading.Thread(target=clean, name="ImageCleanupThread")
    cleanup_thread.daemon = True  # Ensures the thread exits when the main program does
    cleanup_thread.start()