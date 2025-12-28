CREATE TABLE exchange_rate (
    id NUMBER PRIMARY KEY,
    base VARCHAR2(10) NOT NULL,
    symbol VARCHAR2(10) NOT NULL,
    rate DOUBLE PRECISION NOT NULL,
    rate_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exchange_rate_base_date ON exchange_rate(base, rate_date);
