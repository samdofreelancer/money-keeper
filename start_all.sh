#!/bin/bash

# Exit on any error
set -e

# --- Backend ---
echo "--- Ensuring backend is stopped before starting ---"
bash ./scripts/stop_backend.sh
bash ./scripts/start_backend.sh

# --- Frontend ---
echo ""
echo "--- Ensuring frontend is stopped before starting ---"
bash ./scripts/stop_frontend.sh
bash ./scripts/start_frontend.sh

# --- E2E Tests ---
echo ""
bash ./scripts/run_e2e.sh

# --- Final Status ---
echo ""
echo "--- Services are running in the background ---"
echo ""
echo "Backend running at: http://localhost:8080 (PID: $BACKEND_PID)"
echo "Frontend running at: http://localhost:5173 (PID: $FRONTEND_PID)"
echo ""
echo "You can stop services by running:"
echo "bash ./scripts/stop_backend.sh"
echo "bash ./scripts/stop_frontend.sh"