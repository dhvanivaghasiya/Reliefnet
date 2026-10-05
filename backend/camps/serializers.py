from rest_framework import serializers
from .models import Camp

class CampSerializer(serializers.ModelSerializer):
    campaign_detail = serializers.SerializerMethodField(read_only=True)
    leader_username = serializers.ReadOnlyField(source='leader.username')
    leader_full_name = serializers.SerializerMethodField(read_only=True)
    inventory = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Camp
        fields = (
            'id', 'campaign', 'campaign_detail', 'name', 'address', 'latitude', 'longitude',
            'leader', 'leader_username', 'leader_full_name', 'contact_number', 'description', 'status',
            'location', 'capacity', 'current_population', 'created_at', 'updated_at',
            'inventory'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_campaign_detail(self, obj):
        if obj.campaign:
            return {
                'id': obj.campaign.id,
                'title': obj.campaign.title
            }
        return None

    def get_leader_full_name(self, obj):
        if obj.leader and hasattr(obj.leader, 'camp_leader_profile'):
            return obj.leader.camp_leader_profile.full_name
        return None

    def get_inventory(self, obj):
        from inventory.models import InventoryItem
        items = InventoryItem.objects.filter(camp=obj)
        return [{'product_name': item.product_name, 'quantity': item.quantity, 'unit': item.unit} for item in items]

    def validate(self, data):
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        if latitude is not None and not (-90 <= latitude <= 90):
            raise serializers.ValidationError({"latitude": "Latitude must be between -90 and 90."})
        if longitude is not None and not (-180 <= longitude <= 180):
            raise serializers.ValidationError({"longitude": "Longitude must be between -180 and 180."})
        
        capacity = data.get('capacity', self.instance.capacity if self.instance else 0)
        current_population = data.get('current_population', self.instance.current_population if self.instance else 0)
        if capacity < 0:
            raise serializers.ValidationError({"capacity": "Capacity cannot be negative."})
        if current_population < 0:
            raise serializers.ValidationError({"current_population": "Current population cannot be negative."})
            
        return data
