#!/bin/bash

ORACLE_PASSWORD=$1

for i in {1..3}; do
  echo "Attempt $i: Running Flyway migration..."
  if ORACLE_PASSWORD=$ORACLE_PASSWORD docker compose up flyway; then
    echo "Flyway migration succeeded"
    break
  else
    echo "Flyway migration failed, retrying..."
    sleep 5
  fi
done

if [ $i -eq 4 ]; then
  echo "Flyway migration failed after 3 attempts"
  exit 1
fi
