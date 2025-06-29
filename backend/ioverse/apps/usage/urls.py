from django.urls import path
from .views import OrgUsageView, OrgCostView

urlpatterns = [
    path("usage/", OrgUsageView.as_view(), name="org-usage"),
    path("costs/", OrgCostView.as_view(), name="org-costs"),
]
