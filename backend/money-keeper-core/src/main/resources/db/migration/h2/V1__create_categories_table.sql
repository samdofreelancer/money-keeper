CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(255),
    type VARCHAR(10) CHECK (type IN ('EXPENSE', 'INCOME')),
    parent_id BIGINT,
    version BIGINT DEFAULT 0 NOT NULL,
    CONSTRAINT fk_parent FOREIGN KEY (parent_id) REFERENCES categories(id)
);
