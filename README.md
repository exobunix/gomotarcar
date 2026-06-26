# 🚗 GoMotarCar — Platform Monorepo

> **Anything & Everything For Your Car**

A comprehensive car care platform connecting customers, cleaners, service providers, and administrators. Built with React Native, Node.js, Express, MongoDB, Firebase, Socket.IO, and Razorpay.

---

## 📦 Architecture

| Project | Stack | Description |
|---------|-------|-------------|
| `server/` | Node.js, Express, MongoDB, JWT, Socket.IO | Backend API server |
| `admin-panel/` | React, Material UI, Redux Toolkit | Admin web dashboard |
| `customer-app/` | React Native, Redux Toolkit, React Navigation | Customer mobile app |
| `cleaner-app/` | React Native, Redux Toolkit, React Navigation | Cleaner partner mobile app |

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB 7+ (or Docker)
- Redis 7+ (or Docker)

### Backend Setup
```bash
cd server
cp .env.example .env
# Edit .env with your configuration
npm install
npm run dev
```

### Admin Panel Setup
```bash
cd admin-panel
npm install
npm start
```

### Docker Setup (Backend only)
```bash
docker-compose up -d
# API available at http://localhost:5000
# Health check at http://localhost:5000/health
```

## 📁 Project Structure

```
gomotarcar/
├── server/           # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── config/   # DB, Firebase, Razorpay, Redis, S3 config
│   │   ├── middleware/ # Auth, validation, rate limiting, upload
│   │   ├── models/   # 25+ Mongoose models
│   │   ├── routes/   # API route definitions
│   │   ├── controllers/ # Request handlers
│   │   ├── services/ # Business logic
│   │   ├── socket/   # Socket.IO real-time handlers
│   │   ├── jobs/     # Cron jobs & background tasks
│   │   ├── validators/ # Joi/Zod validation schemas
│   │   └── utils/    # Utilities (JWT, OTP, QR, Geo, etc.)
│   ├── tests/        # Unit & integration tests
│   └── uploads/      # File uploads (local dev)
│
├── admin-panel/      # Admin Web Panel (React + MUI)
│   └── src/
│       ├── pages/    # 15+ page groups
│       ├── components/ # Reusable components
│       ├── layouts/  # Sidebar, header layouts
│       ├── redux/    # Redux Toolkit store & slices
│       └── services/  # API & socket services
│
├── customer-app/     # Customer Mobile App (React Native)
│   └── src/
│       ├── screens/  # 49 screens
│       └── navigation/ # React Navigation setup
│
├── cleaner-app/      # Cleaner Mobile App (React Native)
│   └── src/
│       ├── screens/  # 35 screens
│       └── navigation/ # React Navigation setup
│
├── shared/           # Shared constants, types, utilities
├── docs/             # Architecture & project plan docs
└── docker-compose.yml
```

## 🔑 Key Features

### Customer App (49 Screens)
- Splash, Auth (Login, OTP, Register)
- Home Dashboard with quick actions
- Hire Cleaner with subscription packages
- QR Management (sticker, activation, replacement)
- Service Marketplace (search, providers, booking)
- FastTag Recharge
- Subscription & cleaning balance management
- Booking with job card approval
- Complaints & Grievance tracking
- Profile, Vehicles, Addresses, Settings

### Cleaner App (35 Screens)
- Attendance with GPS verification & selfie
- Task management with filters
- QR scanning & cleaning checklist
- Before/after photo upload
- Earnings dashboard & incentive tracker
- Leave management
- Training videos with progress tracking
- Performance dashboard with customer reviews
- Supervisor communication & chat
- Document verification (Aadhaar, PAN, DL)

### Admin Panel (15+ Pages)
- Real-time KPI dashboard with charts
- Cleaner management & document verification
- Customer & subscription management
- Task board & assignment
- Attendance overview & reporting
- Earnings & payout processing
- Training content management
- Issue & complaint resolution
- Analytics & data export

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT (Access + Refresh tokens), Firebase Auth |
| Real-time | Socket.IO |
| Payments | Razorpay |
| Push Notifications | Firebase Cloud Messaging |
| File Storage | AWS S3 / DigitalOcean Spaces |
| Cache | Redis |
| Background Jobs | Bull (Redis-backed) |
| Admin UI | React, Material UI 5, Recharts |
| Mobile Apps | React Native, React Navigation |
| State Management | Redux Toolkit |

## 📊 API Documentation

Server starts at `http://localhost:5000` with API prefix `/api/v1`.

- Health check: `GET /health`
- API docs: See `docs/API.md`

## 🗺️ Development Roadmap

See [PROJECT_PLAN.md](./PROJECT_PLAN.md) for the complete 22-week development plan.

## 📄 License

Proprietary — GoMotarCar
