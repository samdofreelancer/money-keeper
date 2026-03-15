#!/bin/bash

echo "Starting microservices using Docker Compose..."
echo ""
echo "Services to start:"
echo "  - Eureka Server (8761)"
echo "  - money-keeper-core (8081)"
echo "  - tax-service (8082)"
echo "  - gateway (8080)"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed. Please install Docker Desktop."
    exit 1
fi

# Determine docker-compose command
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
else
    DOCKER_COMPOSE_CMD="docker compose"
fi

# Check for ORACLE_PASSWORD
if [ -z "$ORACLE_PASSWORD" ]; then
    echo "WARNING: ORACLE_PASSWORD not set. Please set it first:"
    echo "  export ORACLE_PASSWORD=your_password"
fi

echo ""
echo "Building and starting services..."
$DOCKER_COMPOSE_CMD up -d --build

echo ""
echo "Waiting for services to be ready..."
bash ./scripts/wait_for_backend.sh

echo ""
echo "Backend microservices are running!"
echo "Access via gateway at: http://localhost:8080"
echo ""
echo "To view logs: $DOCKER_COMPOSE_CMD logs -f"
