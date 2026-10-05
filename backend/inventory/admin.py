from django.contrib import admin
from .models import InventoryItem

@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ['product_name', 'camp', 'quantity', 'unit', 'category', 'last_updated']
    list_filter = ['category', 'camp']
    search_fields = ['product_name']
