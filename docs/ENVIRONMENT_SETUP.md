# GoMotarCar — Environment Setup Guide

> **Generated:** June 16, 2026
> **Modules:** Server, Admin Panel, Customer App, Cleaner App, Supervisor App, NCSP App, Franchise App, Operations App, Website

---

## 1. Server (`server/.env`)

### Required Variables

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `NODE_ENV` | `development` | `staging` | `production` |
| `PORT` | `5000` | `5000` | `5000` |
| `MONGODB_URI` | `mongodb://localhost:27017/gomotarcar` | `mongodb+srv://.../gomotar_staging` | `mongodb+srv://.../gomotar_prod` |
| `JWT_SECRET` | `dev-secret-key-...` | Change for staging | 64-char random |
| `JWT_REFRESH_SECRET` | `dev-refresh-key-...` | Change for staging | 64-char random |

### Optional Variables

| Variable | Default | Production Required |
|----------|---------|--------------------|
| `JWT_EXPIRY` | `15m` | ✓ |
| `JWT_REFRESH_EXPIRY` | `30d` | ✓ |
| `RAZORPAY_KEY_ID` | — | ✓ (live) |
| `RAZORPAY_KEY_SECRET` | — | ✓ (live) |
| `FIREBASE_PROJECT_ID` | — | ✓ |
| `REDIS_URL` | `redis://localhost:6379` | ✓ |
| `S3_BUCKET` | `gomotarcar-uploads` | ✓ |
| `S3_REGION` | `ap-south-1` | ✓ |
| `SMTP_HOST` | — | ✓ |
| `TWILIO_ACCOUNT_SID` | — | ✓ (for SMS) |
| `CORS_ORIGINS` | `http://localhost:3000` | ✓ |
| `ENCRYPTION_KEY` | — | ✓ (64 hex chars) |
| `ENCRYPTION_IV` | — | ✓ (32 hex chars) |

---

## 2. Admin Panel (`admin-panel/.env`)

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `REACT_APP_API_URL` | `http://localhost:5000/api/v1` | `https://staging-api.gomotarcar.com/api/v1` | `https://api.gomotarcar.com/api/v1` |
| `REACT_APP_SOCKET_URL` | `http://localhost:5000` | `https://staging-api.gomotarcar.com` | `https://api.gomotarcar.com` |
| `REACT_APP_GOOGLE_MAPS_API_KEY` | Dev key | Staging key | Production key |
| `PORT` | `3000` | `3000` | `80` |

---

## 3. Customer App (`customer-app/.env`)

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `API_BASE_URL` | `http://localhost:5000/api/v1` | `https://staging-api.gomotarcar.com/api/v1` | `https://api.gomotarcar.com/api/v1` |
| `SOCKET_URL` | `http://localhost:5000` | `https://staging-api.gomotarcar.com` | `https://api.gomotarcar.com` |
| `GOOGLE_MAPS_API_KEY` | Dev key | Staging key | Production key |
| `RAZORPAY_KEY_ID` | `rzp_test_...` | `rzp_test_...` | `rzp_live_...` |

---

## 4. Cleaner App (`cleaner-app/.env`)

Same variables as Customer App:

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `API_BASE_URL` | `http://localhost:5000/api/v1` | `https://staging-api...` | `https://api.gomotarcar.com/api/v1` |
| `SOCKET_URL` | `http://localhost:5000` | `https://staging-api...` | `https://api.gomotarcar.com` |
| `GOOGLE_MAPS_API_KEY` | Dev key | Staging key | Production key |

---

## 5. Supervisor App (`supervisor-app/.env`)

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `API_BASE_URL` | `http://localhost:5000/api/v1` | Staging | Production |
| `SOCKET_URL` | `http://localhost:5000` | Staging | Production |
| `GOOGLE_MAPS_API_KEY` | Dev key | Staging | Production |

---

## 6. NCSP App (`ncsp-app/.env`)

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `API_BASE_URL` | `http://localhost:5000/api/v1` | Staging | Production |
| `SOCKET_URL` | `http://localhost:5000` | Staging | Production |
| `GOOGLE_MAPS_API_KEY` | Dev key | Staging | Production |

---

## 7. Franchise App (`franchise-app/.env`)

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `API_BASE_URL` | `http://localhost:5000/api/v1` | Staging | Production |
| `SOCKET_URL` | `http://localhost:5000` | Staging | Production |
| `GOOGLE_MAPS_API_KEY` | Dev key | Staging | Production |

---

## 8. Operations App (`operations-app/.env`)

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `API_BASE_URL` | `http://localhost:5000/api/v1` | Staging | Production |
| `SOCKET_URL` | `http://localhost:5000` | Staging | Production |
| `GOOGLE_MAPS_API_KEY` | Dev key | Staging | Production |

---

## 9. Website (`website/.env`)

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `API_BASE_URL` | `http://localhost:5000/api/v1` | Staging | Production |
| `SOCKET_URL` | `http://localhost:5000` | Staging | Production |
| `GOOGLE_MAPS_API_KEY` | Dev key | Staging | Production |
| `SITE_URL` | `http://localhost:3000` | `https://staging.gomotarcar.com` | `https://www.gomotarcar.com` |
| `SITE_NAME` | `GoMotarCar (Dev)` | `GoMotarCar (Staging)` | `GoMotarCar` |

---

## Setup Instructions

```bash
# 1. Copy .env.example files for each module
cp server/.env.example server/.env
cp admin-panel/.env.example admin-panel/.env
cp customer-app/.env.example customer-app/.env
# ... repeat for all modules

# 2. Edit each .env with appropriate values for your environment

# 3. Verify configuration loads correctly
cd server && node -e "const c = require('./src/config/env'); console.log('Config OK')"

# 4. Verify database connectivity
cd server && node -e "
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('DB Connected');
    process.exit(0);
  }).catch(err => {
    console.error('DB Failed:', err.message);
    process.exit(1);
  });
"
```

## Important Notes

1. **Never commit `.env` files** to version control (they are in `.gitignore`)
2. **Only commit `.env.example` files** as documentation
3. **Use different values** for dev, staging, and production
4. **Rotate secrets** (JWT, API keys) regularly in production
5. **Use environment-specific Firebase projects** (dev/staging/prod)
6. **Use environment-specific Razorpay keys** (test/live)
