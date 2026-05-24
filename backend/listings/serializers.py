import math
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Category, WasteListing

User = get_user_model()


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'icon']


class SellerMiniSerializer(serializers.ModelSerializer):
    """Compact seller info embedded in listings."""
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'rating', 'profile_picture']


class WasteListingSerializer(serializers.ModelSerializer):
    """Full listing serializer — used for list and detail views."""
    seller = SellerMiniSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )
    total_price = serializers.ReadOnlyField()
    distance_km = serializers.SerializerMethodField()

    class Meta:
        model = WasteListing
        fields = [
            'id', 'seller', 'category', 'category_id',
            'title', 'description',
            'quantity', 'unit', 'price_per_unit', 'total_price',
            'image', 'status',
            'latitude', 'longitude', 'address',
            'distance_km',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'seller', 'status', 'created_at', 'updated_at']

    def get_distance_km(self, obj):
        """Calculate distance from requesting user using Haversine formula."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        user = request.user
        if not all([user.latitude, user.longitude, obj.latitude, obj.longitude]):
            return None
        return round(_haversine(
            float(user.latitude), float(user.longitude),
            float(obj.latitude), float(obj.longitude)
        ), 2)

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user
        # Auto-fill location from user profile if not provided
        if not validated_data.get('latitude') and user.latitude:
            validated_data['latitude'] = user.latitude
        if not validated_data.get('longitude') and user.longitude:
            validated_data['longitude'] = user.longitude
        validated_data['seller'] = user
        return super().create(validated_data)


class WasteListingCreateSerializer(serializers.ModelSerializer):
    """Minimal serializer for creating/updating a listing."""
    class Meta:
        model = WasteListing
        fields = [
            'category', 'title', 'description',
            'quantity', 'unit', 'price_per_unit',
            'image', 'latitude', 'longitude', 'address',
        ]

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user
        if not validated_data.get('latitude') and user.latitude:
            validated_data['latitude'] = user.latitude
        if not validated_data.get('longitude') and user.longitude:
            validated_data['longitude'] = user.longitude
        validated_data['seller'] = user
        return super().create(validated_data)


def _haversine(lat1, lon1, lat2, lon2):
    """Calculate distance in km between two lat/lon coordinates."""
    R = 6371  # Earth's radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
