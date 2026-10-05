from django.conf import settings
from django.db import models

class Camp(models.Model):
    class CampStatus(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        INACTIVE = 'INACTIVE', 'Inactive'
        FULL = 'FULL', 'Full'

    campaign = models.ForeignKey(
        'campaigns.Campaign',
        on_delete=models.CASCADE,
        related_name='camps',
        null=True,
        blank=True
    )
    name = models.CharField(max_length=200, verbose_name="Camp Name")
    address = models.TextField(blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    leader = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'role': 'CAMP_LEADER'},
        related_name='managed_camps'
    )
    contact_number = models.CharField(max_length=20, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=CampStatus.choices,
        default=CampStatus.ACTIVE
    )
    
    # Keeping fields from Phase 1 for maximum schema compatibility
    location = models.CharField(max_length=255, blank=True, null=True)
    capacity = models.IntegerField(default=0)
    current_population = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
