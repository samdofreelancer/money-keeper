#!/bin/bash

# Check if running on Ubuntu
if [ -f /etc/os-release ]; then
    . /etc/os-release
    if [[ "$ID" != "ubuntu" ]]; then
        echo "Error: This script must be run on Ubuntu"
        exit 1
    fi
fi

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a command exists
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}Error: $1 is not installed${NC}"
        if [ "$2" ]; then
            echo -e "${YELLOW}Try installing it with: $2${NC}"
        fi
        exit 1
    fi
}

# Function to check if k3s/kubectl is available
check_k3s() {
    if ! command -v kubectl &> /dev/null; then
        echo -e "${YELLOW}kubectl not found. Installing k3s...${NC}"
        curl -sfL https://get.k3s.io | sh -
        # Wait for k3s to be ready
        sleep 10
        sudo chmod 644 /etc/rancher/k3s/k3s.yaml
        export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
    fi
}

# Check required commands
check_command "curl" "sudo apt install -y curl"
check_command "docker" "sudo apt install -y docker.io"

# Check k3s installation
check_k3s

# Check if GITHUB_TOKEN and GITHUB_EMAIL are provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage: ./deploy.sh <GITHUB_TOKEN> <GITHUB_EMAIL>${NC}"
    echo "Example: ./deploy.sh ghp_xxxxxxxxxxxx your.email@example.com"
    exit 1
fi

if [ -z "$2" ]; then
    echo -e "${YELLOW}GitHub email is required${NC}"
    echo "Example: ./deploy.sh ghp_xxxxxxxxxxxx your.email@example.com"
    exit 1
fi

GITHUB_TOKEN=$1
GITHUB_EMAIL=$2
GITHUB_USER="samdofreelancer"

# Function to wait for deployment
wait_for_deployment() {
    echo -e "Waiting for $1 deployment to be ready..."
    kubectl rollout status deployment/$1 --timeout=300s || {
        echo -e "${RED}Error: $1 deployment failed${NC}"
        echo -e "Checking pod logs:"
        kubectl logs -l app=$1 --tail=50
        exit 1
    }
}

echo -e "${GREEN}Setting up Kubernetes secrets and deployments...${NC}"

# Create namespace if it doesn't exist
kubectl create namespace money-keeper --dry-run=client -o yaml | kubectl apply -f -

# Step 1: Create GitHub Container Registry Secret
echo -e "${GREEN}1. Creating GitHub Container Registry Secret...${NC}"
kubectl create secret docker-registry ghcr-secret \
    --namespace money-keeper \
    --docker-server=ghcr.io \
    --docker-username=$GITHUB_USER \
    --docker-password=$GITHUB_TOKEN \
    --docker-email=$GITHUB_EMAIL \
    --dry-run=client -o yaml | kubectl apply -f -

# Step 2: Apply Backend Deployment
echo -e "${GREEN}2. Applying Backend Deployment...${NC}"
kubectl apply -f k8s/backend-deployment.yaml
wait_for_deployment "money-keeper-backend"

# Step 3: Apply Frontend Deployment
echo -e "${GREEN}3. Applying Frontend Deployment...${NC}"
kubectl apply -f k8s/frontend-deployment.yaml
wait_for_deployment "money-keeper-frontend"

# Step 4: Apply Ingress Configuration
echo -e "${GREEN}4. Applying Ingress Configuration...${NC}"
kubectl apply -f k8s/ingress.yaml

# Step 5: Display Status
echo -e "${GREEN}5. Deployment Status:${NC}"
echo -e "\nNamespace Resources:"
kubectl get all -n money-keeper

echo -e "\nIngress Status:"
kubectl get ingress -n money-keeper

echo -e "\nPod Logs:"
echo -e "${YELLOW}Backend Logs:${NC}"
kubectl logs -l app=money-keeper-backend --tail=20 -n money-keeper
echo -e "\n${YELLOW}Frontend Logs:${NC}"
kubectl logs -l app=money-keeper-frontend --tail=20 -n money-keeper

echo -e "\n${GREEN}Deployment complete!${NC}"
echo -e "To access the application, find your Ingress IP with:"
echo -e "${YELLOW}kubectl get ingress -n money-keeper${NC}"

# Add convenience aliases to .bashrc
if ! grep -q "money-keeper-aliases" ~/.bashrc; then
    echo -e "\n# money-keeper-aliases" >> ~/.bashrc
    echo "alias mk-status='kubectl get all -n money-keeper'" >> ~/.bashrc
    echo "alias mk-logs-backend='kubectl logs -l app=money-keeper-backend -n money-keeper --tail=100 -f'" >> ~/.bashrc
    echo "alias mk-logs-frontend='kubectl logs -l app=money-keeper-frontend -n money-keeper --tail=100 -f'" >> ~/.bashrc
    echo -e "${GREEN}Added helpful aliases to ~/.bashrc${NC}"
    echo "Run 'source ~/.bashrc' to use them now"
fi
