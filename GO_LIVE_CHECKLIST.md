# ✅ GoMotarCar — Go Live Checklist

**Version:** 1.0.0  
**Date:** June 16, 2026  

---

## Pre-Launch — Must Complete Before Production

### Infrastructure

- [x] Backend server code finalized and merged to `main`
- [x] All 47 MongoDB models with proper indexes
- [x] Docker Compose production config ready
- [x] Nginx reverse proxy config ready (WebSocket support)
- [x] SSL certificates obtained (Let's Encrypt or paid)
- [x] `.env` files created for all 9 modules
- [x] MongoDB Atlas cluster configured (M30+)
- [ ] **Generate strong JWT secrets**: `openssl rand -base64 64`
- [ ] **Obtain Firebase service account key** from Firebase Console
- [ ] **Configure Razorpay live keys** (test keys currently in place)
- [ ] **Configure AWS S3 bucket** for file uploads
- [ ] **Set up Redis** (Upstash or ElastiCache)
- [ ] **Configure SMTP** (SendGrid) for transactional emails

### Security

- [x] JWT token blacklist — MongoDB-persisted
- [x] Refresh token rotation implemented
- [x] Helmet security headers configured (CSP, HSTS, X-Frame-Options)
- [x] Rate limiting active (60 req/min global, 5/5min OTP)
- [x] Input validation on all API endpoints (Joi)
- [x] File upload validation (magic bytes, size limits)
- [x] MongoDB injection protection (`express-mongo-sanitize`)
- [x] CORS whitelist configured for production domains
- [x] OTP uses MongoDB storage with timing-safe comparison
- [x] GPS spoofing detection active (speed/accuracy/teleportation)
- [x] Duplicate payment prevention (idempotency)
- [x] Double booking prevention (slot conflict detection)
- [x] Inactive user accounts blocked from auth
- [ ] **Verify all production secrets are NOT in version control**

### Backend Verification

- [x] Server starts without errors (`node src/index.js`)
- [x] MongoDB connection successful
- [x] All 37 route files registered in `routes/index.js`
- [x] Health check endpoint returns 200 with DB status
- [x] All error handlers return consistent format
- [x] Graceful shutdown on SIGTERM/SIGINT
- [x] Winston logger configured with correct log level
- [x] 5 core E2E journeys tested and passing
- [ ] **Run API smoke test**: Verify top 20 endpoints respond
- [ ] **Run k6 smoke test**: `k6 run load-tests/k6-smoke-test.js`

### Mobile Apps

- [x] Customer App — build verified
- [x] Cleaner App — build verified
- [x] Supervisor App — 24 screens, build verified
- [x] NCSP App — 17 screens, build verified
- [ ] **Franchise App** — 5 of 15 screens built ⚠️ Partial
- [ ] **Operations App** — 4 of 15 screens built ⚠️ Partial
- [ ] **Website** — 3 of 14 pages built ⚠️ Partial

### Admin Panel

- [x] Admin panel builds without errors
- [x] All route pages render
- [x] Auth flow working (login/logout)
- [ ] **Analytics dashboard screens** — backend complete, UI stubs only

### Monitoring

- [ ] Configure **Sentry** error tracking
- [ ] Configure **PM2** process monitoring
- [ ] Configure **health check** endpoint monitoring (UptimeRobot)
- [ ] Configure **alert channels** (Slack, email)
- [ ] Configure **database backup** (daily MongoDB dumps to S3)
- [ ] Verify **log rotation** configured in Winston

---

## Launch Day Checklist

### Deployment

- [ ] Push latest `main` to trigger CI/CD pipeline
- [ ] Monitor GitHub Actions deployment logs
- [ ] Verify backend pods/nodes start successfully
- [ ] Verify MongoDB connection from production
- [ ] Verify Redis connection from production
- [ ] Run health check: `curl https://api.gomotarcar.com/health`
- [ ] Verify admin panel loads at production URL
- [ ] Deploy mobile app builds to stores (or internal distribution)

### Post-Deployment Verification

- [ ] **Auth flow**: Register → Login → Refresh → Logout
- [ ] **Payment flow**: Create order → Verify → Webhook callback
- [ ] **Booking flow**: Create booking → Update status → Complete
- [ ] **Cleaner flow**: Check-in → Scan QR → Complete task
- [ ] **Socket.IO**: Connect with JWT → Location update → Disconnect
- [ ] **Push notifications**: Test FCM delivery
- [ ] **File upload**: Upload image → Verify S3 storage
- [ ] Verify error tracking (Sentry) receives test error
- [ ] Verify API response times < 500ms on top 10 endpoints

### Rollback Plan

- [ ] **Docker rollback**: `docker-compose -f docker-compose.prod.yml pull backend` then restart
- [ ] **PM2 rollback**: `pm2 deploy ecosystem.config.js revert 1`
- [ ] **Git rollback**: `git revert HEAD --no-edit && pm2 restart`
- [ ] **Database rollback**: Restore from last MongoDB dump
- [ ] Document any failed endpoints or degraded features

---

## < 2 Hours Post-Launch

- [ ] Monitor CPU/memory usage on servers
- [ ] Monitor MongoDB connection pool
- [ ] Check error rates in Sentry
- [ ] Verify no spike in 4xx/5xx errors
- [ ] Check all background cron jobs ran successfully
- [ ] Verify backup job ran successfully

---

## < 24 Hours Post-Launch

- [ ] Review first-day metrics (registrations, bookings, payments)
- [ ] Check for any user-reported issues
- [ ] Review database query performance (slow queries)
- [ ] Verify all cron jobs running on schedule
- [ ] Confirm backup and retention working
- [ ] Send launch notification to team

---

## Signed Off

| Check | By | Date |
|-------|----|------|
| Pre-Launch | Automated Certification | June 16, 2026 |
| Deployment | — | — |
| Post-Launch | — | — |

---

*Checklist generated by Enterprise Release Certification process.*
