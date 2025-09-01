#!/bin/bash

# Kubernetes Troubleshooting Script for Money Keeper Deployment
# This script helps diagnose common Kubernetes connectivity issues

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if kubectl is installed
check_kubectl() {
    log_info "Checking if kubectl is installed..."
    
    if command -v kubectl &> /dev/null; then
        local version=$(kubectl version --client --short 2>/dev/null || kubectl version --client 2>/dev/null)
        log_success "kubectl is installed: $version"
        return 0
    else
        log_error "kubectl is not installed or not in PATH"
        log_info "To install kubectl:"
        log_info "  - Linux: curl -LO 'https://dl.k8s.io/release/\$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl'"
        log_info "  - macOS: brew install kubectl"
        log_info "  - Windows: choco install kubernetes-cli"
        return 1
    fi
}

# Function to check kubeconfig
check_kubeconfig() {
    log_info "Checking kubeconfig configuration..."
    
    # Check if KUBECONFIG environment variable is set
    if [ -n "$KUBECONFIG" ]; then
        log_info "KUBECONFIG environment variable is set: $KUBECONFIG"
        if [ -f "$KUBECONFIG" ]; then
            log_success "Kubeconfig file exists at: $KUBECONFIG"
        else
            log_error "Kubeconfig file does not exist at: $KUBECONFIG"
            return 1
        fi
    else
        # Check default kubeconfig location
        local default_config="$HOME/.kube/config"
        if [ -f "$default_config" ]; then
            log_success "Default kubeconfig found at: $default_config"
        else
            log_error "No kubeconfig found at default location: $default_config"
            log_info "You need to configure kubectl to connect to your cluster:"
            log_info "  - For local clusters (minikube): minikube start"
            log_info "  - For cloud providers: Download kubeconfig from your cloud console"
            log_info "  - For custom clusters: Copy kubeconfig to ~/.kube/config"
            return 1
        fi
    fi
    
    return 0
}

# Function to check current context
check_current_context() {
    log_info "Checking current Kubernetes context..."
    
    local current_context=$(kubectl config current-context 2>/dev/null)
    if [ $? -eq 0 ] && [ -n "$current_context" ]; then
        log_success "Current context: $current_context"
        
        # Show context details
        log_info "Context details:"
        kubectl config get-contexts "$current_context"
        return 0
    else
        log_error "No current context set or unable to get context"
        log_info "Available contexts:"
        kubectl config get-contexts 2>/dev/null || log_warning "No contexts available"
        return 1
    fi
}

# Function to test cluster connectivity
test_cluster_connectivity() {
    log_info "Testing cluster connectivity..."
    
    # Test basic connectivity
    if kubectl cluster-info &> /dev/null; then
        log_success "Successfully connected to Kubernetes cluster!"
        log_info "Cluster info:"
        kubectl cluster-info
        return 0
    else
        log_error "Cannot connect to Kubernetes cluster"
        
        # Try to get more detailed error
        log_info "Detailed error:"
        kubectl cluster-info 2>&1
        return 1
    fi
}

# Function to check cluster resources
check_cluster_resources() {
    log_info "Checking cluster resources and permissions..."
    
    # Check if we can list nodes
    if kubectl get nodes &> /dev/null; then
        log_success "Can list cluster nodes:"
        kubectl get nodes
    else
        log_warning "Cannot list nodes (may be permission-related)"
    fi
    
    # Check if we can list namespaces
    if kubectl get namespaces &> /dev/null; then
        log_success "Can list namespaces:"
        kubectl get namespaces
    else
        log_warning "Cannot list namespaces (may be permission-related)"
    fi
    
    # Check if we can create resources (try with dry-run)
    if kubectl auth can-i create namespace &> /dev/null; then
        log_success "Have permission to create namespaces"
    else
        log_warning "May not have permission to create namespaces"
    fi
}

# Function to suggest solutions
suggest_solutions() {
    log_info "Common solutions for Kubernetes connectivity issues:"
    echo
    echo "1. Local Development (Minikube/Kind/Docker Desktop):"
    echo "   - Start minikube: minikube start"
    echo "   - Enable Docker Desktop Kubernetes: Settings > Kubernetes > Enable"
    echo "   - Start kind cluster: kind create cluster"
    echo
    echo "2. Cloud Providers:"
    echo "   - AWS EKS: aws eks update-kubeconfig --region <region> --name <cluster-name>"
    echo "   - Google GKE: gcloud container clusters get-credentials <cluster-name> --zone <zone>"
    echo "   - Azure AKS: az aks get-credentials --resource-group <rg> --name <cluster-name>"
    echo
    echo "3. Manual kubeconfig setup:"
    echo "   - Copy kubeconfig file to ~/.kube/config"
    echo "   - Set KUBECONFIG environment variable"
    echo "   - Ensure correct file permissions (600)"
    echo
    echo "4. Network/Firewall issues:"
    echo "   - Check if cluster endpoint is accessible"
    echo "   - Verify firewall rules allow kubectl traffic"
    echo "   - Check VPN connection if required"
    echo
    echo "5. Authentication issues:"
    echo "   - Check if certificates are valid and not expired"
    echo "   - Verify service account tokens"
    echo "   - Re-authenticate with cloud provider if needed"
}

# Main function
main() {
    log_info "Starting Kubernetes connectivity troubleshooting..."
    echo
    
    local issues_found=0
    
    # Step 1: Check kubectl installation
    if ! check_kubectl; then
        issues_found=$((issues_found + 1))
    fi
    echo
    
    # Step 2: Check kubeconfig
    if ! check_kubeconfig; then
        issues_found=$((issues_found + 1))
    fi
    echo
    
    # Step 3: Check current context
    if ! check_current_context; then
        issues_found=$((issues_found + 1))
    fi
    echo
    
    # Step 4: Test connectivity
    if ! test_cluster_connectivity; then
        issues_found=$((issues_found + 1))
    fi
    echo
    
    # Step 5: Check resources (only if connected)
    if [ $issues_found -eq 0 ]; then
        check_cluster_resources
        echo
    fi
    
    # Show suggestions if issues found
    if [ $issues_found -gt 0 ]; then
        suggest_solutions
        log_error "Found $issues_found issue(s). Please resolve them before running the deployment script."
        exit 1
    else
        log_success "All connectivity checks passed! You can now run the deployment script."
        exit 0
    fi
}

# Run main function
main "$@" 