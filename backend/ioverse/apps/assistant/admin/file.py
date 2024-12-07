from django.contrib import admin
from django import forms
from ..models.file import File
from django_json_widget.widgets import JSONEditorWidget
from django.utils.safestring import mark_safe

class FileAdminForm(forms.ModelForm):
    class Meta:
        model = File
        fields = '__all__'


@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    form = FileAdminForm

    # Display key fields in the list view
    list_display = (
        'id',
        'filename',
        'purpose',
        'created_at_display',
        'file_size_display',
        'image_file_thumbnail',
        'image_url_preview',
    )
    
    # Enable search functionality
    search_fields = ('id', 'filename', 'purpose')
    
    # Enable filtering by purpose and creation date
    list_filter = ('purpose', 'created_at', 'owner')
    
    # Organize fields into logical sections
    fieldsets = [
        ('Basic Information', {
            'fields': ('id', 'filename', 'purpose')
        }),
        ('Details', {
            'fields': ('bytes', 'object')
        }),
        ('Image Details', {
            'fields': ('image_file', 'image_url')
        }),
    ]
    
    # Add help texts and descriptions
    def get_field_help_texts(self, request, obj=None):
        return {
            'id': "The unique identifier for the file object.",
            'object': "The object type, always set to 'file'.",
            'created_at': "Unix timestamp (in seconds) for when the file was created.",
            'filename': "The name of the file (max 255 characters).",
            'bytes': "The size of the file in bytes. Must be a positive integer.",
            'purpose': "The intended purpose of the file (e.g., 'assistants', 'fine-tune').",
            'image_file': "An optional image associated with the file.",
            'image_url': "An optional URL pointing to an image associated with the file.",
        }

    def get_readonly_fields(self, request, obj=None):
        # If an instance exists, make all fields read-only
        if obj:
            return [field.name for field in self.model._meta.fields if field.name not in ['image_file', 'image_url']]
        return []  # No fields are read-only during creation

    # Override formfield_for_dbfield to add help texts dynamically
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        # Add help texts dynamically
        for field_name, help_text in self.get_field_help_texts(request, obj).items():
            if field_name in form.base_fields:
                form.base_fields[field_name].help_text = help_text
        return form

    # Display creation date in a human-readable format
    def created_at_display(self, obj):
        from datetime import datetime
        return datetime.fromtimestamp(obj.created_at).strftime('%Y-%m-%d %H:%M:%S')
    
    created_at_display.short_description = 'Created At'

    # Display file size in a readable format (e.g., KB, MB)
    def file_size_display(self, obj):
        if obj.bytes < 1024:
            return f"{obj.bytes} B"
        elif obj.bytes < 1024 ** 2:
            return f"{obj.bytes / 1024:.2f} KB"
        elif obj.bytes < 1024 ** 3:
            return f"{obj.bytes / 1024 ** 2:.2f} MB"
        else:
            return f"{obj.bytes / 1024 ** 3:.2f} GB"

    file_size_display.short_description = 'File Size'
    
   # Display a thumbnail of the image_file
    def image_file_thumbnail(self, obj):
        if obj.image_file:
            return mark_safe(f'<img src="{obj.image_file.url}" width="50" height="50" style="object-fit: cover;" />')
        return "-"
    image_file_thumbnail.short_description = 'Image File'

    # Display a preview link for the image_url
    def image_url_preview(self, obj):
        if obj.image_url:
            return mark_safe(f'<a href="{obj.image_url}" target="_blank">View Image</a>')
        return "-"
    image_url_preview.short_description = 'Image URL' 
