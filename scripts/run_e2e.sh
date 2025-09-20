#!/bin/bash

# This script is intended to be sourced by the main start_all.sh script

echo "--- Running E2E Tests ---"
cd playwright-code-gen
npm install
npm run test:allure
cd ..
