#!/bin/bash

# ============================================
# Live24Jam - VPS Deployment Script
# Ubuntu 24.04 + FFmpeg Streaming
# ============================================

set -e

echo "🚀 Starting Live24Jam Deployment..."
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# 1. Update system
echo ""
echo "📦 Step 1: Updating system packages..."
sudo apt update && sudo apt upgrade -y
print_status "System updated"

# 2. Install Node.js 20.x
echo ""
echo "📦 Step 2: Installing Node.js 20.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    print_status "Node.js installed: $(node -v)"
else
    print_warning "Node.js already installed: $(node -v)"
fi

# 3. Install FFmpeg
echo ""
echo "🎬 Step 3: Installing FFmpeg..."
if ! command -v ffmpeg &> /dev/null; then
    sudo apt install -y ffmpeg
    print_status "FFmpeg installed: $(ffmpeg -version | head -1)"
else
    print_warning "FFmpeg already installed: $(ffmpeg -version | head -1)"
fi

# 4. Install PM2 globally
echo ""
echo "📦 Step 4: Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    print_status "PM2 installed"
else
    print_warning "PM2 already installed"
fi

# 5. Install Nginx
echo ""
echo "📦 Step 5: Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl enable nginx
    sudo systemctl start nginx
    print_status "Nginx installed and started"
else
    print_warning "Nginx already installed"
fi

# 6. Clone or update repository
echo ""
echo "📦 Step 6: Setting up Live24Jam..."
APP_DIR="/var/www/live24jam"

if [ -d "$APP_DIR" ]; then
    print_warning "Directory exists, pulling latest changes..."
    cd $APP_DIR
    git pull origin main
else
    sudo mkdir -p /var/www
    sudo chown -R $USER:$USER /var/www
    git clone https://github.com/Fransloverz/Live24Jam.git $APP_DIR
    cd $APP_DIR
fi
print_status "Repository ready"

# 7. Create videos directory
echo ""
echo "📁 Step 7: Creating videos directory..."
mkdir -p $APP_DIR/videos
print_status "Videos directory created: $APP_DIR/videos"

# 8. Setup environment variables
echo ""
echo "⚙️ Step 8: Setting up environment..."
if [ ! -f "$APP_DIR/.env" ]; then
    cat > $APP_DIR/.env << EOF
API_PORT=3001
VIDEOS_DIR=$APP_DIR/videos
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF
    print_status "Environment file created"
else
    print_warning "Environment file already exists"
fi

# 9. Install dependencies
echo ""
echo "📦 Step 9: Installing dependencies..."
cd $APP_DIR
npm install
print_status "Dependencies installed"

# 10. Build the application
echo ""
echo "🔨 Step 10: Building application..."
npm run build
print_status "Build completed"

# 11. Setup PM2 for both frontend and API
echo ""
echo "🚀 Step 11: Starting services with PM2..."
pm2 delete live24jam 2>/dev/null || true
pm2 delete live24jam-api 2>/dev/null || true

# Start Next.js frontend
pm2 start npm --name "live24jam" -- start

# Start API server
pm2 start npm --name "live24jam-api" -- run server

pm2 save
print_status "Both services started with PM2"

# 12. Setup PM2 startup
echo ""
echo "⚙️ Step 12: Configuring auto-start..."
pm2 startup systemd -u $USER --hp /home/$USER
pm2 save
print_status "Auto-start configured"

# 13. Configure Nginx
echo ""
echo "🌐 Step 13: Configuring Nginx..."
sudo tee /etc/nginx/sites-available/live24jam > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # API Server
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/live24jam /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
print_status "Nginx configured"

# 14. Configure firewall
echo ""
echo "🔒 Step 14: Configuring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable
print_status "Firewall configured"

# Done!
echo ""
echo "============================================"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "============================================"
echo ""
echo "Your Live24Jam is now running at:"
echo -e "  ${GREEN}http://$(curl -s ifconfig.me)${NC}"
echo ""
echo "📁 Upload videos to: $APP_DIR/videos/"
echo ""
echo "Useful commands:"
echo "  pm2 status              - Check all services"
echo "  pm2 logs live24jam      - View frontend logs"
echo "  pm2 logs live24jam-api  - View API logs"
echo "  pm2 restart all         - Restart all services"
echo ""
echo "🎬 FFmpeg streaming ready!"
echo ""
