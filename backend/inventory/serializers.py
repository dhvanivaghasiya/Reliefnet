from rest_framework import serializers
from .models import InventoryItem

class InventoryItemSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    camp_name = serializers.ReadOnlyField(source='camp.name')

    class Meta:
        model = InventoryItem
        fields = (
            'id', 'camp', 'camp_name', 'category', 'category_name', 
            'product_name', 'quantity', 'unit', 'last_updated'
        )
        read_only_fields = ('id', 'last_updated')

    def validate_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("Quantity cannot be negative.")
        return value
