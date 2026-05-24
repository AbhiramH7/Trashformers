from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Category(models.Model):
    """Waste categories as defined in the project spec."""
    CATEGORY_CHOICES = [
        ('plastic', 'Plastic'),
        ('metal', 'Metal'),
        ('paper', 'Paper'),
        ('biodegradable', 'Biodegradable'),
        ('ewaste', 'E-Waste'),
    ]
    name = models.CharField(max_length=50, choices=CATEGORY_CHOICES, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text='Icon name for frontend')

    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'categories'

    def __str__(self):
        return self.get_name_display()


class WasteListing(models.Model):
    """A waste item listed for sale by a seller."""

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('sold', 'Sold'),
        ('expired', 'Expired'),
        ('deleted', 'Deleted'),
    ]

    UNIT_CHOICES = [
        ('kg', 'Kilograms'),
        ('ton', 'Tons'),
        ('piece', 'Pieces'),
        ('litre', 'Litres'),
    ]

    seller = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='listings'
    )
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, related_name='listings'
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default='kg')
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='listings/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')

    # Location (copied from seller at listing time for distance calculations)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    address = models.CharField(max_length=255, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'waste_listings'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} by {self.seller.username}'

    @property
    def total_price(self):
        return float(self.quantity) * float(self.price_per_unit)
