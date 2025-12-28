#!/bin/bash
# Port Forwarding Script for Money Keeper Frontend
# Platform: Linux/Mac (Bash)
# Usage: ./k8s/port-forward-frontend.sh [-n namespace] [-p port] [-h]

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default values
NAMESPACE="money-keeper"
PORT="5173"
HELP=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -p|--port)
            PORT="$2"
            shift 2
            ;;
        -h|--help)
            HELP=true
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Show help if requested
if [ "$HELP" = true ]; then
    cat << EOF
${CYAN}Money Keeper - Frontend Port Forwarding${NC}
Platform: Linux/Mac (Bash)

USAGE:
  ./k8s/port-forward-frontend.sh [-n namespace] [-p port] [-h]

OPTIONS:
  -n, --namespace NAMESPACE    Kubernetes namespace (default: money-keeper)
  -p, --port PORT              Local port (default: 5173)
  -h, --help                   Show this help message

EXAMPLES:
  # Port forward to default namespace
  ./k8s/port-forward-frontend.sh

  # Port forward to custom namespace
  ./k8s/port-forward-frontend.sh -n custom-app

  # Use custom port
  ./k8s/port-forward-frontend.sh -p 3000

ACCESS POINTS (after running):
  - Frontend: http://localhost:$PORT

EOF
    exit 0
fi

echo -e "${CYAN}Money Keeper - Frontend Port Forwarding${NC}"
echo -e "${CYAN}Namespace: $NAMESPACE | Local Port: $PORT${NC}\n"

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}ERROR: kubectl is not installed or not in PATH${NC}"
    echo -e "${YELLOW}Please install kubectl: https://kubernetes.io/docs/tasks/tools/${NC}"
    exit 1
fi

# Check if namespace exists
if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
    echo -e "${RED}ERROR: Namespace '$NAMESPACE' not found${NC}"
    exit 1
fi

# Check if frontend service exists
if ! kubectl get svc -n "$NAMESPACE" money-keeper-frontend-service &> /dev/null; then
    echo -e "${RED}ERROR: Frontend service not found in namespace '$NAMESPACE'${NC}"
    exit 1
fi

echo -e "${GREEN}Frontend service found - OK${NC}\n"

# Kill any existing kubectl port-forward processes for this port
pkill -f "kubectl port-forward.*$PORT" 2>/dev/null || true
sleep 1

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Port Forwarding Started${NC}"
echo -e "${CYAN}========================================\n${NC}"

echo -e "${GREEN}ACCESS POINTS:${NC}"
echo -e "  - Frontend: http://localhost:$PORT\n"

echo -e "${YELLOW}Port forwarding frontend service...${NC}"
echo "Press Ctrl+C to stop port forwarding."

# Run port-forward in foreground
kubectl port-forward -n "$NAMESPACE" svc/money-keeper-frontend-service "$PORT:80"
