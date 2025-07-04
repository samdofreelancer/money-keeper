-- Common index creation
BEGIN
  EXECUTE IMMEDIATE 'CREATE INDEX idx_parent_category_id ON CORE.categories(parent_id)';
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE = -942 THEN
      NULL; -- Table does not exist, skip index creation
    ELSE
      RAISE;
    END IF;
END;
/
