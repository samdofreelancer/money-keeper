#!/bin/bash

# Money Keeper - Kubernetes Cluster Setup Script (Non-Docker Desktop)
# Supports: Minikube, Kind, and Kubeadm on WSL2
# This script helps you choose and set up a K8s cluster

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Functions for colored output
print_header() {
    echo ""
    echo -e "${BLUE}============================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================================${NC}"
}

print_step() {
    echo ""
    echo -e "${YELLOW}>>> $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check system
check_system() {
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
        print_info "Windows detected (Git Bash)"
        return 0
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if grep -qi microsoft /proc/version 2>/dev/null; then
            print_info "WSL2 detected"
            return 0
        else
            print_info "Linux detected"
            return 0
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        print_info "macOS detected"
        return 0
    fi
}

# Menu for choosing K8s solution
show_menu() {
    print_header "Choose Kubernetes Solution"
    echo ""
    echo -e "${CYAN}1)${NC} Minikube (Recommended for Windows - Easiest)"
    echo -e "${CYAN}2)${NC} Kind (Kubernetes in Docker)"
    echo -e "${CYAN}3)${NC} Kubeadm on WSL2 (Advanced - Most production-like)"
    echo -e "${CYAN}4)${NC} Check installed tools"
    echo -e "${CYAN}5)${NC} Exit"
    echo ""
}

# Check installed tools
check_tools() {
    print_header "Checking Installed Tools"
    
    echo ""
    echo -e "${CYAN}Kubernetes Tools:${NC}"
    if command_exists kubectl; then
        echo -e "${GREEN}✅${NC} kubectl: $(kubectl version --client --short 2>/dev/null | grep -oP 'v[0-9.]+' || echo 'installed')"
    else
        echo -e "${RED}❌${NC} kubectl: NOT installed"
    fi
    
    if command_exists minikube; then
        echo -e "${GREEN}✅${NC} minikube: $(minikube version 2>/dev/null | grep -oP 'v[0-9.]+' || echo 'installed')"
    else
        echo -e "${RED}❌${NC} minikube: NOT installed"
    fi
    
    if command_exists kind; then
        echo -e "${GREEN}✅${NC} kind: $(kind version 2>/dev/null | grep -oP 'v[0-9.]+' || echo 'installed')"
    else
        echo -e "${RED}❌${NC} kind: NOT installed"
    fi
    
    echo ""
    echo -e "${CYAN}Virtualization/Container:${NC}"
    if command_exists docker; then
        echo -e "${GREEN}✅${NC} docker: $(docker --version)"
    else
        echo -e "${RED}❌${NC} docker: NOT installed"
    fi
    
    if command_exists VBoxManage; then
        echo -e "${GREEN}✅${NC} VirtualBox: $(VBoxManage --version)"
    else
        echo -e "${RED}❌${NC} VirtualBox: NOT installed"
    fi
    
    echo ""
}

# Install Minikube
install_minikube() {
    print_header "Minikube Setup"
    
    echo ""
    print_step "Checking prerequisites..."
    
    # Check if minikube is already installed
    if command_exists minikube; then
        print_success "Minikube already installed: $(minikube version)"
    else
        echo ""
        echo -e "${YELLOW}Minikube installation instructions:${NC}"
        echo ""
        echo -e "${CYAN}Option 1: Using Chocolatey (Windows)${NC}"
        echo "  choco install minikube"
        echo ""
        echo -e "${CYAN}Option 2: Manual download${NC}"
        echo "  Download from: https://github.com/kubernetes/minikube/releases"
        echo "  Add to PATH"
        echo ""
        echo -e "${CYAN}Option 3: Using scoop${NC}"
        echo "  scoop install minikube"
        echo ""
    fi
    
    # Check kubectl
    if ! command_exists kubectl; then
        echo ""
        print_step "kubectl not found. Installing kubectl..."
        echo ""
        echo -e "${CYAN}Option 1: Using Chocolatey (Windows)${NC}"
        echo "  choco install kubernetes-cli"
        echo ""
        echo -e "${CYAN}Option 2: Using scoop${NC}"
        echo "  scoop install kubectl"
        echo ""
    fi
    
    echo ""
    print_step "Starting Minikube cluster..."
    echo ""
    echo -e "${YELLOW}Run one of these commands:${NC}"
    echo ""
    echo -e "${CYAN}Option 1: Using Hyper-V (Windows default)${NC}"
    echo "  minikube start --vm-driver=hyperv --cpus=4 --memory=8192"
    echo ""
    echo -e "${CYAN}Option 2: Using VirtualBox${NC}"
    echo "  minikube start --vm-driver=virtualbox --cpus=4 --memory=8192"
    echo ""
    echo -e "${CYAN}Option 3: Using Docker${NC}"
    echo "  minikube start --vm-driver=docker --cpus=4 --memory=8192"
    echo ""
    echo -e "${CYAN}Option 4: Default (auto-detect driver)${NC}"
    echo "  minikube start --cpus=4 --memory=8192"
    echo ""
}

# Setup Minikube interactive
setup_minikube_interactive() {
    print_header "Setting up Minikube"
    
    if ! command_exists minikube; then
        print_error "Minikube is not installed"
        print_info "Please install it first using: choco install minikube (Windows) or follow the instructions above"
        return 1
    fi
    
    print_step "Starting Minikube cluster..."
    print_info "This may take 2-3 minutes..."
    
    minikube start --cpus=4 --memory=8192
    
    print_success "Minikube cluster started!"
    
    print_step "Verifying cluster..."
    kubectl cluster-info
    
    print_success "Minikube setup complete!"
    
    echo ""
    echo -e "${CYAN}Next steps:${NC}"
    echo "  1. Deploy your application:"
    echo "     bash k8s/deploy-k8s.sh"
    echo ""
    echo "  2. Access dashboard:"
    echo "     bash k8s/setup-k8s-dashboard.sh"
    echo ""
    echo "  3. Useful commands:"
    echo "     minikube status              # Check status"
    echo "     minikube dashboard           # Open dashboard"
    echo "     minikube stop                # Stop cluster"
    echo "     minikube delete              # Delete cluster"
    echo ""
}

# Install Kind
install_kind() {
    print_header "Kind (Kubernetes in Docker) Setup"
    
    echo ""
    print_step "Checking prerequisites..."
    
    if ! command_exists docker; then
        print_error "Docker is required for Kind"
        echo "Please install Docker first from: https://www.docker.com/products/docker-desktop"
        return 1
    fi
    
    if command_exists kind; then
        print_success "Kind already installed"
    else
        echo ""
        echo -e "${YELLOW}Kind installation instructions:${NC}"
        echo ""
        echo -e "${CYAN}Option 1: Using Chocolatey (Windows)${NC}"
        echo "  choco install kind"
        echo ""
        echo -e "${CYAN}Option 2: Using scoop${NC}"
        echo "  scoop install kind"
        echo ""
        echo -e "${CYAN}Option 3: Manual download${NC}"
        echo "  Download from: https://github.com/kubernetes-sigs/kind/releases"
        echo "  Add to PATH"
        echo ""
    fi
    
    echo ""
    print_step "Starting Kind cluster..."
    echo ""
    echo -e "${YELLOW}Run this command:${NC}"
    echo "  kind create cluster --name money-keeper --image kindest/node:v1.28.0"
    echo ""
}

# Setup Kind interactive
setup_kind_interactive() {
    print_header "Setting up Kind Cluster"
    
    if ! command_exists kind; then
        print_error "Kind is not installed"
        print_info "Please install it first"
        return 1
    fi
    
    if ! command_exists docker; then
        print_error "Docker is not running"
        print_info "Please start Docker first"
        return 1
    fi
    
    print_step "Creating Kind cluster..."
    print_info "This may take 1-2 minutes..."
    
    kind create cluster --name money-keeper --image kindest/node:v1.28.0
    
    print_success "Kind cluster created!"
    
    print_step "Verifying cluster..."
    kubectl cluster-info
    
    print_success "Kind setup complete!"
    
    echo ""
    echo -e "${CYAN}Next steps:${NC}"
    echo "  1. Deploy your application:"
    echo "     bash k8s/deploy-k8s.sh"
    echo ""
    echo "  2. Access dashboard:"
    echo "     bash k8s/setup-k8s-dashboard.sh"
    echo ""
    echo "  3. Useful commands:"
    echo "     kind get clusters             # List clusters"
    echo "     kind delete cluster --name money-keeper  # Delete cluster"
    echo ""
}

# Install Kubeadm
install_kubeadm() {
    print_header "Kubeadm on WSL2 Setup (Advanced)"
    
    echo ""
    echo -e "${YELLOW}This is the most production-like setup but requires:${NC}"
    echo "  • WSL2 (Windows Subsystem for Linux 2)"
    echo "  • Linux distribution installed in WSL2"
    echo "  • Minimum 4GB RAM available"
    echo ""
    
    echo -e "${CYAN}Prerequisites Installation:${NC}"
    echo ""
    echo "1. Install WSL2 and a Linux distribution:"
    echo "   wsl --install -d Ubuntu"
    echo ""
    echo "2. Update system in WSL2:"
    echo "   sudo apt update && sudo apt upgrade -y"
    echo ""
    echo "3. Install Docker in WSL2:"
    echo "   curl -fsSL https://get.docker.com | sudo bash"
    echo ""
    echo "4. Install kubectl:"
    echo "   curl -LO 'https://dl.k8s.io/release/\$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl'"
    echo "   chmod +x kubectl && sudo mv kubectl /usr/local/bin/"
    echo ""
    echo "5. Initialize cluster with kubeadm:"
    echo "   sudo kubeadm init --pod-network-cidr=10.244.0.0/16"
    echo ""
    echo "6. Setup kubeconfig:"
    echo "   mkdir -p \$HOME/.kube"
    echo "   sudo cp /etc/kubernetes/admin.conf \$HOME/.kube/config"
    echo "   sudo chown \$(id -u):\$(id -g) \$HOME/.kube/config"
    echo ""
    echo "7. Install network plugin (Flannel):"
    echo "   kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml"
    echo ""
    
    echo -e "${YELLOW}Full documentation:${NC}"
    echo "  https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/"
    echo ""
}

# Main menu loop
main() {
    check_system
    
    while true; do
        show_menu
        read -p "Enter your choice (1-5): " choice
        
        case $choice in
            1)
                install_minikube
                echo ""
                read -p "Do you want to start Minikube now? (y/n): " start_now
                if [[ $start_now == "y" || $start_now == "Y" ]]; then
                    setup_minikube_interactive
                fi
                ;;
            2)
                install_kind
                echo ""
                read -p "Do you want to create Kind cluster now? (y/n): " create_now
                if [[ $create_now == "y" || $create_now == "Y" ]]; then
                    setup_kind_interactive
                fi
                ;;
            3)
                install_kubeadm
                ;;
            4)
                check_tools
                ;;
            5)
                print_info "Exiting..."
                exit 0
                ;;
            *)
                print_error "Invalid choice"
                ;;
        esac
    done
}

# Run main
main
