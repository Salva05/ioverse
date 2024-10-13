from django.contrib import admin
from .models import Conversation, Message

class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    readonly_fields = ('sender', 'message_body', 'timestamp')
    can_delete = False
    verbose_name_plural = 'Messages'
    ordering = ('timestamp',)
    fields = ('sender', 'message_body', 'timestamp')
    show_change_link = False

class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'user', 'created_at', 'updated_at')
    list_filter = ('user', 'created_at')
    search_fields = ('title', 'user__username')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)
    inlines = [MessageInline]

    fieldsets = (
        (None, {
            'fields': ('user', 'title')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'conversation', 'sender', 'short_message_body', 'timestamp')
    list_filter = ('sender', 'timestamp')
    search_fields = ('message_body', 'conversation__title', 'conversation__user__username')
    readonly_fields = ('timestamp',)
    ordering = ('-timestamp',)

    def short_message_body(self, obj):
        return obj.message_body[:50] + ('...' if len(obj.message_body) > 50 else '')
    short_message_body.short_description = 'Message Body'

admin.site.register(Conversation, ConversationAdmin)
admin.site.register(Message, MessageAdmin)
