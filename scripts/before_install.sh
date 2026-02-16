#!/bin/bash
echo Before Install
echo Before Install
set -euo pipefail
if [ -f "/home/ubuntu/backend/.env" ]; then
  cp /home/ubuntu/backend/.env /home/ubuntu/.env
fi
sudo rm -rf /home/ubuntu/backend/*
