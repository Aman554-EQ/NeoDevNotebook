"""Lesson 24: reporting queries on a small shop database (window functions, CTEs, EXISTS)."""

import sqlite3

from _kit import emit, query, table

db = sqlite3.connect(":memory:")
db.executescript(
    """
    CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, category TEXT, price NUMERIC);
    CREATE TABLE sales (id INTEGER PRIMARY KEY, product_id INTEGER REFERENCES products(id),
                        month TEXT, qty INTEGER);
    INSERT INTO products VALUES (1, 'Dune', 'books', 12.5), (2, 'Emma', 'books', 8),
                                (3, 'Chess set', 'games', 30), (4, 'Go board', 'games', 45);
    INSERT INTO sales VALUES (1, 1, '2026-01', 10), (2, 2, '2026-01', 4), (3, 3, '2026-01', 2),
                             (4, 1, '2026-02', 6),  (5, 2, '2026-02', 9), (6, 3, '2026-02', 5);
    """
)

REVENUE = """
SELECT p.category,
       printf('%.2f', SUM(s.qty * p.price)) AS revenue
FROM sales s
JOIN products p ON p.id = s.product_id
GROUP BY p.category
ORDER BY SUM(s.qty * p.price) DESC;
"""

RANKED = """
SELECT p.name, p.category, SUM(s.qty) AS sold,
       RANK() OVER (PARTITION BY p.category
                    ORDER BY SUM(s.qty) DESC) AS rank_in_category
FROM sales s
JOIN products p ON p.id = s.product_id
GROUP BY p.id
ORDER BY p.category, rank_in_category;
"""

RUNNING = """
SELECT month,
       SUM(qty) AS units,
       SUM(SUM(qty)) OVER (ORDER BY month) AS running_total
FROM sales
GROUP BY month
ORDER BY month;
"""

NEVER_SOLD = """
SELECT name
FROM products p
WHERE NOT EXISTS (SELECT 1 FROM sales s WHERE s.product_id = p.id)
ORDER BY name;
"""

MONTH_OVER_MONTH = """
WITH monthly AS (
  SELECT product_id, month, qty FROM sales
)
SELECT p.name, jan.qty AS jan, feb.qty AS feb, feb.qty - jan.qty AS change
FROM monthly jan
JOIN monthly feb ON feb.product_id = jan.product_id
JOIN products p ON p.id = jan.product_id
WHERE jan.month = '2026-01' AND feb.month = '2026-02'
ORDER BY change DESC;
"""

emit(
    "sql",
    "Reporting queries on a shop database",
    [
        query(db, REVENUE, label="Revenue per category", note="Multiply inside the aggregate: SUM(qty * price) per category. printf formats the money with two decimals.", uses=["products", "sales"]),
        query(db, RANKED, label="RANK() OVER", note="A window function ranks rows within each category without collapsing them, which GROUP BY alone can't do.", uses=["products", "sales"]),
        query(db, RUNNING, label="Running total", note="SUM(...) OVER (ORDER BY month) accumulates across the grouped months.", uses=["sales"]),
        query(db, NEVER_SOLD, label="NOT EXISTS", note="Products that never sold. EXISTS stops at the first matching row, so it stays cheap on big tables.", uses=["products", "sales"]),
        query(db, MONTH_OVER_MONTH, label="CTE + self-join", note="WITH names a subquery (a CTE) so it can be used twice: January joined to February per product.", uses=["products", "sales"]),
    ],
    tables=[table(db, "products"), table(db, "sales")],
)
