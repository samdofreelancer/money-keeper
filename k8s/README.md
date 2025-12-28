# Money Keeper - Kubernetes Deployment Guide

This guide explains how to deploy Money Keeper to a local Kubernetes cluster.

## Prerequisites

- **Kubernetes Cluster**: Docker Desktop Kubernetes or Minikube
- **kubectl**: Command-line tool for Kubernetes
- **Docker Desktop** (if using Docker Desktop Kubernetes)

### Check Prerequisites

```powershell
# Check kubectl version
kubectl version --client

# Check cluster info
kubectl cluster-info
```

## Quick Start - One Command Deployment

The easiest way to deploy is using the provided PowerShell script:

```powershell
# Navigate to the project directory
cd c:\Users\ADMIN\Documents\working\DDD\money-keeper

# Deploy everything
.\k8s\deploy-k8s.ps1

# Or with cleanup (removes old resources first)
.\k8s\deploy-k8s.ps1 --cleanup
```

The script will:
1. ✅ Create `money-keeper` namespace
2. ✅ Deploy Oracle database (StatefulSet)
3. ✅ Wait for Oracle to be healthy
4. ✅ Create Flyway migrations ConfigMap
5. ✅ Run Flyway migrations
6. ✅ Deploy backend (Spring Boot)
7. ✅ Wait for backend to be ready
8. ✅ Create Nginx configuration
9. ✅ Deploy frontend (Nginx)
10. ✅ Show access instructions

## Manual Deployment Steps

If you prefer to deploy manually:

### Step 1: Create Namespace
```powershell
kubectl create namespace money-keeper
```

### Step 2: Create Oracle Secret
```powershell
kubectl apply -f k8s/oracle-secret.yaml
```

### Step 3: Deploy Oracle Database
```powershell
kubectl apply -f k8s/oracle-statefulset.yaml

# Wait for Oracle to be ready (2-3 minutes)
kubectl wait --for=condition=ready pod -l app=oracle -n money-keeper --timeout=300s
```

### Step 4: Create Flyway Migrations ConfigMap
```powershell
kubectl create configmap flyway-migrations `
  --from-file=backend/src/main/resources/db/migration/oracle/ `
  -n money-keeper `
  --dry-run=client -o yaml | kubectl apply -f -
```

### Step 5: Run Flyway Migrations
```powershell
kubectl apply -f k8s/flyway-job.yaml

# Wait for migrations to complete
kubectl wait --for=condition=complete job/flyway-migration -n money-keeper --timeout=300s
```

### Step 6: Deploy Backend
```powershell
kubectl apply -f k8s/backend-deployment.yaml

# Wait for backend to be ready
kubectl wait --for=condition=ready pod -l app=money-keeper-backend -n money-keeper --timeout=300s
```

### Step 7: Create Nginx Configuration
```powershell
kubectl apply -f k8s/nginx-configmap.yaml
```

### Step 8: Deploy Frontend
```powershell
kubectl apply -f k8s/frontend-deployment.yaml

# Wait for frontend to be ready
kubectl wait --for=condition=ready pod -l app=money-keeper-frontend -n money-keeper --timeout=300s
```

## Access the Application

### Setup Port Forwarding

Open two terminal windows:

**Terminal 1 - Backend (Port 8080):**
```powershell
kubectl port-forward -n money-keeper svc/money-keeper-backend-service 8080:8080
```

**Terminal 2 - Frontend (Port 5173):**
```powershell
kubectl port-forward -n money-keeper svc/money-keeper-frontend-service 5173:80
```

### Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/actuator/health

## Useful kubectl Commands

```powershell
# View all resources
kubectl get all -n money-keeper

# View pods with more details
kubectl get pods -n money-keeper -o wide

# View pod logs
kubectl logs -n money-keeper <pod-name>

# Tail pod logs
kubectl logs -n money-keeper <pod-name> -f

# Describe a pod (for troubleshooting)
kubectl describe pod -n money-keeper <pod-name>

# Get resource details
kubectl get deployment -n money-keeper
kubectl get statefulset -n money-keeper
kubectl get services -n money-keeper
kubectl get configmaps -n money-keeper
kubectl get jobs -n money-keeper

