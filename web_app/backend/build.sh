#!/bin/bash
set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Change to backend directory (works whether called from root or backend dir)
if [ -f "$SCRIPT_DIR/requirements.txt" ]; then
    cd "$SCRIPT_DIR"
elif [ -f "web_app/backend/requirements.txt" ]; then
    cd web_app/backend
else
    echo "ERROR: Could not find requirements.txt"
    echo "Current directory: $(pwd)"
    echo "Script directory: $SCRIPT_DIR"
    ls -la
    exit 1
fi

echo "Building from directory: $(pwd)"
echo "Contents:"
ls -la

# Upgrade pip
pip install --upgrade pip

# Install requirements
pip install -r requirements.txt

echo "Build completed successfully!"

