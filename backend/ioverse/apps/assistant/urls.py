from django.urls import path
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
from .views.message import (
    MessageCreateView,
    MessageListView,
    MessageRetrieveView,
    MessageUpdateView,
    MessageDeleteView
)
from .views.vectorstore import (
    VectorStoreCreateView,
    VectorStoreListView,
    VectorStoreRetrieveView,
    VectorStoreUpdateView,
    VectorStoreDeleteView
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
    # Message
    path('message/<str:thread_id>/create/', MessageCreateView.as_view(), name='message-create'),
    path('message/<str:thread_id>/list/', MessageListView.as_view(), name='message-list'),
    path('message/<str:thread_id>/<str:message_id>/retrieve/', MessageRetrieveView.as_view(), name='message-retrieve'),
    path('message/<str:thread_id>/<str:message_id>/update/', MessageUpdateView.as_view(), name='message-update'),
    path('message/<str:thread_id>/<str:message_id>/delete/', MessageDeleteView.as_view(), name='message-delete'),
    # Vector Store
    path('vector_store/create/', VectorStoreCreateView.as_view(), name='vector_store-create'),
    path('vector_store/list/', VectorStoreListView.as_view(), name='vector_store-list'),
    path('vector_store/<str:vector_store_id>/retrieve/', VectorStoreRetrieveView.as_view(), name='vector_store-retrieve'),
    path('vector_store/<str:vector_store_id>/update/', VectorStoreUpdateView.as_view(), name='vector_store-update'),
    path('vector_store/<str:vector_store_id>/delete/', VectorStoreDeleteView.as_view(), name='vector_store-delete'),
]
