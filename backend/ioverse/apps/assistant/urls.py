from django.urls import path, include
from rest_framework import routers
from .views.assistant import (
    AssistantCreateView,
    AssistantListView,
    AssistantRetrieveView,
    AssistantUpdateView,
    AssistantDeleteView
)
from .views.thread import (
    ThreadCreateView,
    ThreadRetrieveView,
    ThreadUpdateView,
    ThreadDeleteView
)

urlpatterns = [
    # Assistant
    path('create/', AssistantCreateView.as_view(), name='assistant-create'),
    path('list/', AssistantListView.as_view(), name='assistant-list'),
    path('<str:assistant_id>/retrieve/', AssistantRetrieveView.as_view(), name='assistant-retrieve'),
    path('<str:assistant_id>/update/', AssistantUpdateView.as_view(), name='assistant-update'),
    path('<str:assistant_id>/delete/', AssistantDeleteView.as_view(), name='assistant-delete'),
    # Thread
    path('thread/create/', ThreadCreateView.as_view(), name='thread-create'),
    path('thread/<str:thread_id>/retrieve/', ThreadRetrieveView.as_view(), name='thread-retrieve'),
    path('thread/<str:thread_id>/update/', ThreadUpdateView.as_view(), name='thread-update'),
    path('thread/<str:thread_id>/delete/', ThreadDeleteView.as_view(), name='thread-delete'),
]
