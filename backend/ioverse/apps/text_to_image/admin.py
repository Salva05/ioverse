from django.contrib import admin
from django.utils.html import format_html
from .models import ImageGeneration

@admin.register(ImageGeneration)
class ImageGenerationAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'short_prompt',
        'model_used',
        'created_at',
        'is_shared',
    )
    list_filter = (
        'model_used',
        'is_shared',
        'created_at',
    )
    search_fields = (
        'prompt',
        'user__username',
        'model_used',
    )
    readonly_fields = (
        'created_at',
        'shared_at',
        'expires_at',
        'share_token',
        'short_image_preview',
    )
    ordering = ('-created_at',)

    fieldsets = (
        (None, {
            'fields': (
                'user',
                'prompt',
                'revised_prompt',
                'short_image_preview',
            )
        }),
        ('Generation Details', {
            'fields': (
                'model_used',
                'n',
                'quality',
                'size',
                'style',
                'response_format',
            ),
            'classes': ('collapse',),
        }),
        ('Sharing Options', {
            'fields': (
                'is_shared',
                'shared_at',
                'expires_at',
                'share_token',
            ),
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',),
        }),
    )

    def short_prompt(self, obj):
        return obj.prompt[:50] + ('...' if len(obj.prompt) > 50 else '')
    short_prompt.short_description = 'Prompt'

    def short_image_preview(self, obj):
        if obj.image_file:
            return format_html('<img src="{}" width="200" />', obj.image_file.url)
        elif obj.image_url:
            return format_html('<img src="{}" width="200" />', obj.image_url)
        else:
            return "No Image Available"
    short_image_preview.short_description = 'Image Preview'

    def get_readonly_fields(self, request, obj=None):
        if obj:
            return self.readonly_fields + ('user',)
        return self.readonly_fields
