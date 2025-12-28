#!/bin/bash

# Money Keeper K8s Deployment Script for Linux/Mac
# This script deploys the complete Money Keeper application to Kubernetes

set -e

# Default values
NAMESPACE="money-keeper"
ORACLE_PASSWORD="oracle"
CLEANUP_FIRST=false

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
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Help function
show_help() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS]

Deploy Money Keeper to Kubernetes cluster.

OPTIONS:
    -n, --namespace NAMESPACE    Kubernetes namespace (default: money-keeper)
    -p, --password PASSWORD      Oracle password (default: oracle)
    -c, --cleanup                Delete existing namespace before deploying
    -h, --help                   Show this help message

EXAMPLES:
    $(basename "$0")                              # Deploy with defaults
    $(basename "$0") --cleanup                    # Deploy with cleanup first
    $(basename "$0") -n my-app --cleanup          # Deploy to custom namespace
    $(basename "$0") -p mypassword123             # Deploy with custom Oracle password

EOF
    exit 0
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -n|--namespace)
                NAMESPACE="$2"
                shift 2
                ;;
            -p|--password)
                ORACLE_PASSWORD="$2"
                shift 2
                ;;
            -c|--cleanup)
                CLEANUP_FIRST=true
                shift
                ;;
            -h|--help)
                show_help
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                ;;
        esac
    done
}

# Check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed"
        echo "Please install kubectl from https://kubernetes.io/docs/tasks/tools/"
        exit 1
    fi
    
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster"
        echo "Make sure your Kubernetes cluster is running"
        exit 1
    fi
    
    print_success "kubectl found: $(kubectl version --client --short 2>/dev/null | head -1)"
    print_success "Kubernetes cluster is accessible"
}

# Cleanup existing resources
cleanup_resources() {
    print_step "Cleaning up existing resources in namespace '$NAMESPACE'..."
    
    kubectl delete namespace "$NAMESPACE" --ignore-not-found=true
    
    # Wait for namespace deletion
    local max_attempts=30
    local attempts=0
    
    while kubectl get namespace "$NAMESPACE" &> /dev/null && [ $attempts -lt $max_attempts ]; do
        print_info "Waiting for namespace deletion... ($attempts/$max_attempts)"
        sleep 2
        ((attempts++))
    done
    
    print_success "Cleanup complete"
    sleep 5
}

# Create namespace
deploy_namespace() {
    print_header "Step 1: Create Namespace"
    print_step "Creating namespace '$NAMESPACE'..."
    
    kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
    
    print_success "Namespace created"
}

# Create Oracle secret
deploy_oracle_secret() {
    print_header "Step 2: Create Oracle Secret"
    print_step "Creating Oracle secret with password..."
    
    kubectl apply -f k8s/oracle-secret.yaml
    
    print_success "Secret created"
}

# Deploy Oracle StatefulSet
deploy_oracle() {
    print_header "Step 3: Deploy Oracle Database"
    print_step "Deploying Oracle StatefulSet..."
    
    kubectl apply -f k8s/oracle-statefulset.yaml
    
    print_success "Oracle StatefulSet deployed"
}

# Wait for Oracle to be ready
wait_for_oracle() {
    print_header "Step 4: Wait for Oracle to be Ready"
    print_step "Waiting for Oracle pod to be ready (this may take 2-3 minutes)..."
    print_info "Oracle is initializing the database, please be patient..."
    
    if kubectl wait --for=condition=ready pod -l app=oracle -n "$NAMESPACE" --timeout=300s 2>/dev/null; then
        print_success "Oracle is ready!"
    else
        print_error "Timeout: Oracle failed to become ready"
        echo "Checking Oracle pod status:"
        kubectl describe pod -n "$NAMESPACE" -l app=oracle
        exit 1
    fi
    
    sleep 10
}

# Create Flyway migrations ConfigMap
create_flyway_configmap() {
    print_header "Step 5: Create Flyway Migrations ConfigMap"
    print_step "Creating ConfigMap with migration files..."
    
    kubectl create configmap flyway-migrations \
        --from-file=backend/src/main/resources/db/migration/oracle/ \
        -n "$NAMESPACE" \
        --dry-run=client -o yaml | kubectl apply -f -
    
    print_success "ConfigMap created with migration files"
}

# Run Flyway job
run_flyway() {
    print_header "Step 6: Run Flyway Migrations"
    print_step "Running Flyway migration job..."
    
    kubectl apply -f k8s/flyway-job.yaml
    
    print_success "Flyway job submitted"
    
    print_step "Waiting for migrations to complete..."
    
    if kubectl wait --for=condition=complete job/flyway-migration -n "$NAMESPACE" --timeout=300s 2>/dev/null; then
        print_success "Migrations completed!"
    else
        print_error "Timeout: Flyway migrations did not complete"
        echo "Checking Flyway job logs:"
        kubectl logs -n "$NAMESPACE" job/flyway-migration
        exit 1
    fi
}

