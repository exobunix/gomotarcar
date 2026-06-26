# GoMotarCar — Server Requirements

## Minimum Production Server

| Resource | Requirement | Notes |
|----------|-------------|-------|
| CPU | 2 vCPUs | For API + background jobs |
| RAM | 4 GB | 2 GB for Node, 1 GB for system, 1 GB buffer |
| Storage | 20 GB SSD | OS + app + logs |
| OS | Ubuntu 22.04 LTS | Recommended |
| Network | 100 Mbps | Static IP required |

## Recommended Production Server

| Resource | Requirement | Notes |
|----------|-------------|-------|
| CPU | 4 vCPUs | Handle peak loads + Redis |
| RAM | 8 GB | 4 GB Node, 2 GB Redis, 2 GB system |
| Storage | 50 GB SSD | With room for uploads and logs |
| OS | Ubuntu 24.04 LTS | Latest LTS |
| Network | 1 Gbps | CDN for static assets |

## Database Server (Separate Instance)

| Resource | Requirement |
|----------|-------------|
| CPU | 2-4 vCPUs |
| RAM | 8 GB+ |
| Storage | 100 GB SSD (GP3) |
| Type | MongoDB 7.0+ Replica Set (3 nodes) |

## Software Requirements

### System Packages
```bash
# Essential
build-essential
curl
git
nginx
certbot
ufw
fail2ban
logrotate

# Database
mongodb-org (7.0+)
redis-server (7.0+)
```

### Node.js
- Version: 20.x LTS
- Manager: nvm or nodesource
- Process: PM2 (global install)

### Docker (Optional)
- Docker Engine 24.0+
- Docker Compose Plugin v2.0+

## Network Requirements

### Ports

| Port | Service | Protocol | Access |
|------|---------|----------|--------|
| 22 | SSH | TCP | Admin IPs only |
| 80 | HTTP | TCP | Public (redirects to 443) |
| 443 | HTTPS | TCP | Public |
| 5000 | API (internal) | TCP | Localhost only |
| 27017 | MongoDB | TCP | Internal network only |
| 6379 | Redis | TCP | Internal network only |

### DNS Records

| Record | Type | Value |
|--------|------|-------|
| api.gomotarcar.com | A | Server IP |
| admin.gomotarcar.com | A | Server IP |
| www.gomotarcar.com | A | Server IP |
| gomotarcar.com | A | Server IP |

## Estimated Costs

### Monthly (Production)
| Service | Plan | Cost (USD) |
|---------|------|------------|
| Application Server | 4 vCPU, 8 GB RAM | ~$60-80 |
| MongoDB Atlas | M20 Replica Set | ~$60 |
| Redis Cloud | 250 MB | ~$15 |
| S3 Storage | 50 GB | ~$5 |
| Firebase | Pay-as-you-go | ~$25 |
| Razorpay | 2% per transaction | Variable |
| Twilio | SMS + WhatsApp | ~$20 |
| SendGrid | 50k emails/month | ~$20 |
| UptimeRobot | Free tier | $0 |
| Sentry | Developer tier | ~$26 |
| **Total** | | **~$250-300/mo** |

### One-Time Setup
| Item | Cost |
|------|------|
| Domain registration | ~$12/year |
| SSL certificate | $0 (Let's Encrypt) |
| App store registration (Apple) | $99/year |
| Google Play registration | $25 (one-time) |

## Scaling Limits (Single Server)

| Metric | Limit | Action |
|--------|-------|--------|
| Concurrent API requests | ~500 | Add horizontal scaling |
| Daily active users | ~10,000 | Add database replicas |
| File storage | 50 GB | Configure S3 lifecycle |
| Log storage | 5 GB | Configure log rotation |
| MongoDB connections | 500 | Increase pool size |
