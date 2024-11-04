from celery import shared_task
from django.utils import timezone
from .models import Conversation
import logging

# Set up a logger for this module
logger = logging.getLogger('celery')

@shared_task
def unshare_expired_conversations():
    """
    A Celery task that identifies and unshares conversations in the database
    that have passed their expiration time.
    """
    now = timezone.now()
    expired_conversations = Conversation.objects.filter(
        is_shared=True,
        expires_at__lt=now
    )

    # Count the conversations that will be unshared
    unshared_count = expired_conversations.count()
    logger.info(f"Unsharing {unshared_count} expired conversations.")

    # Update the expired conversations to mark them as unshared and reset the related fields
    expired_conversations.update(is_shared=False, shared_at=None, expires_at=None)
