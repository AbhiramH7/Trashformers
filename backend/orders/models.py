from django.db import models
from django.contrib.auth import get_user_model
from listings.models import WasteListing

User = get_user_model()


class Order(models.Model):
    """An order placed by a buyer on a seller's waste listing."""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    # Valid transitions map: current → allowed next statuses
    VALID_TRANSITIONS = {
        'pending':   ['accepted', 'rejected', 'cancelled'],
        'accepted':  ['completed', 'cancelled'],
        'rejected':  [],
        'completed': [],
        'cancelled': [],
    }

    buyer = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='orders_as_buyer'
    )
    seller = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='orders_as_seller'
    )
    listing = models.ForeignKey(
        WasteListing, on_delete=models.SET_NULL, null=True, related_name='orders'
    )

    quantity_ordered = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # Pickup details
    pickup_address = models.CharField(max_length=255, blank=True)
    pickup_date = models.DateField(null=True, blank=True)
    pickup_notes = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']

    def __str__(self):
        return f'Order #{self.pk} — {self.buyer.username} → {self.seller.username} ({self.status})'

    def can_transition_to(self, new_status):
        """Check if a status transition is valid."""
        return new_status in self.VALID_TRANSITIONS.get(self.status, [])
