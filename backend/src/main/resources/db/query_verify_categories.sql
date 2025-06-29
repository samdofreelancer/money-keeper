-- Query to verify inserted categories
SELECT id, name, icon, type, parent_id
FROM SYSTEM.categories
ORDER BY id;
