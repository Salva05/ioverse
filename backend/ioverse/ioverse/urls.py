"""
URL configuration for ioverse project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.conf import settings
from django.urls import path, include
from django.conf.urls.static import static

from rest_framework_simplejwt import views as jwt_views

from apps.account.views import UserRegistrationView
from apps.account.views import CurrentUserView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/chatbot/', include('apps.chatbot.urls')),
    path('api/text-to-image/', include('apps.text_to_image.urls')),
    path('api/assistant/', include('apps.assistant.urls')),
    path('account/', include('apps.account.urls')),
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('api/token/', jwt_views.TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
    path('api/current-user/', CurrentUserView.as_view(), name='current-user'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
