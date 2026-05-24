from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Q

from .models import Conversation, ChatMessage
from .serializers import (
    ChatMessageSerializer,
    SendMessageSerializer,
    ConversationSerializer,
)

User = get_user_model()


class SendMessageView(APIView):
    """
    POST /api/chat/send/
    Send a message to a user. Auto-creates conversation if it doesn't exist.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SendMessageSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        sender = request.user
        recipient_id = serializer.validated_data['recipient_id']
        listing_id = serializer.validated_data.get('listing_id')
        content = serializer.validated_data['content']

        if recipient_id == sender.id:
            return Response(
                {'error': 'You cannot message yourself.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        recipient = User.objects.get(pk=recipient_id)

        # Find or create conversation
        conversation = self._get_or_create_conversation(sender, recipient, listing_id)

        # Create message
        message = ChatMessage.objects.create(
            conversation=conversation,
            sender=sender,
            content=content,
        )

        # Bump conversation updated_at
        conversation.save()

        return Response(
            ChatMessageSerializer(message).data,
            status=status.HTTP_201_CREATED,
        )

    def _get_or_create_conversation(self, user1, user2, listing_id):
        """Find existing conversation or create a new one."""
        from listings.models import WasteListing

        listing = None
        if listing_id:
            try:
                listing = WasteListing.objects.get(pk=listing_id)
            except WasteListing.DoesNotExist:
                listing = None

        # Search both directions
        conversation = Conversation.objects.filter(
            (Q(participant_one=user1, participant_two=user2) |
             Q(participant_one=user2, participant_two=user1)),
            listing=listing,
        ).first()

        if not conversation:
            conversation = Conversation.objects.create(
                participant_one=user1,
                participant_two=user2,
                listing=listing,
            )

        return conversation


class ConversationListView(APIView):
    """
    GET /api/chat/conversations/
    List all conversations for the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        conversations = Conversation.objects.filter(
            Q(participant_one=request.user) | Q(participant_two=request.user)
        ).select_related('participant_one', 'participant_two', 'listing')

        serializer = ConversationSerializer(
            conversations, many=True, context={'request': request}
        )
        return Response({'count': conversations.count(), 'results': serializer.data})


class MessageListView(APIView):
    """
    GET /api/chat/conversations/<id>/messages/
    Get all messages in a conversation. Marks incoming messages as read.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id):
        try:
            conversation = Conversation.objects.get(pk=conversation_id)
        except Conversation.DoesNotExist:
            return Response({'error': 'Conversation not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not conversation.has_participant(request.user):
            return Response(
                {'error': 'You are not part of this conversation.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        messages = conversation.messages.select_related('sender').all()

        # Mark unread messages from the other user as read
        messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)

        serializer = ChatMessageSerializer(messages, many=True)
        return Response({'count': messages.count(), 'results': serializer.data})


class UnreadCountView(APIView):
    """
    GET /api/chat/unread-count/
    Get total unread message count across all conversations.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        conversations = Conversation.objects.filter(
            Q(participant_one=request.user) | Q(participant_two=request.user)
        )
        total_unread = ChatMessage.objects.filter(
            conversation__in=conversations,
            is_read=False,
        ).exclude(sender=request.user).count()

        return Response({'unread_count': total_unread})
