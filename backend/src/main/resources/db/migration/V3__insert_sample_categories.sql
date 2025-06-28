-- Insert sample categories for testing data migration
INSERT INTO categories (id, name, icon, type, parent_id) VALUES (1, 'Food', NULL, 'EXPENSE', NULL);
INSERT INTO categories (id, name, icon, type, parent_id) VALUES (2, 'Transport', NULL, 'EXPENSE', NULL);
INSERT INTO categories (id, name, icon, type, parent_id) VALUES (3, 'Entertainment', NULL, 'EXPENSE', NULL);
INSERT INTO categories (id, name, icon, type, parent_id) VALUES (4, 'Groceries', NULL, 'EXPENSE', 1);
INSERT INTO categories (id, name, icon, type, parent_id) VALUES (5, 'Restaurants', NULL, 'EXPENSE', 1);
