from rest_framework import serializers
from .models import Volunteer

class VolunteerSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    assigned_camp_name = serializers.ReadOnlyField(source='assigned_camp.name')

    class Meta:
        model = Volunteer
        fields = '__all__'
