#!/bin/bash
set -e

# Ensure we're in the backend directory
cd "$(dirname "$0")"

# Upgrade pip
pip install --upgrade pip

# Install requirements
pip install -r requirements.txt

echo "Build completed successfully!"

