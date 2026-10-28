from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from cart import views as cart_views
from catalog import api as catalog_api
from catalog import views as catalog_views
from core import views as core_views
from orders import api as orders_api
from orders import views as orders_views
from payments import api as payments_api

router = DefaultRouter()
router.register("products", catalog_api.ProductViewSet, basename="product")
router.register("categories/manage", catalog_api.CategoryViewSet, basename="category")
router.register("orders", orders_api.OrderViewSet, basename="order")

api_v1 = [
    path("auth/token/", TokenObtainPairView.as_view(), name="token-obtain"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("categories/", catalog_api.CategoryList.as_view(), name="category-list"),
    path("orders/<int:order_id>/pay/", payments_api.StartPayment.as_view(), name="order-pay"),
    path("payments/webhook/", payments_api.PaymentWebhook.as_view(), name="payment-webhook"),
    path("", include(router.urls)),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", core_views.health, name="health"),
    path("ready/", core_views.ready, name="ready"),
    # Versioned API: a breaking change becomes /api/v2/ while v1 keeps working for old clients.
    path("api/v1/", include(api_v1)),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="docs"),
    # Storefront (server-rendered, session login)
    path("", catalog_views.storefront, name="storefront"),
    path("p/<slug:slug>/", catalog_views.product_detail, name="product-detail"),
    path("cart/", cart_views.cart_detail, name="cart"),
    path("cart/add/<int:product_id>/", cart_views.cart_add, name="cart-add"),
    path("cart/remove/<int:product_id>/", cart_views.cart_remove, name="cart-remove"),
    path("checkout/", cart_views.checkout, name="checkout"),
    path("orders/<int:pk>/", orders_views.order_detail, name="order-detail"),
    path("login/", auth_views.LoginView.as_view(), name="login"),
    path("logout/", auth_views.LogoutView.as_view(), name="logout"),
]
