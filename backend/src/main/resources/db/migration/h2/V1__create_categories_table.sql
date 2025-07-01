-- H2-compatible initial schema (edit as needed for H2)

-- Example: create schema or tablespace if needed

CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(255),
    type VARCHAR(10) CHECK (type IN ('EXPENSE', 'INCOME')),
    parent_id BIGINT,
    CONSTRAINT fk_parent FOREIGN KEY (parent_id) REFERENCES categories(id)
);
