CREATE TABLE IF NOT EXISTS exchange_rate (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    base VARCHAR(10) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    rate DOUBLE PRECISION NOT NULL,
    rate_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exchange_rate_base_date ON exchange_rate(base, rate_date); 