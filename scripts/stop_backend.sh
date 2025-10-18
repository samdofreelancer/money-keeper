#!/bin/bash

# Port for backend
BACKEND_PORT=8080
echo "Searching for process on port $BACKEND_PORT..."
# Function: try to find PID listening on a given port in a cross-platform way.
find_pid_on_port() {
    local port="$1"

    # Try ss (Linux) which has predictable output
        if command -v ss >/dev/null 2>&1; then
            # -l: listening, -n: numeric, -p: show process
            ss -lntp 2>/dev/null | awk -v p=":${port}$" '$4 ~ p { if ($7 ~ /pid=/) { match($7, /pid=([0-9]+)/, m); print m[1] } }' | grep -E '^[0-9]+$' | grep -v '^0$' | head -n1
            return
        fi

    # Try lsof (macOS/Linux)
        if command -v lsof >/dev/null 2>&1; then
            lsof -iTCP:"${port}" -sTCP:LISTEN -t 2>/dev/null | grep -E '^[0-9]+$' | grep -v '^0$' | head -n1
            return
        fi

    # Fallback to netstat with robust parsing across variants
    if command -v netstat >/dev/null 2>&1; then
        # On Windows (Git Bash), `netstat -ano` shows PID in the last column
        # On many Linux distros `netstat -tulpn` shows PID/Program in last column
        # We try multiple formats to be resilient.
        # Try Windows-style output first
            netstat -ano 2>/dev/null | grep -E ":[0-9]+\b" | grep ":${port}\b" | awk '{print $NF}' | grep -E '^[0-9]+$' | grep -v '^0$' | head -n1
            if [ $? -eq 0 ] && [ -n "$(netstat -ano 2>/dev/null | grep -E ":[0-9]+\b" | grep ":${port}\b" | awk '{print $NF}' | grep -E '^[0-9]+$' | grep -v '^0$' | head -n1)" ]; then
                return
            fi

            # Try Linux `netstat -tulpn` style where PID/Program is in last column like "1234/java"
            netstat -tulpn 2>/dev/null | grep ":${port}\b" | awk '{print $NF}' | sed -E 's#/.*##' | grep -E '^[0-9]+$' | grep -v '^0$' | head -n1
        return
    fi

    # Could not find a suitable command
    return
}

echo "Searching for process on port $BACKEND_PORT..."
BACKEND_PID=$(find_pid_on_port "$BACKEND_PORT")

if [ -n "$BACKEND_PID" ]; then
        echo "Found backend process with PID $BACKEND_PID. Terminating..."
        # Detect Windows (running under cmd/powershell) by presence of taskkill
        if command -v taskkill >/dev/null 2>&1; then
            # Use //PID to prevent Git Bash path conversion when calling taskkill
            taskkill //PID "$BACKEND_PID" //F
        else
            # Unix-like kill
            kill -9 "$BACKEND_PID" 2>/dev/null || echo "Failed to kill PID $BACKEND_PID"
        fi
else
        echo "No backend process found listening on port $BACKEND_PORT."
fi
