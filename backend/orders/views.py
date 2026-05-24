from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class OrderCreateView(APIView):
    def post(self, request):
        return Response({'message': 'Create order — coming in Phase 4'}, status=status.HTTP_200_OK)


class OrderDetailView(APIView):
    def get(self, request, pk):
        return Response({'message': f'Order {pk} — coming in Phase 4'}, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        return Response({'message': f'Update order {pk} status — coming in Phase 4'}, status=status.HTTP_200_OK)
