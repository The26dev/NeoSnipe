#!/bin/bash

# Main execution script for setting up the consolidation environment

echo "Starting NeoSnipe consolidation setup process..."

# 1. Set permissions
echo "Setting script permissions..."
./set_permissions.sh

# 2. Create backups
echo "Creating backups of both directories..."
./backup_script.sh

# 3. Initialize repository
echo "Setting up git repository..."
./repository_setup.sh

echo "Initial setup phase completed!"