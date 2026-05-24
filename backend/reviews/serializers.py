from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db.models import Avg
from .models import Review

User = get_user_model()


class ReviewSerializer(serializers.ModelSerializer):
    reviewer_username = serializers.CharField(source='reviewer.username', read_only=True)
    reviewee_username = serializers.CharField(source='reviewee.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'order', 'reviewer', 'reviewer_username', 'reviewee', 'reviewee_username', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'reviewer', 'reviewer_username', 'reviewee', 'reviewee_username', 'created_at']


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['order', 'rating', 'comment']

    def validate_order(self, value):
        request = self.context.get('request')
        if value.status != 'completed':
            raise serializers.ValidationError('Can only review completed orders.')
        if request.user not in [value.buyer, value.seller]:
            raise serializers.ValidationError('You are not part of this order.')
        if Review.objects.filter(order=value, reviewer=request.user).exists():
            raise serializers.ValidationError('You have already reviewed this order.')
        return value

    def create(self, validated_data):
        request = self.context['request']
        order = validated_data['order']
        reviewer = request.user
        reviewee = order.seller if reviewer == order.buyer else order.buyer

        review = Review.objects.create(
            order=order,
            reviewer=reviewer,
            reviewee=reviewee,
            rating=validated_data['rating'],
            comment=validated_data.get('comment', ''),
        )

        # Update reviewee's average rating
        avg = Review.objects.filter(reviewee=reviewee).aggregate(Avg('rating'))['rating__avg']
        reviewee.rating = round(avg, 2) if avg else 0
        reviewee.save()

        return review
