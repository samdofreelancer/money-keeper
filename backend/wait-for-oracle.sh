#!/bin/sh

# Wait for Oracle DB to be available on port 1521
echo "Waiting for Oracle DB to be available on port 1521..."

while ! nc -z oracle 1521; do
  echo "Oracle is unavailable - sleeping"
  sleep 5
done

echo "Oracle port is open, checking password reset..."

# Wait until Oracle accepts connections with the provided password
while ! echo exit | sqlplus -s system/$ORACLE_PASSWORD@oracle:1521/XEPDB1 > /dev/null 2>&1; do
  echo "Waiting for Oracle password reset to be applied..."
  sleep 5
done

echo "Oracle is up and password reset applied - continuing"
exec "$@"
