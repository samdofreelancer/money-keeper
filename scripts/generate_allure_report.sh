#!/bin/bash

REPORT_FOLDER=$1

if [ -z "$REPORT_FOLDER" ]; then
  echo "Usage: $0 <report_folder>"
  exit 1
fi

sudo chown -R runner:runner $REPORT_FOLDER/test-results

if [ -d "$REPORT_FOLDER" ]; then
  cd $REPORT_FOLDER
  npm ci
  npm run allure:generate
else
  echo "$REPORT_FOLDER directory not found"
  exit 1
fi
