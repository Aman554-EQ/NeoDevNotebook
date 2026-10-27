from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("authors", views.AuthorViewSet)
router.register("books", views.BookViewSet)
router.register("loans", views.LoanViewSet, basename="loan")

urlpatterns = router.urls
