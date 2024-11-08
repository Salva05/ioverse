"""
Django settings for ioverse project.

Generated by 'django-admin startproject' using Django 5.1.2.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.1/ref/settings/
"""
import os
import environ
from datetime import timedelta
from pathlib import Path
from celery.schedules import crontab

env = environ.Env(
    DEBUG=(bool, False)
)

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

environ.Env.read_env(env_file=BASE_DIR / '.env')  # Reads the .env file

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env('DEBUG')

# Path to keys
PRIVATE_KEY_PATH = BASE_DIR / 'keys/private.pem'
PUBLIC_KEY_PATH = BASE_DIR / 'keys/public.pem'

with open(PRIVATE_KEY_PATH, 'r') as private_file:
    PRIVATE_KEY = private_file.read()
    
with open(PUBLIC_KEY_PATH, 'r') as public_file:
    PUBLIC_KEY = public_file.read()

ALLOWED_HOSTS = ['*']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    'apps.chatbot',
    'apps.text_to_image',
    'apps.assistant',
    'rest_framework',
    'django_json_widget',
    'corsheaders',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.DjangoModelPermissionsOrAnonReadOnly'
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 100,
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.UserRateThrottle',
        'rest_framework.throttling.ScopedRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'images': '10/minute',
        'user': '20/minute',
    },
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=5),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ALGORITHM': 'RS256',
    'SIGNING_KEY': PRIVATE_KEY,
    'VERIFYING_KEY': PUBLIC_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

CELERY_BEAT_SCHEDULE = {
    # Task to unshare expired images every 5 minutes
    'unshare-expired-images-every-5-minutes': {
        'task': 'apps.text_to_image.tasks.unshare_expired_images',
        'schedule': crontab(minute='*/5'),
    },
    
    # Task to clean up expired URL images every 5 minutes
    'cleanup-expired-url-images-every-5-minutes': {
        'task': 'apps.text_to_image.tasks.cleanup_expired_url_images',
        'schedule': crontab(minute='*/5'),
    },
    
    # Task to unshare expired conversations every 5 minutes
    'unshare-expired-conversations-every-5-minutes': {
        'task': 'apps.chatbot.tasks.unshare_expired_conversations',
        'schedule': crontab(minute='*/5'),
    },
}

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'test-cache',
    }
}

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CORS_ALLOWED_ORIGINS = [
    'http://192.168.1.14:5173',
    'http://192.168.1.12:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5173',
]

ROOT_URLCONF = 'ioverse.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'ioverse.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[{asctime}] {levelname} {name} {message}',
            'style': '{',
        },
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'fmt': '%(asctime)s %(name)s %(levelname)s %(message)s',
        },
        'chat': {
            'format': '%(asctime)s - %(message)s',
        },
        'text_to_image': {
            'format': '[{asctime}] {levelname} {name} {message}',
            'style': '{',
        },
        'celery': {
            'format': '[Celery] [{asctime}] {levelname} {name} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        # Handlers for chatbot app
        'chatbot_file': {
            'class': 'logging.FileHandler',
            'filename': 'chatbot_project.log',
            'formatter': 'json',
        },
        'chat_file': {
            'class': 'logging.FileHandler',
            'filename': 'chat.log',
            'formatter': 'chat',
        },
        # Handlers for text_to_image app
        'text_to_image_file': {
            'class': 'logging.FileHandler',
            'filename': 'text_to_image_project.log',
            'formatter': 'json',
        },
        'text_to_image_image_file': {
            'class': 'logging.FileHandler',
            'filename': 'text_to_image.log',
            'formatter': 'text_to_image',
        },
        # Handler for Celery logs
        'celery_file': {
            'class': 'logging.FileHandler',
            'filename': 'celery.log',
            'formatter': 'celery',
        },
    },
    'loggers': {
        # Loggers for chatbot app
        'chatbot_project': {
            'handlers': ['chatbot_file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
        'chat_log': {
            'handlers': ['chat_file'],
            'level': 'INFO',
            'propagate': False,
        },
        # Loggers for text_to_image app
        'text_to_image_project': {
            'handlers': ['text_to_image_file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
        'text_to_image_log': {
            'handlers': ['text_to_image_image_file'],
            'level': 'INFO',
            'propagate': False,
        },
        # Logger for Celery
        'celery': {
            'handlers': ['celery_file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media') 

# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Europe/Rome'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Base url of the front end
FRONTEND_URL = env('FRONTEND_URL')