#!/bin/bash

echo "Waiting for Microservices to be healthy..."

# Array of services and their ports
declare -a SERVICES
SERVICES=(
  "eureka-server:8761"
  "money-keeper-core:8081"
  "tax-service:8082"
  "gateway:8080"
)

echo "Checking service health:"
for service in "${SERVICES[@]}"; do
  IFS=':' read -r service_name port <<< "$service"
  echo ""
  echo "Waiting for $service_name on port $port..."
  
  for i in {1..60}; do
    if curl -sf http://localhost:$port/actuator/health > /dev/null 2>&1; then
      echo "[OK] $service_name is healthy"
      break
    fi
    
    if [ $i -eq 60 ]; then
      echo "[FAIL] $service_name failed to become healthy within 10 minutes"
      exit 1
    fi
    
    echo "  Attempt $i/60: Waiting..."
    sleep 10
  done
done

echo ""
echo "All services are healthy!"
echo "Gateway is ready at: http://localhost:8080"
