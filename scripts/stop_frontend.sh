#!/bin/bash

# Port for frontend
FRONTEND_PORT=5173
echo "Searching for process on port $FRONTEND_PORT..."
# Use PowerShell for a more reliable way to get the PID on Windows
FRONTEND_PID=$(powershell -Command "(Get-NetTCPConnection -LocalPort $FRONTEND_PORT -State Listen -ErrorAction SilentlyContinue).OwningProcess" | head -n 1)

if [ -n "$FRONTEND_PID" ]; then
    echo "Found frontend process with PID $FRONTEND_PID. Terminating..."
    # Use //PID to prevent Git Bash path conversion
    taskkill //PID $FRONTEND_PID //F
else
    echo "No frontend process found listening on port $FRONTEND_PORT."
fi
