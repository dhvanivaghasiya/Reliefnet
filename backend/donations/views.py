from rest_framework import viewsets, permissions
from .models import Donation
from .serializers import DonationSerializer
from camps.models import Camp

class DonationViewSet(viewsets.ModelViewSet):
    serializer_class = DonationSerializer

    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Donation.objects.none()

        if user.role == 'SUPER_ADMIN':
            queryset = Donation.objects.all()
        elif user.role == 'CAMP_LEADER':
            led_camps = Camp.objects.filter(leader=user)
            queryset = Donation.objects.filter(camp__in=led_camps)
        else:
            queryset = Donation.objects.filter(email=user.email)

        # Filtering
        camp_id = self.request.query_params.get('camp')
        category_id = self.request.query_params.get('category')
        status = self.request.query_params.get('status')
        search = self.request.query_params.get('search')
        
        if camp_id:
            queryset = queryset.filter(camp_id=camp_id)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        if status:
            queryset = queryset.filter(status=status)
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(product_name__icontains=search) | Q(full_name__icontains=search) | Q(email__icontains=search) | Q(other_item__icontains=search)
            )

        # Sorting
        ordering = self.request.query_params.get('ordering', '-donation_date')
        valid_orderings = ['donation_date', '-donation_date', 'status', '-status', 'quantity', '-quantity']
        if ordering in valid_orderings:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('-donation_date')

        return queryset

    def perform_create(self, serializer):
        instance = serializer.save()
        from notifications.models import Notification
        
        if instance.camp and instance.camp.leader:
            Notification.objects.create(
                user=instance.camp.leader,
                title="Donation Submitted",
                message=f"A new donation of {instance.quantity}x {instance.product_name or instance.other_item} has been offered for your camp '{instance.camp.name}' by {instance.full_name}."
            )
            
        if self.request.user.is_authenticated:
            Notification.objects.create(
                user=self.request.user,
                title="Donation Submitted",
                message=f"Thank you! Your donation of {instance.quantity}x {instance.product_name or instance.other_item} for '{instance.camp.name if instance.camp else 'our relief camp'}' has been registered."
            )

    def perform_update(self, serializer):
        old_instance = self.get_object()
        instance = serializer.save()
        from notifications.models import Notification
        
        # If the donation transitions to COMPLETED, add the product directly to the camp's dynamic inventory
        if old_instance.status != 'COMPLETED' and instance.status == 'COMPLETED':
            if instance.camp and instance.category and instance.product_name:
                from inventory.models import InventoryItem
                
                inv_item, created = InventoryItem.objects.get_or_create(
                    camp=instance.camp,
                    category=instance.category,
                    product_name=instance.product_name,
                    defaults={
                        'quantity': instance.quantity,
                        'unit': instance.unit or 'pcs'
                    }
                )
                if not created:
                    inv_item.quantity += instance.quantity
                    inv_item.save()
            
            if instance.camp and instance.camp.leader:
                Notification.objects.create(
                    user=instance.camp.leader,
                    title="Inventory Updated via Donation",
                    message=f"The donation offer of {instance.quantity}x {instance.product_name or instance.other_item} by {instance.full_name} has been processed and added to camp inventory."
                )
            
            from django.contrib.auth import get_user_model
            User = get_user_model()
            donor_user = User.objects.filter(email=instance.email).first()
            if donor_user:
                Notification.objects.create(
                    user=donor_user,
                    title="Donation Received",
                    message=f"Your donation of {instance.quantity}x {instance.product_name or instance.other_item} has been successfully received and stocked in camp inventory."
                )
