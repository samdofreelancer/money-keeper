CREATE TABLE IF NOT EXISTS app_settings (
    id BIGINT PRIMARY KEY,
    default_currency VARCHAR(10) NOT NULL
);

INSERT INTO app_settings (id, default_currency)
SELECT 1, 'USD'
WHERE NOT EXISTS (SELECT 1 FROM app_settings WHERE id = 1); 