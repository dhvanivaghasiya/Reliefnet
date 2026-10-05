from rest_framework import viewsets, permissions
from .models import InventoryItem
from .serializers import InventoryItemSerializer

class IsCampLeaderOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        # Allow read access to all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        # Write access only to SUPER_ADMIN and CAMP_LEADER roles
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['SUPER_ADMIN', 'CAMP_LEADER']
        )

class InventoryItemViewSet(viewsets.ModelViewSet):
    serializer_class = InventoryItemSerializer
    permission_classes = [IsCampLeaderOrAdmin]

    def get_queryset(self):
        queryset = InventoryItem.objects.all()
        
        # Filtering
        camp_id = self.request.query_params.get('camp')
        category_id = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        
        if camp_id:
            queryset = queryset.filter(camp_id=camp_id)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        if search:
            queryset = queryset.filter(product_name__icontains=search)

        # Sorting
        ordering = self.request.query_params.get('ordering', 'product_name')
        valid_orderings = ['product_name', '-product_name', 'quantity', '-quantity', 'last_updated', '-last_updated']
        if ordering in valid_orderings:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('product_name')
            
        return queryset

    def perform_create(self, serializer):
        instance = serializer.save()
        from notifications.models import Notification
        if instance.camp and instance.camp.leader:
            Notification.objects.create(
                user=instance.camp.leader,
                title="Inventory Updated",
                message=f"A new inventory item '{instance.product_name}' with quantity {instance.quantity} {instance.unit} has been added to '{instance.camp.name}'."
            )

    def perform_update(self, serializer):
        instance = serializer.save()
        from notifications.models import Notification
        if instance.camp and instance.camp.leader:
            Notification.objects.create(
                user=instance.camp.leader,
                title="Inventory Updated",
                message=f"Inventory item '{instance.product_name}' has been updated to quantity {instance.quantity} {instance.unit}."
            )
