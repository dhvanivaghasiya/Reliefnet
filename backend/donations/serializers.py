from rest_framework import serializers
from .models import Donation

class DonationSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    camp_name = serializers.ReadOnlyField(source='camp.name')

    class Meta:
        model = Donation
        fields = '__all__'

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Donated quantity must be at least 1.")
        return value
