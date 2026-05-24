from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Complaint
from .serializers import ComplaintSerializer, ComplaintCreateSerializer


class ComplaintCreateView(APIView):
    """POST /api/complaints/ — File a complaint."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ComplaintCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            complaint = serializer.save()
            return Response(
                ComplaintSerializer(complaint).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyComplaintsView(APIView):
    """GET /api/complaints/mine/ — View complaints filed by the user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        complaints = Complaint.objects.filter(filed_by=request.user).select_related('reported_user', 'listing')
        serializer = ComplaintSerializer(complaints, many=True)
        return Response({'count': complaints.count(), 'results': serializer.data})
