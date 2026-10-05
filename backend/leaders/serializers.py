from rest_framework import serializers
from .models import CampLeader

class CampLeaderSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    assigned_camp_name = serializers.SerializerMethodField(read_only=True)
    assigned_camp_id = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = CampLeader
        fields = '__all__'

    def get_assigned_camp_name(self, obj):
        if obj.user:
            camp = obj.user.managed_camps.first()
            return camp.name if camp else None
        return None

    def get_assigned_camp_id(self, obj):
        if obj.user:
            camp = obj.user.managed_camps.first()
            return camp.id if camp else None
        return None

