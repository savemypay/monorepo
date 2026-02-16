#!/bin/bash
set -euo pipefail
cd /home/ubuntu/backend

echo "[after_install] creating venv and installing dependencies"
apt-get update -y
apt-get install -y python3-venv python3-pip
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate
echo "[after_install] done"
