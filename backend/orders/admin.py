from django.contrib import admin
from .models import Order


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'buyer', 'seller', 'listing', 'quantity_ordered', 'total_price', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['buyer__username', 'seller__username']
    readonly_fields = ['created_at', 'updated_at', 'total_price']
