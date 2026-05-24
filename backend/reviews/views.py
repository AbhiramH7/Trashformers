from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model

from .models import Review
from .serializers import ReviewSerializer, ReviewCreateSerializer

User = get_user_model()


class ReviewCreateView(APIView):
    """POST /api/reviews/ — Submit a review for a completed order."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ReviewCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            review = serializer.save()
            return Response(
                ReviewSerializer(review).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserReviewsView(APIView):
    """GET /api/reviews/user/<id>/ — Get all reviews received by a user."""
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            user = User.objects.get(pk=user_id, is_active=True)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        reviews = Review.objects.filter(reviewee=user).select_related('reviewer', 'reviewee')
        serializer = ReviewSerializer(reviews, many=True)
        return Response({
            'user': user.username,
            'average_rating': float(user.rating),
            'count': reviews.count(),
            'results': serializer.data,
        })
