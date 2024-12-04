from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from pydantic import ValidationError
from django.core.exceptions import ObjectDoesNotExist

from apps.assistant.serializers import ThreadSerializer, ThreadCreationSerializer
from apps.assistant.services.thread_services import ThreadIntegrationService

from ioverse.exceptions import MissingApiKeyException

class ThreadBaseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_api_key(self):
        """
        Method to retrieve API key for a given user.
        """
        api_key = getattr(self.request.user, 'api_key', None)
        if not api_key:
            raise MissingApiKeyException()
        return api_key
    
class ThreadCreateView(ThreadBaseView):
    def post(self, request):
        serializer = ThreadCreationSerializer(data=request.data)
        if serializer.is_valid():
            # Retrieve OpenAI API Key
            api_key = self.get_api_key()
            service = ThreadIntegrationService(api_key=api_key)
            
            try:
                django_thread = service.create_thread(serializer.validated_data, request.user)
                return Response(ThreadSerializer(django_thread).data, status=status.HTTP_201_CREATED)
            except ValidationError as ve:
                return Response({"errors": ve.errors()}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ThreadRetrieveView(ThreadBaseView):
    def get(self, request, thread_id):
        try:
            # Retrieve OpenAI API Key
            api_key = self.get_api_key()
            service = ThreadIntegrationService(api_key=api_key)
                                               
            django_thread = service.retrieve_thread(thread_id, request.user)
            if django_thread:
                return Response(ThreadSerializer(django_thread).data, status=status.HTTP_200_OK)
            return Response({"error": "Thread not found."}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as ve:
            return Response({"errors": ve.errors()}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class ThreadListView(ThreadBaseView):
    def get(self, request):
        try:
            # Retrieve OpenAI API Key
            api_key = self.get_api_key()
            service = ThreadIntegrationService(api_key=api_key)
            
            django_threads = service.list_threads(request.user)
            return Response(ThreadSerializer(django_threads, many=True).data, status=status.HTTP_200_OK)
        except ValidationError as ve:
            return Response({"errors": ve.errors()}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class ThreadUpdateView(ThreadBaseView):
    def put(self, request, thread_id):
        serializer = ThreadSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            try:
                # Retrieve OpenAI API Key
                api_key = self.get_api_key()
                service = ThreadIntegrationService(api_key=api_key)
                
                django_thread = service.update_thread(thread_id, serializer.validated_data, request.user)
                return Response(ThreadSerializer(django_thread).data, status=status.HTTP_200_OK)
            except ObjectDoesNotExist:
                return Response({"error": "Thread not found."}, status=status.HTTP_404_NOT_FOUND)
            except ValidationError as ve:
                return Response({"errors": ve.errors()}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ThreadDeleteView(ThreadBaseView):
    def delete(self, request, thread_id):
        try:
            # Retrieve OpenAI API Key
            api_key = self.get_api_key()
            service = ThreadIntegrationService(api_key=api_key)
            
            response = service.delete_thread(thread_id, request.user)
            return Response(response, status=status.HTTP_204_NO_CONTENT)
        except ObjectDoesNotExist:
            return Response({"error": "Thread not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)