from rest_framework import permissions

class RequiresAdminKey(permissions.BasePermission):
    """
    Allows access only to authenticated users who have already saved an admin key.
    """
    message = "You must set an admin key first."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.has_admin_key
        )
