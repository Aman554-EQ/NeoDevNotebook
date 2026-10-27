from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsStaffOrReadOnly(BasePermission):
    """Anyone may read; only staff may create, change or delete."""

    def has_permission(self, request, view):
        return request.method in SAFE_METHODS or bool(request.user and request.user.is_staff)


class IsBorrower(BasePermission):
    """Object-level check: members may only see and return their own loans."""

    def has_object_permission(self, request, view, obj):
        return obj.borrower_id == request.user.id
