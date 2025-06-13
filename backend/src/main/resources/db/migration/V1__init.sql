CREATE TABLE category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(255),
    type VARCHAR(10) CHECK (type IN ('EXPENSE', 'INCOME')),
    parent_category_id BIGINT,
    FOREIGN KEY (parent_category_id) REFERENCES category(id)
);