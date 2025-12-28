#!/bin/bash

# Money Keeper K8s Cleanup Script for Linux/Mac

set -e

# Default values
NAMESPACE="money-keeper"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
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
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Show help
show_help() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS]

Clean up Money Keeper Kubernetes resources.

OPTIONS:
    -n, --namespace NAMESPACE    Kubernetes namespace (default: money-keeper)
    -h, --help                   Show this help message

EXAMPLES:
    $(basename "$0")                      # Clean up default namespace
    $(basename "$0") -n my-app            # Clean up custom namespace

EOF
    exit 0
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            ;;
    esac
done

# Main cleanup
print_header "Money Keeper Kubernetes Cleanup"

print_step "Deleting namespace '$NAMESPACE' and all resources..."

kubectl delete namespace "$NAMESPACE" --ignore-not-found=true

print_step "Waiting for namespace deletion..."

local max_attempts=30
local attempts=0

while kubectl get namespace "$NAMESPACE" &> /dev/null && [ $attempts -lt $max_attempts ]; do
    print_info "Waiting... ($attempts/$max_attempts)"
    sleep 1
    ((attempts++))
done

print_success "Cleanup complete!"
print_info "All Money Keeper resources have been deleted."

echo ""
