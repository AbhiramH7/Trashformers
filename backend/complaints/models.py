from django.db import models
from django.contrib.auth import get_user_model
from listings.models import WasteListing

User = get_user_model()


class Complaint(models.Model):
    """Report filed against a listing or user."""

    TYPE_CHOICES = [
        ('false_listing', 'False Listing'),
        ('wrong_category', 'Incorrect Categorization'),
        ('poor_service', 'Poor Service'),
        ('fraud', 'Fraud / Scam'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('open', 'Open'),
        ('reviewing', 'Under Review'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    ]

    filed_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='complaints_filed'
    )
    reported_user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='complaints_against', null=True, blank=True
    )
    listing = models.ForeignKey(
        WasteListing, on_delete=models.SET_NULL, null=True, blank=True, related_name='complaints'
    )
    complaint_type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    description = models.TextField()
    admin_notes = models.TextField(blank=True, help_text='Internal notes by admin')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'complaints'
        ordering = ['-created_at']

    def __str__(self):
        return f'Complaint #{self.pk} by {self.filed_by.username} ({self.complaint_type})'
