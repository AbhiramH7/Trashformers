from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Extra Info', {'fields': ('phone', 'latitude', 'longitude', 'is_buyer', 'is_seller', 'profile_picture', 'bio', 'rating')}),
    )
