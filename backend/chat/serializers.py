from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Conversation, ChatMessage

User = get_user_model()


class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'profile_picture']


class ChatMessageSerializer(serializers.ModelSerializer):
    sender = UserMiniSerializer(read_only=True)

    class Meta:
        model = ChatMessage
        fields = ['id', 'conversation', 'sender', 'content', 'is_read', 'created_at']
        read_only_fields = ['id', 'conversation', 'sender', 'is_read', 'created_at']


class SendMessageSerializer(serializers.Serializer):
    """Used to send a message — creates or finds the conversation automatically."""
    recipient_id = serializers.IntegerField()
    listing_id = serializers.IntegerField(required=False, allow_null=True)
    content = serializers.CharField(max_length=2000)

    def validate_recipient_id(self, value):
        try:
            User.objects.get(pk=value, is_active=True)
        except User.DoesNotExist:
            raise serializers.ValidationError('Recipient not found.')
        return value

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError('Message cannot be empty.')
        return value.strip()


class ConversationSerializer(serializers.ModelSerializer):
    other_user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'other_user', 'listing', 'last_message', 'unread_count', 'created_at', 'updated_at']

    def get_other_user(self, obj):
        request = self.context.get('request')
        if not request:
            return None
        other = obj.get_other_participant(request.user)
        return UserMiniSerializer(other).data

    def get_last_message(self, obj):
        msg = obj.messages.order_by('-created_at').first()
        if msg:
            return {
                'content': msg.content,
                'sender_id': msg.sender_id,
                'created_at': msg.created_at,
                'is_read': msg.is_read,
            }
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request:
            return 0
        return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
