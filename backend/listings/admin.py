from django.contrib import admin
from .models import Category, WasteListing


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    search_fields = ['name']


@admin.register(WasteListing)
class WasteListingAdmin(admin.ModelAdmin):
    list_display = ['title', 'seller', 'category', 'quantity', 'unit', 'price_per_unit', 'status', 'created_at']
    list_filter = ['status', 'category']
    search_fields = ['title', 'seller__username']
    readonly_fields = ['created_at', 'updated_at']