# Execute command in pod
kubectl exec -it -n money-keeper <pod-name> -- /bin/bash

# View deployment events
kubectl get events -n money-keeper
```

## Troubleshooting

### Oracle Pod Not Ready

Check logs:
```powershell
kubectl logs -n money-keeper oracle-0
```

Wait longer (Oracle takes 2-3 minutes to initialize):
```powershell
Start-Sleep -Seconds 120
kubectl get pods -n money-keeper
```

### Flyway Migration Failed

Check Flyway job logs:
```powershell
kubectl logs -n money-keeper job/flyway-migration
```

View job details:
```powershell
kubectl describe job -n money-keeper flyway-migration
```

### Backend Pod CrashLoopBackOff

Check backend logs:
```powershell
kubectl logs -n money-keeper -l app=money-keeper-backend
```

Check if Oracle is ready and Flyway migrations completed:
```powershell
kubectl get pods -n money-keeper
kubectl get job -n money-keeper
```

### Frontend Not Connecting to Backend

Check frontend logs:
```powershell
kubectl logs -n money-keeper -l app=money-keeper-frontend
```

Verify nginx config is correct:
```powershell
kubectl get configmap -n money-keeper nginx-config -o yaml
```

## Cleanup

To remove all resources:

```powershell
# Using cleanup script
.\k8s\cleanup-k8s.ps1

# Or manually
kubectl delete namespace money-keeper
```

## File Structure

```
k8s/
├── deploy-k8s.ps1                  # Main deployment script (PowerShell)
├── deploy-local.ps1                # Alternative deployment script
├── cleanup-k8s.ps1                 # Cleanup script
├── oracle-secret.yaml              # Oracle password secret
├── oracle-statefulset.yaml         # Oracle database (StatefulSet)
├── flyway-job.yaml                 # Flyway migration job
├── nginx-configmap.yaml            # Nginx configuration
├── backend-deployment.yaml         # Backend (Spring Boot) deployment
├── frontend-deployment.yaml        # Frontend (Nginx) deployment
├── ingress.yaml                    # Kubernetes Ingress (optional)
├── github-secret.yaml              # GitHub registry secret (optional)
└── README.md                       # This file
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Kubernetes Cluster                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │       money-keeper Namespace                     │   │
│  │                                                  │   │
│  │  ┌──────────────┐   ┌──────────────────────┐   │   │
│  │  │   Oracle     │   │   Frontend (Nginx)   │   │   │
│  │  │              │   │  - 5173:80           │   │   │
│  │  │  StatefulSet │◄──┤  - ConfigMap        │   │   │
│  │  │  Port: 1521  │   │    (nginx.conf)      │   │   │
│  │  │              │   │                      │   │   │
│  │  └──────────────┘   └──────────────────────┘   │   │
│  │       ▲                        │                │   │
│  │       │                        │                │   │
│  │   Flyway                    Proxy /api          │   │
│  │   Job                          │                │   │
│  │   (migrations)                 ▼                │   │
│  │       │                  ┌──────────────────┐  │   │
│  │       └─────────────────►│   Backend        │  │   │
│  │                          │ (Spring Boot)    │  │   │
│  │                          │ Port: 8080       │  │   │
│  │                          │ ci profile       │  │   │
│  │                          └──────────────────┘  │   │
│  │                                                  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Environment Variables

### Backend
- `SPRING_PROFILES_ACTIVE`: ci (Oracle database)
- `SPRING_DATASOURCE_URL`: jdbc:oracle:thin:@oracle:1521/XEPDB1
- `SPRING_DATASOURCE_USERNAME`: system
- `SPRING_DATASOURCE_PASSWORD`: oracle (from secret)
- `SPRING_FLYWAY_ENABLED`: false (migrations already run)

### Frontend
- `VITE_BACKEND_HOST`: money-keeper-backend-service
- `VITE_API_URL`: http://money-keeper-backend-service:8080/api

## Notes

- Oracle initialization takes 2-3 minutes on first deployment
- All passwords are stored in Kubernetes secrets
- Persistent storage is used for Oracle data
- Health checks are configured for all services
- Nginx proxies API requests to the backend
