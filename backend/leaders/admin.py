from django.contrib import admin
from .models import CampLeader

@admin.register(CampLeader)
class CampLeaderAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'phone', 'camp_requested', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['full_name', 'email', 'phone']
