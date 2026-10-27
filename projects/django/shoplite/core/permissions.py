from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsStaffOrReadOnly(BasePermission):
    """Anyone may read; only staff may write."""

    def has_permission(self, request, view):
        return request.method in SAFE_METHODS or bool(request.user and request.user.is_staff)


class IsOwnerOrStaff(BasePermission):
    """Object-level: customers reach only their own objects; staff reach everything."""

    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or obj.user_id == request.user.id
