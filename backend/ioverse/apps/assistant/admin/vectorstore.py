from django.contrib import admin
from django import forms
from django.utils.safestring import mark_safe
from django_json_widget.widgets import JSONEditorWidget
from ..models.vectorstore import VectorStore
from datetime import datetime

class VectorStoreAdminForm(forms.ModelForm):
    class Meta:
        model = VectorStore
        fields = '__all__'
        widgets = {
            'file_counts': JSONEditorWidget(options={
                'mode': 'code',  # Other modes: 'tree', 'view', etc.
                'modes': ['code', 'tree', 'form'],  # Allowed modes
            }),
            'expires_after': JSONEditorWidget(options={
                'mode': 'code',
                'modes': ['code', 'tree', 'form'],
            }),
            'metadata': JSONEditorWidget(options={
                'mode': 'code',
                'modes': ['code', 'tree', 'form'],
            }),
        }

@admin.register(VectorStore)
class VectorStoreAdmin(admin.ModelAdmin):
    form = VectorStoreAdminForm

    # Display key fields in the list view
    list_display = ('id', 'name', 'owner', 'status', 'usage_bytes', 'created_at_display', 'metadata_snippet')

    # Enable search functionality
    search_fields = ('id', 'name', 'status', 'owner__username')

    # Enable filtering by status and creation date
    list_filter = ('status', 'created_at', 'owner')

    # Organize fields into logical sections
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'object', 'created_at', 'owner', 'name', 'usage_bytes')
        }),
        ('Status', {
            'fields': ('status', 'file_counts')
        }),
        ('Expiration Policy', {
            'fields': ('expires_after',)
        }),
        ('Metadata', {
            'fields': ('metadata',)
        }),
    )

    # Add help texts and descriptions
    def get_field_help_texts(self, request, obj=None):
        return {
            'id': "The unique identifier for the vector store object.",
            'object': "The object type, always set to 'vector_store'.",
            'created_at': "Unix timestamp (in seconds) for when the vector store was created.",
            'owner': "The owner of this vector store.",
            'name': "The name of the vector store.",
            'usage_bytes': "The total number of bytes used by the files in the vector store.",
            'status': "The status of the vector store, which can be either expired, in_progress, or completed.",
            'file_counts': "Counts of files in various statuses within the vector store.",
            'expires_after': "The expiration policy for the vector store.",
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
