from django.contrib import admin
from django import forms
from django.utils.safestring import mark_safe
from django_json_widget.widgets import JSONEditorWidget
from ..models.thread import Thread
from datetime import datetime

class ThreadAdminForm(forms.ModelForm):
    class Meta:
        model = Thread
        fields = '__all__'
        widgets = {
            'tool_resources': JSONEditorWidget(options={
                'mode': 'code',  # Other modes: 'tree', 'view', etc.
                'modes': ['code', 'tree', 'form'],  # Allowed modes
            }),
            'metadata': JSONEditorWidget(options={
                'mode': 'code',
                'modes': ['code', 'tree', 'form'],
            }),
        }

@admin.register(Thread)
class ThreadAdmin(admin.ModelAdmin):
    form = ThreadAdminForm

    # Display key fields in the list view
    list_display = ('id', 'object', 'owner', 'created_at_display', 'metadata_snippet')

    # Enable search functionality
    search_fields = ('id', 'owner__username')

    # Enable filtering by creation date
    list_filter = ('created_at', 'owner')

    # Organize fields into logical sections
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'object', 'created_at', 'owner',)
        }),
        ('Resources', {
            'fields': ('tool_resources',)
        }),
        ('Metadata', {
            'fields': ('metadata',)
        }),
    )

    # Make certain fields read-only
    readonly_fields = ('id', 'object', 'created_at')

    # Add help texts and descriptions
    def get_field_help_texts(self, request, obj=None):
        return {
            'id': "The unique identifier for the thread object.",
            'object': "The object type, always set to 'thread'.",
            'created_at': "Unix timestamp (in seconds) for when the thread was created.",
            'owner': "The owner of this thread.",
            'tool_resources': "Resources available to the assistant's tools in this thread.",
            'metadata': "A set of up to 16 key-value pairs for additional information.",
        }

    def get_readonly_fields(self, request, obj=None):
        if obj:  # If editing an existing object
            return [field.name for field in self.model._meta.fields]  # Make all fields read-only
        return []  # All fields are editable during creation
    
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

    class Meta:
        verbose_name = "Thread"
        verbose_name_plural = "Threads"
