from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from ..models.file import File
from ..serializers import ImageSerializer

class ImageRetrieveView(generics.RetrieveAPIView):
    queryset = File.objects.all()
    serializer_class = ImageSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
    lookup_url_kwarg = 'id' 
