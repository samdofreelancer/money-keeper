#!/bin/bash

# Port for backend
BACKEND_PORT=8080
echo "Searching for process on port $BACKEND_PORT..."
# Use PowerShell for a more reliable way to get the PID on Windows
BACKEND_PID=$(powershell -Command "(Get-NetTCPConnection -LocalPort $BACKEND_PORT -State Listen -ErrorAction SilentlyContinue).OwningProcess" | head -n 1)

if [ -n "$BACKEND_PID" ]; then
    echo "Found backend process with PID $BACKEND_PID. Terminating..."
    # Use //PID to prevent Git Bash path conversion
    taskkill //PID $BACKEND_PID //F
else
    echo "No backend process found listening on port $BACKEND_PORT."
fi
