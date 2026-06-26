# GoMotarCar Demo Credentials & Testing Guide

## Server Setup

```bash
# 1. Install dependencies
cd server
npm install

# 2. Create .env file (copy from .env.example or use below)
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets

# 3. Start the server (auto-seeds database if empty)
npm start
# Server starts on http://localhost:5000
# Health check: http://localhost:5000/health
```

### Required .env Variables
```
MONGODB_URI=mongodb://localhost:27017/gomotarcar
JWT_SECRET=your-jwt-secret-key-change-in-production
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key-change-in-production
PORT=5000
```

### Admin Panel Setup
```bash
cd admin-panel
npm install
npm start
# Opens on http://localhost:3000
```

---

## Admin Panel Login Credentials

| Role | Email/Phone | Password |
|------|------------|----------|
| **Super Admin** | admin@gomotarcar.com | admin123 |
| *(via phone)* | +919000000000 | admin123 |

> **Note:** The admin panel login uses phone+password via `POST /api/v1/auth/login`. Use phone `+919000000000` with password `admin123`.

---

## All Seed Data Accounts

All accounts below are seeded by `server/src/seed.js` when the database is empty. The server auto-seeds on startup.

### Admin Accounts
| Phone | Email | Password | Role |
|-------|-------|----------|------|
| +919000000000 | admin@gomotarcar.com | admin123 | super_admin |
| +919000000001 | manager@gomotorcar.com | admin123 | manager |
| +919000000002 | franchise@gomotorcar.com | admin123 | franchise |
| +919000000003 | operations@gomotorcar.com | admin123 | operations |

### Customer Accounts (100 customers)
| Phone Pattern | Email Pattern | Password |
|--------------|--------------|----------|
| +9199XXXX0000 - +9199XXXX0099 | customer0@gmail.com - customer99@gmail.com | password123 |

**Sample customers:**
| Phone | Email | Name |
|-------|-------|------|
| +919910000000 | customer0@gmail.com | Priya Sharma |
| +919910000001 | customer1@gmail.com | Ananya Verma |
| +919910000002 | customer2@gmail.com | Neha Gupta |
| +919910000003 | customer3@gmail.com | Pooja Singh |
| +919910000004 | customer4@gmail.com | Sneha Patel |

### Cleaner Accounts (50 cleaners)
| Phone Pattern | Email Pattern | Password |
|--------------|--------------|----------|
| +9198XXXX0000 - +9198XXXX0049 | cleaner0@gmail.com - cleaner49@gmail.com | password123 |

**Sample cleaners:**
| Phone | Email | Name | Cleaner ID |
|-------|-------|------|------------|
| +919810000000 | cleaner0@gmail.com | Rahul Kumar | GMC-0001 |
| +919810000001 | cleaner1@gmail.com | Amit Sharma | GMC-0002 |
| +919810000002 | cleaner2@gmail.com | Vijay Verma | GMC-0003 |
| +919810000003 | cleaner3@gmail.com | Sunil Singh | GMC-0004 |
| +919810000004 | cleaner4@gmail.com | Ravi Patel | GMC-0005 |

### Franchise Accounts (20 franchises)
| Phone Pattern | Email Pattern | Password |
|--------------|--------------|----------|
| +9197XXXX0000 - +9197XXXX0019 | franchise0@gmail.com - franchise19@gmail.com | password123 |

**Sample franchises:**
| Phone | Email | Franchise Name | Owner |
|-------|-------|---------------|-------|
| +919710000000 | franchise0@gmail.com | CleanPro Services | Rajesh Kumar |
| +919710000001 | franchise1@gmail.com | SparkleWash | Amit Sharma |

---

