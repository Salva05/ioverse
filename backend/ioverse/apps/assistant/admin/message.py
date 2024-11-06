from django.contrib import admin
from django import forms
from django.utils.safestring import mark_safe
from django_json_widget.widgets import JSONEditorWidget
from ..models.message import Message
from datetime import datetime

class MessageAdminForm(forms.ModelForm):
    class Meta:
        model = Message
        fields = '__all__'
        widgets = {
            'content': JSONEditorWidget(options={
                'mode': 'code',  # Other modes: 'tree', 'view', etc.
                'modes': ['code', 'tree', 'form'],  # Allowed modes
            }),
            'attachments': JSONEditorWidget(options={
                'mode': 'code',
                'modes': ['code', 'tree', 'form'],
            }),
            'incomplete_details': JSONEditorWidget(options={
                'mode': 'code',
                'modes': ['code', 'tree', 'form'],
            }),
            'metadata': JSONEditorWidget(options={
                'mode': 'code',
                'modes': ['code', 'tree', 'form'],
            }),
        }

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    form = MessageAdminForm

    # Display key fields in the list view
    list_display = ('id', 'thread_id', 'owner', 'role', 'status', 'created_at_display', 'metadata_snippet')

    # Enable search functionality
    search_fields = ('id', 'thread_id', 'role', 'owner__username')

    # Enable filtering by status, role, and creation date
    list_filter = ('status', 'role', 'created_at', 'owner')

    # Organize fields into logical sections
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'object', 'created_at', 'owner', 'thread_id', 'assistant_id', 'run_id')
        }),
        ('Status', {
            'fields': ('status', 'incomplete_details', 'incomplete_at')
        }),
        ('Content', {
            'fields': ('role', 'content')
        }),
        ('Attachments', {
            'fields': ('attachments',)
        }),
        ('Metadata', {
            'fields': ('metadata',)
        }),
    )

    # Add help texts and descriptions
    def get_field_help_texts(self, request, obj=None):
        return {
            'id': "The unique identifier for the message object.",
            'object': "The object type, always set to 'thread.message'.",
            'created_at': "Unix timestamp (in seconds) for when the message was created.",
            'owner': "The owner of this message.",
            'thread_id': "The thread ID that this message belongs to.",
            'status': "The status of the message, which can be either in_progress, incomplete, or completed.",
            'incomplete_details': "Details about why the message is incomplete.",
            'incomplete_at': "The Unix timestamp (in seconds) for when the message was marked as incomplete.",
            'role': "The entity that produced the message. One of user or assistant.",
            'content': "The content of the message in array of text and/or images.",
            'assistant_id': "If applicable, the ID of the assistant that authored this message.",
            'run_id': "The ID of the run associated with the creation of this message. Value is null when messages are created manually using the create message or create thread endpoints.",
            'attachments': "A list of files attached to the message, and the tools they were added to.",
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
