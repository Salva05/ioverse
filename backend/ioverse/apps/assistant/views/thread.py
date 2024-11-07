from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.assistant.serializers import ThreadSerializer
from apps.assistant.services.thread_services import ThreadIntegrationService
from pydantic import ValidationError
from django.core.exceptions import ObjectDoesNotExist

class ThreadCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ThreadSerializer(data=request.data)
        if serializer.is_valid():
            service = ThreadIntegrationService()
            try:
                django_thread = service.create_thread(serializer.validated_data, request.user)
                return Response(ThreadSerializer(django_thread).data, status=status.HTTP_201_CREATED)
            except ValidationError as ve:
                return Response({"errors": ve.errors()}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ThreadRetrieveView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, thread_id):
        service = ThreadIntegrationService()
        try:
            django_thread = service.retrieve_thread(thread_id, request.user)
            if django_thread:
                return Response(ThreadSerializer(django_thread).data, status=status.HTTP_200_OK)
            return Response({"error": "Thread not found."}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as ve:
            return Response({"errors": ve.errors()}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class ThreadUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, thread_id):
        serializer = ThreadSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            service = ThreadIntegrationService()
            try:
                django_thread = service.update_thread(thread_id, serializer.validated_data, request.user)
                return Response(ThreadSerializer(django_thread).data, status=status.HTTP_200_OK)
            except ObjectDoesNotExist:
                return Response({"error": "Thread not found."}, status=status.HTTP_404_NOT_FOUND)
            except ValidationError as ve:
                return Response({"errors": ve.errors()}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ThreadDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, thread_id):
        service = ThreadIntegrationService()
        try:
            response = service.delete_thread(thread_id, request.user)
            return Response(response, status=status.HTTP_204_NO_CONTENT)
        except ObjectDoesNotExist:
            return Response({"error": "Thread not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)