#!/bin/bash

# Initialize git in the NeoSnipe directory
cd NeoSnipe
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Base NeoSnipe codebase

This commit represents the initial state of the NeoSnipe codebase before
consolidation with NeoSnipe_Backup. Part of the 14-day consolidation plan."

echo "Git repository initialized successfully in NeoSnipe directory"
echo "Next steps:"
echo "1. Create remote repository"
echo "2. Add remote origin"
echo "3. Push initial commit"