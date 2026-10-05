from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum

from campaigns.models import Campaign
from camps.models import Camp
from volunteers.models import Volunteer
from leaders.models import CampLeader
from inventory.models import InventoryItem
from donations.models import Donation
from categories.models import Category

from campaigns.serializers import CampaignSerializer
from camps.serializers import CampSerializer
from categories.serializers import CategorySerializer
from inventory.serializers import InventoryItemSerializer

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        campaigns_count = Campaign.objects.count()
        camps_count = Camp.objects.count()
        volunteers_count = Volunteer.objects.count()
        leaders_count = CampLeader.objects.count()
        
        inventory_sum = InventoryItem.objects.aggregate(total=Sum('quantity'))['total'] or 0
        donations_count = Donation.objects.count()

        # Analytics
        # 1. Donations by campaign
        donations_by_campaign = []
        for campg in Campaign.objects.all()[:10]:
            d_count = Donation.objects.filter(camp__campaign=campg).count()
            donations_by_campaign.append({
                "campaign_title": campg.title,
                "count": d_count
            })

        # 2. Volunteers by campaign
        volunteers_by_campaign = []
        for campg in Campaign.objects.all()[:10]:
            v_count = Volunteer.objects.filter(assigned_camp__campaign=campg).count()
            volunteers_by_campaign.append({
                "campaign_title": campg.title,
                "count": v_count
            })

        # 3. Inventory by category
        inventory_by_category = []
        for cat in Category.objects.all():
            total_qty = InventoryItem.objects.filter(category=cat).aggregate(total=Sum('quantity'))['total'] or 0
            inventory_by_category.append({
                "category_name": cat.name,
                "total_qty": total_qty
            })

        return Response({
            "cards": {
                "campaigns": campaigns_count,
                "camps": camps_count,
                "volunteers": volunteers_count,
                "leaders": leaders_count,
                "inventory": inventory_sum,
                "donations": donations_count
            },
            "analytics": {
                "donations_by_campaign": donations_by_campaign,
                "volunteers_by_campaign": volunteers_by_campaign,
                "inventory_by_category": inventory_by_category
            }
        })

class UnifiedSearchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response({
                "campaigns": [],
                "camps": [],
                "categories": [],
                "products": []
            })

        # Search campaigns
        campaigns = Campaign.objects.filter(
            title__icontains=query
        ) | Campaign.objects.filter(
            description__icontains=query
        )
        
        # Search camps
        camps = Camp.objects.filter(
            name__icontains=query
        ) | Camp.objects.filter(
            address__icontains=query
        ) | Camp.objects.filter(
            description__icontains=query
        )

        # Search categories
        categories = Category.objects.filter(
            name__icontains=query
        )

        # Search products
        products = InventoryItem.objects.filter(
            product_name__icontains=query
        )

        return Response({
            "campaigns": CampaignSerializer(campaigns.distinct()[:5], many=True).data,
            "camps": CampSerializer(camps.distinct()[:5], many=True).data,
            "categories": CategorySerializer(categories.distinct()[:5], many=True).data,
            "products": InventoryItemSerializer(products.distinct()[:5], many=True).data
        })
