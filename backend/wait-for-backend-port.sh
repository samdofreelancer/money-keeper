#!/bin/sh

# Wait for Backend service to be available on port 8080
echo "Waiting for Backend service to be available on port 8080..."

for i in $(seq 1 30); do
  if curl --retry 1 --retry-delay 5 --retry-connrefused -sSf http://backend:8080/actuator/health; then
    echo "Backend service is healthy"
    exit 0
  else
    echo "Waiting for Backend service to be healthy... (attempt $i)"
    sleep 5
  fi
done

echo "Backend service did not become healthy in time"
exit 1
