# GoMotarCar — Production Deployment Checklist

## Pre-Deployment

### Security
- [ ] All default passwords changed
- [ ] JWT secrets are 64+ random characters
- [ ] MongoDB authentication enabled
- [ ] Redis password set
- [ ] HTTPS certificate obtained (Let's Encrypt or paid)
- [ ] CORS origins restricted to known domains
- [ ] Rate limiting configured
- [ ] Helmet security headers enabled
- [ ] Input validation on all API endpoints
- [ ] File upload size limits configured
- [ ] S3 bucket is not publicly writable
- [ ] Firebase service account key secured
- [ ] `.env` files excluded from version control

### Backend
- [ ] `NODE_ENV=production` set
- [ ] Winston logger configured with correct log level
- [ ] Error handling covers all routes
- [ ] Database indexes created (run `npm run migrate`)
- [ ] MongoDB connection string uses auth
- [ ] Redis connection configured
- [ ] PM2 or Docker configured for process management
- [ ] Health check endpoint returns 200
- [ ] API versioning (v1 prefix) confirmed

### Mobile Apps
- [ ] API URLs point to production endpoint
- [ ] Socket.IO URLs point to production
- [ ] Razorpay keys are live (not test)
- [ ] Firebase project is production
- [ ] Google Services JSON (Android) placed
- [ ] GoogleService-Info.plist (iOS) placed
- [ ] App signing configured (keystore)
- [ ] Version numbers incremented
- [ ] Deep links configured (if applicable)

### Admin Panel
- [ ] API URL points to production backend
- [ ] Build succeeds without errors
- [ ] All routes accessible
- [ ] Authentication flow works end-to-end

---

## Deployment Day

### Database
- [ ] MongoDB replica set configured (3+ nodes)
- [ ] Automated backups tested
- [ ] Indexes confirmed via explain()
- [ ] Connection pool size optimized

### DNS & Networking
- [ ] A records created for: api, admin, www
- [ ] SSL certificates installed
- [ ] Nginx reverse proxy configured
- [ ] WebSocket support enabled in proxy
- [ ] Firewall rules applied (ports 80, 443 only)
- [ ] Fail2ban installed for SSH protection

### Monitoring
- [ ] Health checks configured (UptimeRobot or similar)
- [ ] Log aggregation set up
- [ ] Error tracking (Sentry) configured
- [ ] Server resource monitoring active (CPU, RAM, disk)
- [ ] Database query monitoring (slow queries)
- [ ] Alert channels configured (Slack, email)

### CI/CD
- [ ] GitHub Actions workflow deployed
- [ ] Secrets configured in GitHub
- [ ] Build passes on main branch
- [ ] Rollback procedure documented
- [ ] Deployment notifications configured

---

## Post-Deployment

### Verification
- [ ] API health check: `GET /health` returns 200
- [ ] Auth flow: login/register working
- [ ] Payment flow: test transaction succeeds
- [ ] Push notifications: test notification received
- [ ] Socket.IO: real-time events working
- [ ] File upload: test upload to S3
- [ ] Admin panel: all pages loading
- [ ] Mobile apps: build installs and runs

### Performance
- [ ] API response times < 200ms (p95)
- [ ] Static assets served via CDN
- [ ] Database queries optimized
- [ ] Memory usage within limits
- [ ] CPU usage below 70% under load

### Backup
- [ ] Daily database backup configured
- [ ] Backup retention policy defined
- [ ] Backup restoration tested
- [ ] Off-site backup location configured
- [ ] Backup monitoring alert set up

### Documentation
- [ ] Runbooks for common procedures
- [ ] On-call rotation established
- [ ] Incident response plan documented
- [ ] Architecture diagram updated
- [ ] API documentation current
