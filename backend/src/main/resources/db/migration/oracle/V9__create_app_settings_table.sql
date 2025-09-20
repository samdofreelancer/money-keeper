CREATE TABLE app_settings (
    id NUMBER PRIMARY KEY,
    default_currency VARCHAR2(10) NOT NULL
);

INSERT INTO app_settings (id, default_currency)
SELECT 1, 'USD'
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM app_settings WHERE id = 1);
