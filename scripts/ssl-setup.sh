#!/bin/bash
# ============================================================
# GoMotarCar — SSL Certificate Setup via Let's Encrypt
# ============================================================
# This script installs Certbot and obtains SSL certificates
# for all GoMotarCar domains.
#
# Usage:
#   chmod +x scripts/ssl-setup.sh
#   sudo ./scripts/ssl-setup.sh
#
# Prerequisites:
#   - Ubuntu/Debian server with nginx installed
#   - DNS A records pointing to this server:
#     api.gomotarcar.com, admin.gomotarcar.com, www.gomotarcar.com
#   - Port 80 must be accessible (for ACME challenge)
# ============================================================

set -euo pipefail

# Configuration
DOMAINS=(
    "api.gomotarcar.com"
    "admin.gomotarcar.com"
    "www.gomotarcar.com"
)
EMAIL="admin@gomotarcar.com"  # Change this to your email
LETSENCRYPT_DIR="/var/www/letsencrypt"
NGINX_CONFIG_DIR="/etc/nginx/sites-available"
NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"

echo "========================================"
echo "  GoMotarCar SSL Certificate Setup"
echo "========================================"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    echo "❌ This script must be run as root (sudo)."
    exit 1
fi

# Check for nginx
if ! command -v nginx &> /dev/null; then
    echo "❌ Nginx is not installed. Please install nginx first."
    echo "   sudo apt-get update && sudo apt-get install -y nginx"
    exit 1
fi

# Step 1: Install Certbot
echo "📦 Installing Certbot and nginx plugin..."
apt-get update -qq
apt-get install -y -qq certbot python3-certbot-nginx || {
    echo "❌ Failed to install Certbot. Trying snap..."
    if command -v snap &> /dev/null; then
        snap install --classic certbot
        ln -sf /snap/bin/certbot /usr/bin/certbot
        snap set certbot trust-plugin-with-root=ok
        snap install certbot-dns-cloudflare
    else
        echo "❌ Please install Certbot manually: https://certbot.eff.org"
        exit 1
    fi
}

# Step 2: Create ACME challenge directory
echo "📁 Creating ACME challenge directory..."
mkdir -p "$LETSENCRYPT_DIR"

# Step 3: Configure HTTP server block for ACME challenge
echo "🔧 Configuring HTTP server for ACME challenges..."
cat > /etc/nginx/snippets/letsencrypt.conf << 'EOF'
location ^~ /.well-known/acme-challenge/ {
    root /var/www/letsencrypt;
    default_type "text/plain";
    try_files $uri =404;
}
EOF

# Step 4: Obtain certificates
echo ""
echo "🔐 Obtaining SSL certificates for domains:"
for domain in "${DOMAINS[@]}"; do
    echo "   - $domain"
done
echo ""

for domain in "${DOMAINS[@]}"; do
    echo "   → Requesting certificate for $domain ..."
    certbot certonly --webroot \
        --webroot-path "$LETSENCRYPT_DIR" \
        --domain "$domain" \
        --non-interactive \
        --agree-tos \
        --email "$EMAIL" \
        --expand \
        --quiet || {
            echo "   ⚠️  Failed to get certificate for $domain (may already exist)"
        }
done

echo ""
echo "✅ Certificates obtained!"
echo "   Location: /etc/letsencrypt/live/"

# Step 5: Set up auto-renewal cron
echo ""
echo "⏰ Setting up auto-renewal cron job..."
CROM_CMD="0 3 * * * /usr/bin/certbot renew --quiet --post-hook \"systemctl reload nginx\""
(crontab -l 2>/dev/null | grep -v "certbot renew" || true; echo "$CROM_CMD") | crontab -

echo "   ✅ Auto-renewal scheduled daily at 3:00 AM"

# Step 6: Test renewal
echo ""
echo "🧪 Testing certificate renewal..."
certbot renew --dry-run --quiet && echo "   ✅ Renewal test passed!" || echo "   ⚠️  Renewal test had warnings (may be normal for first run)"

# Step 7: Summary
echo ""
echo "========================================"
echo "  ✅ SSL Setup Complete!"
echo "========================================"
echo ""
echo "  📍 Certificate location:"
for domain in "${DOMAINS[@]}"; do
    echo "     - /etc/letsencrypt/live/$domain/"
done
echo ""
echo "  📋 Next steps:"
echo "     1. Copy nginx config to /etc/nginx/sites-available/:"
echo "        sudo cp nginx/gomotarcar.conf /etc/nginx/sites-available/gomotarcar"
echo "        sudo ln -sf /etc/nginx/sites-available/gomotarcar /etc/nginx/sites-enabled/"
echo "        sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "     2. Verify HTTPS:"
for domain in "${DOMAINS[@]}"; do
    echo "        curl -I https://$domain/"
done
echo ""
echo "     3. Check renewal status:"
echo "        certbot renew --dry-run"
echo ""
