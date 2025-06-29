from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Account
from .forms import AccountCreationForm

class CustomAccountAdmin(UserAdmin):
    add_form = AccountCreationForm
    model = Account
    fieldsets = UserAdmin.fieldsets + (
        ('API Information', {'fields': ('api_key', 'admin_key'),}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {
            'fields': ('username', 'email', 'api_key', 'admin_key', 'password1', 'password2'),
        }),
    )
    list_display = ['username', 'email', 'api_key', 'admin_key', 'is_staff', 'is_active']

# Register the custom admin
admin.site.register(Account, CustomAccountAdmin)