## API Endpoints Summary

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Login with phone + password |
| POST | `/api/v1/auth/send-otp` | Send OTP to phone |
| POST | `/api/v1/auth/verify-otp` | Verify OTP |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/auth/profile` | Get current user profile |

### Core Resources (all require auth)
| Method | Endpoint Pattern | Description |
|--------|-----------------|-------------|
| CRUD | `/api/v1/cleaner` | Cleaner management |
| CRUD | `/api/v1/customer` | Customer management |
| CRUD | `/api/v1/tasks` | Task management |
| CRUD | `/api/v1/attendance` | Attendance management |
| CRUD | `/api/v1/earnings` | Earnings management |
| CRUD | `/api/v1/franchise` | Franchise management |
| CRUD | `/api/v1/zones` | Zone management |
| CRUD | `/api/v1/issues` | Issue tracking |
| CRUD | `/api/v1/training` | Training modules |
| CRUD | `/api/v1/services/*` | Marketplace (categories/providers) |
| CRUD | `/api/v1/settings` | App settings |
| CRUD | `/api/v1/bookings` | Service bookings |
| CRUD | `/api/v1/payments` | Payments |
| CRUD | `/api/v1/subscriptions` | Subscriptions |
| CRUD | `/api/v1/qr` | QR code management |
| CRUD | `/api/v1/complaints` | Complaints |
| CRUD | `/api/v1/notifications` | Notifications |
| CRUD | `/api/v1/vehicles` | Vehicles |
| CRUD | `/api/v1/apartments` | Apartments |
| CRUD | `/api/v1/wallet` | Wallet management |
| GET | `/api/v1/analytics/*` | Analytics and reports |

### Uploads
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/upload/image` | Upload image file |
| POST | `/api/v1/upload/document` | Upload document |
| POST | `/api/v1/upload/video` | Upload video |

---

## Admin Panel Routes

| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | Dashboard | Real-time overview with charts |
| `/cleaners` | Cleaners | Full CRUD cleaner management |
| `/customers` | Customers | Full CRUD customer management |
| `/bookings` | Bookings | Booking management |
| `/tasks` | Tasks | Task management with Kanban view |
| `/attendance` | Attendance | Attendance tracking with charts |
| `/earnings` | Earnings | Earnings & payout management |
| `/payments` | Payments | Payment management |
| `/subscriptions` | Subscriptions | Subscription management |
| `/franchises` | Franchises | Franchise partner management |
| `/zones` | Zones | Zone management |
| `/vehicles` | Vehicles | Vehicle management |
| `/qr` | QR Codes | QR code generation & scanning |
| `/apartments` | Apartments | Apartment management |
| `/marketplace` | Marketplace | Service categories & providers |
| `/issues` | Issues | Issue tracking with workflow |
| `/complaints` | Complaints | Complaint management |
| `/training` | Training | Training module management |
| `/notifications` | Notifications | Notification center |
| `/analytics` | Analytics | Reports and charts |
| `/settings` | Settings | Application settings |

---

## Testing Checklist

### Admin Panel
- [ ] Login with phone `+919000000000` / password `admin123`
- [ ] Dashboard shows statistics from all modules
- [ ] Cleaners page: view, add, edit, delete, filter, search, export CSV
- [ ] Customers page: view, edit, filter, deactivate
- [ ] Tasks page: view, filter, Kanban/table toggle
- [ ] Attendance page: view, filter by date range, chart
- [ ] Earnings page: view, filter by period/status
- [ ] Franchises page: view, add, edit, delete, deactivate
- [ ] Zones page: view, add, edit, delete
- [ ] Marketplace page: manage categories & providers
- [ ] Issues page: create, update status workflow
- [ ] Training page: manage modules, category chart
- [ ] Settings page: configure all setting groups
- [ ] QR page: generate, activate, report damaged, replace
- [ ] Bookings page: view, update status
- [ ] Payments page: view, process refunds
- [ ] Complaints page: assign, resolve, close
- [ ] Notifications page: send, view history
- [ ] Analytics page: view reports
- [ ] Real-time: dashboard updates via Socket.IO

### API Testing
- [ ] `POST /api/v1/auth/login` returns JWT tokens
- [ ] `GET /api/v1/cleaner/stats` returns statistics
- [ ] `GET /api/v1/dashboard` returns dashboard data
- [ ] All CRUD endpoints return proper responses
- [ ] Error responses include proper error codes

---

## Architecture Notes

- **Backend**: Node.js + Express + MongoDB (Mongoose)
- **Admin Panel**: React 18 + MUI 5 + Redux Toolkit + Recharts + Socket.IO
- **Auth**: JWT with access + refresh tokens, OTP support
- **Mobile Apps**: React Native (separate projects)
- **Real-time**: Socket.IO for live updates
- **File Upload**: Multer with magic byte validation
