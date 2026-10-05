from django.conf import settings
from django.db import models

class CampLeader(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='camp_leader_profile',
        null=True,
        blank=True
    )
    full_name = models.CharField(max_length=150, default='')
    age = models.IntegerField(default=18)
    email = models.EmailField(default='')
    phone = models.CharField(max_length=20, default='')
    gov_id = models.CharField(max_length=100, verbose_name="Government ID", default='')
    address = models.TextField(default='')
    camp_requested = models.CharField(max_length=200, blank=True, null=True)
    reason_for_applying = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    temp_password = models.CharField(max_length=128, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.full_name or 'Unnamed Leader'} ({self.status})"
