from django.urls import path
from .views import PasswordResetRequestView, AdminKeySetView

urlpatterns = [
    path('reset-password/', PasswordResetRequestView.as_view(), name='reset-password'),
    path("admin-key/", AdminKeySetView.as_view(), name="account-admin-key"),
]
