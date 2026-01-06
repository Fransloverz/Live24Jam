#!/bin/bash

# ============================================
# Live24Jam - VPS Deployment Script
# Ubuntu 24.04
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

# 3. Install PM2 globally
echo ""
echo "📦 Step 3: Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    print_status "PM2 installed"
else
    print_warning "PM2 already installed"
fi

# 4. Install Nginx
echo ""
echo "📦 Step 4: Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl enable nginx
    sudo systemctl start nginx
    print_status "Nginx installed and started"
else
    print_warning "Nginx already installed"
fi

# 5. Clone or update repository
echo ""
echo "📦 Step 5: Setting up Live24Jam..."
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

# 6. Install dependencies
echo ""
echo "📦 Step 6: Installing dependencies..."
cd $APP_DIR
npm install
print_status "Dependencies installed"

# 7. Build the application
echo ""
echo "🔨 Step 7: Building application..."
npm run build
print_status "Build completed"

# 8. Setup PM2
echo ""
echo "🚀 Step 8: Starting with PM2..."
pm2 delete live24jam 2>/dev/null || true
pm2 start npm --name "live24jam" -- start
pm2 save
print_status "Application started with PM2"

# 9. Setup PM2 startup
echo ""
echo "⚙️ Step 9: Configuring auto-start..."
pm2 startup systemd -u $USER --hp /home/$USER
pm2 save
print_status "Auto-start configured"

# 10. Configure Nginx
echo ""
echo "🌐 Step 10: Configuring Nginx..."
sudo tee /etc/nginx/sites-available/live24jam > /dev/null <<EOF
server {
    listen 80;
    server_name _;

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
}
EOF

sudo ln -sf /etc/nginx/sites-available/live24jam /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
print_status "Nginx configured"

# 11. Configure firewall
echo ""
echo "🔒 Step 11: Configuring firewall..."
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
echo "Useful commands:"
echo "  pm2 status          - Check app status"
echo "  pm2 logs live24jam  - View logs"
echo "  pm2 restart live24jam - Restart app"
echo ""
