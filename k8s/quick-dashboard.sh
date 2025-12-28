#!/bin/bash

# Money Keeper - Quick Dashboard Access Script
# Run this anytime you want to access the dashboard

set -e

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Minikube is running
check_minikube_status() {
    print_step "Checking Minikube status..."
    
    if minikube status 2>/dev/null | grep -q "host: Running"; then
        print_success "Minikube is already running"
        return 0
    else
        print_info "Minikube is not running. Starting..."
        minikube start --cpus=4 --memory=8192
        print_success "Minikube started!"
        return 0
    fi
}

# Check if dashboard is installed
check_dashboard_installed() {
    print_step "Checking if dashboard is installed..."
    
    if kubectl get namespace kubernetes-dashboard &>/dev/null; then
        print_success "Dashboard is installed"
        return 0
    else
        print_info "Dashboard not found. Installing..."
        kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml
        kubectl wait --for=condition=available --timeout=300s deployment/kubernetes-dashboard -n kubernetes-dashboard
        print_success "Dashboard installed!"
        return 0
    fi
}

# Check if service account exists
check_service_account() {
    print_step "Checking service account..."
    
    if kubectl get serviceaccount admin-user -n kubernetes-dashboard &>/dev/null; then
        print_success "Service account already exists"
    else
        print_info "Creating service account..."
        kubectl create serviceaccount admin-user -n kubernetes-dashboard
        kubectl create clusterrolebinding admin-user --clusterrole=cluster-admin --serviceaccount=kubernetes-dashboard:admin-user
        print_success "Service account created!"
    fi
}

# Get token
get_token() {
    print_step "Generating authentication token..."
    TOKEN=$(kubectl -n kubernetes-dashboard create token admin-user)
    
    if [ -z "$TOKEN" ]; then
        print_error "Failed to generate token"
        exit 1
    fi
    
    print_success "Token generated!"
}

# Display dashboard access info
display_access_info() {
    print_header "🎉 Dashboard is Ready!"
    
    echo ""
    echo -e "${BLUE}📊 DASHBOARD ACCESS:${NC}"
    echo ""
    echo -e "${YELLOW}Browser URL:${NC}"
    echo "  http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/"
    echo ""
    echo -e "${YELLOW}Proxy command (keep running):${NC}"
    echo "  kubectl proxy"
    echo ""
    echo -e "${YELLOW}Authentication Token:${NC}"
    echo ""
    echo -e "  ${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo "  $TOKEN"
    echo -e "  ${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    echo -e "${GREEN}📋 TO ACCESS DASHBOARD:${NC}"
    echo "  1. Keep this terminal running the 'kubectl proxy' command"
    echo "  2. Open a NEW terminal/PowerShell"
    echo "  3. Run: kubectl proxy"
    echo "  4. Open browser and paste the URL above"
    echo "  5. Select 'Token' and paste the token"
    echo ""
    
    echo -e "${YELLOW}💡 ALTERNATIVE (without kubectl proxy):${NC}"
    echo "  kubectl port-forward -n kubernetes-dashboard service/kubernetes-dashboard 8443:443"
    echo "  Then open: https://localhost:8443"
    echo ""
}

# Main execution
main() {
    print_header "Money Keeper - Dashboard Quick Access"
    
    check_minikube_status
    check_dashboard_installed
    check_service_account
    get_token
    display_access_info
    
    echo -e "${BLUE}Next: Start kubectl proxy in a new terminal to access the dashboard${NC}"
    echo ""
}

main
