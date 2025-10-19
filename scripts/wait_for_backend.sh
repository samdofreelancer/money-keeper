#!/bin/bash

set -euo pipefail

echo "Waiting for Backend to be healthy..."

HEALTH_URL="http://localhost:8080/actuator/health"
MAX_TRIES=30
SLEEP_SECONDS=10

for i in $(seq 1 $MAX_TRIES); do
  echo "Attempt $i/$MAX_TRIES: curling $HEALTH_URL"
  if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
    echo "Backend is healthy"
    exit 0
  fi
  echo "Waiting for Backend... ($i/$MAX_TRIES)"
  sleep $SLEEP_SECONDS
done

echo "Backend failed to become healthy within $((MAX_TRIES * SLEEP_SECONDS / 60)) minutes"

# Try to gather diagnostics to help CI logs
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  echo "--- docker compose ps ---"
  docker compose ps || true
  echo "--- docker compose ps (all) ---"
  docker compose ps -a || true

  echo "--- docker compose logs backend (last 5m) ---"
  # Grab recent logs; --no-color makes logs easier to read in CI
  docker compose logs --no-color --since 5m backend || true

  echo "--- docker inspect backend (brief) ---"
  docker compose ps -q backend | xargs -r docker inspect --format '{{.Name}} {{.State.Status}} {{.State.ExitCode}} {{.State.Error}}' || true
else
  echo "docker or docker compose not found in PATH. Cannot collect container diagnostics."
fi

echo "Hint: check backend container logs and the image entrypoint. If the service crashes on startup the health endpoint will never respond."
exit 1
