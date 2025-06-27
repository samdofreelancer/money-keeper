#!/bin/sh

# Wait for frontend service to be available on port 5173
echo "Waiting for frontend service to be available on port 5173..."

for i in $(seq 1 30); do
  if nc -z frontend 5173; then
    echo "Frontend service is healthy"
    exit 0
  else
    echo "Waiting for frontend service to be healthy... (attempt $i)"
    sleep 5
  fi
done

echo "Frontend service did not become healthy in time"
exit 1
