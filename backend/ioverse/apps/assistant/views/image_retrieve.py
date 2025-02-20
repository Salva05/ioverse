from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from django.http import Http404

from ..models.file import File
from ..serializers import ImageSerializer
from ioverse.exceptions import MissingApiKeyException
from apps.assistant.services.file_services import FileIntegrationService

class ImageRetrieveView(generics.RetrieveAPIView):
    queryset = File.objects.all()
    serializer_class = ImageSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
    lookup_url_kwarg = 'id' 

    def get_object(self):
        file_instance = super().get_object()
        
        if not file_instance.image_file:
            # Attempt to download the image directly from OpenAI API
            # in case the image creation was done external to this application
            user = self.request.user
            file_id = self.kwargs.get(self.lookup_url_kwarg)
            
            api_key = getattr(user, 'api_key', None)
            if not api_key:
                raise MissingApiKeyException()

            service = FileIntegrationService(api_key=api_key)
            django_file = service.retrieve_file(file_id, user)
            
            if not django_file:
                raise Http404(f"File with ID {file_id} not found.")
            
            # Download the image associated to this file
            # and set it to the local model instance
            image_file = service.get_content(file_id, django_file.filename, user)
            django_file.image_file = image_file
            django_file.save()
        
        return file_instance
    