from django.contrib import admin
from django import forms
from django.utils.safestring import mark_safe
from django_json_widget.widgets import JSONEditorWidget
from ..models.vectorstorefile import VectorStoreFile
from datetime import datetime

class VectorStoreFileAdminForm(forms.ModelForm):
    class Meta:
        model = VectorStoreFile
        fields = '__all__'
        widgets = {
            'last_error': JSONEditorWidget(options={
                'mode': 'code',  # Other modes: 'tree', 'view', etc.
                'modes': ['code', 'tree', 'form'],  # Allowed modes
            }),
            'chunking_strategy': JSONEditorWidget(options={
                'mode': 'code',
                'modes': ['code', 'tree', 'form'],
            }),
            'metadata': JSONEditorWidget(options={
                'mode': 'code',
                'modes': ['code', 'tree', 'form'],
            }),
        }

@admin.register(VectorStoreFile)
class VectorStoreFileAdmin(admin.ModelAdmin):
    form = VectorStoreFileAdminForm

    # Display key fields in the list view
    list_display = ('id', 'vector_store_id', 'owner', 'status', 'usage_bytes', 'created_at_display', 'metadata_snippet')

    # Enable search functionality
    search_fields = ('id', 'vector_store_id', 'status', 'owner__username')

    # Enable filtering by status and creation date
    list_filter = ('status', 'created_at', 'owner')

    # Organize fields into logical sections
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'object', 'created_at', 'owner', 'vector_store_id', 'usage_bytes')
        }),
        ('Status', {
            'fields': ('status', 'last_error')
        }),
        ('Chunking Strategy', {
            'fields': ('chunking_strategy',)
        }),
        ('Metadata', {
            'fields': ('metadata',)
        }),
    )

    # Add help texts and descriptions
    def get_field_help_texts(self, request, obj=None):
        return {
            'id': "The unique identifier for the vector store file object.",
            'object': "The object type, always set to 'vector_store.file'.",
            'created_at': "Unix timestamp (in seconds) for when the vector store file was created.",
            'owner': "The owner of this vector store file.",
            'vector_store_id': "The ID of the vector store that the File is attached to.",
            'usage_bytes': "The total vector store usage in bytes. Note that this may be different from the original file size.",
            'status': "The status of the vector store file, which can be either in_progress, completed, cancelled, or failed. The status completed indicates that the vector store file is ready for use.",
            'last_error': "The last error associated with this vector store file. Will be null if there are no errors.",
            'chunking_strategy': "The strategy used to chunk the file.",
            'metadata': "Set of 16 key-value pairs that can be attached to an object.",
        }

    # Override formfield_for_dbfield to add help texts dynamically
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        for field_name, help_text in self.get_field_help_texts(request, obj).items():
            if field_name in form.base_fields:
                form.base_fields[field_name].help_text = help_text
        return form

    # Display creation date in a human-readable format
    def created_at_display(self, obj):
        return datetime.fromtimestamp(obj.created_at).strftime('%Y-%m-%d %H:%M:%S')
    created_at_display.short_description = 'Created At'

    # Display a snippet of metadata for quick reference
    def metadata_snippet(self, obj):
        if obj.metadata:
            # Display first 50 characters of metadata for brevity
            snippet = str(obj.metadata)
            return mark_safe(f"<pre>{snippet[:50]}{'...' if len(snippet) > 50 else ''}</pre>")
        return "-"
    metadata_snippet.short_description = 'Metadata Snippet'
