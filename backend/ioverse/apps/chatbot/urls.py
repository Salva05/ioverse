from django.urls import path
from .views import MessageCreate

urlpatterns = [
    path('messages/', MessageCreate.as_view(), name='chatbot'),
]
