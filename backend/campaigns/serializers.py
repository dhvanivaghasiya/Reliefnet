from rest_framework import serializers
from .models import Campaign
from categories.models import Category

class CampaignSerializer(serializers.ModelSerializer):
    category_detail = serializers.SerializerMethodField(read_only=True)
    creator_username = serializers.ReadOnlyField(source='creator.username')
    target_amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, default=0)
    raised_amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, default=0)

    class Meta:
        model = Campaign
        fields = (
            'id', 'title', 'description', 'banner_image', 'category', 'category_detail',
            'target_amount', 'raised_amount',
            'status', 'creator', 'creator_username', 'start_date', 'end_date', 
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'creator', 'created_at', 'updated_at')

    def get_category_detail(self, obj):
        if obj.category:
            return {
                'id': obj.category.id,
                'name': obj.category.name,
                'description': obj.category.description
            }
        return None

    def validate(self, data):
        start_date = data.get('start_date', self.instance.start_date if self.instance else None)
        end_date = data.get('end_date', self.instance.end_date if self.instance else None)
        if start_date and end_date and start_date >= end_date:
            raise serializers.ValidationError({"end_date": "End date must be strictly after the start date."})
        return data

