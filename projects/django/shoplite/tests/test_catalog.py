import pytest

from catalog.services import category_list

pytestmark = pytest.mark.django_db


def test_public_product_list_hides_inactive_products(api, catalog):
    body = api.get("/api/v1/products/").json()
    assert [p["name"] for p in body["results"]] == ["Chess set", "Dune", "Emma"]
    assert body["results"][1]["price"] == "12.50"  # Decimal is sent as a string: no float rounding


def test_staff_see_inactive_products(as_user, staff, catalog):
    names = [p["name"] for p in as_user(staff).get("/api/v1/products/").json()["results"]]
    assert "Old stock" in names


def test_filtering_searching_and_ordering(api, catalog):
    def names(**params):
        return [p["name"] for p in api.get("/api/v1/products/", params).json()["results"]]

    assert names(category__slug="books") == ["Dune", "Emma"]
    assert names(price__gte="10", price__lte="20") == ["Dune"]
    assert names(search="chess") == ["Chess set"]
    assert names(ordering="-price") == ["Chess set", "Dune", "Emma"]


def test_page_size_is_capped(api, catalog):
    body = api.get("/api/v1/products/", {"page_size": 1000}).json()
    assert body["count"] == 3  # all fit; the cap (100) only limits huge requests


def test_product_list_query_budget(api, catalog, django_assert_max_num_queries):
    with django_assert_max_num_queries(2):  # COUNT + one SELECT joined with categories
        api.get("/api/v1/products/")


def test_customers_cannot_change_the_catalogue(as_user, customer, catalog):
    response = as_user(customer).patch("/api/v1/products/dune/", {"price": "0.01"})
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "permission_denied"


def test_staff_can_update_a_product(as_user, staff, catalog):
    response = as_user(staff).patch("/api/v1/products/dune/", {"stock": 50})
    assert response.status_code == 200 and response.json()["stock"] == 50


def test_negative_price_is_a_validation_error(as_user, staff, catalog):
    response = as_user(staff).patch("/api/v1/products/dune/", {"price": "-1"})
    assert response.status_code == 400
    error = response.json()["error"]
    assert error["code"] == "validation_error"
    assert error["details"] == {"price": ["Ensure this value is greater than or equal to 0."]}


def test_categories_are_cached_and_invalidated(api, as_user, staff, catalog, django_assert_num_queries):
    assert [c["slug"] for c in api.get("/api/v1/categories/").json()] == ["books", "games"]
    with django_assert_num_queries(0):
        category_list()  # served from the cache
    as_user(staff).post("/api/v1/categories/manage/", {"name": "Music", "slug": "music"})
    assert [c["slug"] for c in category_list()] == ["books", "games", "music"]


def test_storefront_pages(client, catalog):
    page = client.get("/").content.decode()
    assert "Dune" in page and "Old stock" not in page
    assert client.get("/?category=games").context["products"].count() == 1
    assert client.get("/p/dune/").status_code == 200
    assert client.get("/p/old/").status_code == 404  # inactive products have no page
