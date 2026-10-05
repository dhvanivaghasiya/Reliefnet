from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Camp
from .serializers import CampSerializer

class CampViewSet(viewsets.ModelViewSet):
    serializer_class = CampSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Camp.objects.all()
        
        # Filtering
        campaign_id = self.request.query_params.get('campaign')
        status_param = self.request.query_params.get('status')
        leader = self.request.query_params.get('leader')
        search = self.request.query_params.get('search')
        
        if campaign_id:
            queryset = queryset.filter(campaign_id=campaign_id)
        if status_param:
            queryset = queryset.filter(status=status_param)
        if leader:
            queryset = queryset.filter(leader_id=leader)
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(address__icontains=search) | Q(description__icontains=search)
            )

        # Sorting
        ordering = self.request.query_params.get('ordering', '-created_at')
        valid_orderings = ['created_at', '-created_at', 'name', '-name', 'capacity', '-capacity', 'current_population', '-current_population']
        if ordering in valid_orderings:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('-created_at')
            
        return queryset

    def perform_create(self, serializer):
        instance = serializer.save()
        from notifications.models import Notification
        if instance.leader:
            Notification.objects.create(
                user=instance.leader,
                title="Camp Created & Assigned",
                message=f"You have been assigned as the Camp Leader for the newly created camp '{instance.name}'."
            )

    def perform_update(self, serializer):
        old_leader = self.get_object().leader
        instance = serializer.save()
        # If the leader was changed (newly assigned or reassigned)
        if instance.leader and instance.leader != old_leader:
            # Unassign this leader from any other camps they might be assigned to
            other_camps = Camp.objects.filter(leader=instance.leader).exclude(id=instance.id)
            for other_camp in other_camps:
                other_camp.leader = None
                other_camp.save()
                
                # Notify that they were unassigned from the other camp
                from notifications.models import Notification
                Notification.objects.create(
                    user=instance.leader,
                    title="Camp Unassigned",
                    message=f"You have been unassigned from '{other_camp.name}' because you were reassigned to '{instance.name}'."
                )

            from notifications.models import Notification
            Notification.objects.create(
                user=instance.leader,
                title="Camp Assigned",
                message=f"You have been assigned as the Camp Leader for '{instance.name}'."
            )
            
        if old_leader and instance.leader != old_leader:
            from notifications.models import Notification
            Notification.objects.create(
                user=old_leader,
                title="Camp Unassigned",
                message=f"You have been unassigned as the Camp Leader for '{instance.name}'."
            )

    @action(detail=True, methods=['post'], url_path='assign-leader')
    def assign_leader(self, request, pk=None):
        camp = self.get_object()
        
        # Validate data
        full_name = request.data.get('full_name')
        age = request.data.get('age')
        email = request.data.get('email')
        phone = request.data.get('phone')
        gov_id = request.data.get('gov_id')
        address = request.data.get('address')
        
        if not all([full_name, age, email, phone, gov_id, address]):
            return Response({"detail": "All fields (full_name, age, email, phone, gov_id, address) are required."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            age = int(age)
            if age < 1:
                return Response({"detail": "Age must be a positive integer."}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({"detail": "Age must be an integer."}, status=status.HTTP_400_BAD_REQUEST)

        # Generate unique credentials
        import string
        import random
        from django.utils.text import slugify
        from django.contrib.auth import get_user_model
        from leaders.models import CampLeader
        from django.db import transaction
        
        User = get_user_model()
        
        base_slug = slugify(camp.name).replace('-', '_')[:20]
        if not base_slug:
            base_slug = "camp"
        idx = 1
        while True:
            username = f"camp_{base_slug}_{idx:02d}"
            if not User.objects.filter(username=username).exists():
                break
            idx += 1
            
        chars = string.ascii_lowercase + string.ascii_uppercase + string.digits + "#$%@!*"
        temp_password = "".join([
            random.choice(string.ascii_lowercase),
            random.choice(string.ascii_uppercase),
            random.choice(string.digits),
            random.choice("#$%@!*"),
            *[random.choice(chars) for _ in range(6)]
        ])
        pass_list = list(temp_password)
        random.shuffle(pass_list)
        temp_password = "".join(pass_list)
        
        with transaction.atomic():
            # Create user
            user = User.objects.create(
                username=username,
                email=email,
                phone=phone,
                address=address,
                role=User.Role.CAMP_LEADER,
                must_change_password=True,
                is_active=True
            )
            user.set_password(temp_password)
            user.save()
            
            # Create leader profile
            CampLeader.objects.create(
                user=user,
                full_name=full_name,
                age=age,
                email=email,
                phone=phone,
                gov_id=gov_id,
                address=address,
                camp_requested=camp.name,
                reason_for_applying="Assigned directly by Admin",
                status='APPROVED',
                temp_password=temp_password
            )
            
            # Link to camp
            camp.leader = user
            camp.save()
            
            # Create notification
            from notifications.models import Notification
            Notification.objects.create(
                user=user,
                title="Camp Assigned",
                message=f"You have been assigned as the Camp Leader for '{camp.name}' by the Admin."
            )
            
        return Response({
            "success": True,
            "username": username,
            "password": temp_password,
            "leader_id": user.id
        }, status=status.HTTP_201_CREATED)
