#!/bin/bash

# Money Keeper k3s Deployment Script
set -e

echo "🚀 Starting Money Keeper deployment on k3s..."

# Create namespace
echo "📦 Creating namespace..."
kubectl apply -f namespace.yaml

# Create secrets (update with actual values)
echo "🔐 Creating secrets..."
kubectl apply -f secrets.yaml

# Create configmap
echo "⚙️  Creating configmap..."
kubectl apply -f configmap.yaml

# Deploy Oracle database
echo "🗄️  Deploying Oracle database..."
kubectl apply -f oracle-deployment.yaml

# Wait for Oracle to be ready
echo "⏳ Waiting for Oracle database to be ready..."
kubectl wait --for=condition=ready pod -l app=oracle -n money-keeper --timeout=300s

# Deploy backend
echo "🔧 Deploying backend..."
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml

# Deploy frontend
echo "🎨 Deploying frontend..."
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml
kubectl apply -f frontend-ingress.yaml

# Wait for deployments to be ready
echo "⏳ Waiting for deployments to be ready..."
kubectl wait --for=condition=available deployment/money-keeper-backend -n money-keeper --timeout=300s
kubectl wait --for=condition=available deployment/money-keeper-frontend -n money-keeper --timeout=300s

echo "✅ Deployment complete!"
echo ""
echo "📋 Access your application:"
echo "  Frontend: http://money-keeper.local"
echo "  Backend API: http://money-keeper.local/api"
echo ""
echo "🔍 Check status:"
echo "  kubectl get pods -n money-keeper"
echo "  kubectl get services -n money-keeper"
echo "  kubectl get ingress -n money-keeper"
