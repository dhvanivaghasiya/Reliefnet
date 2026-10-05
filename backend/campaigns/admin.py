from django.contrib import admin
from .models import Campaign

@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'target_amount', 'raised_amount', 'status', 'start_date', 'end_date']
    list_filter = ['status', 'category']
    search_fields = ['title', 'description']
