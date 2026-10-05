from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CampLeaderViewSet

router = DefaultRouter()
router.register('leaders', CampLeaderViewSet, basename='leader')

urlpatterns = [
    path('', include(router.urls)),
]
