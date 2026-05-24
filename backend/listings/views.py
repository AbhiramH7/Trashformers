from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class ListingListCreateView(APIView):
    def get(self, request):
        return Response({'message': 'Listings endpoint — coming in Phase 3'}, status=status.HTTP_200_OK)

    def post(self, request):
        return Response({'message': 'Create listing — coming in Phase 3'}, status=status.HTTP_200_OK)


class ListingDetailView(APIView):
    def get(self, request, pk):
        return Response({'message': f'Listing {pk} — coming in Phase 3'}, status=status.HTTP_200_OK)

    def put(self, request, pk):
        return Response({'message': f'Update listing {pk} — coming in Phase 3'}, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        return Response({'message': f'Delete listing {pk} — coming in Phase 3'}, status=status.HTTP_200_OK)
