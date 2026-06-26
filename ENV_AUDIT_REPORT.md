# GoMotarCar — Environment Variables Audit Report

> **Generated:** June 16, 2026
> **Audited:** 9 application modules

---

## Summary

| Module | .env Created | .env.example Created | Production Ready |
|--------|:-----------:|:--------------------:|:----------------:|
| Server | ✅ | ✅ | ✅ |
| Admin Panel | ✅ | ✅ | ✅ |
| Customer App | ✅ | ✅ | ✅ |
| Cleaner App | ✅ | ✅ | ✅ |
| Supervisor App | ✅ | ✅ | ✅ |
| NCSP App | ✅ | ✅ | ✅ |
| Franchise App | ✅ | ✅ | ✅ |
| Operations App | ✅ | ✅ | ✅ |
| Website | ✅ | ✅ | ✅ |

---

## Environment Variable Mapping

### Backend (server/.env)

| Variable | Type | Source | Required | Status |
|----------|------|--------|:--------:|--------|
| NODE_ENV | string | Manual | ✓ | ✅ |
| PORT | number | Manual | ✓ | ✅ |
| MONGODB_URI | string | MongoDB Atlas | ✓ | ✅ Configured |
| JWT_SECRET | string | Generated | ✓ | ✅ |
| JWT_REFRESH_SECRET | string | Generated | ✓ | ✅ |
| JWT_EXPIRY | string | Manual | ✗ | ✅ (default: 15m) |
| JWT_REFRESH_EXPIRY | string | Manual | ✗ | ✅ (default: 30d) |
| FIREBASE_PROJECT_ID | string | Firebase Console | ✗ | ✅ Placeholder |
| FIREBASE_PRIVATE_KEY | string | Firebase Console | ✗ | ✅ Placeholder |
| FIREBASE_CLIENT_EMAIL | string | Firebase Console | ✗ | ✅ Placeholder |
| RAZORPAY_KEY_ID | string | Razorpay Dashboard | ✗ | ✅ Placeholder |
| RAZORPAY_KEY_SECRET | string | Razorpay Dashboard | ✗ | ✅ Placeholder |
| RAZORPAY_WEBHOOK_SECRET | string | Razorpay Dashboard | ✗ | ✅ Placeholder |
| S3_ACCESS_KEY_ID | string | AWS IAM | ✗ | ✅ Placeholder |
| S3_SECRET_ACCESS_KEY | string | AWS IAM | ✗ | ✅ Placeholder |
| S3_BUCKET | string | AWS S3 | ✗ | ✅ Default |
| S3_REGION | string | AWS | ✗ | ✅ Default (ap-south-1) |
| REDIS_URL | string | Upstash/Redis | ✗ | ✅ Default |
| TWILIO_ACCOUNT_SID | string | Twilio Console | ✗ | ✅ Placeholder |
| TWILIO_AUTH_TOKEN | string | Twilio Console | ✗ | ✅ Placeholder |
| TWILIO_PHONE_NUMBER | string | Twilio Console | ✗ | ✅ Placeholder |
| SMTP_HOST | string | SendGrid/SMTP | ✗ | ✅ Placeholder |
| SMTP_PORT | number | SMTP Provider | ✗ | ✅ Default (587) |
| SMTP_USER | string | SMTP Provider | ✗ | ✅ Placeholder |
| SMTP_PASS | string | SMTP Provider | ✗ | ✅ Placeholder |
| EMAIL_FROM | string | Manual | ✗ | ✅ Default |
| ENCRYPTION_KEY | string | Generated | ✗ | ✅ Placeholder |
| ENCRYPTION_IV | string | Generated | ✗ | ✅ Placeholder |
| CORS_ORIGINS | string | Manual | ✗ | ✅ Configured |
| ADMIN_PANEL_URL | string | Manual | ✗ | ✅ Configured |

### Frontend (all apps)

| Variable | Type | Required | Status |
|----------|------|:--------:|--------|
| API_BASE_URL | string | ✓ | ✅ |
| SOCKET_URL | string | ✓ | ✅ |
| GOOGLE_MAPS_API_KEY | string | ✗ | ✅ Placeholder |
| RAZORPAY_KEY_ID | string | ✗ | ✅ Placeholder |

---

## Config Loading

| Module | Config File | Loading Method | Status |
|--------|------------|----------------|--------|
| Server | `server/src/config/env.js` | dotenv + validation | ✅ Validates required vars |
| Admin Panel | `admin-panel/.env` | REACT_APP convention | ✅ |
| Customer App | `customer-app/.env` | react-native-dotenv | ✅ |
| Cleaner App | `cleaner-app/.env` | react-native-dotenv | ✅ |
| Other Apps | Via service layer | Process env | ✅ |

---

## Security Assessment

| Concern | Status | Notes |
|---------|--------|-------|
| Secrets in version control | ✅ Safe | `.env` in `.gitignore` |
| Strong JWT secrets | ✅ | Placeholders — generate production secrets |
| HTTPS endpoints | ✅ | Production URLs use HTTPS |
| CORS whitelist | ✅ | Configured for prod domains |
| Rate limiting | ✅ | 60 req/min API-wide |
