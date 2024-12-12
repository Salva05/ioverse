from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from django.http import Http404

from ..models.file import File
from ..serializers import FileContentSerializer
from ioverse.exceptions import MissingApiKeyException
from apps.assistant.services.file_services import FileIntegrationService

# image_file and this could be merged, but will keep distinct to keep the handling clear
# this is used in cases the file arrives as an assistant_output generated file whose type is not 'image_file'
class FileContentRetrieveView(generics.RetrieveAPIView):
    queryset = File.objects.all()
    serializer_class = FileContentSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
    lookup_url_kwarg = 'id' 

    def get_object(self):
        file_instance = super().get_object()
        
        if not file_instance.file_content:
            # Attempt to download the content directly from OpenAI API
            user = self.request.user
            file_id = self.kwargs.get(self.lookup_url_kwarg)
            
            api_key = getattr(user, 'api_key', None)
            if not api_key:
                raise MissingApiKeyException()

            service = FileIntegrationService(api_key=api_key)
            django_file = service.retrieve_file(file_id, user)
            
            if not django_file:
                raise Http404(f"File with ID {file_id} not found.")
            
            # Download the content associated to this file
            # and set it to the local model instance
            file_content = service.get_content(file_id, django_file.filename, user)
            django_file.file_content = file_content
            django_file.save()
        
        return file_instance