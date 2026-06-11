#!/bin/bash

# Dev Container Docker Initialization Script
# This script handles Docker setup in dev container environments
# where systemd is not available

set -e

echo "=================================================="
echo "Dev Container Docker Initialization"
echo "=================================================="

# Check if we're in a dev container
if [ ! -f "/.dockerenv" ]; then
    echo "Warning: This script is optimized for dev containers"
    echo "Continuing anyway..."
fi

# Check if Docker daemon is already running
check_docker_running() {
    if docker ps &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Start Docker daemon in background
start_docker_daemon() {
    echo "Starting Docker daemon..."
    
    # Check if docker socket exists
    if [ ! -S /var/run/docker.sock ]; then
        if command -v dockerd &> /dev/null; then
            echo "Starting dockerd in the background..."
            # Run dockerd without daemonizing (it will run in background via &)
            sudo dockerd > /tmp/dockerd.log 2>&1 &
            DOCKER_PID=$!
            echo "Docker PID: $DOCKER_PID"
            
            # Wait for socket to be created
            echo "Waiting for Docker socket to be available..."
            local max_attempts=30
            local attempt=0
            
            while [ ! -S /var/run/docker.sock ] && [ $attempt -lt $max_attempts ]; do
                sleep 1
                attempt=$((attempt + 1))
                echo "Attempt $attempt/$max_attempts..."
            done
            
            if [ -S /var/run/docker.sock ]; then
                echo "Docker socket is now available"
                return 0
            else
                echo "Failed to start Docker daemon"
                echo "Docker log:"
                sudo tail -20 /tmp/dockerd.log
                return 1
            fi
        else
            echo "Error: dockerd not found"
            return 1
        fi
    else
        echo "Docker socket already exists"
        return 0
    fi
}

# Add user to docker group if not already
add_user_to_docker_group() {
    if ! id -nG "$USER" | grep -qw "docker"; then
        echo "Adding user to docker group..."
        sudo usermod -aG docker "$USER"
        echo "Note: Group changes take effect after logging out and in"
    else
        echo "User is already in docker group"
    fi
}

# Test Docker installation
test_docker() {
    echo ""
    echo "Testing Docker installation..."
    
    if check_docker_running; then
        echo "✓ Docker daemon is running"
        docker version
        return 0
    else
        echo "✗ Docker daemon is not running"
        return 1
    fi
}

# Function to verify Docker can access socket
verify_docker_socket() {
    echo "Verifying Docker socket permissions..."
    
    if [ -S /var/run/docker.sock ]; then
        echo "Docker socket exists at /var/run/docker.sock"
        ls -la /var/run/docker.sock
        
        # Check if we can access it
        if sudo docker ps &> /dev/null; then
            echo "✓ Docker socket is accessible"
            return 0
        else
            echo "✗ Cannot access Docker socket"
            return 1
        fi
    else
        echo "✗ Docker socket does not exist"
        return 1
    fi
}

# Main execution
main() {
    echo "Initializing Docker for dev container environment..."
    echo ""
    
    # Check current Docker status
    if check_docker_running; then
        echo "✓ Docker daemon is already running"
    else
        echo "Docker daemon is not running, attempting to start..."
        
        if start_docker_daemon; then
            echo "✓ Docker daemon started successfully"
        else
            echo "✗ Failed to start Docker daemon"
            echo ""
            echo "You may need to start Docker manually:"
            echo "  sudo dockerd"
            echo ""
            echo "Or use Docker socket from host (if available):"
            echo "  export DOCKER_HOST=unix:///var/run/docker.sock"
            return 1
        fi
    fi
    
    # Add user to docker group
    add_user_to_docker_group
    
    # Verify socket
    verify_docker_socket
    
    # Test Docker
    echo ""
    if test_docker; then
        echo ""
        echo "=================================================="
        echo "Docker is ready to use!"
        echo "=================================================="
    else
        echo ""
        echo "Warning: Docker may not be fully functional"
        echo "Try the following:"
        echo "1. Run 'sudo service docker start' or 'sudo dockerd'"
        echo "2. Ensure /var/run/docker.sock is accessible"
        echo "3. Check Docker logs: sudo tail -f /tmp/dockerd.log"
    fi
}

# Run main function
main "$@"
