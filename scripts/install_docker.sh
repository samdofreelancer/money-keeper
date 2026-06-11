#!/bin/bash

# Docker Installation Script
# Automates Docker installation on Linux systems

set -e

echo "=================================================="
echo "Docker Installation Script"
echo "=================================================="

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VERSION=$VERSION_ID
else
    echo "Cannot detect OS. Exiting."
    exit 1
fi

echo "Detected OS: $OS $VERSION"

# Function to install Docker on Ubuntu/Debian
install_docker_debian() {
    echo "Installing Docker on Debian/Ubuntu..."
    
    # Update package manager
    sudo apt-get update
    
    # Install dependencies
    sudo apt-get install -y \
        ca-certificates \
        curl \
        gnupg \
        lsb-release
    
    # Add Docker GPG key
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/$OS/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Add Docker repository
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$OS \
        $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    echo "Docker installed successfully!"
}

# Function to install Docker on RHEL/CentOS/Fedora
install_docker_rhel() {
    echo "Installing Docker on RHEL/CentOS/Fedora..."
    
    # Update package manager
    sudo yum update -y
    
    # Install dependencies
    sudo yum install -y yum-utils
    
    # Add Docker repository
    sudo yum-config-manager --add-repo https://download.docker.com/linux/rhel/docker-ce.repo
    
    # Install Docker
    sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    echo "Docker installed successfully!"
}

# Function to install Docker on Arch
install_docker_arch() {
    echo "Installing Docker on Arch Linux..."
    
    sudo pacman -Syu --noconfirm
    sudo pacman -S --noconfirm docker docker-compose
    
    echo "Docker installed successfully!"
}

# Install Docker based on OS
case "$OS" in
    ubuntu|debian)
        install_docker_debian
        ;;
    fedora|rhel|centos)
        install_docker_rhel
        ;;
    arch|manjaro)
        install_docker_arch
        ;;
    *)
        echo "Unsupported OS: $OS"
        exit 1
        ;;
esac

# Start Docker service (handle both systemd and dev container environments)
echo "Starting Docker service..."
if command -v systemctl &> /dev/null && systemctl is-system-running &> /dev/null; then
    # systemd is running
    sudo systemctl start docker
    sudo systemctl enable docker
elif command -v service &> /dev/null; then
    # Fall back to service command (for dev containers)
    echo "Detected dev container environment - using service command"
    sudo service docker start
else
    echo "Warning: Could not start Docker service. Please start manually with: sudo dockerd &"
fi

# Add current user to docker group (optional)
echo "Adding current user to docker group..."
sudo usermod -aG docker $USER

# Verify installation
echo ""
echo "Verifying Docker installation..."
docker --version
docker run hello-world

echo ""
echo "=================================================="
echo "Docker installation completed successfully!"
echo "=================================================="
echo ""
echo "Note: You may need to log out and log back in for group changes to take effect."
echo "Or run: newgrp docker"
