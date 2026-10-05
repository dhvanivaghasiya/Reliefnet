from django.contrib import admin
from .models import Volunteer

@admin.register(Volunteer)
class VolunteerAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'phone', 'current_city', 'status', 'assigned_camp', 'created_at']
    list_filter = ['status', 'current_city', 'assigned_camp']
    search_fields = ['full_name', 'email', 'phone', 'skills']
