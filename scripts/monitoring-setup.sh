#!/bin/bash
# ============================================================
# GoMotarCar — Monitoring & Observability Setup
# ============================================================
# Configures error tracking (Sentry), process monitoring (PM2),
# and provides instructions for uptime/APM tools.
#
# Usage:
#   chmod +x scripts/monitoring-setup.sh
#   ./scripts/monitoring-setup.sh
# ============================================================

set -euo pipefail

echo "========================================"
echo "  GoMotarCar Monitoring Setup"
echo "========================================"
echo ""

# ============================================================
# 1. Sentry Error Tracking
# ============================================================
echo "📦 1. Sentry Error Tracking"
echo "---------------------------"

if command -v npm &> /dev/null; then
    echo "Installing @sentry/node..."
    cd server
    npm install @sentry/node @sentry/profiling-node 2>&1 | tail -3 || {
        echo "⚠️  Could not install Sentry packages. You can install manually:"
        echo "   cd server && npm install @sentry/node @sentry/profiling-node"
    }
    cd ..
else
    echo "⚠️  npm not found — install Sentry manually:"
    echo "   cd server && npm install @sentry/node @sentry/profiling-node"
fi

echo ""
echo "To enable Sentry, add the following to your server/.env:"
echo ""
echo "  SENTRY_DSN=https://<your-dsn>@o<org>.ingest.sentry.io/<project>"
echo "  SENTRY_ENVIRONMENT=production"
echo "  SENTRY_TRACES_SAMPLE_RATE=0.1"
echo ""
echo "Then uncomment the Sentry initialization in server/src/app.js"
echo ""

# ============================================================
# 2. PM2 Process Management
# ============================================================
echo "📦 2. PM2 Process Manager"
echo "--------------------------"

if command -v pm2 &> /dev/null; then
    echo "✅ PM2 is already installed."
else
    echo "Installing PM2 globally..."
    npm install -g pm2 2>&1 | tail -3
fi

# Create PM2 ecosystem config
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'gomotarcar-api',
    script: 'src/index.js',
    cwd: './server',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
    },
    env_file: './server/.env',
    max_memory_restart: '1G',
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    time: true,
    watch: false,
    max_restarts: 10,
    restart_delay: 5000,
    listen_timeout: 3000,
    kill_timeout: 5000,
    shutdown_with_message: true,
  }]
};
EOF

echo "Created PM2 ecosystem config: ecosystem.config.js"
echo ""
echo "To start with PM2:"
echo "  pm2 start ecosystem.config.js"
echo "  pm2 save"
echo "  pm2 startup"
echo ""

# ============================================================
# 3. Uptime Monitoring
# ============================================================
echo "📦 3. Uptime Monitoring"
echo "------------------------"
echo ""
echo "Configure an external uptime monitor to check:"
echo ""
echo "  URL: https://api.gomotarcar.com/health"
echo "  Interval: 5 minutes"
echo "  Alert via: Email / Slack / SMS"
echo ""
echo "Recommended free services:"
echo "  • UptimeRobot    → https://uptimerobot.com  (50 monitors, free)"
echo "  • BetterStack    → https://betterstack.com  (free tier available)"
echo "  • Pulsetic       → https://pulsetic.com     (free tier available)"
echo ""

# ============================================================
# 4. Log Management
# ============================================================
echo "📦 4. Log Management"
echo "--------------------"
echo ""
echo "Options for centralized log management:"
echo ""
echo "  • BetterStack (free 3GB/month):"
echo "    curl -fsSL https://betterstack.com/install.sh | bash"
echo ""
echo "  • Logtail (free 1GB/month):"
echo "    Install @logtail/node package and configure"
echo ""
echo "  • Loki + Grafana (self-hosted):"
echo "    docker run -d --name=loki -p 3100:3100 grafana/loki"
echo ""

# ============================================================
# 5. Server Resource Monitoring
# ============================================================
echo "📦 5. Server Resource Monitoring"
echo "--------------------------------"
echo ""
echo "For basic server monitoring, install Netdata:"
echo ""
echo "  bash <(curl -Ss https://my-netdata.io/kickstart.sh)"
echo ""
echo "  Dashboard: http://localhost:19999"
echo ""
echo "For production-grade monitoring stack:"
echo ""
echo "  Prometheus + Node Exporter + Grafana"
echo "  docker-compose -f docker-compose.monitoring.yml up -d"
echo ""

# ============================================================
# Summary
# ============================================================
echo ""
echo "========================================"
echo "  ✅ Monitoring Setup Guide Complete"
echo "========================================"
echo ""
echo "  What was installed:"
echo "    - Sentry packages for error tracking"
echo "    - PM2 ecosystem config for process management"
echo ""
echo "  What to configure manually:"
echo "    - Add SENTRY_DSN to server/.env"
echo "    - Set up UptimeRobot / BetterStack"
echo "    - Install Netdata for server metrics"
echo "    - Configure log shipping"
echo ""
