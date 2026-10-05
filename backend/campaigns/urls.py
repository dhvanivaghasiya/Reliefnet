from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CampaignViewSet
from .dashboard_views import DashboardStatsView, UnifiedSearchView

router = DefaultRouter()
router.register('campaigns', CampaignViewSet, basename='campaign')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('search/', UnifiedSearchView.as_view(), name='unified-search'),
]
