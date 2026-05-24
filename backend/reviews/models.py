from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from orders.models import Order

User = get_user_model()


class Review(models.Model):
    """Post-transaction review by buyer or seller."""
    order = models.OneToOneField(
        Order, on_delete=models.CASCADE, related_name='review'
    )
    reviewer = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='reviews_given'
    )
    reviewee = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='reviews_received'
    )
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reviews'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.reviewer.username} → {self.reviewee.username}: {self.rating}/5'
