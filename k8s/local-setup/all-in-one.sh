#!/bin/bash

# Money Keeper - Complete Kubernetes Setup & Dashboard Script
# This single script handles everything: cluster setup, deployment, and dashboard access

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

# Check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed"
        exit 1
    fi
    print_success "kubectl found"
    
    if ! command -v minikube &> /dev/null; then
        print_error "minikube is not installed"
        exit 1
    fi
    print_success "minikube found"
}

# Check and start Minikube
ensure_minikube_running() {
    print_step "Checking Minikube status..."
    
    if minikube status 2>/dev/null | grep -q "host: Running"; then
        print_success "Minikube is already running"
    else
        print_info "Starting Minikube..."
        minikube start --cpus=4 --memory=8192
        print_success "Minikube started!"
    fi
    
    print_step "Verifying cluster connection..."
    kubectl cluster-info
    print_success "Connected to cluster"
}

# Create namespace
create_namespace() {
    print_step "Checking money-keeper namespace..."
    
    if kubectl get namespace money-keeper &>/dev/null; then
        print_success "Namespace 'money-keeper' already exists"
    else
        print_info "Creating namespace..."
        kubectl create namespace money-keeper
        print_success "Namespace created"
    fi
}

# Deploy application
deploy_application() {
    print_header "Deploying Money Keeper Application"
    
    # Check if we should deploy
    read -p "Do you want to deploy Money Keeper application? (y/n): " deploy_app
    if [[ $deploy_app != "y" && $deploy_app != "Y" ]]; then
        print_info "Skipping application deployment"
        return
    fi
    
    # Check if Oracle is already running
    if kubectl get pod -n money-keeper -l app=oracle 2>/dev/null | grep -q "Running"; then
        print_info "Money Keeper is already deployed"
    else
        print_info "Running deployment script..."
        if [ -f "k8s/deploy-k8s.sh" ]; then
            bash k8s/deploy-k8s.sh
            print_success "Money Keeper deployed!"
        else
            print_error "deploy-k8s.sh not found"
        fi
    fi
}

# Install Kubernetes Dashboard
install_dashboard() {
    print_step "Checking Kubernetes Dashboard..."
    
    if kubectl get namespace kubernetes-dashboard &>/dev/null; then
        print_success "Dashboard is already installed"
    else
        print_info "Installing Dashboard v2.7.0..."
        kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml
        
        print_step "Waiting for dashboard to be ready (1-2 minutes)..."
        kubectl wait --for=condition=available --timeout=300s deployment/kubernetes-dashboard -n kubernetes-dashboard
        print_success "Dashboard installed and ready!"
    fi
}

# Create service account
setup_service_account() {
    print_step "Setting up service account..."
    
    if kubectl get serviceaccount admin-user -n kubernetes-dashboard &>/dev/null; then
        print_success "Service account 'admin-user' already exists"
    else
        print_info "Creating service account..."
        kubectl create serviceaccount admin-user -n kubernetes-dashboard
        print_success "Service account created"
    fi
    
    if kubectl get clusterrolebinding admin-user &>/dev/null; then
        print_success "Cluster role binding already exists"
    else
        print_info "Creating cluster role binding..."
        kubectl create clusterrolebinding admin-user --clusterrole=cluster-admin --serviceaccount=kubernetes-dashboard:admin-user
        print_success "Cluster role binding created"
    fi
}