# Deploy backend
deploy_backend() {
    print_header "Step 7: Deploy Backend"
    print_step "Deploying backend application..."
    
    kubectl apply -f k8s/backend-deployment.yaml
    
    print_success "Backend deployment created"
    
    print_step "Waiting for backend pod to be ready (this may take 1-2 minutes)..."
    
    if kubectl wait --for=condition=ready pod -l app=money-keeper-backend -n "$NAMESPACE" --timeout=300s 2>/dev/null; then
        print_success "Backend is ready!"
    else
        print_error "Timeout: Backend failed to become ready"
        echo "Checking backend pod logs:"
        kubectl logs -n "$NAMESPACE" -l app=money-keeper-backend
        exit 1
    fi
}

# Create Nginx ConfigMap
create_nginx_configmap() {
    print_header "Step 8: Create Nginx Configuration"
    print_step "Creating ConfigMap for nginx configuration..."
    
    kubectl apply -f k8s/nginx-configmap.yaml
    
    print_success "Nginx ConfigMap created"
}

# Deploy frontend
deploy_frontend() {
    print_header "Step 9: Deploy Frontend"
    print_step "Deploying frontend application..."
    
    kubectl apply -f k8s/frontend-deployment.yaml
    
    print_success "Frontend deployment created"
    
    print_step "Waiting for frontend pod to be ready..."
    
    if kubectl wait --for=condition=ready pod -l app=money-keeper-frontend -n "$NAMESPACE" --timeout=300s 2>/dev/null; then
        print_success "Frontend is ready!"
    else
        print_error "Timeout: Frontend failed to become ready"
        echo "Checking frontend pod logs:"
        kubectl logs -n "$NAMESPACE" -l app=money-keeper-frontend
        exit 1
    fi
}

# Show deployment summary
show_summary() {
    print_header "Deployment Complete!"
    
    echo ""
    print_success "All resources deployed successfully!"
    
    echo ""
    print_info "Pod Status:"
    kubectl get pods -n "$NAMESPACE"
    
    echo ""
    print_info "Services:"
    kubectl get svc -n "$NAMESPACE"
    
    echo ""
    print_info "Deployments:"
    kubectl get deployments -n "$NAMESPACE"
}

# Show access instructions
show_access_instructions() {
    print_header "Access Your Application"
    
    echo ""
    echo -e "${YELLOW}To access the application, run these commands in separate terminals:${NC}"
    
    echo ""
    echo -e "${GREEN}Terminal 1 - Backend (http://localhost:8080):${NC}"
    echo "  kubectl port-forward -n $NAMESPACE svc/money-keeper-backend-service 8080:8080"
    
    echo ""
    echo -e "${GREEN}Terminal 2 - Frontend (http://localhost:5173):${NC}"
    echo "  kubectl port-forward -n $NAMESPACE svc/money-keeper-frontend-service 5173:80"
    
    echo ""
    echo -e "${YELLOW}📍 Access Points:${NC}"
    echo "  Frontend: http://localhost:5173"
    echo "  Backend API: http://localhost:8080"
    echo "  Health Check: http://localhost:8080/actuator/health"
    
    echo ""
    echo -e "${YELLOW}📋 Useful kubectl Commands:${NC}"
    echo "  View all resources: kubectl get all -n $NAMESPACE"
    echo "  View pod logs: kubectl logs -n $NAMESPACE <pod-name>"
    echo "  Describe pod: kubectl describe pod -n $NAMESPACE <pod-name>"
    echo "  Get pod details: kubectl get pods -n $NAMESPACE -o wide"
    echo "  Delete deployment: kubectl delete -f k8s/frontend-deployment.yaml"
    echo "  Clean up everything: kubectl delete namespace $NAMESPACE"
    
    echo ""
}

# Main deployment function
main() {
    parse_args "$@"
    
    print_header "Money Keeper Kubernetes Deployment"
    
    check_prerequisites
    
    if [ "$CLEANUP_FIRST" = true ]; then
        cleanup_resources
    fi
    
    deploy_namespace
    deploy_oracle_secret
    deploy_oracle
    wait_for_oracle
    create_flyway_configmap
    run_flyway
    deploy_backend
    create_nginx_configmap
    deploy_frontend
    show_summary
    show_access_instructions
    
    print_success "Deployment finished! You can now access your application."
}

# Run main function
main "$@"
