#!/bin/bash
# ================================================================
# Live24Jam - VPS Update Script
# Jalankan: bash update.sh
# ================================================================

set -e

echo "🔄 Live24Jam - Updating from GitHub..."

# Navigate to project directory
cd /var/www/live24jam

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build frontend
echo "🔨 Building Next.js app..."
npm run build

# Restart services
echo "🔄 Restarting services..."
pm2 restart live24jam live24jam-api

# Show status
echo ""
echo "✅ Update complete!"
echo ""
pm2 status

echo ""
echo "🔗 Your site: http://$(hostname -I | awk '{print $1}')"