# Generate and display token
generate_and_display_token() {
    print_step "Generating authentication token..."
    
    TOKEN=$(kubectl -n kubernetes-dashboard create token admin-user)
    
    if [ -z "$TOKEN" ]; then
        print_error "Failed to generate token"
        exit 1
    fi
    
    print_success "Token generated!"
    
    # Display access information
    print_header "🎉 Kubernetes Dashboard Setup Complete!"
    
    echo ""
    echo -e "${BLUE}📊 DASHBOARD ACCESS INFORMATION:${NC}"
    echo ""
    
    echo -e "${CYAN}METHOD 1: Using kubectl proxy (Recommended)${NC}"
    echo ""
    echo -e "${YELLOW}Step 1: Start proxy in a new terminal${NC}"
    echo "  kubectl proxy"
    echo ""
    echo -e "${YELLOW}Step 2: Open browser${NC}"
    echo "  http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/"
    echo ""
    
    echo -e "${CYAN}METHOD 2: Using port-forward${NC}"
    echo ""
    echo -e "${YELLOW}Step 1: Start port-forward in a new terminal${NC}"
    echo "  kubectl port-forward -n kubernetes-dashboard service/kubernetes-dashboard 8443:443"
    echo ""
    echo -e "${YELLOW}Step 2: Open browser${NC}"
    echo "  https://localhost:8443"
    echo ""
    
    echo -e "${GREEN}🔐 AUTHENTICATION TOKEN:${NC}"
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo "$TOKEN"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    echo -e "${BLUE}📋 Login Instructions:${NC}"
    echo "  1. Copy the token above"
    echo "  2. In dashboard, select 'Token' authentication"
    echo "  3. Paste the token"
    echo "  4. Click 'Sign in'"
    echo ""
    
    echo -e "${BLUE}🔧 Useful Kubectl Commands:${NC}"
    echo ""
    echo "  # View all resources in money-keeper namespace"
    echo "  kubectl get all -n money-keeper"
    echo ""
    echo "  # View pod logs"
    echo "  kubectl logs <pod-name> -n money-keeper"
    echo ""
    echo "  # View pod details"
    echo "  kubectl describe pod <pod-name> -n money-keeper"
    echo ""
    echo "  # Get cluster info"
    echo "  kubectl cluster-info"
    echo ""
    echo "  # Minikube status"
    echo "  minikube status"
    echo ""
    echo "  # Stop Minikube"
    echo "  minikube stop"
    echo ""
    echo "  # Restart Minikube"
    echo "  minikube start"
    echo ""
}

# Show menu for quick actions
show_menu() {
    echo ""
    echo -e "${BLUE}═════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}What would you like to do?${NC}"
    echo -e "${BLUE}═════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${CYAN}1)${NC} Full setup (Minikube + Deploy + Dashboard)"
    echo -e "${CYAN}2)${NC} Quick dashboard access (Minikube + Dashboard only)"
    echo -e "${CYAN}3)${NC} Check cluster status"
    echo -e "${CYAN}4)${NC} View Money Keeper resources"
    echo -e "${CYAN}5)${NC} Port-forward backend (8080)"
    echo -e "${CYAN}6)${NC} Port-forward frontend (3000)"
    echo -e "${CYAN}7)${NC} Port-forward dashboard (8443)"
    echo -e "${CYAN}8)${NC} Port-forward all (backend + frontend + dashboard)"
    echo -e "${CYAN}9)${NC} Stop Minikube"
    echo -e "${CYAN}10)${NC} Exit"
    echo ""
}

# Check cluster status
check_cluster_status() {
    print_header "Cluster Status"
    
    print_step "Minikube status:"
    minikube status
    
    print_step "Cluster info:"
    kubectl cluster-info
    
    print_step "Nodes:"
    kubectl get nodes
    
    print_step "Namespaces:"
    kubectl get namespaces
}

# View Money Keeper resources
view_resources() {
    print_header "Money Keeper Resources"
    
    print_step "Pods in money-keeper namespace:"
    kubectl get pods -n money-keeper -o wide || print_info "No pods found (application may not be deployed yet)"
    
    print_step "Services in money-keeper namespace:"
    kubectl get services -n money-keeper || print_info "No services found"
    
    print_step "Deployments in money-keeper namespace:"
    kubectl get deployments -n money-keeper || print_info "No deployments found"
}

# Stop Minikube
stop_minikube() {
    print_step "Stopping Minikube..."
    minikube stop
    print_success "Minikube stopped"
}

# Port-forward backend
port_forward_backend() {
    print_header "Backend Port-Forward Setup"
    
    print_step "Starting port-forward for backend (8080)..."
    print_info "Backend will be available at: http://localhost:8080"
    print_info "Press Ctrl+C to stop port-forward"
    
    kubectl port-forward -n money-keeper svc/money-keeper-backend-service 8080:8080
}

# Port-forward frontend
port_forward_frontend() {
    print_header "Frontend Port-Forward Setup"
    
    print_step "Starting port-forward for frontend (5173)..."
    print_info "Frontend will be available at: http://localhost:5173"
    print_info "Press Ctrl+C to stop port-forward"
    
    kubectl port-forward -n money-keeper svc/money-keeper-frontend-service 5173:80
}

