from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import CampLeader
from .serializers import CampLeaderSerializer

class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'SUPER_ADMIN'

class CampLeaderViewSet(viewsets.ModelViewSet):
    serializer_class = CampLeaderSerializer

    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.AllowAny()]
        return [IsSuperAdmin()]

    def get_queryset(self):
        queryset = CampLeader.objects.all()
        
        # Filtering
        status = self.request.query_params.get('status')
        search = self.request.query_params.get('search')
        
        if status:
            queryset = queryset.filter(status=status)
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(full_name__icontains=search) | Q(email__icontains=search) | Q(phone__icontains=search) | Q(camp_requested__icontains=search)
            )

        # Sorting
        ordering = self.request.query_params.get('ordering', '-created_at')
        valid_orderings = ['created_at', '-created_at', 'full_name', '-full_name', 'age', '-age']
        if ordering in valid_orderings:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('-created_at')
            
        return queryset

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        old_status = instance.status
        new_status = request.data.get('status')
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        temp_password = None
        user = instance.user
        
        if new_status == 'APPROVED' and old_status != 'APPROVED' and user:
            # Generate a secure temporary password
            import random
            import string
            chars = string.ascii_lowercase + string.ascii_uppercase + string.digits + "#$%@!*"
            temp_password = "".join([
                random.choice(string.ascii_lowercase),
                random.choice(string.ascii_uppercase),
                random.choice(string.digits),
                random.choice("#$%@!*"),
                *[random.choice(chars) for _ in range(6)]
            ])
            user.set_password(temp_password)
            user.must_change_password = True
            user.is_active = True
            user.save()
            
            # Send notification
            from notifications.models import Notification
            Notification.objects.create(
                user=user,
                title="Camp Leader Application Approved",
                message=f"Congratulations, your camp leader application has been approved! Your temporary password is: {temp_password}. Please change it upon login."
            )
            
        self.perform_update(serializer)
        
        if temp_password:
            instance.temp_password = temp_password
            instance.save()
            
        response_data = serializer.data
        if temp_password:
            response_data['temp_password'] = temp_password
            response_data['username'] = user.username
            
        return Response(response_data)

    def perform_update(self, serializer):
        old_instance = self.get_object()
        instance = serializer.save()
        user = instance.user
        if user:
            user.refresh_from_db()
            if instance.status == 'APPROVED':
                if not user.is_active:
                    user.is_active = True
                    user.save()
                # Create notification if transition happened (handled in update method if password was reset, but keeping for fallback)
                if old_instance.status != 'APPROVED':
                    from notifications.models import Notification
                    # Only create if not already created
                    if not Notification.objects.filter(user=user, title="Camp Leader Application Approved").exists():
                        Notification.objects.create(
                            user=user,
                            title="Camp Leader Application Approved",
                            message="Congratulations, your camp leader application has been approved! You can now log in and manage relief camps and inventories."
                        )
            elif instance.status == 'REJECTED':
                if user.is_active:
                    user.is_active = False
                    user.save()

