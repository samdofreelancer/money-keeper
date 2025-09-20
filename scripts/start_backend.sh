#!/bin/bash

# This script is intended to be sourced by the main start_all.sh script

echo "--- Starting Backend ---"
cd backend
mvn clean install -DskipTests
java -jar target/springboot-ddd-category-1.0-SNAPSHOT.jar &
BACKEND_PID=$!
cd ..

echo "--- Waiting for Backend (port 8080) ---"
for i in $(seq 1 30); do
  if curl -sSf http://localhost:8080/actuator/health; then
    echo "Backend is up!"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "Backend failed to start after 150 seconds. Exiting."
    kill $BACKEND_PID
    exit 1
  fi
  echo "Attempt $i: Backend not up yet. Waiting 5 seconds..."
  sleep 5
done
