# Deployment Guide — GoMotarCar

**Version:** 1.0  
**Last Updated:** June 16, 2026  

---

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Environment Setup](#2-environment-setup)
3. [Local Development Deployment](#3-local-development-deployment)
4. [Docker Deployment](#4-docker-deployment)
5. [VPS Deployment](#5-vps-deployment)
6. [Production Configuration](#6-production-configuration)
7. [Backup Strategy](#7-backup-strategy)
8. [Monitoring & Alerts](#8-monitoring--alerts)
9. [Rollback Procedure](#9-rollback-procedure)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites

### Required Software
| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | >= 18.x | Runtime |
| MongoDB | >= 6.x | Database |
| Redis | >= 7.x | Cache + Session |
| PM2 | >= 5.x | Process Manager |
| Nginx | >= 1.24 | Reverse Proxy |
| Docker | >= 24.x (optional) | Containerization |
| Certbot | Latest (optional) | SSL Certificates |

### System Requirements
| Environment | CPU | RAM | Storage |
|-------------|-----|-----|---------|
| Development | 2 cores | 4GB | 20GB |
| Production | 4+ cores | 8GB+ | 50GB+ SSD |

---

## 2. Environment Setup

### Step 1: Clone & Configure
```bash
git clone https://github.com/your-org/gomotarcar.git
cd gomotarcar

# Copy environment template
cp .env.example .env

# Edit .env with your production values
nano .env
```

### Step 2: Essential Environment Variables

```bash
# REQUIRED - Must be set before starting
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/gomotarcar?retryWrites=true&w=majority
JWT_SECRET=<generate: openssl rand -base64 32>
JWT_REFRESH_SECRET=<generate: openssl rand -base64 32>
REDIS_URL=redis://:password@localhost:6379
CORS_ORIGINS=https://admin.gomotarcar.com

# REQUIRED - Payment / Notifications
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
```

### Step 3: Generate Secrets
```bash
# Generate JWT secrets
openssl rand -base64 32  # Copy output to JWT_SECRET
openssl rand -base64 32  # Copy output to JWT_REFRESH_SECRET

# Generate encryption key
openssl rand -hex 16      # Copy output to ENCRYPTION_KEY
```

---

## 3. Local Development Deployment

```bash
# Install dependencies
cd server && npm install
cd ../admin-panel && npm install

# Start MongoDB and Redis (using Docker)
docker run -d -p 27017:27017 --name mongodb mongo:7
docker run -d -p 6379:6379 --name redis redis:7-alpine

# Start backend
cd server
npm run dev  # or: npx nodemon src/index.js

# Start admin panel (separate terminal)
cd admin-panel
npm start    # Runs on http://localhost:3000

# Run index optimization
NODE_ENV=development node scripts/index-optimization.js
```

---

## 4. Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and run all services
docker-compose -f docker-compose.prod.yml up -d --build

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f api
```

### Service Architecture
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Nginx      │────▶│  Node API    │────▶│  MongoDB    │
│  (Reverse    │     │  (PM2 Cluster│     │  (Primary)  │
│   Proxy)     │     │  4 instances)│     │             │
└─────────────┘     └──────────────┘     └─────────────┘
       │                     │                   │
       │                     ▼                   │
       │              ┌──────────────┐           │
       │              │   Redis      │           │
       │              │  (Cache)     │           │
       │              └──────────────┘           │
       │                                         │
       ▼                                         ▼
┌─────────────┐                          ┌─────────────┐
│ Admin Panel │                          │   MongoDB    │
│ (Static     │                          │   (Backup)   │
│  Files)     │                          │             │
└─────────────┘                          └─────────────┘
```

### Individual Docker Builds

```bash
# Build server image
docker build -t gomotarcar-api:latest ./server

# Run server container
docker run -d \
  --name gomotarcar-api \
  --restart unless-stopped \
  -p 5000:5000 \
  -v $(pwd)/.env:/app/.env \
  -v $(pwd)/uploads:/app/uploads \
  gomotarcar-api:latest

# Build admin panel
docker build -t gomotarcar-admin:latest ./admin-panel

# Run admin panel
docker run -d \
  --name gomotarcar-admin \
  --restart unless-stopped \
  -p 3000:80 \
  gomotarcar-admin:latest
```

---

## 5. VPS Deployment

### Nginx Configuration
The production nginx config is at `nginx/gomotarcar.conf`. Key settings:

```nginx
# SSL configuration
ssl_certificate /etc/letsencrypt/live/api.gomotarcar.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/api.gomotarcar.com/privkey.pem;

# Gzip compression
gzip on;
gzip_types application/json text/plain text/css application/javascript;
gzip_min_length 1000;

# API proxy
location /api/ {
    proxy_pass http://127.0.0.1:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Uploads
location /uploads/ {
    alias /var/www/gomotarcar/uploads/;
    expires 30d;
    add_header Cache-Control "public, immutable";
}

# Admin panel
location / {
    root /var/www/gomotarcar/admin-panel/build;
    try_files $uri $uri/ /index.html;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### PM2 Process Manager

```bash
# Install PM2 globally
npm install -g pm2

# Start with ecosystem config
pm2 start ecosystem.config.js --env production

# Save PM2 process list
pm2 save

# Setup PM2 to start on reboot
pm2 startup

# Monitor
pm2 monit
pm2 logs
pm2 status
```

### SSL Certificates

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d api.gomotarcar.com -d admin.gomotarcar.com

# Auto-renewal (certbot adds systemd timer automatically)
sudo certbot renew --dry-run
```

---

## 6. Production Configuration

### MongoDB Production Setup
```javascript
// server/src/config/db.js
{
  maxPoolSize: 10,
  minPoolSize: 2,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
  heartbeatFrequencyMS: 10000,
  retryWrites: true,
  w: 'majority',
}
```

### Cron Jobs
| Job | Frequency | Command |
|-----|-----------|---------|
| Database backup | Daily | `scripts/backup.sh` |
| Index optimization | Monthly | `node scripts/index-optimization.js` |
| Log rotation | Daily | PM2 handles automatically |
| SSL renewal | Every 2 months | `certbot renew` (automatic) |

### Health Check Endpoints
```
GET /health                    — Server health + dependency check
GET /api/v1/health            — API health
```

---

## 7. Backup Strategy

### Automated Backups (`scripts/backup.sh`)

```bash
# MongoDB dump
mongodump --uri="$MONGODB_URI" --out=/backups/mongodb/$(date +%Y%m%d)

# Upload files backup
tar -czf /backups/uploads/$(date +%Y%m%d).tar.gz /var/www/gomotarcar/uploads/

# .env backup (encrypted)
gpg --symmetric --cipher-algo AES256 /backups/env/$(date +%Y%m%d).env
```

### Backup Schedule
| Data | Frequency | Retention | Location |
|------|-----------|-----------|----------|
| MongoDB | Daily | 30 days | Local + S3 |
| Uploads | Weekly | 90 days | Local + S3 |
| Environment | After changes | Permanent | Encrypted |
| Logs | Continuous | 14 days | Log rotation |

### Restore Procedure
```bash
# Restore MongoDB
mongorestore --uri="$MONGODB_URI" --drop /backups/mongodb/20260101

# Restore uploads
tar -xzf /backups/uploads/20260101.tar.gz -C /var/www/gomotarcar/uploads/
```

---

## 8. Monitoring & Alerts

### Essential Monitoring

| Metric | Tool | Threshold |
|--------|------|-----------|
| CPU usage | PM2 / htop | > 80% |
| Memory usage | PM2 / htop | > 1GB per instance |
| Disk usage | df -h | > 80% |
| MongoDB connections | db.serverStatus() | > 80% of pool |
| Redis memory | INFO memory | > 80% of maxmemory |
| API response time | Nginx logs | > 2s p95 |
| Error rate | App logs | > 1% of requests |

### Incognito/Alert Channels
- Health check: `GET /health` returns dependency status
- PM2 notifications: Configure `pm2 plus` or use custom webhook
- Log aggregation: ELK Stack or Papertrail

---

## 9. Rollback Procedure

### Docker Rollback
```bash
# Roll to previous version
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build  # Or use tagged version

# Or rollback specific service
docker service update --image gomotarcar-api:1.0.9 gomotarcar_api
```

### PM2 Rollback
```bash
# Keep previous versions ready
git checkout <previous-tag>
npm install
pm2 restart ecosystem.config.js --env production
```

### Database Rollback
```bash
# Restore previous day's backup
mongorestore --uri="$MONGODB_URI" --drop --dir=/backups/mongodb/previous-date
```

---

## 10. Troubleshooting

### Common Issues

| Symptom | Cause | Solution |
|---------|-------|----------|
| `ECONNREFUSED` on MongoDB | MongoDB not running | `systemctl start mongod` |
| `AUTH_TOKEN_EXPIRED` | JWT secret changed | Restart all sessions or keep original secret |
| 502 Bad Gateway | Node app not running | `pm2 restart gomotarcar-api` |
| 413 Payload Too Large | Upload exceeds nginx limit | Increase `client_max_body_size` in nginx |
| Redis connection error | Redis not running | `docker start redis` or `systemctl start redis-server` |
| File upload fails | Uploads directory permissions | `chown -R node:node /var/www/gomotarcar/uploads` |

### Quick Health Check
```bash
# Check all services
curl http://localhost:5000/health
curl -I https://api.gomotarcar.com/health
pm2 status
systemctl status mongod
systemctl status redis-server
systemctl status nginx
```

---

## Appendix: File Reference

| File | Purpose |
|------|---------|
| `ecosystem.config.js` | PM2 process manager configuration |
| `docker-compose.prod.yml` | Production Docker Compose setup |
| `nginx/gomotarcar.conf` | Production Nginx configuration |
| `server/Dockerfile` | Backend Docker image build |
| `admin-panel/Dockerfile` | Admin panel Docker image build |
| `admin-panel/nginx/default.conf` | Admin panel Nginx in Docker |
| `scripts/backup.sh` | Automated backup script |
| `scripts/monitoring-setup.sh` | Monitoring setup script |
| `scripts/index-optimization.js` | MongoDB index optimization |
| `.env.example` | Environment variable template |
| `SECURITY_REPORT.md` | Security audit report |
| `PERFORMANCE_REPORT.md` | Performance optimization report |

---
*Generated by Codebuff Deployment Guide — June 16, 2026*
