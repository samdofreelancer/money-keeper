#!/bin/bash

# This script is intended to be sourced by the main start_all.sh script

echo "--- Starting Frontend ---"
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!
cd ..

echo "--- Waiting for Frontend (port 5173) ---"
# Give Vite a moment to start up before polling
sleep 5

for i in $(seq 1 30); do
    # Use curl to check if the frontend server is responding
    if curl -sSf http://localhost:5173 > /dev/null; then
        echo "Frontend is up!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "Frontend failed to start after 150 seconds. Exiting."
        kill $BACKEND_PID
        kill $FRONTEND_PID
        exit 1
    fi
    echo "Attempt $i: Frontend not up yet. Waiting 5 seconds..."
    sleep 5
done
