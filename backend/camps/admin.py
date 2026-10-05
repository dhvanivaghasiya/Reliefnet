from django.contrib import admin
from .models import Camp

@admin.register(Camp)
class CampAdmin(admin.ModelAdmin):
    list_display = ['name', 'campaign', 'address', 'latitude', 'longitude', 'leader', 'contact_number', 'status']
    list_filter = ['status', 'campaign']
    search_fields = ['name', 'address', 'contact_number']
