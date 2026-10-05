from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    LogoutView,
    CurrentUserView,
    RegisterLeaderView,
    RegisterVolunteerView,
    UsersListView,
    ChangePasswordView
)

urlpatterns = [
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/me/', CurrentUserView.as_view(), name='current_user'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('auth/register/leader/', RegisterLeaderView.as_view(), name='register_leader'),
    path('auth/register/volunteer/', RegisterVolunteerView.as_view(), name='register_volunteer'),
    path('users/', UsersListView.as_view(), name='users_list'),
]
