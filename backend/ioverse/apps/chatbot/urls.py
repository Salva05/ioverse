from django.urls import path
from .views import MessageCreate

urlpatterns = [
    path('chat/', MessageCreate.as_view(), name='message-create'),
]
