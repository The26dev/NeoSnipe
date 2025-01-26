#!/bin/bash

# Script to create backups of both NeoSnipe directories
# Usage: ./backup_script.sh

# Set timestamp for backup names
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create backup directory if it doesn't exist
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

# Backup Directory A (NeoSnipe)
echo "Creating backup of NeoSnipe directory..."
tar -czf "$BACKUP_DIR/NeoSnipe_$TIMESTAMP.tar.gz" ./NeoSnipe/

# Backup Directory B (NeoSnipe_Backup)
echo "Creating backup of NeoSnipe_Backup directory..."
tar -czf "$BACKUP_DIR/NeoSnipe_Backup_$TIMESTAMP.tar.gz" ./NeoSnipe_Backup/

echo "Backups completed successfully!"
echo "Backup files:"
echo "- $BACKUP_DIR/NeoSnipe_$TIMESTAMP.tar.gz"
echo "- $BACKUP_DIR/NeoSnipe_Backup_$TIMESTAMP.tar.gz"