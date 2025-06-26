#!/bin/sh

# Wait for Oracle DB to be available on port 1521
echo "Waiting for Oracle DB to be available on port 1521..."

while ! nc -z oracle 1521; do
  echo "Oracle is unavailable - sleeping"
  sleep 5
done

echo "Oracle is up - continuing"
exec "$@"
