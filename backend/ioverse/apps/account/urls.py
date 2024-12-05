from django.urls import path
from .views import PasswordResetRequestView

urlpatterns = [
    path('reset-password/', PasswordResetRequestView.as_view(), name='reset-password'),
]
