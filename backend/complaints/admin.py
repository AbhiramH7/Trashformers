from django.contrib import admin
from .models import Complaint


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ['id', 'filed_by', 'reported_user', 'complaint_type', 'status', 'created_at']
    list_filter = ['status', 'complaint_type']
    search_fields = ['filed_by__username', 'reported_user__username', 'description']
    readonly_fields = ['created_at', 'updated_at']
