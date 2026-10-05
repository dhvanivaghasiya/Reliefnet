from django.contrib import admin
from .models import Donation

@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'product_name', 'quantity', 'unit', 'status', 'camp', 'donation_date']
    list_filter = ['status', 'delivery_method', 'category']
    search_fields = ['full_name', 'email', 'product_name', 'other_item']
