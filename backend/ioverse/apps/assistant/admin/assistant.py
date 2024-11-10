from django.contrib import admin
from django import forms
from ..models.assistant import Assistant
from django_json_widget.widgets import JSONEditorWidget

class AssistantAdminForm(forms.ModelForm):
    class Meta:
        model = Assistant
        fields = '__all__'
        widgets = {
            'tools': JSONEditorWidget(options={
                'mode': 'code',  # Other modes: 'tree', 'view', etc.
                'modes': ['code', 'tree', 'form'],  # Allowed modes
            }),
            'tool_resources': JSONEditorWidget(options={
                'mode': 'code',
                'modes': ['code', 'tree', 'form'],
            }),
            'response_format': JSONEditorWidget(options={
                'mode': 'code',
                'modes': ['code', 'tree', 'form'],
            }),
            'instructions': forms.Textarea(attrs={'rows': 4}),
        }

@admin.register(Assistant)
class AssistantAdmin(admin.ModelAdmin):
    form = AssistantAdminForm

    # Display key fields in the list view
    list_display = ('id', 'name', 'owner', 'model', 'created_at', 'temperature', 'top_p')
    
    # Enable search functionality
    search_fields = ('id', 'name', 'model', 'owner__username')
    
    # Enable filtering by model and creation date
    list_filter = ('model', 'created_at', 'owner')
    
    # Organize fields into logical sections
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'object', 'created_at', 'owner', 'name', 'description', 'model')
        }),
        ('Configuration', {
            'fields': ('instructions', 'temperature', 'top_p', 'response_format')
        }),
        ('Tools', {
            'fields': ('tools', 'tool_resources')
        }),
    )
    
    # Add help texts and descriptions
    def get_field_help_texts(self, request, obj=None):
        return {
            'id': "The unique identifier for the assistant object.",
            'object': "The object type, always set to 'assistant'.",
            'created_at': "Unix timestamp (in seconds) for when the assistant was created.",
            'owner': "The owner of this assistant.",
            'name': "The name of the assistant (max 256 characters).",
            'description': "The description of the assistant (max 512 characters).",
            'model': "The ID of the model to use (e.g., 'gpt-4').",
            'instructions': "System instructions for the assistant (max 256,000 characters).",
            'tools': "A list of tools enabled on the assistant (max 128).",
            'tool_resources': "JSON object containing resources used by the assistant's tools.",
            'temperature': "Sampling temperature for responses, between 0 (deterministic) and 2 (highly random).",
            'top_p': "Nucleus sampling probability mass for responses, between 0 and 1.",
            'response_format': "Specifies the format that the model must output.",
        }

    def get_readonly_fields(self, request, obj=None):
        # If an instance exists, make all fields read-only
        # To ensure consistency with OpenAI objects
        exc_fields = ['tools', 'tool_resources']
        if obj:
             # If `response_format` is 'auto' remove read_only property to preserve json formatting
            response_format = getattr(obj, 'response_format', 'auto')
            if response_format != 'auto':
                exc_fields.append('response_format')
            return [field.name for field in self.model._meta.fields if field.name not in exc_fields]
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
    list_display = ('id', 'name', 'model', 'created_at_display', 'temperature', 'top_p')

