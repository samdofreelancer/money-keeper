#!/bin/bash

# Port for frontend
FRONTEND_PORT=5173
echo "Searching for process on port $FRONTEND_PORT..."
# Use netstat to find the PID on the port
FRONTEND_PID=$(netstat -ano 2>/dev/null | grep ":$FRONTEND_PORT" | awk '{print $5}' | head -n 1)

if [ -n "$FRONTEND_PID" ]; then
    echo "Found frontend process with PID $FRONTEND_PID. Terminating..."
    # Use //PID to prevent Git Bash path conversion
    taskkill //PID $FRONTEND_PID //F
else
    echo "No frontend process found listening on port $FRONTEND_PORT."
fi
