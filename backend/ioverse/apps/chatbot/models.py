from django.db import models
from django.contrib.auth.models import User

class Conversation(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='conversations',
        verbose_name="User",
        help_text="The user who owns this conversation."
    )
    title = models.CharField(
        max_length=255,
        verbose_name="Title",
        help_text="A summary of the conversation."
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Created At",
        help_text="The date and time when the conversation was created."
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Updated At",
        help_text="The date and time when the conversation was last updated."
    )
    
    def __str__(self):
        return f"Conversation {self.id} with {self.user.username}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Conversation"
        verbose_name_plural = "Conversations"

class Message(models.Model):
    SENDER_CHOICES = (
        ('user', 'User'),
        ('ai', 'AI'),  # Capitalized "AI" for consistency
    )
    
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages',
        verbose_name="Conversation",
        help_text="The conversation to which this message belongs."
    )
    sender = models.CharField(
        max_length=5,
        choices=SENDER_CHOICES,
        verbose_name="Sender",
        help_text="Indicates whether the sender is the user or the AI."
    )
    message_body = models.TextField(
        verbose_name="Message Body",
        help_text="The content of the message."
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Timestamp",
        help_text="The date and time when the message was created."
    )
    
    def __str__(self):
        """
        Returns a string representation of the Message instance.
        It includes the sender's display name and a truncated version of the message body.
        """
        # Retrieve the human-readable sender name
        sender_display = self.get_sender_display()
        
        # Truncate the message body if it's longer than 50 characters
        msg_title = f"{self.message_body[:50]}..." if len(self.message_body) > 50 else self.message_body
        
        return f"{sender_display}: {msg_title}"
    
    class Meta:
        ordering = ['timestamp']
        verbose_name = "Message"
        verbose_name_plural = "Messages"
