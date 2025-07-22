#!/bin/bash

# WMS Consultant Agent - Production Deployment Script
# Usage: ./deploy.sh [port]

set -e

PORT=${1:-5000}
echo "🚀 Deploying WMS Consultant Agent on port $PORT..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version $NODE_VERSION detected. Please upgrade to Node.js 16+."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm run install-all

# Build React frontend
echo "🏗️  Building React frontend..."
cd client
npm run build
cd ..

# Copy build files to server
echo "📂 Copying build files to server..."
mkdir -p server/public
cp -r client/build/* server/public/

# Set up environment
echo "🔧 Setting up environment..."
cd server
if [ ! -f .env ]; then
    cp .env.example .env
    echo "NODE_ENV=production" >> .env
    echo "PORT=$PORT" >> .env
    echo "📝 Created .env file. Please configure API keys if needed."
fi

# Start server
echo "🚀 Starting production server on port $PORT..."
echo "Access your application at: http://localhost:$PORT"
echo "Health check: http://localhost:$PORT/api/health"
echo ""
echo "To run in background: NODE_ENV=production PORT=$PORT node server.js &"
echo "To stop: pkill -f 'node server.js'"
echo ""

# Check if port is available
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port $PORT is already in use. Choose a different port."
    echo "Usage: ./deploy.sh [port]"
    exit 1
fi

NODE_ENV=production PORT=$PORT node server.js