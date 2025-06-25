-- Insert sample categories for testing data migration
INSERT INTO category (id, name, description, parent_category_id, created_at, updated_at) VALUES (1, 'Food', 'Expenses related to food and groceries', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO category (id, name, description, parent_category_id, created_at, updated_at) VALUES (2, 'Transport', 'Expenses related to transportation', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO category (id, name, description, parent_category_id, created_at, updated_at) VALUES (3, 'Entertainment', 'Expenses related to entertainment and leisure', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO category (id, name, description, parent_category_id, created_at, updated_at) VALUES (4, 'Groceries', 'Groceries and daily essentials', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO category (id, name, description, parent_category_id, created_at, updated_at) VALUES (5, 'Restaurants', 'Eating out and restaurants', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
