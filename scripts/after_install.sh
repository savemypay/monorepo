#!/bin/bash
set -euo pipefail
cd /home/ubuntu/backend

echo "[after_install] creating venv and installing dependencies"
mkdir -p /home/ubuntu/backend
chown -R ubuntu:ubuntu /home/ubuntu/backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate
echo "[after_install] done"
