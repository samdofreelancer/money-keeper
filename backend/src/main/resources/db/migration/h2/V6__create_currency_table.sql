-- H2-compatible migration script to create currency table

CREATE TABLE currency (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10),
    flag VARCHAR(255)
);

INSERT INTO currency (code, name, symbol, flag) VALUES
('USD', 'US Dollar', '$', 'https://flagcdn.com/w40/us.png'),
('EUR', 'Euro', '€', 'https://flagcdn.com/w40/eu.png'),
('VND', 'Vietnamese Dong', '₫', 'https://flagcdn.com/w40/vn.png'),
('JPY', 'Japanese Yen', '¥', 'https://flagcdn.com/w40/jp.png'),
('GBP', 'British Pound', '£', 'https://flagcdn.com/w40/gb.png'),
('AUD', 'Australian Dollar', '$', 'https://flagcdn.com/w40/au.png');
