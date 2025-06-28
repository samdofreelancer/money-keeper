#!/bin/sh

# Configurable retry interval (seconds) and max retries
RETRY_INTERVAL=${RETRY_INTERVAL:-5}
MAX_RETRIES=${MAX_RETRIES:-60}

count=0

until echo "select 1 from dual;" | sqlplus -s system/$ORACLE_PASSWORD@oracle:1521/XEPDB1 | grep -q 1; do
  count=$((count + 1))
  if [ "$count" -ge "$MAX_RETRIES" ]; then
    echo "Max retries reached ($MAX_RETRIES). Oracle is not ready."
    exit 1
  fi
  echo "Waiting for Oracle password reset to be applied... Retry $count/$MAX_RETRIES"
  sleep $RETRY_INTERVAL
done
