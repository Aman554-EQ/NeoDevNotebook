from rest_framework.pagination import PageNumberPagination


class Pagination(PageNumberPagination):
    """?page=2&page_size=50, capped so nobody can ask for a million rows at once."""

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100
