#!/bin/bash
set -euo pipefail

APP_DIR="/home/ubuntu/backend"

cd "$APP_DIR"

# copy env if present at home
if [ -f "/home/ubuntu/.env" ]; then
  cp /home/ubuntu/.env "$APP_DIR/.env"
fi

echo "Restarting smp-app service..."
sudo service smp-app restart
echo "smp-app service restarted"
