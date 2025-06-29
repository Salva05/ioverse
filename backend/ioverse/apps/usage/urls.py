from django.urls import path
from .views import OrgUsageView

urlpatterns = [
    path("usage/", OrgUsageView.as_view(), name="org-usage"),
]
