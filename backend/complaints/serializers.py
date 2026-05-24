from rest_framework import serializers
from .models import Complaint


class ComplaintSerializer(serializers.ModelSerializer):
    filed_by_username = serializers.CharField(source='filed_by.username', read_only=True)
    reported_username = serializers.CharField(source='reported_user.username', read_only=True, default=None)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    type_display = serializers.CharField(source='get_complaint_type_display', read_only=True)

    class Meta:
        model = Complaint
        fields = [
            'id', 'filed_by', 'filed_by_username',
            'reported_user', 'reported_username',
            'listing',
            'complaint_type', 'type_display',
            'description',
            'status', 'status_display',
            'created_at',
        ]
        read_only_fields = ['id', 'filed_by', 'status', 'created_at']


class ComplaintCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = ['reported_user', 'listing', 'complaint_type', 'description']

    def validate(self, attrs):
        if not attrs.get('reported_user') and not attrs.get('listing'):
            raise serializers.ValidationError('You must report either a user or a listing.')
        return attrs

    def create(self, validated_data):
        request = self.context['request']
        validated_data['filed_by'] = request.user
        return super().create(validated_data)
