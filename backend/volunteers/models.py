from django.conf import settings
from django.db import models

class Volunteer(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('ASSIGNED', 'Assigned'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='volunteer_profile',
        null=True,
        blank=True
    )
    full_name = models.CharField(max_length=150, default='')
    age = models.IntegerField(default=18)
    email = models.EmailField(default='')
    phone = models.CharField(max_length=20, default='')
    gov_id = models.CharField(max_length=100, verbose_name="Government ID", default='')
    address = models.TextField(default='')
    current_city = models.CharField(max_length=100, default='')
    skills = models.TextField(blank=True, null=True)
    availability = models.CharField(max_length=100, default='Full Time')
    reason_for_volunteering = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    assigned_camp = models.ForeignKey(
        'camps.Camp',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='volunteers'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.full_name or 'Unnamed Volunteer'} ({self.status})"