# Port-forward dashboard
port_forward_dashboard() {
    print_header "Dashboard Port-Forward Setup"
    
    print_step "Starting port-forward for dashboard (8443)..."
    print_info "Dashboard will be available at: https://localhost:8443"
    print_info "Press Ctrl+C to stop port-forward"
    
    kubectl port-forward -n kubernetes-dashboard service/kubernetes-dashboard 8443:443
}

# Port-forward all services
port_forward_all() {
    print_header "Starting All Port-Forwards"
    
    echo ""
    echo -e "${YELLOW}This will start port-forwarding for all services in background.${NC}"
    echo -e "${YELLOW}Note: You may see errors if services are not deployed yet.${NC}"
    echo ""
    
    # Start backend port-forward in background
    if kubectl get svc -n money-keeper money-keeper-backend-service &>/dev/null 2>&1; then
        print_step "Starting backend port-forward (8080)..."
        kubectl port-forward -n money-keeper svc/money-keeper-backend-service 8080:8080 > /dev/null 2>&1 &
        BACKEND_PID=$!
        print_success "Backend port-forward started (PID: $BACKEND_PID)"
    else
        print_info "Backend service not found - skipping"
    fi
    
    # Start frontend port-forward in background
    if kubectl get svc -n money-keeper money-keeper-frontend-service &>/dev/null 2>&1; then
        print_step "Starting frontend port-forward (5173)..."
        kubectl port-forward -n money-keeper svc/money-keeper-frontend-service 5173:80 > /dev/null 2>&1 &
        FRONTEND_PID=$!
        print_success "Frontend port-forward started (PID: $FRONTEND_PID)"
    else
        print_info "Frontend service not found - skipping"
    fi
    
    # Start dashboard port-forward in background
    if kubectl get svc -n kubernetes-dashboard kubernetes-dashboard &>/dev/null 2>&1; then
        print_step "Starting dashboard port-forward (8443)..."
        kubectl port-forward -n kubernetes-dashboard service/kubernetes-dashboard 8443:443 > /dev/null 2>&1 &
        DASHBOARD_PID=$!
        print_success "Dashboard port-forward started (PID: $DASHBOARD_PID)"
    else
        print_info "Dashboard service not found - skipping"
    fi
    
    print_header "✅ All Port-Forwards Started"
    
    echo ""
    echo -e "${GREEN}Available Services:${NC}"
    echo ""
    echo "  🌐 Backend:   http://localhost:8080"
    echo "  🎨 Frontend:  http://localhost:5173"
    echo "  📊 Dashboard: https://localhost:8443"
    echo ""
    
    if [ ! -z "$BACKEND_PID" ] || [ ! -z "$FRONTEND_PID" ] || [ ! -z "$DASHBOARD_PID" ]; then
        echo -e "${YELLOW}To stop all port-forwards:${NC}"
        echo "  # Kill specific port-forward"
        echo "  kill $BACKEND_PID       # Backend"
        echo "  kill $FRONTEND_PID      # Frontend"
        echo "  kill $DASHBOARD_PID     # Dashboard"
        echo ""
        echo "  # Or use pkill"
        echo "  pkill -f 'kubectl port-forward'"
        echo ""
    fi
}

# Full setup flow
full_setup() {
    check_prerequisites
    ensure_minikube_running
    create_namespace
    deploy_application
    install_dashboard
    setup_service_account
    generate_and_display_token
}

# Quick dashboard flow
quick_dashboard() {
    check_prerequisites
    ensure_minikube_running
    create_namespace
    install_dashboard
    setup_service_account
    generate_and_display_token
}

# Main menu loop
main() {
    while true; do
        show_menu
        read -p "Enter your choice (1-10): " choice
        
        case $choice in
            1)
                full_setup
                ;;
            2)
                quick_dashboard
                ;;
            3)
                check_cluster_status
                ;;
            4)
                view_resources
                ;;
            5)
                port_forward_backend
                ;;
            6)
                port_forward_frontend
                ;;
            7)
                port_forward_dashboard
                ;;
            8)
                port_forward_all
                ;;
            9)
                stop_minikube
                ;;
            10)
                print_info "Exiting..."
                exit 0
                ;;
            *)
                print_error "Invalid choice. Please try again."
                ;;
        esac
    done
}

# Run main
main
