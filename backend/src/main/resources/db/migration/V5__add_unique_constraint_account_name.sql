-- Migration script to add unique constraint to account_name in account table

ALTER TABLE account
ADD CONSTRAINT uq_account_account_name UNIQUE (account_name);
