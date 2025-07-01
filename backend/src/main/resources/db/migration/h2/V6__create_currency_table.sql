-- H2-compatible migration script to create currency table

CREATE TABLE currency (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL
);

INSERT INTO currency (code, name) VALUES
('USD', 'US Dollar'),
('EUR', 'Euro'),
('VND', 'Vietnamese Dong'),
('JPY', 'Japanese Yen'),
('GBP', 'British Pound'),
('AUD', 'Australian Dollar');
