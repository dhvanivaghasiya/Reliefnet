from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from .models import User
from leaders.models import CampLeader
from volunteers.models import Volunteer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    volunteer_status = serializers.SerializerMethodField()
    assigned_camp_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'address', 'is_active', 'volunteer_status', 'assigned_camp_name')
        read_only_fields = ('id', 'role')

    def get_volunteer_status(self, obj):
        if hasattr(obj, 'volunteer_profile') and obj.volunteer_profile:
            return obj.volunteer_profile.status
        return None

    def get_assigned_camp_name(self, obj):
        if hasattr(obj, 'volunteer_profile') and obj.volunteer_profile and obj.volunteer_profile.assigned_camp:
            return obj.volunteer_profile.assigned_camp.name
        return None

class RegisterLeaderSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    full_name = serializers.CharField(max_length=150)
    age = serializers.IntegerField(min_value=1)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20)
    gov_id = serializers.CharField(max_length=100)
    address = serializers.CharField()
    camp_requested = serializers.CharField(max_length=200, required=False, allow_blank=True)
    reason_for_applying = serializers.CharField(required=False, allow_blank=True)

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value

    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        
        with transaction.atomic():
            user = User.objects.create(
                username=username,
                email=validated_data.get('email', ''),
                phone=validated_data.get('phone', ''),
                address=validated_data.get('address', ''),
                role=User.Role.CAMP_LEADER,
                is_active=False  # Deactivated until Admin approves
            )
            user.set_password(password)
            user.save()
            
            # Create Camp Leader Profile
            CampLeader.objects.create(
                user=user,
                full_name=validated_data.get('full_name', ''),
                age=validated_data.get('age', 18),
                email=validated_data.get('email', ''),
                phone=validated_data.get('phone', ''),
                gov_id=validated_data.get('gov_id', ''),
                address=validated_data.get('address', ''),
                camp_requested=validated_data.get('camp_requested', ''),
                reason_for_applying=validated_data.get('reason_for_applying', ''),
                status='PENDING'
            )
            
        return user

    def to_representation(self, instance):
        return {
            'id': instance.id,
            'username': instance.username,
            'email': instance.email,
            'role': instance.role,
            'detail': 'Leader application submitted successfully. Status: Pending.'
        }

class RegisterVolunteerSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    full_name = serializers.CharField(max_length=150)
    age = serializers.IntegerField(min_value=1)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20)
    gov_id = serializers.CharField(max_length=100)
    address = serializers.CharField()
    current_city = serializers.CharField(max_length=100)
    skills = serializers.CharField(required=False, allow_blank=True)
    availability = serializers.CharField(max_length=100)
    reason_for_volunteering = serializers.CharField(required=False, allow_blank=True)

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value

    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        
        with transaction.atomic():
            user = User.objects.create(
                username=username,
                email=validated_data.get('email', ''),
                phone=validated_data.get('phone', ''),
                address=validated_data.get('address', ''),
                role=User.Role.VOLUNTEER,
                is_active=False  # Deactivated until Admin approves
            )
            user.set_password(password)
            user.save()
            
            # Create Volunteer Profile
            Volunteer.objects.create(
                user=user,
                full_name=validated_data.get('full_name', ''),
                age=validated_data.get('age', 18),
                email=validated_data.get('email', ''),
                phone=validated_data.get('phone', ''),
                gov_id=validated_data.get('gov_id', ''),
                address=validated_data.get('address', ''),
                current_city=validated_data.get('current_city', ''),
                skills=validated_data.get('skills', ''),
                availability=validated_data.get('availability', 'Full Time'),
                reason_for_volunteering=validated_data.get('reason_for_volunteering', ''),
                status='PENDING'
            )
            
        return user

    def to_representation(self, instance):
        return {
            'id': instance.id,
            'username': instance.username,
            'email': instance.email,
            'role': instance.role,
            'detail': 'Volunteer application submitted successfully. Status: Pending Approval.'
        }
