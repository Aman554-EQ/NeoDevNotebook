"""Lesson 03: SQL essentials on two small tables (plain sqlite3, no Django)."""

import sqlite3

from _kit import emit, query, table

db = sqlite3.connect(":memory:")
db.executescript(
    """
    CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT);
    CREATE TABLE orders (
        id INTEGER PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id),
        total NUMERIC NOT NULL,
        status TEXT NOT NULL
    );
    INSERT INTO customers VALUES (1, 'Ada', 'London'), (2, 'Grace', 'New York'),
                                 (3, 'Linus', 'Helsinki'), (4, 'Margaret', 'Boston');
    INSERT INTO orders VALUES (10, 1, 25.00, 'paid'), (11, 1, 8.50, 'pending'),
                              (12, 2, 120.00, 'paid'), (13, 3, 42.00, 'cancelled'),
                              (14, 2, 15.00, 'paid');
    """
)

SELECT = """
SELECT name, city
FROM customers
WHERE city <> 'London'
ORDER BY name;
"""

JOIN = """
SELECT o.id, c.name, o.total
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.status = 'paid'
ORDER BY o.id;
"""

GROUP = """
SELECT c.name, COUNT(o.id) AS orders, SUM(o.total) AS spent
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.status = 'paid'
GROUP BY c.name
ORDER BY spent DESC;
"""

LEFT = """
SELECT c.name, COUNT(o.id) AS orders
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id
ORDER BY c.id;
"""

HAVING = """
SELECT c.name, SUM(o.total) AS spent
FROM customers c
JOIN orders o ON o.customer_id = c.id
GROUP BY c.id
HAVING SUM(o.total) > 30
ORDER BY spent DESC;
"""

SUBQUERY = """
SELECT name
FROM customers
WHERE id IN (SELECT customer_id FROM orders WHERE total > 100);
"""

emit(
    "sql",
    "SQL essentials, step by step",
    [
        query(db, SELECT, label="SELECT + WHERE", note="Pick columns, filter rows with WHERE, sort with ORDER BY. Without ORDER BY, row order is not guaranteed.", uses=["customers"]),
        query(db, JOIN, label="JOIN", note="JOIN matches each order with its customer through the foreign key customer_id → customers.id.", uses=["orders", "customers"]),
        query(db, GROUP, label="GROUP BY", note="GROUP BY collapses rows into one per customer; COUNT and SUM work per group.", uses=["orders", "customers"]),
        query(db, LEFT, label="LEFT JOIN", note="A LEFT JOIN keeps customers with no orders (Margaret): their order columns are NULL, so COUNT gives 0. An inner JOIN would drop her.", uses=["orders", "customers"]),
        query(db, HAVING, label="HAVING", note="WHERE filters rows before grouping; HAVING filters groups after aggregation (all statuses count here).", uses=["orders", "customers"]),
        query(db, SUBQUERY, label="Subquery", note="A subquery's result feeds the outer query: customers who placed any order over 100.", uses=["orders", "customers"]),
    ],
    tables=[table(db, "customers"), table(db, "orders")],
)
