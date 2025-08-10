#!/usr/bin/env bash
set -euo pipefail

NS="money-keeper"
SVC="money-keeper-frontend-service"
APP_LABEL="money-keeper-frontend"

# 1) Service phải là NodePort
type=$(kubectl -n "$NS" get svc "$SVC" -o jsonpath='{.spec.type}')
if [[ "$type" != "NodePort" ]]; then
  echo "Service $SVC không phải NodePort (type=$type)" >&2
  exit 1
fi

# 2) Lấy NodePort (ưu tiên port name=http, fallback port đầu tiên)
nodePort=$(kubectl -n "$NS" get svc "$SVC" -o jsonpath='{.spec.ports[?(@.name=="http")].nodePort}')
if [[ -z "${nodePort}" ]]; then
  nodePort=$(kubectl -n "$NS" get svc "$SVC" -o jsonpath='{.spec.ports[0].nodePort}')
fi
[[ -n "$nodePort" ]] || { echo "Không lấy được NodePort" >&2; exit 1; }

# 3) Lấy IP node đang chạy pod frontend (hostIP của pod Running)
nodeIP=$(kubectl -n "$NS" get pod -l app="$APP_LABEL" \
  --field-selector=status.phase=Running \
  -o jsonpath='{.items[0].status.hostIP}' 2>/dev/null || true)

# Fallback: InternalIP của node đầu tiên
if [[ -z "$nodeIP" ]]; then
  nodeIP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')
fi
[[ -n "$nodeIP" ]] || { echo "Không xác định được Node IP" >&2; exit 1; }

# 4) In CHỈ URL
echo "http://${nodeIP}:${nodePort}"
