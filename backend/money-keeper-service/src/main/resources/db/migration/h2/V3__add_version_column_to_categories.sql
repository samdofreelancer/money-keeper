-- Add version column for optimistic locking to categories table
ALTER TABLE categories ADD COLUMN version BIGINT DEFAULT 0 NOT NULL;
