import math
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.contrib.auth import get_user_model

from .models import Category, WasteListing
from .serializers import (
    CategorySerializer,
    WasteListingSerializer,
    WasteListingCreateSerializer,
)

User = get_user_model()


def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


class CategoryListView(APIView):
    """
    GET /api/listings/categories/
    List all waste categories.
    """
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)


class ListingListCreateView(APIView):
    """
    GET  /api/listings/         — Browse all active listings with filters & sorting
    POST /api/listings/         — Create a new listing (seller only)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = WasteListing.objects.filter(status='active').select_related('seller', 'category')

        # --- Filtering ---
        category = request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__name=category)

        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price_per_unit__gte=min_price)
        if max_price:
            queryset = queryset.filter(price_per_unit__lte=max_price)

        min_qty = request.query_params.get('min_quantity')
        max_qty = request.query_params.get('max_quantity')
        if min_qty:
            queryset = queryset.filter(quantity__gte=min_qty)
        if max_qty:
            queryset = queryset.filter(quantity__lte=max_qty)

        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(title__icontains=search)

        # --- Sorting ---
        sort = request.query_params.get('sort', 'newest')
        listings = list(queryset)

        if sort == 'price_asc':
            listings.sort(key=lambda x: float(x.price_per_unit))
        elif sort == 'price_desc':
            listings.sort(key=lambda x: float(x.price_per_unit), reverse=True)
        elif sort == 'rating':
            listings.sort(key=lambda x: float(x.seller.rating), reverse=True)
        elif sort == 'distance':
            user = request.user
            if user.latitude and user.longitude:
                listings.sort(key=lambda x: haversine(
                    float(user.latitude), float(user.longitude),
                    float(x.latitude or 0), float(x.longitude or 0)
                ))
        # default: newest (already ordered by -created_at in model Meta)

        # --- Pagination ---
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        start = (page - 1) * page_size
        end = start + page_size
        paginated = listings[start:end]

        serializer = WasteListingSerializer(
            paginated, many=True, context={'request': request}
        )
        return Response({
            'count': len(listings),
            'page': page,
            'page_size': page_size,
            'total_pages': math.ceil(len(listings) / page_size) if listings else 1,
            'results': serializer.data,
        })

    def post(self, request):
        if not request.user.is_seller:
            return Response(
                {'error': 'Only sellers can create listings.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = WasteListingCreateSerializer(
            data=request.data, context={'request': request}
        )
        if serializer.is_valid():
            listing = serializer.save()
            return Response(
                WasteListingSerializer(listing, context={'request': request}).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ListingDetailView(APIView):
    """
    GET    /api/listings/<id>/   — View a listing
    PUT    /api/listings/<id>/   — Update own listing
    DELETE /api/listings/<id>/   — Delete own listing (soft delete)
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return WasteListing.objects.select_related('seller', 'category').get(pk=pk)
        except WasteListing.DoesNotExist:
            return None

    def get(self, request, pk):
        listing = self.get_object(pk)
        if not listing:
            return Response({'error': 'Listing not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = WasteListingSerializer(listing, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk):
        listing = self.get_object(pk)
        if not listing:
            return Response({'error': 'Listing not found.'}, status=status.HTTP_404_NOT_FOUND)
        if listing.seller != request.user:
            return Response({'error': 'You can only edit your own listings.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = WasteListingCreateSerializer(
            listing, data=request.data, partial=True, context={'request': request}
        )
        if serializer.is_valid():
            listing = serializer.save()
            return Response(WasteListingSerializer(listing, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        listing = self.get_object(pk)
        if not listing:
            return Response({'error': 'Listing not found.'}, status=status.HTTP_404_NOT_FOUND)
        if listing.seller != request.user:
            return Response({'error': 'You can only delete your own listings.'}, status=status.HTTP_403_FORBIDDEN)
        listing.status = 'deleted'
        listing.save()
        return Response({'message': 'Listing deleted successfully.'}, status=status.HTTP_200_OK)


class MyListingsView(APIView):
    """
    GET /api/listings/mine/
    Return all listings by the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        listings = WasteListing.objects.filter(
            seller=request.user
        ).exclude(status='deleted').select_related('category')
        serializer = WasteListingSerializer(listings, many=True, context={'request': request})
        return Response(serializer.data)


class ListingStatusUpdateView(APIView):
    """
    PATCH /api/listings/<id>/status/
    Update listing status (active, sold, expired).
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            listing = WasteListing.objects.get(pk=pk, seller=request.user)
        except WasteListing.DoesNotExist:
            return Response({'error': 'Listing not found.'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        valid = [s[0] for s in WasteListing.STATUS_CHOICES]
        if new_status not in valid:
            return Response(
                {'error': f'Invalid status. Must be one of: {valid}'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        listing.status = new_status
        listing.save()
        return Response({'message': f'Listing status updated to "{new_status}".'})
