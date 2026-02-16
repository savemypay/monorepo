#!/bin/bash
set -euo pipefail

APP_DIR="/home/ubuntu/backend"
VENV_DIR="$APP_DIR/venv"
LOG_FILE="$APP_DIR/uvicorn.log"
PID_FILE="$APP_DIR/uvicorn.pid"

cd "$APP_DIR"

# copy env if present at home
if [ -f "/home/ubuntu/.env" ]; then
  cp /home/ubuntu/.env "$APP_DIR/.env"
fi

source "$VENV_DIR/bin/activate"

# stop existing process if running
if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE") || true
  if [ -n "${PID:-}" ] && kill -0 "$PID" 2>/dev/null; then
    echo "Stopping existing uvicorn (pid $PID)"
    kill "$PID" || true
    sleep 2
  fi
fi

echo "Starting uvicorn..."
nohup uvicorn main:app --host 0.0.0.0 --port 8001 --root-path /smp > "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"
deactivate
echo "uvicorn started with pid $(cat $PID_FILE)"
