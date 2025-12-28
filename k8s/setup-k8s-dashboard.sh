#!/bin/bash

# Money Keeper - Kubernetes Dashboard Setup Script
# This script installs and configures the Kubernetes Dashboard
# and provides access instructions

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if kubectl is installed
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed or not in PATH"
        echo "Please install kubectl first"
        exit 1
    fi
    print_success "kubectl found: $(kubectl version --client --short)"
}

# Check cluster connectivity
check_cluster() {
    print_step "Checking Kubernetes cluster..."
    if kubectl cluster-info &> /dev/null; then
        print_success "Connected to cluster"
    else
        print_error "Cannot connect to Kubernetes cluster"
        echo "Make sure Docker Desktop Kubernetes is running"
        exit 1
    fi
}

# Check if dashboard namespace exists
check_dashboard_namespace() {
    if kubectl get namespace kubernetes-dashboard &> /dev/null; then
        print_success "Dashboard namespace already exists"
        return 0
    else
        return 1
    fi
}

# Install Kubernetes Dashboard
install_dashboard() {
    print_step "Installing Kubernetes Dashboard v2.7.0..."
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml
    print_success "Dashboard installed"
    
    # Wait for dashboard to be ready
    print_step "Waiting for dashboard deployment to be ready (this may take 1-2 minutes)..."
    kubectl wait --for=condition=available --timeout=300s deployment/kubernetes-dashboard -n kubernetes-dashboard
    print_success "Dashboard is ready"
}

# Create service account
create_service_account() {
    print_step "Creating admin service account..."
    
    # Check if service account already exists
    if kubectl get serviceaccount admin-user -n kubernetes-dashboard &> /dev/null; then
        print_info "Service account 'admin-user' already exists"
    else
        kubectl create serviceaccount admin-user -n kubernetes-dashboard
        print_success "Service account created"
    fi
}

# Create cluster role binding
create_role_binding() {
    print_step "Creating cluster role binding..."
    
    # Check if role binding already exists
    if kubectl get clusterrolebinding admin-user &> /dev/null; then
        print_info "Cluster role binding 'admin-user' already exists"
    else
        kubectl create clusterrolebinding admin-user --clusterrole=cluster-admin --serviceaccount=kubernetes-dashboard:admin-user
        print_success "Cluster role binding created"
    fi
}

# Get authentication token
get_token() {
    print_step "Generating authentication token..."
    TOKEN=$(kubectl -n kubernetes-dashboard create token admin-user)
    
    if [ -z "$TOKEN" ]; then
        print_error "Failed to generate token"
        exit 1
    fi
    
    print_success "Token generated successfully"
}

# Display access instructions
display_instructions() {
    print_header "Kubernetes Dashboard is Ready!"
    
    echo ""
    echo -e "${BLUE}📊 METHOD 1: Using kubectl proxy (Recommended for first time)${NC}"
    echo ""
    echo -e "${YELLOW}Step 1: Start the proxy${NC}"
    echo "  kubectl proxy"
    echo ""
    echo -e "${YELLOW}Step 2: Open in browser${NC}"
    echo "  http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/"
    echo ""
    echo -e "${YELLOW}Step 3: Login${NC}"
    echo "  Select: Token"
    echo "  Paste token below"
    echo ""
    
    echo -e "${BLUE}📊 METHOD 2: Using port-forward (Alternative)${NC}"
    echo ""
    echo -e "${YELLOW}Step 1: Start port-forward${NC}"
    echo "  kubectl port-forward -n kubernetes-dashboard service/kubernetes-dashboard 8443:443"
    echo ""
    echo -e "${YELLOW}Step 2: Open in browser${NC}"
    echo "  https://localhost:8443"
    echo ""
    echo -e "${YELLOW}Step 3: Login${NC}"
    echo "  Select: Token"
    echo "  Paste token below"
    echo "  (Bypass SSL warning - self-signed certificate is normal)"
    echo ""
    
    echo -e "${GREEN}🔐 YOUR AUTHENTICATION TOKEN:${NC}"
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo "$TOKEN"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${BLUE}📋 Useful commands:${NC}"
    echo "  # View all resources in money-keeper namespace"
    echo "  kubectl get all -n money-keeper"
    echo ""
    echo "  # View logs of a pod"
    echo "  kubectl logs <pod-name> -n money-keeper"
    echo ""
    echo "  # View pod details"
    echo "  kubectl describe pod <pod-name> -n money-keeper"
    echo ""
    echo "  # View events"
    echo "  kubectl get events -n money-keeper"
    echo ""
}

# Main execution
main() {
    print_header "Kubernetes Dashboard Setup for Money Keeper"
    
    check_kubectl
    check_cluster
    
    if ! check_dashboard_namespace; then
        install_dashboard
    else
        print_info "Dashboard already installed"
    fi
    
    create_service_account
    create_role_binding
    get_token
    display_instructions
}

# Run main function
main
