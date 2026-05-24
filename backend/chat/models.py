from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Conversation(models.Model):
    """A conversation thread between two users, optionally tied to a listing."""
    participant_one = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='conversations_as_one'
    )
    participant_two = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='conversations_as_two'
    )
    listing = models.ForeignKey(
        'listings.WasteListing', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='conversations'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'conversations'
        ordering = ['-updated_at']
        # Prevent duplicate conversations between the same pair for the same listing
        constraints = [
            models.UniqueConstraint(
                fields=['participant_one', 'participant_two', 'listing'],
                name='unique_conversation',
            )
        ]

    def __str__(self):
        return f'Conversation #{self.pk}: {self.participant_one.username} ↔ {self.participant_two.username}'

    def has_participant(self, user):
        return user in [self.participant_one, self.participant_two]

    def get_other_participant(self, user):
        if user == self.participant_one:
            return self.participant_two
        return self.participant_one


class ChatMessage(models.Model):
    """An individual message within a conversation."""
    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name='messages'
    )
    sender = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='sent_messages'
    )
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chat_messages'
        ordering = ['created_at']

    def __str__(self):
        return f'{self.sender.username}: {self.content[:50]}'
