#!/bin/bash

# Port for frontend
FRONTEND_PORT=5173
echo "Searching for process on port $FRONTEND_PORT..."
# Function: try to find PID listening on a given port in a cross-platform way.
find_pid_on_port() {
    local port="$1"

    # Try ss (Linux) which has predictable output
        if command -v ss >/dev/null 2>&1; then
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
            netstat -ano 2>/dev/null | grep -E ":[0-9]+\b" | grep ":${port}\b" | awk '{print $NF}' | grep -E '^[0-9]+$' | grep -v '^0$' | head -n1
            if [ $? -eq 0 ] && [ -n "$(netstat -ano 2>/dev/null | grep -E ":[0-9]+\b" | grep ":${port}\b" | awk '{print $NF}' | grep -E '^[0-9]+$' | grep -v '^0$' | head -n1)" ]; then
                return
            fi

            netstat -tulpn 2>/dev/null | grep ":${port}\b" | awk '{print $NF}' | sed -E 's#/.*##' | grep -E '^[0-9]+$' | grep -v '^0$' | head -n1
            return
    fi

    # Could not find a suitable command
    return
}

echo "Searching for process on port $FRONTEND_PORT..."
FRONTEND_PID=$(find_pid_on_port "$FRONTEND_PORT")

if [ -n "$FRONTEND_PID" ]; then
        echo "Found frontend process with PID $FRONTEND_PID. Terminating..."
        if command -v taskkill >/dev/null 2>&1; then
            taskkill //PID "$FRONTEND_PID" //F
        else
            kill -9 "$FRONTEND_PID" 2>/dev/null || echo "Failed to kill PID $FRONTEND_PID"
        fi
else
        echo "No frontend process found listening on port $FRONTEND_PORT."
fi
