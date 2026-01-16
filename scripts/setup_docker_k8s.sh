#!/bin/bash

# Complete Setup Script - Docker & Kubernetes Installation Orchestrator
# This script automates the installation of Docker and Kubernetes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}=================================================="
echo "Docker & Kubernetes Setup Script"
echo "==================================================${NC}"
echo ""

# Check if running as non-root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}Please do not run this script as root${NC}"
    echo "This script will use sudo when needed"
    exit 1
fi

# Check for required commands
check_requirements() {
    echo -e "${YELLOW}Checking system requirements...${NC}"
    
    local missing_tools=()
    
    if ! command -v curl &> /dev/null; then
        missing_tools+=("curl")
    fi
    
    if ! command -v git &> /dev/null; then
        missing_tools+=("git")
    fi
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        echo -e "${YELLOW}Installing missing tools: ${missing_tools[@]}${NC}"
        sudo apt-get update
        sudo apt-get install -y "${missing_tools[@]}"
    fi
    
    echo -e "${GREEN}Requirements satisfied${NC}"
}

# Make scripts executable
make_scripts_executable() {
    echo -e "${YELLOW}Making scripts executable...${NC}"
    chmod +x "$SCRIPT_DIR/install_docker.sh"
    chmod +x "$SCRIPT_DIR/install_kubernetes.sh"
    echo -e "${GREEN}Done${NC}"
}

# Function to install Docker
install_docker() {
    echo ""
    echo -e "${BLUE}Starting Docker installation...${NC}"
    "$SCRIPT_DIR/install_docker.sh"
    echo -e "${GREEN}Docker installation completed${NC}"
}

# Function to install Kubernetes
install_kubernetes() {
    echo ""
    echo -e "${BLUE}Starting Kubernetes installation...${NC}"
    "$SCRIPT_DIR/install_kubernetes.sh"
    echo -e "${GREEN}Kubernetes installation completed${NC}"
}

# Display menu
show_menu() {
    echo ""
    echo -e "${BLUE}Select installation options:${NC}"
    echo "1) Install Docker only"
    echo "2) Install Kubernetes only"
    echo "3) Install both Docker and Kubernetes"
    echo "4) Exit"
    echo ""
}

# Main menu loop
main_menu() {
    while true; do
        show_menu
        read -p "Enter your choice (1-4): " choice
        
        case $choice in
            1)
                install_docker
                ;;
            2)
                install_kubernetes
                ;;
            3)
                install_docker
                install_kubernetes
                ;;
            4)
                echo -e "${YELLOW}Exiting setup script${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid choice. Please select 1-4${NC}"
                ;;
        esac
    done
}

# Function to verify installations
verify_installations() {
    echo ""
    echo -e "${BLUE}Verifying installations...${NC}"
    
    if command -v docker &> /dev/null; then
        echo -e "${GREEN}✓ Docker${NC} - $(docker --version)"
    else
        echo -e "${RED}✗ Docker${NC} - Not installed"
    fi
    
    if command -v kubectl &> /dev/null; then
        echo -e "${GREEN}✓ kubectl${NC} - $(kubectl version --client --short 2>/dev/null || echo 'Installed')"
    else
        echo -e "${RED}✗ kubectl${NC} - Not installed"
    fi
    
    if command -v kubeadm &> /dev/null; then
        echo -e "${GREEN}✓ kubeadm${NC} - Installed"
    fi
    
    if command -v minikube &> /dev/null; then
        echo -e "${GREEN}✓ Minikube${NC} - Installed"
    fi
    
    if command -v helm &> /dev/null; then
        echo -e "${GREEN}✓ Helm${NC} - $(helm version --short)"
    fi
}

# Print success message
print_success() {
    echo ""
    echo -e "${GREEN}=================================================="
    echo "Installation completed successfully!"
    echo "==================================================${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Log out and log back in to apply Docker group changes"
    echo "2. Or run: newgrp docker"
    echo "3. Run 'docker ps' to verify Docker installation"
    echo "4. Run 'kubectl cluster-info' to verify Kubernetes"
    echo "5. For local development, start Minikube with: minikube start"
    echo ""
}

# Main execution
main() {
    check_requirements
    make_scripts_executable
    
    # Ask if user wants to skip menu
    read -p "Skip interactive menu and install both Docker and Kubernetes? (y/n): " skip_menu
    
    if [[ "$skip_menu" =~ ^[Yy]$ ]]; then
        install_docker
        install_kubernetes
        verify_installations
        print_success
    else
        main_menu
    fi
}

# Run main function
main
