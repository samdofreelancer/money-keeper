-- Common unique constraint
ALTER TABLE CORE.account ADD CONSTRAINT uq_account_name UNIQUE (account_name);
