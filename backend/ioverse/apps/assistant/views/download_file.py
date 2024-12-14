from django.http import FileResponse, Http404
from django.conf import settings
import os

def download_file(request, filename):
    file_path = os.path.join(settings.MEDIA_ROOT, 'uploaded_files', filename)
    if not os.path.exists(file_path):
        raise Http404("File not found.")

    # Open the file in binary mode and create a FileResponse
    response = FileResponse(open(file_path, 'rb'))
    # Set Content-Disposition to attachment to force download
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response
