#!/bin/bash

echo "Stopping microservices..."
echo ""

# Determine docker-compose command
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
else
    DOCKER_COMPOSE_CMD="docker compose"
fi

# Stop Docker Compose services
echo "Stopping Docker Compose services..."
$DOCKER_COMPOSE_CMD down

echo ""
echo "Microservices stopped successfully!"
echo ""
echo "To clean up volumes and images (optional):"
echo "  $DOCKER_COMPOSE_CMD down -v"
echo "  docker system prune"
