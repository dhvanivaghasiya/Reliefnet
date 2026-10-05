from rest_framework import viewsets, permissions
from .models import Volunteer
from .serializers import VolunteerSerializer

class IsAdminOrLeader(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['SUPER_ADMIN', 'CAMP_LEADER']

class VolunteerViewSet(viewsets.ModelViewSet):
    serializer_class = VolunteerSerializer
    
    def get_permissions(self):
        # Registration can be accessed by anyone, CRUD lists restricted to Admin or Leader
        if self.action in ['create']:
            return [permissions.AllowAny()]
        return [IsAdminOrLeader()]

    def get_queryset(self):
        queryset = Volunteer.objects.all()
        
        # Filtering
        status = self.request.query_params.get('status')
        search = self.request.query_params.get('search')
        
        if status:
            queryset = queryset.filter(status=status)
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(full_name__icontains=search) | Q(email__icontains=search) | Q(current_city__icontains=search) | Q(skills__icontains=search)
            )

        # Sorting
        ordering = self.request.query_params.get('ordering', '-created_at')
        valid_orderings = ['created_at', '-created_at', 'full_name', '-full_name', 'age', '-age']
        if ordering in valid_orderings:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('-created_at')
            
        return queryset

    def perform_update(self, serializer):
        old_instance = self.get_object()
        instance = serializer.save()
        user = instance.user
        if user:
            if instance.status in ['APPROVED', 'ASSIGNED']:
                user.is_active = True
                user.save()
                # Create notification if transition happened
                if old_instance.status not in ['APPROVED', 'ASSIGNED']:
                    from notifications.models import Notification
                    Notification.objects.create(
                        user=user,
                        title="Volunteer Application Approved",
                        message=f"Congratulations, your volunteer application has been approved! Assigned Camp: {instance.assigned_camp.name if instance.assigned_camp else 'Pending Deployment'}."
                    )
                # If assigned_camp changed:
                elif instance.assigned_camp != old_instance.assigned_camp:
                    from notifications.models import Notification
                    if instance.assigned_camp:
                        Notification.objects.create(
                            user=user,
                            title="Volunteer Deployed",
                            message=f"You have been deployed to '{instance.assigned_camp.name}'."
                        )
                    else:
                        Notification.objects.create(
                            user=user,
                            title="Volunteer Unassigned",
                            message=f"You have been unassigned from '{old_instance.assigned_camp.name if old_instance.assigned_camp else 'your camp'}'."
                        )
            elif instance.status == 'REJECTED':
                user.is_active = False
                user.save()
