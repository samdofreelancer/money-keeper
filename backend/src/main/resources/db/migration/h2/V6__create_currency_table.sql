CREATE TABLE currency (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10),
    flag VARCHAR(255)
);

INSERT INTO currency (code, name, symbol, flag) VALUES
('USD', 'US Dollar', '$', 'https://flagcdn.com/w40/us.png');
INSERT INTO currency (code, name, symbol, flag) VALUES
('EUR', 'Euro', '€', 'https://flagcdn.com/w40/eu.png');
INSERT INTO currency (code, name, symbol, flag) VALUES
('VND', 'Vietnamese Dong', '₫', 'https://flagcdn.com/w40/vn.png');
INSERT INTO currency (code, name, symbol, flag) VALUES
('JPY', 'Japanese Yen', '¥', 'https://flagcdn.com/w40/jp.png');
INSERT INTO currency (code, name, symbol, flag) VALUES
('GBP', 'British Pound', '£', 'https://flagcdn.com/w40/gb.png');
INSERT INTO currency (code, name, symbol, flag) VALUES
('AUD', 'Australian Dollar', '$', 'https://flagcdn.com/w40/au.png');
