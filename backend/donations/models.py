from django.db import models

class Donation(models.Model):
    DELIVERY_METHOD_CHOICES = [
        ('SELF_DELIVERY', 'Self Delivery'),
        ('PICKUP_REQUEST', 'Pickup Request'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('COMPLETED', 'Completed'),
    ]

    campaign = models.ForeignKey(
        'campaigns.Campaign',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='donations'
    )
    camp = models.ForeignKey(
        'camps.Camp',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='donations'
    )
    
    # Contact details
    full_name = models.CharField(max_length=150, default='')
    email = models.EmailField(default='')
    phone = models.CharField(max_length=20, default='')
    
    # Item details
    category = models.ForeignKey(
        'categories.Category',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='donations'
    )
    product_name = models.CharField(max_length=200, blank=True, null=True)
    quantity = models.IntegerField(default=1)
    unit = models.CharField(max_length=50, blank=True, null=True)
    other_item = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    
    # Delivery details
    delivery_method = models.CharField(
        max_length=20,
        choices=DELIVERY_METHOD_CHOICES,
        default='SELF_DELIVERY'
    )
    
    # Status details
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    
    # Legacy fields
    donor_name = models.CharField(max_length=150, default='Anonymous')
    donor_email = models.EmailField(blank=True, null=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    transaction_id = models.CharField(max_length=100, unique=True, blank=True, null=True)
    
    donation_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        item = self.product_name or self.other_item or f"${self.amount}"
        return f"Donation of {self.quantity}x {item} by {self.full_name or self.donor_name}"
