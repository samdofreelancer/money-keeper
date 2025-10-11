#!/bin/bash

echo "Waiting for Frontend to be healthy..."

for i in {1..30}; do
  if curl -f http://localhost:5173; then
    echo "Frontend is healthy"
    break
  fi
  echo "Waiting for Frontend... ($i/30)"
  sleep 10
done

if ! curl -f http://localhost:5173; then
  echo "Frontend failed to become healthy within 5 minutes"
  exit 1
fi
