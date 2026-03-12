-- Add version column for optimistic locking to categories table
ALTER TABLE CORE.categories ADD version NUMBER DEFAULT 0 NOT NULL;
