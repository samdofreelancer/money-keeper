#!/bin/bash

# Money Keeper K8s Deployment Script
# This script deploys the complete Money Keeper application to Kubernetes

set -e  # Exit on any error

# Configuration
NAMESPACE="money-keeper"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MAX_WAIT_TIME=300  # 5 minutes max wait time for each service

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

# Function to check if namespace exists
check_namespace_exists() {
    if kubectl get namespace "$NAMESPACE" >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to create namespace
create_namespace() {
    log_info "Checking if namespace '$NAMESPACE' exists..."
    
    if check_namespace_exists; then
        log_warning "Namespace '$NAMESPACE' already exists. Skipping creation."
    else
        log_info "Creating namespace '$NAMESPACE'..."
        kubectl create namespace "$NAMESPACE"
        log_success "Namespace '$NAMESPACE' created successfully."
    fi
}

# Function to wait for deployment to be ready
wait_for_deployment() {
    local deployment_name=$1
    local namespace=$2
    local max_wait=$3
    
    log_info "Waiting for deployment '$deployment_name' to be ready (max ${max_wait}s)..."
    
    if kubectl wait --for=condition=available deployment/"$deployment_name" \
        --namespace="$namespace" --timeout="${max_wait}s"; then
        log_success "Deployment '$deployment_name' is ready!"
        return 0
    else
        log_error "Deployment '$deployment_name' failed to become ready within ${max_wait}s"
        return 1
    fi
}

# Function to wait for pods to be ready
wait_for_pods() {
    local app_label=$1
    local namespace=$2
    local max_wait=$3
    
    log_info "Waiting for pods with label 'app=$app_label' to be ready (max ${max_wait}s)..."
    
    if kubectl wait --for=condition=ready pod -l app="$app_label" \
        --namespace="$namespace" --timeout="${max_wait}s"; then
        log_success "Pods with label 'app=$app_label' are ready!"
        return 0
    else
        log_error "Pods with label 'app=$app_label' failed to become ready within ${max_wait}s"
        return 1
    fi
}

# Function to check Oracle database connectivity
check_oracle_health() {
    log_info "Checking Oracle database health..."
    
    # Get Oracle pod name
    local oracle_pod=$(kubectl get pods -n "$NAMESPACE" -l app=oracle-db -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
    
    if [ -z "$oracle_pod" ]; then
        log_error "Oracle pod not found"
        return 1
    fi
    
    # Check if Oracle is responding
    local retries=0
    local max_retries=30
    
    while [ $retries -lt $max_retries ]; do
        if kubectl exec -n "$NAMESPACE" "$oracle_pod" -- bash -c \
            "echo 'SELECT 1 FROM DUAL;' | sqlplus -s sys/Oracle123@localhost:1521/XE as sysdba" >/dev/null 2>&1; then
            log_success "Oracle database is healthy and accepting connections!"
            return 0
        fi
        
        log_info "Oracle not ready yet, waiting... (attempt $((retries + 1))/$max_retries)"
        sleep 10
        retries=$((retries + 1))
    done
    
    log_error "Oracle database health check failed after $max_retries attempts"
    return 1
}

# Function to check backend health
check_backend_health() {
    log_info "Checking backend service health..."
    
    # Get backend pod name
    local backend_pod=$(kubectl get pods -n "$NAMESPACE" -l app=money-keeper-backend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
    
    if [ -z "$backend_pod" ]; then
        log_error "Backend pod not found"
        return 1
    fi
    
    # Check if backend is responding
    local retries=0
    local max_retries=30
    
    while [ $retries -lt $max_retries ]; do
        if kubectl exec -n "$NAMESPACE" "$backend_pod" -- \
            curl -f http://localhost:8080/actuator/health >/dev/null 2>&1; then
            log_success "Backend service is healthy and responding!"
            return 0
        fi
        
        log_info "Backend not ready yet, waiting... (attempt $((retries + 1))/$max_retries)"
        sleep 10
        retries=$((retries + 1))
    done
    
    log_error "Backend service health check failed after $max_retries attempts"
    return 1
}

# Function to deploy Oracle
deploy_oracle() {
    log_info "Deploying Oracle database..."
    
    kubectl apply -f "$SCRIPT_DIR/oracle-deployment.yaml" -n "$NAMESPACE"
    
    # Wait for Oracle deployment to be available
    if ! wait_for_deployment "oracle-db" "$NAMESPACE" "$MAX_WAIT_TIME"; then
        log_error "Oracle deployment failed"
        return 1
    fi
    
    # Wait for Oracle pods to be ready
    if ! wait_for_pods "oracle-db" "$NAMESPACE" "$MAX_WAIT_TIME"; then
        log_error "Oracle pods failed to become ready"
        return 1
    fi
    
    # Check Oracle health
    if ! check_oracle_health; then
        log_error "Oracle health check failed"
        return 1
    fi
    
    log_success "Oracle database deployed and ready!"
}

# Function to deploy GitHub secret
deploy_github_secret() {
    log_info "Deploying GitHub container registry secret..."
    
    if kubectl get secret ghcr-secret -n "$NAMESPACE" >/dev/null 2>&1; then
        log_warning "GitHub secret already exists. Skipping creation."
    else
        kubectl apply -f "$SCRIPT_DIR/github-secret.yaml" -n "$NAMESPACE"
        log_success "GitHub secret deployed!"
    fi
}

# Function to deploy backend
deploy_backend() {
    log_info "Deploying backend service..."
    
    kubectl apply -f "$SCRIPT_DIR/backend-deployment.yaml" -n "$NAMESPACE"
    
    # Wait for backend deployment to be available
    if ! wait_for_deployment "money-keeper-backend" "$NAMESPACE" "$MAX_WAIT_TIME"; then
        log_error "Backend deployment failed"
        return 1
    fi
    
    # Wait for backend pods to be ready
    if ! wait_for_pods "money-keeper-backend" "$NAMESPACE" "$MAX_WAIT_TIME"; then
        log_error "Backend pods failed to become ready"
        return 1
    fi
    
    # Check backend health
    if ! check_backend_health; then
        log_error "Backend health check failed"
        return 1
    fi
    
    log_success "Backend service deployed and ready!"
}

# Function to deploy frontend
deploy_frontend() {
    log_info "Deploying frontend service..."
    
    kubectl apply -f "$SCRIPT_DIR/frontend-deployment.yaml" -n "$NAMESPACE"
    
    # Wait for frontend deployment to be available
    if ! wait_for_deployment "money-keeper-frontend" "$NAMESPACE" "$MAX_WAIT_TIME"; then
        log_error "Frontend deployment failed"
        return 1
    fi
    
    # Wait for frontend pods to be ready
    if ! wait_for_pods "money-keeper-frontend" "$NAMESPACE" "$MAX_WAIT_TIME"; then
        log_error "Frontend pods failed to become ready"
        return 1
    fi
    
    log_success "Frontend service deployed and ready!"
}

# Function to deploy ingress
deploy_ingress() {
    log_info "Deploying ingress controller..."
    
    kubectl apply -f "$SCRIPT_DIR/ingress.yaml" -n "$NAMESPACE"
    
    log_success "Ingress controller deployed!"
    
    # Show ingress information
    log_info "Ingress information:"
    kubectl get ingress -n "$NAMESPACE"
}

# Function to show deployment status
show_deployment_status() {
    log_info "Current deployment status:"
    echo
    echo "Pods:"
    kubectl get pods -n "$NAMESPACE" -o wide
    echo
    echo "Services:"
    kubectl get services -n "$NAMESPACE"
    echo
    echo "Deployments:"
    kubectl get deployments -n "$NAMESPACE"
    echo
    echo "Ingress:"
    kubectl get ingress -n "$NAMESPACE"
}

# Function to cleanup on failure
cleanup_on_failure() {
    log_error "Deployment failed. You can check the logs with:"
    echo "  kubectl logs -n $NAMESPACE -l app=oracle-db"
    echo "  kubectl logs -n $NAMESPACE -l app=money-keeper-backend"
    echo "  kubectl logs -n $NAMESPACE -l app=money-keeper-frontend"
    echo
    echo "To delete the deployment:"
    echo "  kubectl delete namespace $NAMESPACE"
}

# Main deployment function
main() {
    log_info "Starting Money Keeper deployment to Kubernetes..."
    log_info "Target namespace: $NAMESPACE"
    echo
    
    # Trap to handle cleanup on failure
    trap cleanup_on_failure ERR
    
    # Step 1: Create namespace
    create_namespace
    echo
    
    # Step 2: Deploy GitHub secret for image pulling
    deploy_github_secret
    echo
    
    # Step 3: Deploy Oracle database first
    deploy_oracle
    echo
    
    # Step 4: Deploy backend after Oracle is ready
    deploy_backend
    echo
    
    # Step 5: Deploy frontend after backend is ready
    deploy_frontend
    echo
    
    # Step 6: Deploy ingress
    deploy_ingress
    echo
    
    # Show final status
    show_deployment_status
    echo
    
    log_success "Money Keeper application deployed successfully!"
    log_info "You can access the application through the ingress endpoint."
    log_info "To get the ingress IP/hostname, run: kubectl get ingress -n $NAMESPACE"
}

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    log_error "kubectl is not installed or not in PATH"
    exit 1
fi

# Check if we can connect to Kubernetes cluster
if ! kubectl cluster-info &> /dev/null; then
    log_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    exit 1
fi

# Run main deployment
main "$@" 