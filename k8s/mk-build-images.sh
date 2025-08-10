#!/usr/bin/env bash
# Build + import images into k3s/containerd
set -Eeuo pipefail

# -------- Config (chỉnh nếu cần) --------------------------------------------
FRONTEND_DIR="${FRONTEND_DIR:-../frontend}"
BACKEND_DIR="${BACKEND_DIR:-../backend}"

FRONTEND_IMG="${FRONTEND_IMG:-money-keeper-frontend:latest}"
BACKEND_IMG="${BACKEND_IMG:-money-keeper-backend:latest}"

# Build-arg cho frontend
VITE_API_BASE_URL="${VITE_API_BASE_URL:-/api}"

# Mặc định build cả hai. Có thể chỉ định --only frontend|backend
ONLY="${ONLY:-}"

# -------- Helpers ------------------------------------------------------------
die() { echo "❌ $*" >&2; exit 1; }
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

usage() {
  cat <<EOF
Usage: $(basename "$0") [--only frontend|backend] [--no-import] [--api-base-url URL]

Options:
  --only frontend|backend   Chỉ build 1 phần
  --no-import               Không import vào k3s (chỉ build + save tar)
  --api-base-url URL        Gán build-arg cho frontend (mặc định: /api)
EOF
}

# -------- Args ----------------------------------------------------------------
IMPORT=1
while [[ $# -gt 0 ]]; do
  case "$1" in
    --only) ONLY="${2:-}"; shift 2 ;;
    --no-import) IMPORT=0; shift ;;
    --api-base-url) VITE_API_BASE_URL="${2:-/api}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) die "Unknown arg: $1";;
  esac
done

need_cmd docker

DOCKER_BUILDKIT=1

# -------- Build Frontend ------------------------------------------------------
build_frontend() {
  echo "🎨 Building Frontend image: ${FRONTEND_IMG}"
  [[ -d "$FRONTEND_DIR" ]] || die "Frontend dir not found: $FRONTEND_DIR"
  pushd "$FRONTEND_DIR" >/dev/null
  docker build --build-arg VITE_API_BASE_URL="$VITE_API_BASE_URL" -t "$FRONTEND_IMG" .
  local FTAR; FTAR="$(mktemp -p /tmp mk-frontend-XXXXXX.tar)"
  docker save "$FRONTEND_IMG" -o "$FTAR"
  popd >/dev/null

  if [[ $IMPORT -eq 1 ]]; then
    import_image_into_k3s "$FTAR"
  fi
  rm -f "$FTAR"
  echo "✅ Frontend image ready."
}

# -------- Build Backend -------------------------------------------------------
build_backend() {
  echo "🔧 Building Backend image: ${BACKEND_IMG}"
  [[ -d "$BACKEND_DIR" ]] || die "Backend dir not found: $BACKEND_DIR"
  pushd "$BACKEND_DIR" >/dev/null
  docker build -t "$BACKEND_IMG" .
  local BTAR; BTAR="$(mktemp -p /tmp mk-backend-XXXXXX.tar)"
  docker save "$BACKEND_IMG" -o "$BTAR"
  popd >/dev/null

  if [[ $IMPORT -eq 1 ]]; then
    import_image_into_k3s "$BTAR"
  fi
  rm -f "$BTAR"
  echo "✅ Backend image ready."
}

case "$ONLY" in
  "")          build_frontend; build_backend ;;
  frontend)    build_frontend ;;
  backend)     build_backend ;;
  *)           die "Invalid --only value: $ONLY" ;;
esac

echo "🎉 Done."
