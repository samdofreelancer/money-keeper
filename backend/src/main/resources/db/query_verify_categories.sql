-- Query to verify inserted categories
SELECT id, name, description, parent_category_id, created_at, updated_at
FROM category
ORDER BY id;
