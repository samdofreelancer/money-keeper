# Money Keeper Kubernetes Deployment

This directory contains Kubernetes manifests and deployment scripts for the Money Keeper application.

## Prerequisites

1. **Kubernetes Cluster**: You need access to a Kubernetes cluster (local or cloud-based)
2. **kubectl**: Kubernetes command-line tool must be installed and configured
3. **Container Images**: Backend and frontend images should be available in GitHub Container Registry

## Files Overview

- `deploy.sh` - Main deployment script that orchestrates the entire deployment
- `troubleshoot-k8s.sh` - Troubleshooting script for Kubernetes connectivity issues
- `oracle-deployment.yaml` - Oracle database deployment manifest
- `backend-deployment.yaml` - Backend service deployment manifest
- `frontend-deployment.yaml` - Frontend service deployment manifest
- `ingress.yaml` - Ingress configuration for external access
- `github-secret.yaml` - Secret for pulling images from GitHub Container Registry

## Quick Start

### 1. Troubleshoot Kubernetes Connection (if needed)

If you're having connectivity issues, run the troubleshooting script first:

```bash
./troubleshoot-k8s.sh
```

This script will:
- Check if kubectl is installed
- Verify kubeconfig configuration
- Test cluster connectivity
- Provide solutions for common issues

### 2. Configure GitHub Container Registry Access

Before deploying, you need to configure access to GitHub Container Registry. Edit `github-secret.yaml` and replace `BASE64_ENCODED_DOCKER_CONFIG` with your actual base64-encoded Docker config.

To create the Docker config:

```bash
# Create Docker config for GitHub Container Registry
echo -n '{"auths":{"ghcr.io":{"username":"your-github-username","password":"your-github-token","auth":"base64-of-username:token"}}}' | base64 -w 0
```

### 3. Deploy the Application

Run the main deployment script:

```bash
./deploy.sh
```

The script will automatically:
1. Create the `money-keeper` namespace (if it doesn't exist)
2. Deploy GitHub registry secret
3. Deploy Oracle database with persistent storage
4. Wait for Oracle to be ready and healthy
5. Deploy the backend service
6. Wait for backend to be ready and healthy
7. Deploy the frontend service
8. Configure ingress for external access

## Deployment Process

The deployment follows a strict sequence to ensure dependencies are met:

```
1. Namespace Creation
    ↓
2. GitHub Secret Deployment
    ↓
3. Oracle Database Deployment
    ↓ (wait for Oracle health check)
4. Backend Service Deployment
    ↓ (wait for backend health check)
5. Frontend Service Deployment
    ↓
6. Ingress Configuration
```

## Health Checks

The deployment script includes comprehensive health checks:

- **Oracle Database**: Tests SQL connectivity using `sqlplus`
- **Backend Service**: Tests HTTP health endpoint at `/actuator/health`
- **Kubernetes Resources**: Waits for deployments and pods to be ready

## Accessing the Application

After successful deployment, you can access the application through the ingress endpoint:

```bash
# Get the ingress details
kubectl get ingress -n money-keeper

# If using a local cluster (minikube), you might need to enable ingress
minikube addons enable ingress
```

## Monitoring and Troubleshooting

### Check Deployment Status

```bash
# Check all resources in the namespace
kubectl get all -n money-keeper

# Check pod logs
kubectl logs -n money-keeper -l app=oracle-db
kubectl logs -n money-keeper -l app=money-keeper-backend
kubectl logs -n money-keeper -l app=money-keeper-frontend
```

### Common Issues

1. **Image Pull Errors**: Ensure GitHub secret is properly configured
2. **Oracle Startup Issues**: Oracle may take several minutes to initialize
3. **Backend Connection Issues**: Check if Oracle is accessible from backend pods
4. **Ingress Not Working**: Ensure ingress controller is installed in your cluster

### Cleanup

To remove the entire deployment:

```bash
kubectl delete namespace money-keeper
```

## Environment-Specific Configurations

### Local Development (Minikube/Kind)

```bash
# Start minikube with sufficient resources
minikube start --memory=8192 --cpus=4

# Enable ingress addon
minikube addons enable ingress
```

### Cloud Providers

Make sure your cluster has:
- Sufficient resources (minimum 4GB RAM, 2 CPU cores)
- Ingress controller installed
- Persistent volume provisioner
- Access to pull images from GitHub Container Registry

## Container Images

The deployment uses these container images:
- Backend: `ghcr.io/samdofreelancer/money-keeper-backend:latest`
- Frontend: `ghcr.io/samdofreelancer/money-keeper-frontend:latest`
- Oracle: `container-registry.oracle.com/database/express:latest`

## Resource Requirements

### Minimum Cluster Requirements
- **CPU**: 2 cores
- **Memory**: 8GB RAM
- **Storage**: 20GB available storage

### Pod Resource Allocations
- **Oracle**: 2-4GB RAM, 0.5-1 CPU
- **Backend**: 0.5-1GB RAM, 0.25-0.5 CPU
- **Frontend**: 0.25-0.5GB RAM, 0.1-0.2 CPU

## Security Considerations

1. **GitHub Token**: Use a personal access token with only necessary permissions
2. **Oracle Password**: Change the default Oracle password in production
3. **Network Policies**: Consider implementing network policies for production deployments
4. **RBAC**: Ensure proper role-based access control is configured

## Support

If you encounter issues:
1. Run `./troubleshoot-k8s.sh` for connectivity diagnostics
2. Check pod logs for application-specific errors
3. Verify resource availability in your cluster
4. Ensure all prerequisites are met 