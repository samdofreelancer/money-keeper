-- Common unique constraint
ALTER TABLE account ADD CONSTRAINT uq_account_name UNIQUE (account_name);
