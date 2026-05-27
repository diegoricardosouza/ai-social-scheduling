#!/bin/bash

# Sync time every 30 seconds in background
while true; do
  sudo /usr/local/bin/sync-time.sh > /dev/null 2>&1
  sleep 30
done &

SYNC_PID=$!

# Run dev server
yarn dev

# Kill sync loop when dev server stops
kill $SYNC_PID
