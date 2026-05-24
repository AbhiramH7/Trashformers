from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Order
from .serializers import OrderCreateSerializer, OrderSerializer, OrderStatusUpdateSerializer


class OrderCreateView(APIView):
    """
    POST /api/orders/create/
    Buyer places an order on an active listing.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Prevent sellers from ordering their own listing
        listing_id = request.data.get('listing_id')
        if listing_id:
            from listings.models import WasteListing
            try:
                listing = WasteListing.objects.get(pk=listing_id)
                if listing.seller == request.user:
                    return Response(
                        {'error': 'You cannot place an order on your own listing.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            except WasteListing.DoesNotExist:
                return Response({'error': 'Listing not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = OrderCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            order = serializer.save()
            return Response(
                OrderSerializer(order, context={'request': request}).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OrderDetailView(APIView):
    """
    GET   /api/orders/<id>/   — View order (buyer or seller only)
    PATCH /api/orders/<id>/   — Update order status
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        try:
            order = Order.objects.select_related(
                'buyer', 'seller', 'listing', 'listing__category'
            ).get(pk=pk)
            if order.buyer != user and order.seller != user:
                return None, 'forbidden'
            return order, None
        except Order.DoesNotExist:
            return None, 'not_found'

    def get(self, request, pk):
        order, err = self.get_object(pk, request.user)
        if err == 'not_found':
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)
        if err == 'forbidden':
            return Response({'error': 'You do not have access to this order.'}, status=status.HTTP_403_FORBIDDEN)
        return Response(OrderSerializer(order, context={'request': request}).data)

    def patch(self, request, pk):
        order, err = self.get_object(pk, request.user)
        if err == 'not_found':
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)
        if err == 'forbidden':
            return Response({'error': 'You do not have access to this order.'}, status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get('status')

        # Role-based restrictions
        if new_status in ['accepted', 'rejected'] and request.user != order.seller:
            return Response(
                {'error': 'Only the seller can accept or reject an order.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        if new_status == 'completed' and request.user != order.seller:
            return Response(
                {'error': 'Only the seller can mark an order as completed.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        if new_status == 'cancelled' and request.user not in [order.buyer, order.seller]:
            return Response(
                {'error': 'Only the buyer or seller can cancel an order.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = OrderStatusUpdateSerializer(
            data=request.data, context={'order': order}
        )
        if serializer.is_valid():
            order.status = serializer.validated_data['status']
            order.save()

            # If order completed, mark listing as sold
            if order.status == 'completed' and order.listing:
                order.listing.status = 'sold'
                order.listing.save()

            return Response({
                'message': f'Order status updated to "{order.status}".',
                'order': OrderSerializer(order, context={'request': request}).data,
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyOrdersView(APIView):
    """
    GET /api/orders/
    Return all orders where the user is buyer or seller.
    Query params:
      ?role=buyer | seller   (default: both)
      ?status=pending | accepted | completed | cancelled | rejected
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        role = request.query_params.get('role')
        order_status = request.query_params.get('status')

        if role == 'buyer':
            queryset = Order.objects.filter(buyer=request.user)
        elif role == 'seller':
            queryset = Order.objects.filter(seller=request.user)
        else:
            from django.db.models import Q
            queryset = Order.objects.filter(
                Q(buyer=request.user) | Q(seller=request.user)
            )

        if order_status:
            queryset = queryset.filter(status=order_status)

        queryset = queryset.select_related(
            'buyer', 'seller', 'listing', 'listing__category'
        ).order_by('-created_at')

        serializer = OrderSerializer(queryset, many=True, context={'request': request})
        return Response({'count': queryset.count(), 'results': serializer.data})
