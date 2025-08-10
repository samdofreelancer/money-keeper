#!/usr/bin/env bash
# Deploy k8s manifests + wait readiness
set -Eeuo pipefail

# -------- Config (chỉnh nếu cần) --------------------------------------------
NS="${NS:-money-keeper}"

FRONTEND_NAME="${FRONTEND_NAME:-money-keeper-frontend}"
BACKEND_NAME="${BACKEND_NAME:-money-keeper-backend}"
ORACLE_LABEL="${ORACLE_LABEL:-app=oracle}"

# Path YAML theo thư mục của script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Files (tùy repo có/không có file nào đó)
NS_YAML="${NS_YAML:-$SCRIPT_DIR/namespace.yaml}"
SECRETS_YAML="${SECRETS_YAML:-$SCRIPT_DIR/secrets.yaml}"
CONFIGMAP_YAML="${CONFIGMAP_YAML:-$SCRIPT_DIR/configmap.yaml}"
ORACLE_YAML="${ORACLE_YAML:-$SCRIPT_DIR/oracle-deployment.yaml}"

FRONTEND_DEPLOY_YAML="${FRONTEND_DEPLOY_YAML:-$SCRIPT_DIR/frontend-deployment.yaml}"
FRONTEND_SVC_YAML="${FRONTEND_SVC_YAML:-$SCRIPT_DIR/frontend-service.yaml}"
FRONTEND_ING_YAML="${FRONTEND_ING_YAML:-$SCRIPT_DIR/frontend-ingress.yaml}"

BACKEND_DEPLOY_YAML="${BACKEND_DEPLOY_YAML:-$SCRIPT_DIR/backend-deployment.yaml}"
BACKEND_SVC_YAML="${BACKEND_SVC_YAML:-$SCRIPT_DIR/backend-service.yaml}"

# -------- Helpers ------------------------------------------------------------
die() { echo "❌ $*" >&2; exit 1; }
need_cmd() { command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"; }

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
  echo "⏳ Waiting for Oracle pod to be Ready..."
  kubectl wait --for=condition=ready pod -l "${ORACLE_LABEL}" -n "${NS}" --timeout=600s

  local pod
  pod="$(kubectl get pod -n "${NS}" -l "${ORACLE_LABEL}" -o jsonpath='{.items[0].metadata.name}')"
  echo "🔎 Verifying Oracle listener (port 1521) inside pod ${pod}..."
  for i in {1..60}; do
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
  echo "⏳ Waiting for deployment/${deploy} to become Available..."
  kubectl rollout status deployment/"${deploy}" -n "${NS}" --timeout=300s
  echo "📜 Showing live logs for deployment/${deploy} (30s)..."
  timeout 30s kubectl logs -n "${NS}" deploy/"${deploy}" -f --tail=200 || true
}

trap 'echo ""; echo "⚠️  Something went wrong. Quick checks:";
      echo "  - kubectl get pods -n ${NS}";
      echo "  - kubectl describe deploy/${FRONTEND_NAME} -n ${NS} || true";
      echo "  - kubectl describe deploy/${BACKEND_NAME} -n ${NS} || true";
      echo "  - kubectl get events -n ${NS} --sort-by=.lastTimestamp | tail -n 30";
' ERR

usage() {
  cat <<EOF
Usage: $(basename "$0") [--reset]

Options:
  --reset   Xóa namespace rồi deploy lại sạch.
            Mặc định: giữ namespace và apply cập nhật.
EOF
}

RESET=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --reset) RESET=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) die "Unknown arg: $1" ;;
  esac
done

need_cmd kubectl

echo "🚀 Deploying Money Keeper to k3s (namespace: ${NS})..."

# Namespace
if [[ $RESET -eq 1 ]]; then
  if kubectl get ns "${NS}" >/dev/null 2>&1; then
    echo "🧹 Deleting namespace '${NS}'..."
    kubectl delete ns "${NS}" --wait=true
    wait_for_namespace_gone "${NS}"
  fi
fi

if [[ -f "$NS_YAML" ]]; then
  echo "📦 Applying namespace.yaml ..."
  kubectl apply -f "$NS_YAML"
else
  echo "📦 Ensuring namespace exists ..."
  kubectl get ns "${NS}" >/dev/null 2>&1 || kubectl create ns "${NS}"
fi

# Secrets / ConfigMap (nếu có file)
[[ -f "$SECRETS_YAML" ]] && { echo "🔐 Applying secrets..."; kubectl apply -f "$SECRETS_YAML"; }
[[ -f "$CONFIGMAP_YAML" ]] && { echo "⚙️  Applying configmap..."; kubectl apply -f "$CONFIGMAP_YAML"; }

# Oracle (bắt buộc)
[[ -f "$ORACLE_YAML" ]] || die "Missing $ORACLE_YAML"
echo "🗄️  Deploying Oracle..."
kubectl apply -f "$ORACLE_YAML"

# Frontend
if [[ -f "$FRONTEND_DEPLOY_YAML" ]]; then
  echo "🎨 Deploying frontend..."
  kubectl apply -f "$FRONTEND_DEPLOY_YAML"
  [[ -f "$FRONTEND_SVC_YAML" ]] && kubectl apply -f "$FRONTEND_SVC_YAML"
  [[ -f "$FRONTEND_ING_YAML" ]] && kubectl apply -f "$FRONTEND_ING_YAML" || true
fi

# Đợi Oracle sẵn sàng trước khi backend lên
wait_for_oracle_ready

# Backend
if [[ -f "$BACKEND_DEPLOY_YAML" ]]; then
  echo "🔧 Deploying backend..."
  kubectl apply -f "$BACKEND_DEPLOY_YAML"
  [[ -f "$BACKEND_SVC_YAML" ]] && kubectl apply -f "$BACKEND_SVC_YAML"
fi

# Wait & logs
rollout_and_logs "$FRONTEND_NAME"
rollout_and_logs "$BACKEND_NAME"

echo "✅ Deployment complete!"
echo ""
echo "📋 Access (nếu có Ingress/hosts):"
echo "  Frontend: http://money-keeper.local"
echo "  Backend : http://money-keeper.local/api"
echo ""
echo "🔍 Quick status:"
echo "  kubectl get pods -n ${NS}"
echo "  kubectl get svc -n ${NS}"
echo "  kubectl get ingress -n ${NS}"
