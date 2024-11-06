from django.urls import path, include
from rest_framework import routers
from .views.assistant import (
    AssistantCreateView,
    AssistantListView,
    AssistantRetrieveView,
    AssistantUpdateView,
    AssistantDeleteView
)

urlpatterns = [
    path('', AssistantCreateView.as_view(), name='assistant-create'),
    path('list/', AssistantListView.as_view(), name='assistant-list'),
    path('<str:assistant_id>/', AssistantRetrieveView.as_view(), name='assistant-retrieve'),
    path('<str:assistant_id>/update/', AssistantUpdateView.as_view(), name='assistant-update'),
    path('<str:assistant_id>/delete/', AssistantDeleteView.as_view(), name='assistant-delete'),
]
