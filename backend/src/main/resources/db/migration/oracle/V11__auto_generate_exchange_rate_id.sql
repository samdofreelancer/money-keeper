-- Create sequence and trigger to auto-generate IDs for exchange_rate rows
-- Needed because V10 created id as NUMBER without identity/default

CREATE SEQUENCE exchange_rate_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

-- Align the sequence to MAX(id)+1 if there are already rows in the table
DECLARE
    v_max_id NUMBER;
    v_curr   NUMBER;
    v_inc    NUMBER;
BEGIN
    SELECT NVL(MAX(id), 0) INTO v_max_id FROM exchange_rate;

    -- Prime the sequence and fetch current value
    SELECT exchange_rate_seq.NEXTVAL INTO v_curr FROM dual;

    IF v_max_id >= v_curr THEN
        v_inc := v_max_id - v_curr + 1;
        EXECUTE IMMEDIATE 'ALTER SEQUENCE exchange_rate_seq INCREMENT BY ' || v_inc;
        -- Advance sequence to desired next value
        SELECT exchange_rate_seq.NEXTVAL INTO v_curr FROM dual;
        -- Reset increment to 1 for normal operation
        EXECUTE IMMEDIATE 'ALTER SEQUENCE exchange_rate_seq INCREMENT BY 1';
    END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_exchange_rate_id
BEFORE INSERT ON exchange_rate
FOR EACH ROW
WHEN (new.id IS NULL)
BEGIN
    SELECT exchange_rate_seq.NEXTVAL INTO :new.id FROM dual;
END;
/ 