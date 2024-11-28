#!/bin/bash

# Load nvm (this works for both manual and automated nvm installations)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use Node.js 20 LTS (Latest LTS version)
echo "Switching to Node.js 20 LTS..."
nvm install 20 --lts
nvm use 20

# Verify Node.js version
echo "Using Node.js version: $(node -v)"

# Install root dependencies if they don't exist
if [ ! -d "node_modules" ]; then
    echo "Installing root dependencies..."
    npm install
fi

# Install project dependencies if needed
npm run install:all

# Start both servers
npm run dev 