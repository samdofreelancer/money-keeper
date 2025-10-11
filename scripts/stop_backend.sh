#!/bin/bash

# Port for backend
BACKEND_PORT=8080
echo "Searching for process on port $BACKEND_PORT..."
# Use netstat to find the PID on the port
BACKEND_PID=$(netstat -ano 2>/dev/null | grep ":$BACKEND_PORT" | awk '{print $5}' | head -n 1)

if [ -n "$BACKEND_PID" ]; then
    echo "Found backend process with PID $BACKEND_PID. Terminating..."
    # Use //PID to prevent Git Bash path conversion
    taskkill //PID $BACKEND_PID //F
else
    echo "No backend process found listening on port $BACKEND_PORT."
fi
