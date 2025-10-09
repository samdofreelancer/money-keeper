#!/bin/bash

echo "Waiting for Backend to be healthy..."

for i in {1..30}; do
  if curl -f http://localhost:8080/actuator/health; then
    echo "Backend is healthy"
    break
  fi
  echo "Waiting for Backend... ($i/30)"
  sleep 10
done

if ! curl -f http://localhost:8080/actuator/health; then
  echo "Backend failed to become healthy within 5 minutes"
  exit 1
fi
