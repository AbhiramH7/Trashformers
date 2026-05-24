from django.contrib import admin
from .models import Conversation, ChatMessage


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'participant_one', 'participant_two', 'listing', 'created_at', 'updated_at']
    search_fields = ['participant_one__username', 'participant_two__username']


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'conversation', 'sender', 'content', 'is_read', 'created_at']
    list_filter = ['is_read']
    search_fields = ['sender__username', 'content']
