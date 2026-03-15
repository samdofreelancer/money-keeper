#!/bin/bash

ORACLE_PASSWORD=$1

# Wait for Oracle to be healthy
for i in {1..30}; do
  echo "Waiting for Oracle to be ready (attempt $i)..."
  if docker compose exec -T oracle bash -c "echo select 1 from dual | sqlplus -s system/'${ORACLE_PASSWORD}'@localhost:1521/XEPDB1 | grep -q 1"; then
    echo "Oracle is ready"
    break
  fi
  sleep 10
done

success=false
for i in {1..5}; do
  echo "Attempt $i: Running Flyway migration..."
  if ORACLE_PASSWORD=$ORACLE_PASSWORD docker compose up --no-color flyway; then
    echo "Flyway migration succeeded"
    success=true
    break
  else
    echo "Flyway migration failed, retrying..."
    sleep 10
  fi
done

if ! $success; then
  echo "Flyway migration failed after 5 attempts"
  docker compose logs oracle
  exit 1
fi
