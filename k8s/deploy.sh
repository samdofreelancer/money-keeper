#!/usr/bin/env bash
# Money Keeper k3s Deployment Script (enhanced)
set -Eeuo pipefail

NS="money-keeper"
FRONTEND_NAME="money-keeper-frontend"
BACKEND_NAME="money-keeper-backend"
ORACLE_LABEL="app=oracle"

FRONTEND_IMG="money-keeper-frontend:latest"
BACKEND_IMG="money-keeper-backend:latest"
FRONTEND_TAR="/tmp/money-keeper-frontend.tar"
BACKEND_TAR="/tmp/money-keeper-backend.tar"

# Adjust these if your repo layout differs
FRONTEND_DIR="../frontend"
BACKEND_DIR="../backend"

# ---- Helpers ---------------------------------------------------------------
die() { echo "❌ $*" >&2; exit 1; }

trap 'echo ""; echo "⚠️  Something went wrong. Quick checks:";
      echo "  - kubectl get pods -n ${NS}";
      echo "  - kubectl describe deploy/${FRONTEND_NAME} -n ${NS} || true";
      echo "  - kubectl describe deploy/${BACKEND_NAME} -n ${NS} || true";
      echo "  - kubectl get events -n ${NS} --sort-by=.lastTimestamp | tail -n 30";
' ERR

need_cmd() { command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"; }

import_image_into_k3s() {
  local tar="$1"
  if command -v k3s >/dev/null 2>&1; then
    echo "📦 Importing image via 'k3s ctr'..."
    sudo k3s ctr images import "$tar"
  elif command -v ctr >/dev/null 2>&1; then
    echo "📦 Importing image via 'ctr -n k8s.io'..."
    sudo ctr -n k8s.io images import "$tar"
  else
    die "Neither 'k3s' nor 'ctr' found to import images into containerd."
  fi
}

wait_for_namespace_gone() {
  local ns="$1"
  echo "⏳ Waiting for namespace '${ns}' to terminate..."
  for i in {1..120}; do
    if ! kubectl get ns "$ns" >/dev/null 2>&1; then
      echo "✅ Namespace '${ns}' fully removed."
      return 0
    fi
    sleep 2
  done
  die "Namespace '${ns}' did not terminate in time."
}

wait_for_oracle_ready() {
  echo "⏳ Waiting for Oracle pod to be Ready (K8s condition)..."
  kubectl wait --for=condition=ready pod -l "${ORACLE_LABEL}" -n "${NS}" --timeout=600s

  # Extra: verify listener port 1521 inside the pod (best-effort)
  local pod
  pod="$(kubectl get pod -n "${NS}" -l "${ORACLE_LABEL}" -o jsonpath='{.items[0].metadata.name}')"
  echo "🔎 Verifying Oracle listener (port 1521) inside pod ${pod}..."
  for i in {1..60}; do
    # Try bash /dev/tcp trick
    if kubectl -n "${NS}" exec "${pod}" -- bash -lc 'exec 3<>/dev/tcp/127.0.0.1/1521' 2>/dev/null; then
      echo "✅ Oracle listener is accepting connections."
      return 0
    fi
    sleep 5
  done
  echo "⚠️  Could not confirm listener with /dev/tcp, but pod is Ready. Continuing..."
}

rollout_and_logs() {
  local deploy="$1"
  local ns="$2"
  local timeout="${3:-300s}"
  echo "⏳ Waiting for deployment/${deploy} to become Available..."
  kubectl rollout status deployment/"${deploy}" -n "${ns}" --timeout="${timeout}"

  echo "📜 Showing live logs for deployment/${deploy} (30s)..."
  timeout 30s kubectl logs -n "${ns}" deploy/"${deploy}" -f --tail=200 || true
}

# ---- Pre-flight ------------------------------------------------------------
need_cmd kubectl
need_cmd docker

echo "🚀 Starting Money Keeper deployment on k3s..."

# If namespace exists -> delete it first
if kubectl get ns "${NS}" >/dev/null 2>&1; then
  echo "🧹 Namespace '${NS}' exists. Deleting it first..."
  kubectl delete ns "${NS}" --wait=true
  wait_for_namespace_gone "${NS}"
fi

# Create namespace
echo "📦 Creating namespace..."
kubectl apply -f namespace.yaml

# Create secrets
echo "🔐 Creating secrets..."
kubectl apply -f secrets.yaml

# Create configmap
echo "⚙️  Creating configmap..."
kubectl apply -f configmap.yaml

# Deploy Oracle database
echo "🗄️  Deploying Oracle database..."
kubectl apply -f oracle-deployment.yaml

# ---------------- Frontend: build -> import -> deploy -----------------------
echo "🎨 Building Frontend image: ${FRONTEND_IMG}"
pushd "${FRONTEND_DIR}" >/dev/null
docker build --build-arg VITE_API_BASE_URL=/api -t "${FRONTEND_IMG}" .
docker save "${FRONTEND_IMG}" -o "${FRONTEND_TAR}"
popd >/dev/null

echo "📥 Importing Frontend image into k3s/containerd..."
import_image_into_k3s "${FRONTEND_TAR}"
rm -f "${FRONTEND_TAR}"

echo "🎨 Deploying frontend (manifests)..."
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml
# Ingress may be optional in your env; ignore error if file missing or CRD not present
kubectl apply -f frontend-ingress.yaml 2>/dev/null || true

# ---------------- Backend: build -> import -> wait DB -> deploy ------------
echo "🔧 Building Backend image: ${BACKEND_IMG}"
pushd "${BACKEND_DIR}" >/dev/null
docker build -t "${BACKEND_IMG}" .
docker save "${BACKEND_IMG}" -o "${BACKEND_TAR}"
popd >/dev/null

echo "📥 Importing Backend image into k3s/containerd..."
import_image_into_k3s "${BACKEND_TAR}"
rm -f "${BACKEND_TAR}"

echo "🔎 Checking Oracle DB readiness before deploying backend..."
wait_for_oracle_ready

echo "🔧 Deploying backend (manifests)..."
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml

# ---------------- Wait for deployments & show logs --------------------------
rollout_and_logs "${FRONTEND_NAME}" "${NS}" "300s"
rollout_and_logs "${BACKEND_NAME}" "${NS}" "300s"

echo "✅ Deployment complete!"
echo ""
echo "📋 Access your application (if Ingress/hosts are configured):"
echo "  Frontend: http://money-keeper.local"
echo "  Backend API: http://money-keeper.local/api"
echo ""
echo "🔍 Quick status:"
echo "  kubectl get pods -n ${NS}"
echo "  kubectl get svc -n ${NS}"
echo "  kubectl get ingress -n ${NS}"
