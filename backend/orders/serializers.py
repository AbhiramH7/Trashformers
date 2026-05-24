from rest_framework import serializers
from django.contrib.auth import get_user_model
from listings.models import WasteListing
from listings.serializers import WasteListingSerializer
from .models import Order

User = get_user_model()


class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'phone', 'rating', 'profile_picture']


class OrderCreateSerializer(serializers.ModelSerializer):
    """Used when a buyer places a new order."""
    listing_id = serializers.PrimaryKeyRelatedField(
        queryset=WasteListing.objects.filter(status='active'),
        source='listing',
        write_only=True,
    )

    class Meta:
        model = Order
        fields = [
            'listing_id',
            'quantity_ordered',
            'pickup_address',
            'pickup_date',
            'pickup_notes',
        ]

    def validate(self, attrs):
        listing = attrs.get('listing')
        quantity = attrs.get('quantity_ordered')

        if quantity <= 0:
            raise serializers.ValidationError({'quantity_ordered': 'Quantity must be greater than 0.'})

        if quantity > listing.quantity:
            raise serializers.ValidationError({
                'quantity_ordered': f'Only {listing.quantity} {listing.unit} available.'
            })
        return attrs

    def create(self, validated_data):
        request = self.context['request']
        listing = validated_data['listing']
        quantity = validated_data['quantity_ordered']

        # Calculate total price
        total = float(quantity) * float(listing.price_per_unit)

        order = Order.objects.create(
            buyer=request.user,
            seller=listing.seller,
            listing=listing,
            quantity_ordered=quantity,
            total_price=total,
            pickup_address=validated_data.get('pickup_address', listing.address),
            pickup_date=validated_data.get('pickup_date'),
            pickup_notes=validated_data.get('pickup_notes', ''),
        )
        return order


class OrderSerializer(serializers.ModelSerializer):
    """Full order details — used for GET responses."""
    buyer = UserMiniSerializer(read_only=True)
    seller = UserMiniSerializer(read_only=True)
    listing = WasteListingSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    allowed_transitions = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'buyer', 'seller', 'listing',
            'quantity_ordered', 'total_price',
            'status', 'status_display', 'allowed_transitions',
            'pickup_address', 'pickup_date', 'pickup_notes',
            'created_at', 'updated_at',
        ]

    def get_allowed_transitions(self, obj):
        return Order.VALID_TRANSITIONS.get(obj.status, [])


class OrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES)

    def validate_status(self, value):
        order = self.context.get('order')
        if order and not order.can_transition_to(value):
            raise serializers.ValidationError(
                f'Cannot transition from "{order.status}" to "{value}". '
                f'Allowed: {Order.VALID_TRANSITIONS.get(order.status, [])}'
            )
        return value
