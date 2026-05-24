from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class SendMessageView(APIView):
    def post(self, request):
        return Response({'message': 'Send message — coming in Phase 5'}, status=status.HTTP_200_OK)


class MessageListView(APIView):
    def get(self, request):
        return Response({'message': 'Message history — coming in Phase 5'}, status=status.HTTP_200_OK)
