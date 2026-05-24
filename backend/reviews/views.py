from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class ReviewCreateView(APIView):
    def post(self, request):
        return Response({'message': 'Create review — coming in Phase 6'}, status=status.HTTP_200_OK)
