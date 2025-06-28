#!/bin/sh

until echo "select 1 from dual;" | sqlplus -s system/$ORACLE_PASSWORD@oracle:1521/XEPDB1 | grep -q 1; do
  echo "Waiting for Oracle password reset to be applied..."
  sleep 5
done
