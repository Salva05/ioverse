from celery import shared_task
from django.utils import timezone

from .services.cleanup_service import trigger_clean
from .models import ImageGeneration
import logging

logger = logging.getLogger('celery')

@shared_task
def unshare_expired_images():
    """
    A Celery task that identifies and unshares images in the database
    that have passed their expiration time.
    """
    now = timezone.now()
    expired_images = ImageGeneration.objects.filter(
        is_shared=True,
        expires_at__lt=now
    )

    unshared_count = expired_images.count()
    logger.info(f"Unsharing {unshared_count} expired images.")

    expired_images.update(is_shared=False, shared_at=None, expires_at=None)

@shared_task
def cleanup_expired_url_images():
    """
    Celery task to clean up expired images with response_format 'url'.
    This task triggers the clean function in a separate thread.
    """
    try:
        logger.info("Starting cleanup of expired URL images.")
        trigger_clean()
    except Exception as e:
        logger.exception(f"Error while triggering cleanup: {e}")