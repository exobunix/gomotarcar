# GoMotarCar — Complete System Architecture

> **Platform:** GoMotarCar — Anything & Everything For Your Car  
> **Version:** 2.0.0 (Consolidated)  
> **Audience:** Engineering Team  
> **Stack:** Node.js · Express.js · MongoDB · JWT · Firebase · Socket.IO · Razorpay  
> **Admin Panel:** React · Material UI · Redux Toolkit  
> **Mobile Apps:** React Native · Redux Toolkit · React Navigation  

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [User Roles & Hierarchies](#2-user-roles--hierarchies)
3. [Complete Folder Structure](#3-complete-folder-structure)
4. [MongoDB Database Schema](#4-mongodb-database-schema)
5. [Collection Relationships](#5-collection-relationships)
6. [API Architecture](#6-api-architecture)
7. [Module Architecture](#7-module-architecture)
8. [Authentication & Security Architecture](#8-authentication--security-architecture)
9. [Notification Architecture](#9-notification-architecture)
10. [QR Management Architecture](#10-qr-management-architecture)
11. [Subscription Architecture](#11-subscription-architecture)
12. [Booking Architecture](#12-booking-architecture)
13. [Payment Architecture](#13-payment-architecture)
14. [Microservices & Internal Communication](#14-microservices--internal-communication)
15. [Admin Panel Architecture](#15-admin-panel-architecture)
16. [Customer App Architecture](#16-customer-app-architecture)
17. [Cleaner App Architecture](#17-cleaner-app-architecture)

---

## 1. System Architecture Overview

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│                                                                              │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────────┐ │
│  │   CUSTOMER APP      │  │   CLEANER APP       │  │   ADMIN PANEL          │ │
│  │   (React Native)    │  │   (React Native)     │  │   (React + MUI)       │ │
│  │   • Hire Cleaner    │  │   • Attendance       │  │   • Dashboard         │ │
│  │   • Book Services   │  │   • Task Management  │  │   • Cleaners          │ │
│  │   • QR Management   │  │   • QR Scanning      │  │   • Customers         │ │
│  │   • FastTag         │  │   • Earnings         │  │   • Tasks             │ │
│  │   • Search Services │  │   • Training         │  │   • Payments          │ │
│  │   • Subscriptions   │  │   • Performance      │  │   • Analytics         │ │
│  └──────────┬─────────┘  └──────────┬───────────┘  └───────────┬────────────┘ │
└─────────────┼───────────────────────┼──────────────────────────┼──────────────┘
              │                       │                          │
              ▼                       ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             API GATEWAY LAYER                                │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │            Nginx / AWS CloudFront / Load Balancer                     │   │
│  │            Rate Limiting · CORS · IP Whitelisting                    │   │
│  └──────────────────────────┬───────────────────────────────────────────┘   │
│                             │                                                │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                AUTH MIDDLEWARE (JWT Verification)                     │   │
│  │                Role Guard · Device Validation                         │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SERVICE LAYER (Node.js + Express)                    │
│                                                                              │
│  ┌───────────┐ ┌──────────┐ ┌───────────┐ ┌───────────┐ ┌──────────────┐   │
│  │  Auth      │ │  User    │ │  Cleaner  │ │  Customer │ │  Supervisor  │   │
│  │  Service   │ │  Service │ │  Service  │ │  Service  │ │  Service     │   │
│  └───────────┘ └──────────┘ └───────────┘ └───────────┘ └──────────────┘   │
│  ┌───────────┐ ┌──────────┐ ┌───────────┐ ┌───────────┐ ┌──────────────┐   │
│  │  Task     │ │  Attend- │ │  Leave    │ │  Earnings  │ │  Payment     │   │
│  │  Service  │ │  ance    │ │  Service  │ │  Service   │ │  Service     │   │
│  │           │ │  Service │ │           │ │           │ │  (Razorpay)  │   │
│  └───────────┘ └──────────┘ └───────────┘ └───────────┘ └──────────────┘   │
│  ┌───────────┐ ┌──────────┐ ┌───────────┐ ┌───────────┐ ┌──────────────┐   │
│  │  QR       │ │  Sub-    │ │  Booking  │ │  Training │ │  Performance │   │
│  │  Service  │ │ scription│ │  Service  │ │  Service  │ │  Service     │   │
│  └───────────┘ └──────────┘ └───────────┘ └───────────┘ └──────────────┘   │
│  ┌───────────┐ ┌──────────┐ ┌───────────┐ ┌───────────┐ ┌──────────────┐   │
│  │  Notif-   │ │  Chat/   │ │  Search   │ │  Griev-   │ │  Analytics   │   │
│  │  ication  │ │  Support │ │  Service  │ │  ance     │ │  Service     │   │
│  │  Service  │ │  Service │ │  Marketplace││  Service  │ │  Service     │   │
│  └───────────┘ └──────────┘ └───────────┘ └───────────┘ └──────────────┘   │
│  ┌───────────┐ ┌──────────┐ ┌───────────┐                                   │
│  │  FastTag  │ │  Franch- │ │  Document │                                   │
│  │  Service  │ │  ise     │ │  Service  │                                   │
│  └───────────┘ └──────────┘ └───────────┘                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATA & INFRASTRUCTURE LAYER                          │
│                                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────────┐     │
│  │   MongoDB       │  │   Redis        │  │   Firebase Cloud           │     │
│  │   (Primary DB)  │  │   (Cache/Sess) │  │   Messaging / Auth / OTP   │     │
│  └────────────────┘  └────────────────┘  └────────────────────────────┘     │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────────┐     │
│  │   AWS S3 / DO  │  │   Socket.IO    │  │   Razorpay                 │     │
│  │   Spaces (Docs)│  │   (Real-time)  │  │   (Payments)               │     │
│  └────────────────┘  └────────────────┘  └────────────────────────────┘     │
│  ┌────────────────┐  ┌────────────────┐                                    │
│  │   Elasticsearch│  │   Bull/BullMQ  │                                    │
│  │   (Search)     │  │   (Job Queue)  │                                    │
│  └────────────────┘  └────────────────┘                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Communication Protocols

| Channel | Protocol | Use Case |
|---------|----------|----------|
| Client ↔ Server | HTTPS / REST | All CRUD operations, file uploads |
| Client ↔ Server | WebSocket (Socket.IO) | Real-time tasks, chat, GPS tracking, notifications |
| Server → Device | FCM (Firebase) | Push notifications (offline) |
| Client ↔ Razorpay | SDK | Payment processing |
| Server ↔ Internal | Message Queue (Bull) | Background jobs, cron tasks |
| Server ↔ SMS | Twilio / MSG91 | OTP delivery, alerts |

---

## 2. User Roles & Hierarchies

### 2.1 Role Hierarchy

```
                    ┌─────────────────┐
                    │   SUPER ADMIN   │  (Full system access)
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │    MANAGER      │  (Regional oversight)
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼────────┐    │   ┌──────────▼──────────┐
     │   SUPERVISOR    │    │   │  OPERATIONS TEAM     │
     │  (Zone Incharge)│    │   │  • Finance           │
     └────────┬────────┘    │   │  • Support           │
              │             │   │  • Content/Training  │
              │             │   └─────────────────────┘
              │             │
              │    ┌────────▼────────┐
              │    │   FRANCHISE    │
              │    │   (Partner)    │
              │    └────────────────┘
              │
     ┌────────▼────────┐     ┌──────────────────┐
     │    CLEANER      │     │    CUSTOMER      │
     │  (Service Staff)│     │  (End User)      │
     └─────────────────┘     └──────────────────┘
```

### 2.2 Role Permissions Matrix

| Feature | Super Admin | Manager | Supervisor | Operations | Franchise | Cleaner | Customer |
|---------|:-----------:|:-------:|:----------:|:----------:|:---------:|:-------:|:--------:|
| Platform Config | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Admin User Management | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Cleaner Management | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| Customer Management | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ |
| Task Assignment | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| Attendance Override | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Leave Approval | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Payment Processing | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Payouts | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Training Content | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Announcements | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Analytics (Full) | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| QR Management | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Subscription Mgmt | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Franchise Mgmt | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Issue Resolution | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Search Marketplace | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |

---

## 3. Complete Folder Structure

```
gomotarcar/
│
├── server/                                # Backend (Node.js + Express)
│   ├── src/
│   │   ├── index.js                       # Entry point — Express app bootstrap
│   │   ├── app.js                         # Express configuration, middleware setup
│   │   │
│   │   ├── config/
│   │   │   ├── db.js                      # MongoDB connection (mongoose)
│   │   │   ├── firebase.js                # Firebase Admin SDK init
│   │   │   ├── razorpay.js                # Razorpay client init (for payments & payouts)
│   │   │   ├── redis.js                   # Redis client initialization
│   │   │   ├── s3.js                      # AWS S3 / DO Spaces config
│   │   │   ├── elasticsearch.js           # Elasticsearch client (search marketplace)
│   │   │   ├── sms.js                     # SMS provider config (Twilio/MSG91)
│   │   │   ├── email.js                   # Email service config
│   │   │   └── env.js                     # Environment variable validation
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js                    # JWT verification middleware
│   │   │   ├── roleGuard.js               # Role-based access control (RBAC)
│   │   │   ├── validate.js                # Request validation (Joi/Zod)
│   │   │   ├── rateLimiter.js             # Rate limiting by role & IP
│   │   │   ├── deviceValidator.js         # Device fingerprint validation
│   │   │   ├── upload.js                  # Multer file upload config (images, docs)
│   │   │   ├── audit.js                   # Audit logging middleware
│   │   │   └── errorHandler.js            # Global error handler
│   │   │
│   │   ├── models/                        # Mongoose schemas
│   │   │   ├── User.js                    # Base user auth model
│   │   │   ├── Admin.js                   # Admin profile
│   │   │   ├── Manager.js                 # Manager profile
│   │   │   ├── Supervisor.js              # Supervisor profile
│   │   │   ├── Cleaner.js                 # Cleaner profile (with bank, docs, stats)
│   │   │   ├── Customer.js                # Customer profile (with vehicles, addresses)
│   │   │   ├── Franchise.js               # Franchise partner profile
│   │   │   ├── Vehicle.js                 # Customer vehicles
│   │   │   ├── Task.js                    # Cleaning tasks
│   │   │   ├── Attendance.js              # Daily attendance records
│   │   │   ├── Leave.js                   # Leave applications
│   │   │   ├── Earnings.js                # Cleaner earnings ledger
│   │   │   ├── Incentive.js               # Monthly incentive tracking
│   │   │   ├── Payout.js                  # Bulk payout processing
│   │   │   ├── Payment.js                 # All payment transactions
│   │   │   ├── Refund.js                  # Refund processing
│   │   │   ├── Subscription.js            # Customer subscriptions
│   │   │   ├── SubscriptionPackage.js     # Available subscription packages
│   │   │   ├── CleaningBalance.js         # Per-subscription cleaning tracking
│   │   │   ├── QRCode.js                  # QR code registry
│   │   │   ├── QRReplacement.js           # QR replacement requests
│   │   │   ├── Issue.js                   # Issue/grievance tickets
│   │   │   ├── Notification.js            # In-app notifications
│   │   │   ├── Announcement.js            # Broadcast announcements
│   │   │   ├── Document.js                # Cleaner documents
│   │   │   ├── TrainingVideo.js           # Training content
│   │   │   ├── TrainingProgress.js        # Cleaner training progress
│   │   │   ├── Review.js                  # Customer reviews
│   │   │   ├── Performance.js             # Cleaner performance metrics
│   │   │   ├── ChatMessage.js             # Chat messages
│   │   │   ├── Zone.js                    # Operational zones
│   │   │   ├── ServiceCategory.js         # Search marketplace categories
│   │   │   ├── ServiceProvider.js         # Service providers (workshops, etc.)
│   │   │   ├── ServiceBooking.js          # Service bookings (non-cleaning)
│   │   │   ├── ServiceSlot.js             # Available booking slots
│   │   │   ├── FranchiseBooking.js        # Franchise service bookings
│   │   │   ├── FastTagTransaction.js      # FastTag recharge records
│   │   │   ├── Offer.js                   # Discounts & promotions
│   │   │   ├── Coupon.js                  # Coupon codes
│   │   │   ├── Complaint.js               # Customer grievances
│   │   │   ├── Address.js                 # Customer addresses
│   │   │   └── AuditLog.js                # System audit trail
│   │   │
│   │   ├── routes/                        # Express route definitions
│   │   │   ├── index.js                   # Route aggregator
│   │   │   ├── auth.routes.js
│   │   │   ├── customer.routes.js
│   │   │   ├── cleaner.routes.js
│   │   │   ├── admin.routes.js
│   │   │   ├── supervisor.routes.js
│   │   │   ├── franchise.routes.js
│   │   │   ├── task.routes.js
│   │   │   ├── attendance.routes.js
│   │   │   ├── leave.routes.js
│   │   │   ├── earnings.routes.js
│   │   │   ├── payment.routes.js
│   │   │   ├── subscription.routes.js
│   │   │   ├── qr.routes.js
│   │   │   ├── issue.routes.js
│   │   │   ├── notification.routes.js
│   │   │   ├── training.routes.js
│   │   │   ├── performance.routes.js
│   │   │   ├── document.routes.js
│   │   │   ├── booking.routes.js
│   │   │   ├── service-marketplace.routes.js
│   │   │   ├── fasttag.routes.js
│   │   │   ├── franchise.routes.js
│   │   │   ├── offer.routes.js
│   │   │   ├── complaint.routes.js
│   │   │   ├── chat.routes.js
│   │   │   ├── search.routes.js
│   │   │   ├── upload.routes.js
│   │   │   └── analytics.routes.js
│   │   │
│   │   ├── controllers/                   # Request handlers
│   │   │   ├── auth.controller.js
│   │   │   ├── customer.controller.js
│   │   │   ├── cleaner.controller.js
│   │   │   ├── admin.controller.js
│   │   │   ├── supervisor.controller.js
│   │   │   ├── franchise.controller.js
│   │   │   ├── task.controller.js
│   │   │   ├── attendance.controller.js
│   │   │   ├── leave.controller.js
│   │   │   ├── earnings.controller.js
│   │   │   ├── payment.controller.js
│   │   │   ├── subscription.controller.js
│   │   │   ├── qr.controller.js
│   │   │   ├── issue.controller.js
│   │   │   ├── notification.controller.js
│   │   │   ├── training.controller.js
│   │   │   ├── performance.controller.js
│   │   │   ├── document.controller.js
│   │   │   ├── booking.controller.js
│   │   │   ├── service-marketplace.controller.js
│   │   │   ├── fasttag.controller.js
│   │   │   ├── franchise.controller.js
│   │   │   ├── offer.controller.js
│   │   │   ├── complaint.controller.js
│   │   │   ├── chat.controller.js
│   │   │   ├── search.controller.js
│   │   │   ├── upload.controller.js
│   │   │   └── analytics.controller.js
│   │   │
│   │   ├── services/                      # Business logic layer
│   │   │   ├── auth.service.js
│   │   │   ├── otp.service.js
│   │   │   ├── cleaner.service.js
│   │   │   ├── customer.service.js
│   │   │   ├── task.service.js
│   │   │   ├── task-assignment.service.js # Weighted round-robin assignment algo
│   │   │   ├── attendance.service.js
│   │   │   ├── leave.service.js
│   │   │   ├── earnings.service.js
│   │   │   ├── incentive.service.js
│   │   │   ├── payout.service.js
│   │   │   ├── payment.service.js
│   │   │   ├── subscription.service.js
│   │   │   ├── cleaning-balance.service.js
│   │   │   ├── qr.service.js
│   │   │   ├── qr-replacement.service.js
│   │   │   ├── issue.service.js
│   │   │   ├── complaint.service.js
│   │   │   ├── notification.service.js
│   │   │   ├── push.service.js           # FCM push delivery
│   │   │   ├── training.service.js
│   │   │   ├── performance.service.js
│   │   │   ├── document.service.js
│   │   │   ├── booking.service.js
│   │   │   ├── service-marketplace.service.js
│   │   │   ├── slot.service.js
│   │   │   ├── fasttag.service.js
│   │   │   ├── franchise.service.js
│   │   │   ├── search.service.js          # Elasticsearch integration
│   │   │   ├── offer.service.js
│   │   │   ├── chat.service.js
│   │   │   ├── analytics.service.js
│   │   │   ├── report.service.js
│   │   │   ├── email.service.js
│   │   │   ├── sms.service.js
│   │   │   ├── upload.service.js
│   │   │   ├── audit.service.js
│   │   │   └── geo.service.js             # GPS distance & zone validation
│   │   │
│   │   ├── socket/                        # Socket.IO real-time handlers
│   │   │   ├── index.js                   # Socket initialization & auth
│   │   │   ├── task.handler.js            # Task assignment, updates
│   │   │   ├── attendance.handler.js      # Check-in/out notifications
│   │   │   ├── chat.handler.js            # Real-time messaging
│   │   │   ├── location.handler.js        # Live cleaner GPS tracking
│   │   │   ├── notification.handler.js    # Real-time notification delivery
│   │   │   ├── tracking.handler.js        # Customer tracking cleaner
│   │   │   └── booking.handler.js         # Booking status updates
│   │   │
│   │   ├── jobs/                          # Background jobs (Bull/BullMQ)
│   │   │   ├── attendance.cron.js         # Auto-mark no-shows at 10:30 AM
│   │   │   ├── earnings.cron.js           # Daily/weekly/monthly calc
│   │   │   ├── incentive.cron.js          # Monthly incentive computation
│   │   │   ├── payout.cron.js             # Scheduled payouts
│   │   │   ├── subscription.cron.js       # Auto-renew, expiry alerts
│   │   │   ├── notification.cron.js       # Scheduled push notifications
│   │   │   ├── performance.cron.js        # Performance recalculation
│   │   │   ├── cleanup.cron.js            # Temp file cleanup, log rotation
│   │   │   ├── match.cron.js              # Auto-assign cleaners to tasks
│   │   │   └── report.cron.js             # Generate & email reports
│   │   │
│   │   ├── validators/                    # Joi/Zod request schemas
│   │   │   ├── auth.validator.js
│   │   │   ├── customer.validator.js
│   │   │   ├── cleaner.validator.js
│   │   │   ├── task.validator.js
│   │   │   ├── attendance.validator.js
│   │   │   ├── subscription.validator.js
│   │   │   ├── booking.validator.js
│   │   │   ├── payment.validator.js
│   │   │   ├── qr.validator.js
│   │   │   └── complaint.validator.js
│   │   │
│   │   ├── utils/
│   │   │   ├── jwt.js                     # JWT sign/verify helpers
│   │   │   ├── otp.js                     # OTP generation & verification
│   │   │   ├── qr.js                      # QR code generation & encryption
│   │   │   ├── geo.js                     # GPS distance calculations
│   │   │   ├── encryption.js              # AES-256 for sensitive data
│   │   │   ├── pagination.js              # Offset & cursor pagination
│   │   │   ├── response.js               # Standard response formatter
│   │   │   ├── logger.js                  # Winston logger configuration
│   │   │   ├── constants.js               # App-wide enums & constants
│   │   │   ├── helpers.js                 # General utility functions
│   │   │   └── validators.js             # Shared validation functions
│   │   │
│   │   └── templates/                     # Email & notification templates
│   │       ├── emails/
│   │       │   ├── welcome.html
│   │       │   ├── payout.html
│   │       │   └── invoice.html
│   │       └── push/
│   │           ├── task-assigned.json
│   │           ├── leave-approved.json
│   │           └── payment-received.json
│   │
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── fixtures/
│   │
│   ├── uploads/                           # Local dev uploads (gitignored)
│   ├── .env.example
│   ├── package.json
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── admin-panel/                           # Admin Web Panel
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── index.js                       # Entry point
│   │   ├── App.js                         # Root component with router
│   │   ├── theme.js                       # MUI theme (brand colors)
│   │   │
│   │   ├── layouts/
│   │   │   ├── AdminLayout.jsx            # Main layout with sidebar
│   │   │   ├── Sidebar.jsx                # Navigation sidebar
│   │   │   ├── Header.jsx                 # Top header with notifications
│   │   │   └── ProtectedRoute.jsx         # Auth guard wrapper
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard/
│   │   │   │   ├── DashboardPage.jsx
│   │   │   │   ├── KPICards.jsx
│   │   │   │   ├── TaskChart.jsx
│   │   │   │   ├── RevenueChart.jsx
│   │   │   │   ├── ZoneDistribution.jsx
│   │   │   │   └── ActivityFeed.jsx
│   │   │   ├── Cleaners/
│   │   │   │   ├── CleanerListPage.jsx
│   │   │   │   ├── CleanerDetailPage.jsx
│   │   │   │   ├── CleanerForm.jsx
│   │   │   │   ├── DocumentVerification.jsx
│   │   │   │   └── CleanerPerformance.jsx
│   │   │   ├── Customers/
│   │   │   │   ├── CustomerListPage.jsx
│   │   │   │   ├── CustomerDetailPage.jsx
│   │   │   │   └── CustomerSubscription.jsx
│   │   │   ├── Tasks/
│   │   │   │   ├── TaskListPage.jsx
│   │   │   │   ├── TaskDetailPage.jsx
│   │   │   │   ├── TaskAssignment.jsx
│   │   │   │   └── ScheduleBoard.jsx
│   │   │   ├── Attendance/
│   │   │   │   ├── AttendancePage.jsx
│   │   │   │   ├── AttendanceReport.jsx
│   │   │   │   └── AttendanceOverride.jsx
│   │   │   ├── Earnings/
│   │   │   │   ├── EarningsOverview.jsx
│   │   │   │   ├── PayoutManagement.jsx
│   │   │   │   └── IncentiveSettings.jsx
│   │   │   ├── Payments/
│   │   │   │   ├── TransactionList.jsx
│   │   │   │   └── RefundManagement.jsx
│   │   │   ├── Subscriptions/
│   │   │   │   ├── PackageManagement.jsx
│   │   │   │   └── SubscriptionList.jsx
│   │   │   ├── QRManagement/
│   │   │   │   ├── QRListPage.jsx
│   │   │   │   └── QRReplacementRequests.jsx
│   │   │   ├── Training/
│   │   │   │   ├── VideoList.jsx
│   │   │   │   ├── VideoUpload.jsx
│   │   │   │   └── TrainingReports.jsx
│   │   │   ├── Zones/
│   │   │   │   ├── ZoneList.jsx
│   │   │   │   └── ZoneMap.jsx
│   │   │   ├── Marketplace/
│   │   │   │   ├── ServiceProviders.jsx
│   │   │   │   ├── Categories.jsx
│   │   │   │   └── ProviderVerification.jsx
│   │   │   ├── Franchise/
│   │   │   │   ├── FranchiseList.jsx
│   │   │   │   └── FranchiseDetail.jsx
│   │   │   ├── Issues/
│   │   │   │   ├── IssueQueue.jsx
│   │   │   │   └── IssueDetail.jsx
│   │   │   ├── Complaints/
│   │   │   │   ├── ComplaintList.jsx
│   │   │   │   └── ResolutionCenter.jsx
│   │   │   ├── Notifications/
│   │   │   │   ├── NotificationCenter.jsx
│   │   │   │   └── BroadcastForm.jsx
│   │   │   ├── Analytics/
│   │   │   │   ├── AnalyticsDashboard.jsx
│   │   │   │   ├── Reports.jsx
│   │   │   │   └── ExportData.jsx
│   │   │   ├── Support/
│   │   │   │   ├── TicketList.jsx
│   │   │   │   └── ChatLogs.jsx
│   │   │   └── Settings/
│   │   │       ├── GeneralSettings.jsx
│   │   │       ├── RolesPermissions.jsx
│   │   │       ├── EmailTemplates.jsx
│   │   │       └── SystemConfig.jsx
│   │   │
│   │   ├── components/                    # Reusable MUI components
│   │   │   ├── DataTable.jsx              # Universal data table
│   │   │   ├── StatCard.jsx               # KPI card
│   │   │   ├── StatusBadge.jsx            # Task/status badges
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   ├── SearchInput.jsx
│   │   │   ├── FilterPanel.jsx
│   │   │   ├── LoadingScreen.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   │
│   │   ├── redux/                         # Redux Toolkit
│   │   │   ├── store.js
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.js
│   │   │   │   ├── cleanerSlice.js
│   │   │   │   ├── customerSlice.js
│   │   │   │   ├── taskSlice.js
│   │   │   │   ├── attendanceSlice.js
│   │   │   │   ├── earningsSlice.js
│   │   │   │   ├── notificationSlice.js
│   │   │   │   └── uiSlice.js
│   │   │   └── api/
│   │   │       ├── apiBase.js             # Axios instance
│   │   │       ├── authApi.js
│   │   │       ├── cleanerApi.js
│   │   │       ├── customerApi.js
│   │   │       ├── taskApi.js
│   │   │       └── analyticsApi.js
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── usePagination.js
│   │   │   ├── useDebounce.js
│   │   │   └── useSocket.js
│   │   │
│   │   ├── services/
│   │   │   └── socket.service.js
│   │   │
│   │   ├── utils/
│   │   │   ├── formatters.js
│   │   │   ├── validators.js
│   │   │   └── permissions.js
│   │   │
│   │   └── routes/
│   │       └── index.js                   # Route definitions
│   │
│   ├── package.json
│   └── Dockerfile
│
├── customer-app/                          # Customer React Native App
│   ├── src/
│   │   ├── App.tsx
│   │   ├── navigation/
│   │   │   ├── AppNavigator.tsx
│   │   │   ├── AuthNavigator.tsx
│   │   │   ├── MainTabNavigator.tsx
│   │   │   ├── HomeStack.tsx
│   │   │   ├── HireCleanerStack.tsx
│   │   │   ├── ServicesStack.tsx
│   │   │   ├── BookingsStack.tsx
│   │   │   ├── FastTagStack.tsx
│   │   │   ├── OffersStack.tsx
│   │   │   └── ProfileStack.tsx
│   │   │
│   │   ├── screens/
│   │   │   ├── splash/
│   │   │   │   ├── SplashScreen1.tsx       # Brand intro
│   │   │   │   ├── SplashScreen2.tsx       # Feature carousel
│   │   │   │   └── SplashScreen3.tsx       # Get Started
│   │   │   ├── auth/
│   │   │   │   ├── LoginScreen.tsx
│   │   │   │   ├── OTPVerificationScreen.tsx
│   │   │   │   └── RegistrationScreen.tsx
│   │   │   ├── home/
│   │   │   │   └── HomeDashboardScreen.tsx
│   │   │   ├── hire-cleaner/
│   │   │   │   ├── HireCleanerLanding.tsx
│   │   │   │   ├── ApartmentSelection.tsx
│   │   │   │   ├── AddVehicleScreen.tsx
│   │   │   │   ├── SubscriptionPackages.tsx
│   │   │   │   ├── CheckoutScreen.tsx
│   │   │   │   ├── PaymentSuccessScreen.tsx
│   │   │   │   ├── SubscriptionDashboard.tsx
│   │   │   │   ├── CleaningHistoryScreen.tsx
│   │   │   │   ├── CleaningBalanceScreen.tsx
│   │   │   │   └── ChangeCleanerScreen.tsx
│   │   │   ├── qr/
│   │   │   │   ├── MyQRStickerScreen.tsx
│   │   │   │   ├── QRActivationScreen.tsx
│   │   │   │   └── QRReplacementScreen.tsx
│   │   │   ├── search/
│   │   │   │   ├── SearchHomeScreen.tsx
│   │   │   │   ├── SearchResultsScreen.tsx
│   │   │   │   ├── ServiceProviderProfile.tsx
│   │   │   │   └── RatingScreen.tsx
│   │   │   ├── services/
│   │   │   │   ├── ServiceCategoriesScreen.tsx
│   │   │   │   ├── ServiceDetailScreen.tsx
│   │   │   │   ├── FranchiseListScreen.tsx
│   │   │   │   ├── SlotBookingScreen.tsx
│   │   │   │   ├── ServiceModeScreen.tsx
│   │   │   │   ├── BookingSummaryScreen.tsx
│   │   │   │   ├── PaymentScreen.tsx
│   │   │   │   ├── BookingTrackingScreen.tsx
│   │   │   │   ├── JobCardApprovalScreen.tsx
│   │   │   │   └── InvoiceScreen.tsx
│   │   │   ├── fasttag/
│   │   │   │   ├── FastTagRechargeScreen.tsx
│   │   │   │   ├── RechargeSuccessScreen.tsx
│   │   │   │   └── RechargeHistoryScreen.tsx
│   │   │   ├── offers/
│   │   │   │   └── OffersScreen.tsx
│   │   │   ├── notifications/
│   │   │   │   └── NotificationCenterScreen.tsx
│   │   │   ├── complaints/
│   │   │   │   ├── RaiseComplaintScreen.tsx
│   │   │   │   └── ComplaintTrackingScreen.tsx
│   │   │   └── profile/
│   │   │       ├── ProfileDashboardScreen.tsx
│   │   │       ├── MyVehiclesScreen.tsx
│   │   │       ├── AddressManagementScreen.tsx
│   │   │       ├── PaymentHistoryScreen.tsx
│   │   │       ├── ReviewsScreen.tsx
│   │   │       ├── SettingsScreen.tsx
│   │   │       └── HelpSupportScreen.tsx
│   │   │
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── OTPInput.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Loader.tsx
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   ├── Avatar.tsx
│   │   │   │   ├── ProgressCircle.tsx
│   │   │   │   └── Toast.tsx
│   │   │   ├── home/
│   │   │   │   ├── QuickActionGrid.tsx
│   │   │   │   ├── ActiveSubscription.tsx
│   │   │   │   ├── UpcomingServices.tsx
│   │   │   │   └── PromotionalBanner.tsx
│   │   │   ├── subscription/
│   │   │   │   ├── PackageCard.tsx
│   │   │   │   ├── PackageComparison.tsx
│   │   │   │   └── CleaningProgress.tsx
│   │   │   ├── booking/
│   │   │   │   ├── BookingCard.tsx
│   │   │   │   ├── SlotSelector.tsx
│   │   │   │   └── TrackingTimeline.tsx
│   │   │   ├── qr/
│   │   │   │   ├── QRDisplay.tsx
│   │   │   │   └── QRStatusBadge.tsx
│   │   │   └── common/
│   │   │       ├── Header.tsx
│   │   │       ├── BottomNav.tsx
│   │   │       └── NetworkDetector.tsx
│   │   │
│   │   ├── redux/
│   │   │   ├── store.ts
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.ts
│   │   │   │   ├── subscriptionSlice.ts
│   │   │   │   ├── bookingSlice.ts
│   │   │   │   ├── qrSlice.ts
│   │   │   │   ├── serviceSlice.ts
│   │   │   │   ├── notificationSlice.ts
│   │   │   │   └── uiSlice.ts
│   │   │   └── api/
│   │   │       ├── apiBase.ts
│   │   │       ├── authApi.ts
│   │   │       └── ...
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useSubscription.ts
│   │   │   ├── useBooking.ts
│   │   │   ├── useQR.ts
│   │   │   ├── usePayment.ts
│   │   │   ├── useSocket.ts
│   │   │   ├── useLocation.ts
│   │   │   └── useNotification.ts
│   │   │
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── subscription.service.ts
│   │   │   ├── booking.service.ts
│   │   │   ├── payment.service.ts
│   │   │   └── socket.service.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── validators.ts
│   │   │   ├── formatters.ts
│   │   │   └── deepLinks.ts
│   │   │
│   │   └── theme/
│   │       ├── colors.ts
│   │       ├── typography.ts
│   │       ├── spacing.ts
│   │       └── shadows.ts
│   │
│   ├── __tests__/
│   ├── android/
│   ├── ios/
│   ├── app.json
│   └── package.json
│
├── cleaner-app/                          # Cleaner React Native App
│   ├── src/
│   │   ├── App.tsx
│   │   ├── navigation/
│   │   │   ├── AppNavigator.tsx
│   │   │   ├── AuthNavigator.tsx
│   │   │   ├── MainTabNavigator.tsx
│   │   │   ├── DashboardStack.tsx
│   │   │   ├── TasksStack.tsx
│   │   │   ├── EarningsStack.tsx
│   │   │   ├── ProfileStack.tsx
│   │   │   └── TrainingStack.tsx
│   │   │
│   │   ├── screens/
│   │   │   ├── SplashScreen.tsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginScreen.tsx
│   │   │   │   └── OTPVerificationScreen.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── HomeDashboardScreen.tsx
│   │   │   ├── attendance/
│   │   │   │   ├── StartDayScreen.tsx
│   │   │   │   └── AttendanceHistoryScreen.tsx
│   │   │   ├── tasks/
│   │   │   │   ├── TaskListScreen.tsx
│   │   │   │   ├── TaskDetailScreen.tsx
│   │   │   │   └── CleaningChecklistScreen.tsx
│   │   │   ├── qr/
│   │   │   │   ├── ScanQRScreen.tsx
│   │   │   │   ├── QRVerificationScreen.tsx
│   │   │   │   └── CleaningCompletionScreen.tsx
│   │   │   ├── customer/
│   │   │   │   ├── CustomerDetailScreen.tsx
│   │   │   │   └── CustomerVehicleScreen.tsx
│   │   │   ├── issues/
│   │   │   │   ├── ReportIssueScreen.tsx
│   │   │   │   └── IssueTrackingScreen.tsx
│   │   │   ├── earnings/
│   │   │   │   ├── EarningsDashboardScreen.tsx
│   │   │   │   ├── EarningsHistoryScreen.tsx
│   │   │   │   └── IncentiveTrackerScreen.tsx
│   │   │   ├── supervisor/
│   │   │   │   ├── SupervisorDetailScreen.tsx
│   │   │   │   └── ChatScreen.tsx
│   │   │   ├── leave/
│   │   │   │   ├── ApplyLeaveScreen.tsx
│   │   │   │   └── LeaveStatusScreen.tsx
│   │   │   ├── notifications/
│   │   │   │   └── NotificationCenterScreen.tsx
│   │   │   ├── training/
│   │   │   │   ├── TrainingListScreen.tsx
│   │   │   │   └── TrainingDetailScreen.tsx
│   │   │   ├── performance/
│   │   │   │   ├── PerformanceDashboardScreen.tsx
│   │   │   │   └── CustomerReviewsScreen.tsx
│   │   │   ├── profile/
│   │   │   │   ├── ProfileDashboardScreen.tsx
│   │   │   │   ├── EditProfileScreen.tsx
│   │   │   │   ├── BankDetailsScreen.tsx
│   │   │   │   ├── DocumentsScreen.tsx
│   │   │   │   ├── SettingsScreen.tsx
│   │   │   │   └── HelpSupportScreen.tsx
│   │   │   └── success/
│   │   │       └── SuccessScreen.tsx
│   │   │
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── dashboard/
│   │   │   ├── task/
│   │   │   ├── earnings/
│   │   │   ├── qr/
│   │   │   └── chat/
│   │   │
│   │   ├── redux/
│   │   │   ├── store.ts
│   │   │   └── slices/
│   │   │
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   └── theme/
│   │
│   ├── __tests__/
│   ├── android/
│   ├── ios/
│   ├── app.json
│   └── package.json
│
├── shared/                               # Shared code across all apps
│   ├── constants/
│   │   ├── enums.js
│   │   ├── statusCodes.js
│   │   └── errorCodes.js
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       ├── validators.js
│       └── formatters.js
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── PROJECT_PLAN.md
│   ├── API.md
│   ├── DATABASE.md
│   └── DEPLOYMENT.md
│
├── scripts/
│   ├── seed.js                            # Database seed script
│   ├── migrate.js                         # Migration scripts
│   └── deploy.sh                          # Deployment script
│
├── .gitignore
├── docker-compose.yml
├── docker-compose.prod.yml
└── README.md
```

---

## 4. MongoDB Database Schema

### 4.1 Users Collection (Authentication Base)
```javascript
{
  _id: ObjectId,
  phone: String,                  // +919876543210 — unique index
  email: String,                  // unique, sparse index
  passwordHash: String,           // bcrypt
  role: String,                   // "super_admin" | "manager" | "supervisor" | "operations" | "franchise" | "cleaner" | "customer"
  isActive: Boolean,              // default: true
  isVerified: Boolean,            // default: false
  phoneVerified: Boolean,         // default: false
  emailVerified: Boolean,         // default: false
  fcmToken: String,               // Firebase Cloud Messaging token
  deviceId: String,               // Device fingerprint
  lastLogin: Date,
  loginHistory: [{
    ip: String,
    device: String,
    timestamp: Date
  }],
  refreshToken: String,           // Hashed refresh JWT
  tokenVersion: Number,           // Increment to invalidate all sessions
  createdAt: Date,
  updatedAt: Date
}
// Indexes: { phone: 1 }, { email: 1 }, { role: 1 }
```

### 4.2 Customers Collection
```javascript
{
  _id: ObjectId,                   // References Users._id
  userId: ObjectId,                // Ref: Users — 1:1
  firstName: String,
  lastName: String,
  phone: String,
  email: String,
  photo: String,                   // S3 URL
  
  // Default Address
  defaultAddressId: ObjectId,      // Ref: Addresses
  
  // Subscription
  activeSubscriptionId: ObjectId,  // Ref: Subscriptions (current active)
  subscriptionStatus: String,      // "none" | "active" | "expired" | "cancelled"
  
  // Stats (denormalized)
  totalBookings: Number,
  totalSpent: Number,
  totalCleanings: Number,
  cleaningBalance: Number,         // Remaining cleanings in current subscription
  
  // Referral
  referralCode: String,
  referredBy: ObjectId,            // Ref: Customers
  
  createdAt: Date,
  updatedAt: Date
}
// Indexes: { phone: 1 }, { userId: 1 }, { referralCode: 1 }
```

### 4.3 Cleaners Collection
```javascript
{
  _id: ObjectId,                   // References Users._id
  userId: ObjectId,                // Ref: Users — 1:1
  firstName: String,
  lastName: String,
  photo: String,
  cleanerId: String,               // "GMC-0001" — auto-generated sequential
  
  // Personal
  dateOfBirth: Date,
  gender: String,                  // "male" | "female" | "other"
  alternatePhone: String,
  email: String,
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      type: { type: String, enum: ["Point"] },
      coordinates: [Number]        // [longitude, latitude]
    }
  },
  
  // Work
  assignedZone: ObjectId,          // Ref: Zones
  assignedArea: String,            // "Sector 14, Gurgaon"
  supervisorId: ObjectId,          // Ref: Users (supervisor)
  joiningDate: Date,
  experience: Number,              // Years
  employmentType: String,          // "full-time" | "part-time" | "contract"
  
  // Bank (AES-256 encrypted)
  bankDetails: {
    accountHolder: String,         // Encrypted
    accountNumber: String,         // Encrypted
    ifscCode: String,              // Encrypted
    bankName: String,
    upiId: String,                 // Encrypted
    paymentPreference: String      // "bank" | "upi"
  },
  
  // Documents
  verificationStatus: String,      // "pending" | "verified" | "rejected"
  documents: [{
    type: String,                  // "aadhaar" | "pan" | "driving_license" | "police_verification"
    documentNumber: String,        // Partially masked
    fileUrl: String,
    status: String,                // "pending" | "verified" | "rejected"
    verifiedBy: ObjectId,          // Ref: Admin
    verifiedAt: Date,
    rejectionReason: String,
    uploadedAt: Date
  }],
  
  // Settings
  language: String,                // "en" | "hi" | etc.
  notificationsEnabled: Boolean,
  locationTrackingEnabled: Boolean,
  
  // Denormalized Stats (updated via cron/triggers)
  stats: {
    totalTasksCompleted: Number,
    totalEarnings: Number,
    averageRating: Number,
    attendancePercentage: Number,
    currentMonthTasks: Number,
    currentMonthEarnings: Number,
    currentRating: Number,
    rank: Number
  },
  
  createdAt: Date,
  updatedAt: Date
}
// Indexes: { cleanerId: 1 }, { supervisorId: 1 }, { assignedZone: 1 },
//          { "address.coordinates": "2dsphere" }, { verificationStatus: 1 }
```

### 4.4 Vehicles Collection
```javascript
{
  _id: ObjectId,
  customerId: ObjectId,            // Ref: Customers
  vehicleNumber: String,           // "DL-01-AB-1234"
  model: String,                   // "Hyundai i20"
  make: String,                    // "Hyundai"
  year: Number,
  color: String,
  fuelType: String,                // "petrol" | "diesel" | "electric" | "cng"
  vehicleType: String,             // "hatchback" | "sedan" | "suv" | "luxury" | "ev"
  photo: String,
  
  // QR Code
  qrCode: {
    code: String,                  // Unique QR identifier
    qrImageUrl: String,            // S3 URL
    status: String,                // "active" | "pending" | "replaced" | "damaged"
    issuedAt: Date,
    lastReplacedAt: Date
  },
  
  // Subscription
  subscriptionId: ObjectId,        // Ref: Subscriptions
  packageType: String,             // "basic" | "premium" | "elite"
  
  // Stats
  totalCleanings: Number,
  lastCleaning: Date,
  cleaningHistory: [{
    taskId: ObjectId,
    date: Date,
    cleanerId: ObjectId,
    cleanerName: String,
    packageType: String,
    status: String
  }],                              // Last 10 entries
  
  // RC / PUC / Challan
  rcVerified: Boolean,
  pucExpiry: Date,
  challans: Number,
  
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
// Indexes: { vehicleNumber: 1 }, { customerId: 1 },
//          { "qrCode.code": 1 }, { subscriptionId: 1 }
```

### 4.5 Subscriptions Collection
```javascript
{
  _id: ObjectId,
  customerId: ObjectId,            // Ref: Customers
  vehicleId: ObjectId,             // Ref: Vehicles (optional for multi-vehicle)
  
  // Package
  packageId: ObjectId,             // Ref: SubscriptionPackages
  packageType: String,             // "basic" | "premium" | "elite"
  packageName: String,             // "Basic Wash"
  frequency: String,               // "weekly" | "biweekly" | "monthly"
  
  // Pricing
  totalAmount: Number,             // Before discount
  discount: Number,
  discountType: String,            // "percentage" | "fixed"
  gstAmount: Number,
  netAmount: Number,               // Final amount paid
  
  // Duration
  startDate: Date,
  endDate: Date,
  trialEndDate: Date,              // For trial period
  durationMonths: Number,
  
  // Cleaning Balance
  totalCleanings: Number,          // e.g., 8 per month
  usedCleanings: Number,
  remainingCleanings: Number,
  extraCleanings: Number,          // Additional one-off
  extraCleaningRate: Number,
  
  // Status & Assignment
  status: String,                  // "active" | "expired" | "cancelled" | "trial"
  autoRenew: Boolean,
  cleanerId: ObjectId,             // Ref: Cleaners (assigned)
  supervisorId: ObjectId,          // Ref: Supervisor
  
  // Cancellation
  cancelledAt: Date,
  cancellationReason: String,
  cancelledBy: String,             // "customer" | "admin"
  refundEligible: Boolean,
  refundAmount: Number,
  refundProcessed: Boolean,
  
  // Payment
  paymentId: ObjectId,             // Ref: Payments
  razorpaySubscriptionId: String,  // Razorpay recurring ID
  
  createdAt: Date,
  updatedAt: Date
}
// Indexes: { customerId: 1 }, { cleanerId: 1 }, { status: 1, endDate: -1 }
```

### 4.6 SubscriptionPackages Collection
```javascript
{
  _id: ObjectId,
  name: String,                    // "Basic", "Premium", "Elite"
  code: String,                    // "basic", "premium", "elite"
  
  // Pricing
  price: Number,                   // Monthly price
  discountPrice: Number,           // Discounted price
  gstPercent: Number,              // 18
  setupFee: Number,
  
  // Details
  frequencyOptions: [String],      // ["weekly", "biweekly", "monthly"]
  cleaningsPerMonth: Number,       // 4 for weekly
  durationMonths: Number,          // 1, 3, 6, 12
  
  // Services included
  services: [{
    serviceId: String,
    name: String,
    included: Boolean
  }],
  
  // Benefits
  features: [String],              // Features list for comparison table
  isPopular: Boolean,
  sortOrder: Number,
  
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 4.7 Tasks Collection
```javascript
{
  _id: ObjectId,
  taskId: String,                  // "TSK-20240615-0001" — auto-generated
  
  // Relations
  customerId: ObjectId,            // Ref: Customers
  vehicleId: ObjectId,             // Ref: Vehicles
  cleanerId: ObjectId,             // Ref: Cleaners
  supervisorId: ObjectId,          // Ref: Supervisor
  subscriptionId: ObjectId,        // Ref: Subscriptions (if subscription-based)
  
  // Schedule
  scheduledDate: Date,
  scheduledTime: String,           // "10:00 AM"
  timeSlot: String,                // "morning" | "afternoon" | "evening"
  actualStartTime: Date,
  actualEndTime: Date,
  
  // Package
  packageType: String,             // "basic" | "premium" | "elite"
  cleaningType: String,            // Subscription type or "one-time"
  services: [{
    item: String,                  // "exterior_cleaning"
    label: String,                 // "Exterior Cleaning"
    completed: Boolean,
    completedAt: Date
  }],
  
  // Status
  status: String,                  // "assigned" | "in_progress" | "completed" | "missed" | "cancelled"
  
  // Photos
  beforePhotos: [String],          // S3 URLs
  afterPhotos: [String],           // S3 URLs
  
  // Verification
  qrVerified: Boolean,
  qrScannedAt: Date,
  location: {
    type: { type: String, enum: ["Point"] },
    coordinates: [Number]
  },
  
  // Instructions
  specialInstructions: String,
  
  // Issue
  hasIssue: Boolean,
  issueId: ObjectId,               // Ref: Issues
  
  // Payments & Earnings
  customerPaymentStatus: String,   // "paid" | "pending" (part of subscription)
  cleanerEarnings: Number,
  incentiveEligible: Boolean,
  incentiveEarned: Number,
  
  // History
  statusHistory: [{
    status: String,
    changedBy: ObjectId,
    changedAt: Date,
    remark: String
  }],
  
  // Review
  reviewed: Boolean,
  reviewId: ObjectId,              // Ref: Reviews
  
  createdAt: Date,
  updatedAt: Date
}
// Indexes: { taskId: 1 }, { cleanerId: 1, scheduledDate: -1 },
//          { customerId: 1 }, { status: 1 }, { scheduledDate: -1 },
//          { "location": "2dsphere" }
```

### 4.8 Attendance Collection
```javascript
{
  _id: ObjectId,
  cleanerId: ObjectId,             // Ref: Cleaners
  date: Date,                      // Date only (no time) — unique per cleaner per day
  
  checkIn: {
    time: Date,
    location: {
      type: { type: String, enum: ["Point"] },
      coordinates: [Number]
    },
    address: String,
    selfieUrl: String,
    isLate: Boolean,
    lateMinutes: Number,
    isGPSVerified: Boolean,
    ip: String,
    deviceId: String
  },
  
  checkOut: {
    time: Date,
    location: {
      type: { type: String, enum: ["Point"] },
      coordinates: [Number]
    },
    address: String,
    selfieUrl: String,
    isEarly: Boolean,
    earlyMinutes: Number
  },
  
  summary: {
    totalWorkingMinutes: Number,
    effectiveWorkingMinutes: Number,  // Excluding breaks
    overtimeMinutes: Number,
    breaks: [{
      startTime: Date,
      endTime: Date,
      duration: Number,
      reason: String
    }]
  },
  
  status: String,                   // "present" | "absent" | "half-day" | "late" | "leave" | "holiday"
  
  // Admin Override
  modifiedBy: ObjectId,             // Ref: Admin/Supervisor
  modificationReason: String,
  originalStatus: String,
  modifiedAt: Date,
  
  createdAt: Date,
  updatedAt: Date
}
// Compound unique index: { cleanerId: 1, date: 1 }
// Indexes: { date: -1 }, { status: 1 }
```

### 4.9 Leaves Collection
```javascript
{
  _id: ObjectId,
  cleanerId: ObjectId,             // Ref: Cleaners
  leaveType: String,               // "sick" | "casual" | "earned" | "emergency" | "other"
  
  fromDate: Date,
  toDate: Date,
  totalDays: Number,
  isHalfDay: Boolean,
  
  reason: String,
  attachment: String,              // S3 URL (medical certificate)
  
  status: String,                  // "pending" | "approved" | "rejected"
  approvedBy: ObjectId,            // Ref: Supervisor/Admin
  approvedAt: Date,
  rejectionReason: String,
  
  // Balance snapshot at time of application
  balanceSnapshot: {
    sick: Number,
    casual: Number,
    earned: Number,
    emergency: Number
  },
  
  createdAt: Date,
  updatedAt: Date
}
// Indexes: { cleanerId: 1, status: 1 }, { fromDate: 1, toDate: 1 }
```

### 4.10 Earnings Collection
```javascript
{
  _id: ObjectId,
  cleanerId: ObjectId,             // Ref: Cleaners
  taskId: ObjectId,                // Ref: Tasks (nullable for bonuses/payouts)
  
  // Amounts
  baseAmount: Number,              // Per-task base pay
  incentiveAmount: Number,         // Performance incentive
  overtimeAmount: Number,
  bonusAmount: Number,             // Special bonuses
  deductionAmount: Number,         // Penalties
  netAmount: Number,               // base + incentive + overtime + bonus - deduction
  
  // Period
  periodType: String,              // "daily" | "weekly" | "monthly"
  periodStart: Date,
  periodEnd: Date,
  
  // Payment
  paymentStatus: String,           // "pending" | "processed" | "paid" | "failed"
  payoutId: ObjectId,              // Ref: Payouts
  paidAt: Date,
  
  createdAt: Date
}
// Indexes: { cleanerId: 1, periodStart: -1 }, { paymentStatus: 1 }, { payoutId: 1 }
```

### 4.11 Incentives Collection
```javascript
{
  _id: ObjectId,
  cleanerId: ObjectId,             // Ref: Cleaners
  month: Number,                   // 1-12
  year: Number,                    // 2024
  
  // Monthly Targets
  taskTarget: Number,              // e.g., 60 tasks
  earningsTarget: Number,          // e.g., ₹30,000
  attendanceTarget: Number,        // e.g., 95%
  ratingTarget: Number,            // e.g., 4.5
  
  // Achieved Values
  tasksCompleted: Number,
  totalEarnings: Number,
  attendancePercentage: Number,
  averageRating: Number,
  
  // Scoring
  performanceScore: Number,        // Weighted composite (0-100)
  tier: String,                    // "bronze" | "silver" | "gold" | "platinum" | "none"
  incentiveAmount: Number,
  incentivePaid: Boolean,
  
  // Leaderboard
  leaderboardRank: Number,
  zoneRank: Number,
  
  paidAt: Date,
  payoutId: ObjectId,              // Ref: Payouts
  
  createdAt: Date,
  updatedAt: Date
}
// Compound index: { cleanerId: 1, month: 1, year: 1 }
```

### 4.12 Payouts Collection
```javascript
{
  _id: ObjectId,
  payoutId: String,                // "PAYOUT-20240615-001"
  
  // Target
  cleanerId: ObjectId,             // Ref: Cleaners (single) — or null for bulk
  type: String,                    // "single" | "bulk"
  
  // Period
  periodType: String,              // "daily" | "weekly" | "monthly" | "incentive"
  periodStart: Date,
  periodEnd: Date,
  
  // Amounts
  totalAmount: Number,
  feeAmount: Number,               // Processing fee
  netAmount: Number,
  
  // Earnings included
  earningIds: [ObjectId],          // Ref: Earnings
  taskCount: Number,
  
  // Payment
  status: String,                  // "pending" | "processing" | "completed" | "failed"
  paymentMethod: String,           // "razorpay_payout" | "bank_transfer" | "upi"
  razorpayPayoutId: String,
  transactionRef: String,
  processedAt: Date,
  
  // Recipient
  recipientName: String,
  recipientAccount: String,        // Masked
  recipientIfsc: String,
  recipientUpi: String,
  
  initiatedBy: ObjectId,           // Ref: Admin
  failureReason: String,
  
  createdAt: Date,
  updatedAt: Date
}
// Indexes: { cleanerId: 1 }, { status: 1 }, { periodStart: -1 }
```

### 4.13 Payments Collection (Razorpay)
```javascript
{
  _id: ObjectId,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  
  // Payer
  payerType: String,               // "customer" | "admin" | "franchise"
  payerId: ObjectId,               // Ref: Users
  
  // Payee
  payeeType: String,               // "gomotarcar" | "cleaner" | "franchise" | "provider"
  payeeId: ObjectId,
  
  // Amount
  amount: Number,                  // In paise (Razorpay format)
  currency: String,                // "INR"
  gstAmount: Number,
  
  // Purpose
  purpose: String,                 // "subscription" | "service_booking" | "fasttag_recharge"
                                    // | "cleaner_payout" | "incentive_payout" | "refund" | "wallet_topup"
  referenceType: String,           // "subscription" | "service_booking" | "fasttag" | "earnings"
  referenceId: ObjectId,
  
  // Status
  status: String,                  // "created" | "captured" | "refunded" | "failed" | "partial_refunded"
  refundStatus: String,            // "none" | "partial" | "full"
  refundAmount: Number,
  
  // Receipt
  receipt: String,                 // Custom receipt ID
  notes: Object,                   // Razorpay notes
  
  recurringInfo: {
    isRecurring: Boolean,
    razorpaySubscriptionId: String,
    recurringCycle: Number         // For tracking subscription cycles
  },
  
  createdAt: Date,
  updatedAt: Date
}
// Indexes: { razorpayOrderId: 1 }, { razorpayPaymentId: 1 },
//          { payerId: 1 }, { status: 1 }, { referenceId: 1 }
```

### 4.14 QR Codes Collection
```javascript
{
  _id: ObjectId,
  code: String,                    // Unique QR code string (HMAC-signed)
  vehicleId: ObjectId,             // Ref: Vehicles
  customerId: ObjectId,            // Ref: Customers
  
  qrImageUrl: String,              // S3 URL of generated QR image
  status: String,                  // "active" | "pending_activation" | "replaced" | "damaged"
  
  // Metadata
  version: Number,                 // QR format version
  issuedAt: Date,
  activatedAt: Date,
  
  // Replacement tracking
  replacedBy: ObjectId,            // Ref: QR Codes (new QR)
  replacementReason: String,
  replacedAt: Date,
  
  // Usage
  scannedCount: Number,
  lastScannedAt: Date,
  lastScannedBy: ObjectId,         // Ref: Cleaners
  
  expiresAt: Date,                 // QR expiry (2 years from issue)
  isActive: Boolean,
  
  createdAt: Date,
  updatedAt: Date
}
// Indexes: { code: 1 }, { vehicleId: 1 }, { status: 1 }
```

### 4.15 Issues Collection (Cleaner-Reported)
```javascript
{
  _id: ObjectId,
  ticketNumber: String,            // "ISS-20240615-0001"
  reportedBy: ObjectId,            // Ref: Cleaners
  taskId: ObjectId,                // Ref: Tasks
  
  category: String,                // "vehicle_locked" | "vehicle_missing" | "customer_complaint"
                                    // | "qr_damaged" | "payment_issue" | "other"
  description: String,
  photos: [String],                // S3 URLs
  
  status: String,                  // "open" | "in_progress" | "resolved" | "closed"
  priority: String,                // "low" | "medium" | "high" | "critical"
  
  assignedTo: ObjectId,            // Ref: Supervisor/Admin
  assignedAt: Date,
  
  timeline: [{
    status: String,
    note: String,
    updatedBy: ObjectId,
    updatedAt: Date
  }],
  
  resolution: String,
  resolvedAt: Date,
  resolvedBy: ObjectId,
  
  createdAt: Date,
  updatedAt: Date
}
```

### 4.16 Complaints Collection (Customer Grievances)
```javascript
{
  _id: ObjectId,
  ticketNumber: String,            // "CMP-20240615-0001"
  customerId: ObjectId,            // Ref: Customers
  serviceType: String,             // "cleaning" | "service_booking" | "fasttag" | "subscription" | "other"
  referenceId: ObjectId,           // Ref: Task/Booking/Subscription (polymorphic)
  
  category: String,                // "service_quality" | "cleaner_behavior" | "billing" | "scheduling" | "other"
  description: String,
  images: [String],
  
  status: String,                  // "open" | "in_progress" | "resolved" | "closed"
  priority: String,
  
  assignedTo: ObjectId,
  resolution: String,
  resolvedAt: Date,
  
  customerRating: Number,          // Post-resolution satisfaction (1-5)
  
  createdAt: Date,
  updatedAt: Date
}
```

### 4.17 ServiceBookings Collection (Non-Cleaning)
```javascript
{
  _id: ObjectId,
  bookingId: String,               // "BKG-20240615-0001"
  customerId: ObjectId,
  vehicleId: ObjectId,
  
  // Service
  categoryId: ObjectId,            // Ref: ServiceCategories
  serviceName: String,             // "AC Service", "Battery Replacement"
  providerId: ObjectId,            // Ref: ServiceProviders
  franchiseId: ObjectId,           // Ref: Franchises (optional)
  
  // Slot
  slotDate: Date,
  slotTime: String,
  serviceMode: String,             // "workshop" | "pickup_drop" | "doorstep"
  
  // Pricing
  basePrice: Number,
  extraCharges: [{
    item: String,
    amount: Number,
    approved: Boolean               // Job card approval
  }],
  discount: Number,
  totalAmount: Number,
  
  // Status
  status: String,                  // "booked" | "accepted" | "in_progress" | "completed" | "cancelled"
                                  // "job_card_pending" | "job_card_approved"
  // Tracking
  trackingTimeline: [{
    status: String,
    timestamp: Date,
    note: String
  }],
  
  // Payment
  paymentStatus: String,           // "pending" | "paid" | "refunded"
  paymentId: ObjectId,
  razorpayOrderId: String,
  
  // Job Card
  jobCard: {
    generated: Boolean,
    invoiceUrl: String,
    additionalWork: [{
      description: String,
      amount: Number,
      customerApproved: Boolean
    }]
  },
  
  // Review
  reviewed: Boolean,
  customerRating: Number,
  reviewText: String,
  
  createdAt: Date,
  updatedAt: Date
}
// Indexes: { bookingId: 1 }, { customerId: 1 }, { providerId: 1 }, { status: 1 }
```

### 4.18 FastTagTransactions Collection
```javascript
{
  _id: ObjectId,
  customerId: ObjectId,            // Ref: Customers
  vehicleNumber: String,
  vehicleId: ObjectId,             // Ref: Vehicles
  
  // Transaction
  amount: Number,
  transactionId: String,           // Payment gateway transaction ID
  receipt: String,
  
  // After recharge
  updatedBalance: Number,          // Updated FastTag balance
  
  status: String,                  // "success" | "failed" | "pending"
  failureReason: String,
  
  // Provider
  provider: String,                // "parkplus" | "paytm" | "icici" | etc.
  providerRef: String,
  
  // Payment
  paymentId: ObjectId,             // Ref: Payments
  paymentMethod: String,
  
  createdAt: Date
}
// Indexes: { customerId: 1, createdAt: -1 }, { vehicleNumber: 1 }
```

### 4.19 ServiceProviders Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,                // Ref: Users (optional, for login)
  name: String,                    // "Sharma Auto Works"
  ownerName: String,
  phone: String,
  email: String,
  
  // Location
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      type: { type: String, enum: ["Point"] },
      coordinates: [Number]
    }
  },
  
  // Services offered
  categories: [ObjectId],          // Ref: ServiceCategories
  services: [{
    serviceId: String,
    name: String,
    price: Number,
    duration: Number,              // Minutes
    description: String
  }],
  
  // Media
  photos: [String],
  logo: String,
  
  // Verification
  verified: Boolean,
  documents: [{
    type: String,
    url: String,
    status: String
  }],
  
  // Stats
  averageRating: Number,
  totalReviews: Number,
  totalBookings: Number,
  isActive: Boolean,
  
  // Business Hours
  operatingHours: {
    monday: { open: String, close: String },
    // ... for each day
  },
  
  createdAt: Date,
  updatedAt: Date
}
// Indexes: { "address.coordinates": "2dsphere" }, { categories: 1 }, 
//          { verified: 1 }, { name: "text" }
```

### 4.20 ServiceCategories Collection
```javascript
{
  _id: ObjectId,
  name: String,                    // "Battery", "Tyres", "AC Service", etc.
  slug: String,                    // "battery", "tyres", "ac-service"
  icon: String,                    // Icon URL or name
  image: String,                   // Category image URL
  description: String,
  parentId: ObjectId,              // For sub-categories (null for top-level)
  sortOrder: Number,
  isPopular: Boolean,
  isActive: Boolean,
  createdAt: Date
}
```

### 4.21 Franchises Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,                // Ref: Users
  franchiseName: String,
  ownerName: String,
  phone: String,
  email: String,
  
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      type: { type: String, enum: ["Point"] },
      coordinates: [Number]
    }
  },
  
  // Business
  type: String,                    // "workshop" | "service_center" | "cleaning_station"
  services: [String],
  zones: [ObjectId],               // Ref: Zones (service area)
  
  // Documents
  agreementUrl: String,
  agreementStart: Date,
  agreementEnd: Date,
  commissionPercent: Number,       // GoMotarCar commission
  
  // Verification
  verified: Boolean,
  verificationStatus: String,
  
  // Stats
  totalRevenue: Number,
  totalCommission: Number,
  totalBookings: Number,
  rating: Number,
  
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 4.22 Reviews Collection
```javascript
{
  _id: ObjectId,
  referenceType: String,           // "task" | "service_booking" | "provider" | "cleaner"
  referenceId: ObjectId,           // Polymorphic ref
  
  reviewerId: ObjectId,            // Ref: Customers
  reviewedEntityId: ObjectId,      // Ref: Cleaner/Provider (whom being rated)
  taskId: ObjectId,                // Ref: Tasks (optional)
  
  rating: Number,                  // 1-5
  comment: String,
  photos: [String],
  
  categories: {
    punctuality: Number,
    quality: Number,
    professionalism: Number,
    communication: Number,
    valueForMoney: Number
  },
  
  isPublic: Boolean,
  
  // Response
  responded: Boolean,
  response: String,
  respondedAt: Date,
  respondedBy: ObjectId,           // Ref: Admin/Cleaner/Provider
  
  createdAt: Date
}
// Indexes: { reviewedEntityId: 1, createdAt: -1 }, { referenceId: 1 }
```

### 4.23 Notifications Collection
```javascript
{
  _id: ObjectId,
  recipientId: ObjectId,
  recipientRole: String,           // "customer" | "cleaner" | "supervisor" | "admin" | "franchise"
  
  type: String,                    // "task_assignment" | "attendance_alert" | "issue_update"
                                    // | "payment_update" | "leave_status" | "announcement"
                                    // | "training" | "incentive" | "booking_update"
                                    // | "subscription_reminder" | "complaint_update"
                                    // | "offer" | "system"
  
  title: String,
  body: String,
  data: Object,                    // Deep link payload { screen, params }
  
  priority: String,                // "low" | "normal" | "high" | "urgent"
  isRead: Boolean,
  readAt: Date,
  
  pushSent: Boolean,
  pushSentAt: Date,
  pushDelivered: Boolean,
  
  imageUrl: String,
  
  createdAt: Date
}
// Indexes: { recipientId: 1, createdAt: -1 }, { isRead: 1 }
// TTL: expireAfterSeconds: 7776000 (90 days)
```

### 4.24 TrainingVideos Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String,                // "exterior_cleaning" | "interior_cleaning"
                                    // | "customer_handling" | "safety_training" | "advanced"
  videoUrl: String,
  thumbnailUrl: String,
  duration: Number,                // Seconds
  
  isMandatory: Boolean,
  order: Number,
  
  hasQuiz: Boolean,
  passingScore: Number,            // 70%
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number
  }],
  
  points: Number,                  // Gamification points
  isActive: Boolean,
  createdBy: ObjectId,
  
  createdAt: Date,
  updatedAt: Date
}
```

### 4.25 TrainingProgress Collection
```javascript
{
  _id: ObjectId,
  cleanerId: ObjectId,
  videoId: ObjectId,
  
  progress: Number,                // 0-100
  watchedDuration: Number,         // Seconds watched
  completed: Boolean,
  completedAt: Date,
  
  quizAttempted: Boolean,
  quizScore: Number,
  quizPassed: Boolean,
  quizAttempts: Number,
  
  createdAt: Date,
  updatedAt: Date
}
// Compound: { cleanerId: 1, videoId: 1 }
```

### 4.26 Performance Collection
```javascript
{
  _id: ObjectId,
  cleanerId: ObjectId,
  periodType: String,              // "weekly" | "monthly" | "quarterly"
  periodStart: Date,
  periodEnd: Date,
  
  // Task Metrics
  tasksAssigned: Number,
  tasksCompleted: Number,
  tasksMissed: Number,
  tasksCancelled: Number,
  completionRate: Number,
  
  // Attendance
  workingDays: Number,
  daysPresent: Number,
  daysAbsent: Number,
  daysLate: Number,
  attendanceRate: Number,
  overtimeHours: Number,
  
  // Quality
  averageRating: Number,
  reviewCount: Number,
  positiveReviews: Number,
  
  // Earnings
  totalEarnings: Number,
  totalIncentives: Number,
  
  // Training
  trainingCompleted: Number,
  trainingPending: Number,
  trainingScore: Number,
  
  // Composite
  performanceScore: Number,        // Weighted 0-100
  tier: String,                    // "elite" | "pro" | "regular" | "needs_improvement"
  
  createdAt: Date,
  updatedAt: Date
}
// Indexes: { cleanerId: 1, periodStart: -1 }
```

### 4.27 Zones Collection
```javascript
{
  _id: ObjectId,
  name: String,                    // "Sector 14, Gurgaon"
  city: String,
  state: String,
  
  boundary: {
    type: { type: String, enum: ["Polygon"] },
    coordinates: [ [ [Number, Number], ... ] ]
  },
  
  center: {
    type: { type: String, enum: ["Point"] },
    coordinates: [Number]
  },
  
  supervisorId: ObjectId,          // Ref: Supervisor
  cleanerCount: Number,
  activeCleaners: Number,
  activeTasks: Number,
  radius: Number,                  // In meters
  
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
// Indexes: { "boundary": "2dsphere" }
```

### 4.28 ChatMessages Collection
```javascript
{
  _id: ObjectId,
  conversationId: String,          // Composite: "cleanerId_supervisorId" or "customerId_supportId"
  senderId: ObjectId,
  receiverId: ObjectId,
  
  messageType: String,             // "text" | "image" | "file" | "issue_escalation"
  content: String,
  mediaUrl: String,
  
  isRead: Boolean,
  readAt: Date,
  
  issueId: ObjectId,               // Linked issue (for escalations)
  
  createdAt: Date
}
// Indexes: { conversationId: 1, createdAt: 1 }
```

### 4.29 Addresses Collection
```javascript
{
  _id: ObjectId,
  customerId: ObjectId,
  label: String,                   // "Home" | "Office" | "Other"
  apartment: String,               // "Tower A, 1402"
  building: String,
  street: String,
  area: String,
  city: String,
  state: String,
  pincode: String,
  coordinates: {
    type: { type: String, enum: ["Point"] },
    coordinates: [Number]
  },
  isDefault: Boolean,
  createdAt: Date
}
```

### 4.30 Offers & Coupons Collection
```javascript
{
  _id: ObjectId,
  code: String,                    // "WELCOME50" (for coupons)
  type: String,                    // "coupon" | "offer" | "seasonal"
  
  // Discount
  discountType: String,            // "percentage" | "fixed"
  discountValue: Number,           // 50 (for 50% or ₹50)
  maxDiscount: Number,             // Max discount cap
  minOrderAmount: Number,
  
  // Eligibility
  applicableTo: [String],          // "subscription" | "service" | "fasttag" | "all"
  userLimit: Number,               // Per user usage limit
  totalLimit: Number,              // Global usage limit
  usedCount: Number,
  
  // Duration
  validFrom: Date,
  validTo: Date,
  
  isActive: Boolean,
  image: String,
  terms: String,
  
  createdBy: ObjectId,
  createdAt: Date
}
```

### 4.31 AuditLogs Collection
```javascript
{
  _id: ObjectId,
  action: String,                  // "cleaner.verify_document" | "payment.process_payout"
  actorId: ObjectId,               // User who performed action
  actorRole: String,
  targetType: String,              // "cleaner" | "task" | "payment"
  targetId: ObjectId,
  
  changes: {                       // Before/after for updates
    before: Object,
    after: Object
  },
  
  metadata: Object,                // IP, user-agent, etc.
  ip: String,
  
  timestamp: Date
}
// Indexes: { actorId: 1, timestamp: -1 }, { targetType: 1, targetId: 1 }
// TTL: expireAfterSeconds: 63072000 (2 years)
```

---

## 5. Collection Relationships

### 5.1 Entity Relationship Diagram (Textual)

```
USERS (1) ── (1) CUSTOMERS
USERS (1) ── (1) CLEANERS
USERS (1) ── (1) ADMINS
USERS (1) ── (1) SUPERVISORS
USERS (1) ── (1) FRANCHISES
USERS (1) ── (0..1) SERVICE_PROVIDERS

CUSTOMERS (1) ── (1..N) VEHICLES
CUSTOMERS (1) ── (1..N) ADDRESSES
CUSTOMERS (1) ── (0..1) SUBSCRIPTIONS (active)
CUSTOMERS (1) ── (1..N) SUBSCRIPTIONS (history)
CUSTOMERS (1) ── (1..N) TASKS
CUSTOMERS (1) ── (1..N) SERVICE_BOOKINGS
CUSTOMERS (1) ── (1..N) FASTTAG_TRANSACTIONS
CUSTOMERS (1) ── (1..N) COMPLAINTS
CUSTOMERS (1) ── (1..N) REVIEWS

VEHICLES (1) ── (1) QR_CODES
VEHICLES (1) ── (1..N) TASKS (history)
VEHICLES (1) ── (0..1) SUBSCRIPTIONS

SUBSCRIPTIONS (1) ── (1..N) TASKS (generated)
SUBSCRIPTIONS (1) ── (1) PAYMENTS
SUBSCRIPTIONS (1) ── (0..1) CLEANERS (assigned)
SUBSCRIPTIONS (1) ── (1) SUBSCRIPTION_PACKAGES

CLEANERS (1) ── (1..N) TASKS (assigned)
CLEANERS (1) ── (1..N) ATTENDANCE
CLEANERS (1) ── (1..N) LEAVES
CLEANERS (1) ── (1..N) EARNINGS
CLEANERS (1) ── (1..N) INCENTIVES
CLEANERS (1) ── (1..N) TRAINING_PROGRESS
CLEANERS (1) ── (1..N) PERFORMANCE
CLEANERS (1) ── (1..N) ISSUES (reported)
CLEANERS (1) ── (1) ZONES (assigned)
CLEANERS (1) ── (0..1) SUPERVISORS

SUPERVISORS (1) ── (1..N) CLEANERS (supervised)
SUPERVISORS (1) ── (1..N) ZONES
SUPERVISORS (1) ── (1..N) TASKS (monitored)

TASKS (1) ── (0..1) ISSUES
TASKS (1) ── (0..1) REVIEWS
TASKS (1) ── (0..1) EARNINGS (cleaner)
TASKS (1) ── (1) CUSTOMERS
TASKS (1) ── (1) VEHICLES
TASKS (1) ── (1) CLEANERS (assigned)

SERVICE_CATEGORIES (1) ── (1..N) SERVICE_PROVIDERS
SERVICE_PROVIDERS (1) ── (1..N) SERVICE_BOOKINGS
SERVICE_PROVIDERS (1) ── (1..N) REVIEWS

FRANCHISES (1) ── (1..N) SERVICE_BOOKINGS
FRANCHISES (1) ── (1..N) ZONES

NOTIFICATIONS ─── (polymorphic) → any user role
REVIEWS ─── (polymorphic) → tasks | service_bookings | service_providers
AUDIT_LOGS ─── (polymorphic) → any entity
```

---

## 6. API Architecture

### 6.1 API Design Conventions

```
Base URL (Dev):    http://localhost:5000/api/v1
Base URL (Prod):   https://api.gomotarcar.com/api/v1

Standard Headers:
  Authorization: Bearer <access_token>
  Content-Type: application/json
  Accept: application/json
  X-Device-ID: <device_fingerprint>
  X-Platform: ios | android | web
  X-App-Version: 1.0.0

Response Format:
{
  "success": true,
  "data": {},                    // Response payload
  "meta": {                      // Pagination metadata
    "page": 1,
    "limit": 20,
    "total": 150,
    "hasMore": true,
    "nextCursor": "abc123"
  },
  "timestamp": "2026-06-15T10:30:00Z"
}

Error Format:
{
  "success": false,
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task with ID xxx not found",
    "details": { "taskId": "xxx" },
    "timestamp": "2026-06-15T10:30:00Z"
  }
}

Pagination:
  GET /resource?page=1&limit=20        (Offset-based)
  GET /resource?cursor=abc&limit=20    (Cursor-based for real-time feeds)

Sorting:
  GET /resource?sort=-createdAt        (Prefix - for descending)

Filtering:
  GET /resource?status=completed&fromDate=2026-06-01&toDate=2026-06-15

Field Selection:
  GET /resource?fields=id,name,status

Nested Resources:
  GET /customers/:id/vehicles
  GET /tasks/:id/photos
```

### 6.2 Rate Limits

| Role | Requests/Minute | Burst |
|------|:--------------:|:-----:|
| Super Admin | 200 | 300 |
| Manager | 150 | 200 |
| Supervisor | 100 | 150 |
| Operations | 100 | 150 |
| Franchise | 60 | 80 |
| Cleaner | 60 | 80 |
| Customer | 30 | 50 |
| Unauthenticated | 10 | 20 |

### 6.3 Complete API Endpoint Map

#### Auth Endpoints
```
POST   /api/v1/auth/register              # Register new user
POST   /api/v1/auth/send-otp              # Send OTP to phone
POST   /api/v1/auth/verify-otp            # Verify OTP & login
POST   /api/v1/auth/login                 # Phone + Password login
POST   /api/v1/auth/social-login          # Google/Apple sign-in
POST   /api/v1/auth/refresh               # Refresh access token
POST   /api/v1/auth/logout                # Invalidate session
POST   /api/v1/auth/forgot-password       # Send password reset OTP
POST   /api/v1/auth/reset-password        # Reset password
POST   /api/v1/auth/change-password       # Authenticated password change
PATCH  /api/v1/auth/fcm-token             # Update FCM token
```

#### Customer Endpoints
```
GET    /api/v1/customer/dashboard                   # Home dashboard
GET    /api/v1/customer/profile                     # Profile
PATCH  /api/v1/customer/profile                     # Update profile
POST   /api/v1/customer/vehicles                    # Add vehicle
GET    /api/v1/customer/vehicles                    # My vehicles
GET    /api/v1/customer/vehicles/:id                # Vehicle detail
DELETE /api/v1/customer/vehicles/:id                # Remove vehicle
POST   /api/v1/customer/addresses                   # Add address
GET    /api/v1/customer/addresses                   # My addresses
PATCH  /api/v1/customer/addresses/:id               # Update address
DELETE /api/v1/customer/addresses/:id               # Delete address
PATCH  /api/v1/customer/addresses/:id/default       # Set default address
```

#### Subscription Endpoints
```
GET    /api/v1/subscriptions/packages                # Available packages
GET    /api/v1/subscriptions/packages/:id            # Package detail
GET    /api/v1/subscriptions/compare                 # Package comparison
POST   /api/v1/subscriptions                        # Subscribe
GET    /api/v1/subscriptions/active                 # Active subscription
GET    /api/v1/subscriptions/:id                    # Subscription detail
PATCH  /api/v1/subscriptions/:id                    # Update subscription
POST   /api/v1/subscriptions/:id/cancel             # Cancel subscription
POST   /api/v1/subscriptions/:id/renew              # Renew
GET    /api/v1/subscriptions/history                # Subscription history
GET    /api/v1/subscriptions/balance                # Cleaning balance
GET    /api/v1/subscriptions/cleanings              # Cleaning history
POST   /api/v1/subscriptions/extra-cleaning         # Buy extra cleaning
POST   /api/v1/subscriptions/change-cleaner         # Request cleaner change
```

#### QR Endpoints
```
GET    /api/v1/qr/my-sticker                         # My QR sticker
GET    /api/v1/qr/:id                                # QR detail
POST   /api/v1/qr/activate                           # Activate QR
POST   /api/v1/qr/replace                            # Request replacement
GET    /api/v1/qr/replacement-status                 # Replacement status
POST   /api/v1/qr/download                           # Download QR image
```

#### Service Marketplace Endpoints
```
GET    /api/v1/services/categories                   # Service categories
GET    /api/v1/services/categories/:id               # Category detail
GET    /api/v1/services/search                       # Search services (?q=battery&lat=28.5&lng=77.0)
GET    /api/v1/services/providers/:id                # Provider profile
GET    /api/v1/services/providers/:id/reviews        # Provider reviews
POST   /api/v1/services/providers/:id/review         # Rate provider
```

#### Service Booking Endpoints
```
POST   /api/v1/bookings                              # Create booking
GET    /api/v1/bookings                              # My bookings
GET    /api/v1/bookings/:id                          # Booking detail
PATCH  /api/v1/bookings/:id/cancel                   # Cancel booking
POST   /api/v1/bookings/:id/job-card/approve         # Approve job card
POST   /api/v1/bookings/:id/job-card/reject          # Reject job card
GET    /api/v1/bookings/:id/invoice                  # Get invoice
GET    /api/v1/bookings/:id/tracking                 # Tracking timeline
GET    /api/v1/bookings/slots                        # Available slots (?providerId=xyz&date=2026-06-20)
GET    /api/v1/bookings/franchises                   # Available franchises (?lat=28.5&lng=77.0)
```

#### FastTag Endpoints
```
POST   /api/v1/fasttag/recharge                      # Recharge FastTag
GET    /api/v1/fasttag/balance                       # Check balance
GET    /api/v1/fasttag/history                       # Recharge history
```

#### Offers & Coupons Endpoints
```
GET    /api/v1/offers                                # Active offers
GET    /api/v1/coupons                               # My coupons
POST   /api/v1/coupons/validate                      # Validate coupon code
```

#### Complaint Endpoints
```
POST   /api/v1/complaints                            # Raise complaint
GET    /api/v1/complaints                            # My complaints
GET    /api/v1/complaints/:id                        # Complaint detail
```

#### Cleaner Endpoints
```
GET    /api/v1/cleaner/dashboard                     # Home dashboard
GET    /api/v1/cleaner/tasks                         # Task list (?status=pending)
GET    /api/v1/cleaner/tasks/:id                     # Task detail
PATCH  /api/v1/cleaner/tasks/:id/start               # Start task
PATCH  /api/v1/cleaner/tasks/:id/checklist           # Update checklist
POST   /api/v1/cleaner/tasks/:id/photos              # Upload photos
PATCH  /api/v1/cleaner/tasks/:id/complete            # Complete task
POST   /api/v1/cleaner/tasks/:id/issue               # Report issue on task
POST   /api/v1/cleaner/attendance/checkin            # Day start
POST   /api/v1/cleaner/attendance/checkout           # Day end
GET    /api/v1/cleaner/attendance/history            # Attendance history
POST   /api/v1/cleaner/qr/scan                       # Submit scanned QR
POST   /api/v1/cleaner/qr/confirm                    # Confirm vehicle
POST   /api/v1/cleaner/issues                        # Report issue
GET    /api/v1/cleaner/issues                        # My issues
GET    /api/v1/cleaner/earnings                      # Earnings dashboard
GET    /api/v1/cleaner/earnings/history              # Earnings history
GET    /api/v1/cleaner/incentives                    # Incentive tracker
POST   /api/v1/cleaner/leave                         # Apply leave
GET    /api/v1/cleaner/leave                         # Leave list
GET    /api/v1/cleaner/leave/balance                 # Leave balance
GET    /api/v1/cleaner/notifications                 # Notifications
PATCH  /api/v1/cleaner/notifications/:id/read        # Mark read
PATCH  /api/v1/cleaner/notifications/read-all        # Mark all read
GET    /api/v1/cleaner/training                      # Training videos
GET    /api/v1/cleaner/training/:id                  # Video detail
PATCH  /api/v1/cleaner/training/:id/progress         # Update progress
GET    /api/v1/cleaner/performance                   # Performance dashboard
GET    /api/v1/cleaner/reviews                       # Customer reviews
GET    /api/v1/cleaner/profile                       # Profile
PATCH  /api/v1/cleaner/profile                       # Update profile
PATCH  /api/v1/cleaner/bank                          # Update bank details
GET    /api/v1/cleaner/documents                     # Document status
POST   /api/v1/cleaner/documents/upload              # Upload document
DELETE /api/v1/cleaner/documents/:id                 # Delete document
GET    /api/v1/cleaner/supervisor                    # Supervisor detail
GET    /api/v1/cleaner/chat                          # Chat messages
POST   /api/v1/cleaner/chat                          # Send message
```

#### Admin Endpoints
```
GET    /api/v1/admin/dashboard                       # Dashboard stats
GET    /api/v1/admin/cleaners                        # All cleaners
GET    /api/v1/admin/cleaners/:id                    # Cleaner detail
PATCH  /api/v1/admin/cleaners/:id/status             # Activate/deactivate
PATCH  /api/v1/admin/cleaners/:id/verify-document/:docId  # Verify document
PATCH  /api/v1/admin/cleaners/:id/bank               # View bank details
GET    /api/v1/admin/customers                       # All customers
GET    /api/v1/admin/customers/:id                   # Customer detail
GET    /api/v1/admin/tasks                           # All tasks
POST   /api/v1/admin/tasks                           # Create task
POST   /api/v1/admin/tasks/assign                    # Auto-assign
PATCH  /api/v1/admin/tasks/:id                       # Update task
GET    /api/v1/admin/attendance                      # Attendance overview
GET    /api/v1/admin/attendance/report               # Export report
PATCH  /api/v1/admin/attendance/:id                  # Override attendance
GET    /api/v1/admin/earnings                        # Earnings overview
POST   /api/v1/admin/earnings/payout                 # Process payout
GET    /api/v1/admin/payouts                         # Payout history
GET    /api/v1/admin/payments                        # All transactions
POST   /api/v1/admin/payments/refund                 # Process refund
GET    /api/v1/admin/subscriptions                   # All subscriptions
POST   /api/v1/admin/subscriptions/packages          # Create package
PATCH  /api/v1/admin/subscriptions/packages/:id      # Update package
DELETE /api/v1/admin/subscriptions/packages/:id      # Delete package
GET    /api/v1/admin/qr                              # QR registry
PATCH  /api/v1/admin/qr/:id/status                   # Update QR status
GET    /api/v1/admin/issues                          # Issue queue
PATCH  /api/v1/admin/issues/:id/assign               # Assign issue
PATCH  /api/v1/admin/issues/:id/resolve              # Resolve issue
GET    /api/v1/admin/complaints                      # Complaint queue
PATCH  /api/v1/admin/complaints/:id/resolve          # Resolve complaint
POST   /api/v1/admin/training                        # Upload video
PATCH  /api/v1/admin/training/:id                    # Update video
DELETE /api/v1/admin/training/:id                    # Delete video
GET    /api/v1/admin/training/reports                # Training reports
POST   /api/v1/admin/notifications/broadcast         # Broadcast notification
POST   /api/v1/admin/announcements                   # Create announcement
GET    /api/v1/admin/zones                           # All zones
POST   /api/v1/admin/zones                           # Create zone
PATCH  /api/v1/admin/zones/:id                       # Update zone
GET    /api/v1/admin/service-providers               # All providers
PATCH  /api/v1/admin/service-providers/:id/verify    # Verify provider
GET    /api/v1/admin/franchises                      # All franchises
PATCH  /api/v1/admin/franchises/:id/verify           # Verify franchise
GET    /api/v1/admin/analytics                       # Analytics
GET    /api/v1/admin/analytics/export                # Export data
GET    /api/v1/admin/settings                        # Settings
PATCH  /api/v1/admin/settings                        # Update settings
GET    /api/v1/admin/notifications                   # Notification logs
```

#### Upload Endpoints
```
POST   /api/v1/upload/image                          # Upload image (max 10MB)
POST   /api/v1/upload/document                       # Upload document (PDF/JPG, max 20MB)
POST   /api/v1/upload/video                          # Upload video (max 100MB)
DELETE /api/v1/upload/:id                            # Delete uploaded file
```

---

## 7. Module Architecture

### 7.1 Complete Module Dependency Map

```
MODULE DEPENDENCIES (Arrows = depends on)
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  AUTH ──► USER ──► [CUSTOMER, CLEANER, ADMIN, SUPERVISOR]      │
│                     │        │         │         │              │
│                     ▼        ▼         ▼         ▼              │
│               SUBSCRIPTION  TASK     ZONE     FRANCHISE         │
│                     │        │         │         │              │
│                     ▼        ▼         ▼         ▼              │
│               QR_MANAGEMENT  ATTENDANCE  EARNINGS              │
│                     │        │              │                   │
│                     ▼        ▼              ▼                   │
│              CLEANING_BALANCE  LEAVE     INCENTIVE             │
│                                         PAYOUT                  │
│                     │        │              │                   │
│                     ▼        ▼              ▼                   │
│              NOTIFICATION ──►PAYMENT ◄── RAZORPAY              │
│                     │        │                                  │
│                     ▼        ▼                                  │
│              TRAINING  ──► PERFORMANCE ◄── REVIEW               │
│                     │        │                                  │
│                     ▼        ▼                                  │
│              ISSUES ──► COMPLAINTS ──► CHAT                     │
│                                                                 │
│  SERVICE_MARKETPLACE ──► SERVICE_BOOKING ──► FASTTAG            │
│         │                      │              │                 │
│         ▼                      ▼              ▼                 │
│  SERVICE_PROVIDER ───── FRANCHISE ──────── PAYMENT              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Module Lifecycle States

| Module | States |
|--------|--------|
| User | active → suspended → deactivated |
| Subscription | trial → active → expired / cancelled |
| Task | assigned → in_progress → completed / missed / cancelled |
| Attendance | pending (no check-in) → checked_in → checked_out |
| Leave | pending → approved / rejected |
| QR Code | pending_activation → active → replaced / damaged |
| Issue | open → in_progress → resolved → closed |
| Complaint | open → in_progress → resolved → closed |
| Payment | created → captured / failed → refunded |
| Payout | pending → processing → completed / failed |
| Service Booking | booked → accepted → in_progress → completed / cancelled |
| Performance | computed weekly/monthly/quarterly |
| Training | not_started → in_progress → completed |

---

## 8. Authentication & Security Architecture

### 8.1 Authentication Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Client  │    │   API    │    │  MongoDB │    │ Firebase │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │                │              │                │
     │ 1. Phone + OTP │              │                │
     │────────────────►              │                │
     │                │ 2. Generate  │                │
     │                │    6-digit   │                │
     │                │    OTP       │                │
     │                │─────────────►│                │
     │                │ 3. Store OTP │                │
     │                │ (5 min TTL)  │                │
     │                │◄─────────────│                │
     │                │              │                │
     │                │ 4. Send OTP  │                │
     │                │──────────────────────────────►│
     │                │  (FCM/SMS)   │                │
     │ 5. OTP Entered │◄─────────────│◄───────────────│
     │◄───────────────│              │                │
     │                │              │                │
     │ 6. Verify OTP  │              │                │
     │────────────────►              │                │
     │                │ 7. Validate  │                │
     │                │    OTP       │                │
     │                │─────────────►│                │
     │                │◄─────────────│                │
     │                │              │                │
     │ 8. JWT Pair    │              │                │
     │ (Access 15m +  │              │                │
     │  Refresh 30d)  │              │                │
     │◄───────────────│              │                │
     │                │              │                │
     │ 9. Store in    │              │                │
     │ SecureStorage  │              │                │
     │                │              │                │
     │ 10. API Calls  │              │                │
     │ with Bearer    │              │                │
     │ Token          │              │                │
     │────────────────►              │                │
```

### 8.2 Token Strategy

| Token | Type | Expiry | Storage | Purpose |
|-------|------|--------|---------|---------|
| Access Token | JWT (RS256) | 15 minutes | In-memory | API authentication |
| Refresh Token | JWT (opaque) | 30 days | SecureStore | Get new access token |
| FCM Token | Firebase | Device-dependent | DB + device | Push notifications |
| OTP | Numeric | 5 minutes | MongoDB (TTL) | Phone verification |

### 8.3 JWT Payload

```javascript
// Access Token
{
  sub: "user_objectid",
  role: "customer",
  roleId: "customer_objectid",        // Cleaner/Customer/Franchise specific ID
  permissions: ["read", "write"],     // Feature flags
  iat: 1718467200,
  exp: 1718468100
}

// Refresh Token (stored hashed in DB)
{
  sub: "user_objectid",
  tokenVersion: 2,                    // Increment to invalidate all sessions
  iat: 1718467200,
  exp: 1721059200
}
```

### 8.4 Security Measures Matrix

| Category | Measure | Implementation |
|----------|---------|---------------|
| **Authentication** | Password hashing | bcrypt (12 salt rounds) |
| | JWT signing | RS256 with 2048-bit key |
| | Token rotation | Every refresh cycle |
| | OTP rate limit | Max 3 attempts, then 15min cooldown |
| **Authorization** | RBAC | Role-based guard middleware |
| | Device validation | Device fingerprint in headers |
| | Session management | Token version to force logout |
| **Data Security** | Sensitive encryption | AES-256-GCM for bank details, Aadhaar |
| | Field masking | Partial mask (e.g., Aadhaar: ****-****-1234) |
| | Input sanitization | mongo-sanitize, helmet |
| **API Security** | Rate limiting | express-rate-limit (per-role) |
| | CORS | Whitelisted origins only |
| | SQL injection | Mongoose strict mode |
| | Request size limit | 10MB max (body-parser) |
| **File Upload** | Type validation | MIME type whitelist |
| | Size limits | Images: 10MB, Documents: 20MB, Videos: 100MB |
| | Virus scanning | ClamAV integration (optional) |
| **Infrastructure** | HTTPS | TLS 1.3 in production |
| | API keys | Admin endpoints require key |
| | Audit logging | All admin actions logged |
| **Compliance** | Data retention | Notifications: 90 days, Audit: 2 years |
| | Data export | GDPR-compliant export endpoint |
| | Consent management | Privacy settings per user |

### 8.5 Role-Based Access Control (RBAC) Middleware Chain

```
Request → RateLimiter → Auth(JWT) → RoleGuard(roles) → DeviceValidator → Controller

// Example role guard usage
router.get('/admin/cleaners', 
  authenticate, 
  authorize('super_admin', 'manager', 'supervisor'),
  validate('filterCleaners'),
  adminController.getCleaners
);

// Resource-level permissions
router.patch('/admin/cleaners/:id/verify-document/:docId',
  authenticate,
  authorize('super_admin', 'manager'),
  validate('verifyDocument'),
  adminController.verifyDocument
);
```

---

## 9. Notification Architecture

### 9.1 Dual-Channel Delivery

```
┌──────────────────────────────────────────────────────────────────────┐
│                       NOTIFICATION SERVICE                           │
│                                                                      │
│  ┌──────────────┐        ┌──────────────┐       ┌──────────────┐   │
│  │  Event       │        │  Notification│       │  FCM/Socket  │   │
│  │  Trigger     │───────►│  Repository  │──────►│  Dispatcher  │   │
│  └──────────────┘        └──────────────┘       └──────┬───────┘   │
│         │                                               │          │
│         │                                               ├──────────┤
│         │                                               │          │
│         ▼                                               ▼          ▼
│  ┌──────────────┐                               ┌──────────┐ ┌──────┐
│  │ Event Sources│                               │Socket.IO │ │FCM   │
│  │ • Task       │                               │(Online)  │ │(Off) │
│  │ • Attendance │                               └──────────┘ └──────┘
│  │ • Payment    │
│  │ • Leave      │
│  │ • Issue      │
│  │ • Training   │
│  │ • System     │
│  └──────────────┘
└──────────────────────────────────────────────────────────────────────┘
```

### 9.2 Notification Types by App

| Type | Customer App | Cleaner App | Admin Panel | Priority |
|------|:------------:|:-----------:|:-----------:|:--------:|
| task_assigned | ✓ | ✓ | ✓ | High |
| task_reminder | ✗ | ✓ | ✓ | Medium |
| task_completed | ✓ | ✗ | ✓ | High |
| attendance_reminder | ✗ | ✓ | ✓ | Medium |
| attendance_late | ✗ | ✓ | ✓ | Medium |
| payment_received | ✓ | ✓ | ✓ | High |
| payment_failed | ✓ | ✗ | ✓ | High |
| subscription_created | ✓ | ✗ | ✓ | Medium |
| subscription_expiring | ✓ | ✗ | ✓ | High |
| subscription_expired | ✓ | ✗ | ✓ | High |
| leave_status | ✗ | ✓ | ✓ | Medium |
| issue_update | ✗ | ✓ | ✓ | High |
| complaint_update | ✓ | ✗ | ✓ | Medium |
| incentive_earned | ✗ | ✓ | ✓ | High |
| payout_processed | ✗ | ✓ | ✓ | High |
| training_assigned | ✗ | ✓ | ✓ | Low |
| review_received | ✗ | ✓ | ✓ | Medium |
| booking_update | ✓ | ✗ | ✓ | High |
| job_card_pending | ✓ | ✗ | ✗ | High |
| offer_promotion | ✓ | ✗ | ✗ | Low |
| announcement | ✓ | ✓ | ✓ | Variable |
| system_alert | ✗ | ✗ | ✓ | Urgent |

### 9.3 Notification Templates

```javascript
// Template structure
const templates = {
  task_assigned: {
    title: "New Cleaning Task",
    body: "You've been assigned a {package} cleaning for {customer_name} at {apartment}. Scheduled at {time}.",
    data: { screen: "TaskDetail", taskId: "{taskId}" }
  },
  payment_received: {
    title: "Payment Received",
    body: "₹{amount} has been credited to your account. Transaction ref: {ref}.",
    data: { screen: "EarningsDashboard" }
  },
  subscription_expiring: {
    title: "Subscription Expiring Soon",
    body: "Your {package} subscription for {vehicle_number} expires in {days} days. Renew now!",
    data: { screen: "SubscriptionDashboard" }
  }
};
```

### 9.4 Push Notification Delivery Flow

```
1. Event Triggered (Task assigned, Payment received, etc.)
2. Server creates Notification record in DB
3. Server builds push payload from template
4. If recipient is online (Socket.IO connected):
   - Send via socket immediately
5. Send via FCM regardless:
   - Firebase Admin SDK sends to fcmToken
   - FCM delivers to device
6. On device:
   - Foreground: In-app notification banner
   - Background: System notification tray
7. When opened: Fire deep link to correct screen
8. Mark notification as read when viewed
```

---

## 10. QR Management Architecture

### 10.1 QR Lifecycle

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│ PENDING  │─────►│  ACTIVE  │─────►│ DAMAGED  │─────►│ REPLACED │
│(Issued)  │      │(Scannable)│     │(Not work)│      │(Archived)│
└──────────┘      └──────────┘      └──────────┘      └──────────┘
                      │
                      │ (Time: 2 years)
                      ▼
                   EXPIRED
                   (Auto-deactivate)
```

### 10.2 QR Generation & Security

```javascript
// QR Code content (encrypted)
const payload = {
  v: 1,                           // Version
  vid: "vehicle_objectid",        // Vehicle ID
  cid: "customer_objectid",       // Customer ID
  ts: Date.now(),                 // Timestamp
  sig: hmacSHA256(payload, SECRET) // HMAC signature
};

// Encoded as: base64url(json_string)
// Printed as sticker and placed on vehicle
// Asset tracking: each QR has unique serial number
```

### 10.3 QR Scanning Flow (Cleaner App)

```
1. Cleaner taps "Scan QR" on task
2. Camera opens with QR framing overlay
3. QR scanned → decoded → payload extracted
4. POST /cleaner/qr/scan { code, taskId, location }
5. Server validates:
   - QR exists & is active
   - QR belongs to assigned vehicle
   - QR not expired
   - Cleaner within 1km of customer address (GPS check)
6. If valid: Return vehicle + customer details
7. Cleaner confirms vehicle match
8. POST /cleaner/qr/confirm { taskId, qrCodeId }
9. Task status → "in_progress"
10. QR scanned count incremented
```

### 10.4 QR Replacement Flow (Customer)

```
1. Customer sees QR is damaged/not working
2. Navigates to My QR Sticker → Replace QR
3. Uploads photo of damaged QR
4. Selects reason: "Damaged" | "Lost" | "Vehicle Changed"
5. POST /qr/replace { vehicleId, reason, photo }
6. Admin receives replacement request
7. Admin approves → old QR marked "replaced"
8. New QR generated → issued as "pending_activation"
9. Customer activates new QR via app
10. QR sticker sent/delivered to customer address
```

### 10.5 QR Statuses (Customer App)

| Status | Meaning | Customer Action |
|--------|---------|-----------------|
| Active | Working, scannable | None needed |
| Pending | QR issued but not activated | Activate via app |
| Replaced | Superseded by new QR | Use new sticker |
| Damaged | QR reported/verified as damaged | Request replacement |

---

## 11. Subscription Architecture

### 11.1 Subscription Lifecycle

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│  TRIAL   │─────►│  ACTIVE  │─────►│ EXPIRED  │─────►│ DELETED  │
│(Limited) │      │(Renewing)│     └────┬─────┘      │(Archived) │
└──────────┘      └────┬─────┘         │            └──────────┘
                       │               │
                       │      ┌────────▼─────┐
                       │      │ CANCELLED    │
                       └─────►│ (By Customer) │
                              │ (By Admin)   │
                              └──────────────┘
```

### 11.2 Subscription Plans

| Feature | Basic | Premium | Elite |
|---------|:-----:|:-------:|:-----:|
| Monthly Price (₹) | 999 | 1,999 | 3,999 |
| Cleanings/Month | 4 | 8 | 12 |
| Exterior Wash | ✓ | ✓ | ✓ |
| Interior Cleaning | ✗ | ✓ | ✓ |
| Dashboard Cleaning | ✓ | ✓ | ✓ |
| Glass Polishing | ✗ | ✓ | ✓ |
| Wax Polish | ✗ | ✗ | ✓ |
| Engine Bay | ✗ | ✗ | ✓ |
| Frequency | Weekly | Weekly | Weekly |
| Extra Cleaning (₹) | 299 | 249 | 199 |
| Trial Days | 7 | 7 | 7 |
| Discounts (3/6/12M) | 5/10/15% | 5/10/15% | 5/10/15% |

### 11.3 Subscription Purchase Flow

```
1. Customer selects "Hire Cleaner"
2. Sees How It Works → Subscription Benefits → Package Comparison
3. Selects apartment/address (or adds new)
4. Adds vehicle (or selects existing)
5. Selects subscription package + frequency + duration
6. Review checkout: Package + GST - Discount = Total
7. Payment via Razorpay (UPI, Card, Wallet, NetBanking)
8. On success:
   - Subscription created (status: "active")
   - Cleaning balance initialized (total cleanings based on package)
   - QR code auto-generated for vehicle
   - Cleaner auto-assigned (nearest available in zone)
   - Notification sent to customer + cleaner
9. Subscription dashboard shows: package, balance, cleaner, QR status
```

### 11.4 Cleaning Balance Management

```javascript
// On each cleaning completion:
subscription.usedCleanings += 1
subscription.remainingCleanings -= 1

// Auto-topup logic:
if (subscription.remainingCleanings <= 0) {
  if (subscription.autoRenew) {
    // Create new billing cycle via Razorpay recurring
    // Add cleanings to balance
  } else {
    // Notify customer to renew
    // Offer extra cleaning purchase
  }
}

// Monthly reset (for frequency = monthly):
if (newMonth) {
  subscription.totalCleanings = package.cleaningsPerMonth
  subscription.usedCleanings = 0
  subscription.remainingCleanings = package.cleaningsPerMonth
}
```

### 11.5 Cleaner Change Request Flow

```
1. Customer requests cleaner change
2. Selects reason: "Cleaner behavior" | "Quality issues" | "Late arrival" | "Other"
3. Comments entered
4. Request goes to supervisor
5. Supervisor reviews + re-assigns new cleaner
6. Customer notified of new cleaner
7. Old cleaner removed from subscription
8. New cleaner assigned
```

---

## 12. Booking Architecture

### 12.1 Booking Types

| Type | Description | Module |
|------|-------------|--------|
| Subscription Cleaning | Recurring cleaning from subscription | Hire Cleaner |
| One-Time Cleaning | Single cleaning (no subscription) | Hire Cleaner |
| Service Booking | Car service (AC, battery, etc.) | Book Services |
| Franchise Booking | Service via franchise partner | Book Services |

### 12.2 Service Booking Flow

```
1. Customer selects Service Category (e.g., "AC Service")
2. Views service details, pricing, duration
3. Selects service provider from franchise list (sorted by distance/rating)
4. Selects service mode:
   - Workshop Visit (drop car at workshop)
   - Pickup & Drop (workshop picks up car)
   - Doorstep Service (service at home)
5. Selects date & time slot from available slots
6. Review booking summary → Total Amount
7. Payment via Razorpay
8. On success:
   - Booking created (status: "booked")
   - Provider notified
   - Tracking timeline initialized
9. Customer tracks booking status in real-time
```

### 12.3 Service Booking Status Timeline

```
BOOKED ───► ACCEPTED ───► IN_PROGRESS ───► COMPLETED
                │                               │
                │                   ┌───────────┘
                ▼                   ▼
          JOB_CARD_PENDING    INVOICE_GENERATED
                │
                ▼
          JOB_CARD_APPROVED
                │
                ▼
          IN_PROGRESS
```

### 12.4 Job Card Approval Workflow

```
1. Service center adds additional work during service
2. Job card generated with: original items + additional work
3. Customer receives notification: "Additional work ₹1,500 recommended"
4. Customer can:
   - Approve: Work continues, amount added to bill
   - Reject: Only original work performed
5. Final invoice generated after completion
6. Invoice includes: original items + approved extras - discounts
```

### 12.5 Service Modes

| Mode | Description | Pros | Cons |
|------|-------------|------|------|
| Workshop Visit | Customer drops car at workshop | Cost-effective | Inconvenient |
| Pickup & Drop | Workshop arranges pickup | Convenient | Extra charge |
| Doorstep Service | Technician comes to home | Maximum convenience | Limited services |

---

## 13. Payment Architecture

### 13.1 Payment Flow (Razorpay)

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Client  │    │  Server  │    │  MongoDB │    │ Razorpay │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │                │              │                │
     │ 1. Create      │              │                │
     │    Order       │              │                │
     │────────────────►              │                │
     │                │ 2. Create    │                │
     │                │    Order API │                │
     │                │──────────────────────────────►│
     │                │ 3. Order ID  │                │
     │                │◄──────────────────────────────│
     │                │              │                │
     │ 4. Save Order  │              │                │
     │    in DB       │              │                │
     │                │─────────────►│                │
     │                │              │                │
     │ 5. Order ID    │              │                │
     │    + Key       │              │                │
     │◄───────────────│              │                │
     │                │              │                │
     │ 6. Open        │              │                │
     │    Checkout UI │              │                │
     │───────────────────────────────────────────────►│
     │                │              │                │
     │ 7. Payment     │              │                │
     │    Response    │              │                │
     │◄───────────────────────────────────────────────│
     │                │              │                │
     │ 8. Verify      │              │                │
     │    Signature   │              │                │
     │────────────────►              │                │
     │                │ 9. Validate  │                │
     │                │    Signature │                │
     │                │─────────────►│                │
     │                │ 10. Confirm  │                │
     │                │──────────────►───────────────►│
     │                │              │                │
     │ 11. Success    │              │                │
     │◄───────────────│              │                │
```

### 13.2 Payment Types & Flows

| Payment Type | Direction | Description |
|-------------|-----------|-------------|
| Subscription | Customer → GoMotarCar | Monthly/quarterly/annual subscription |
| Service Booking | Customer → Provider | One-time service payment |
| FastTag Recharge | Customer → FastTag Provider | Wallet top-up |
| Cleaner Payout | GoMotarCar → Cleaner | Daily/weekly earnings payout |
| Incentive Payout | GoMotarCar → Cleaner | Monthly incentive bonus |
| Refund | GoMotarCar → Customer | Cancellation refund |
| Extra Cleaning | Customer → GoMotarCar | One-off additional cleaning |

### 13.3 Razorpay Integration

```javascript
// Razorpay order creation
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Regular order
const order = await razorpay.orders.create({
  amount: netAmountInPaise,    // ₹500 = 50000 paise
  currency: "INR",
  receipt: "sub_abc123",
  notes: {
    purpose: "subscription",
    customerId: "xyz",
    subscriptionId: "abc"
  }
});

// Recurring subscription
const subscription = await razorpay.subscriptions.create({
  plan_id: "plan_abc123",       // Created in Razorpay dashboard
  total_count: 12,              // 12 months
  customer_notify: 1,
  notes: { customerId: "xyz" }
});

// Payout to cleaner
const payout = await razorpay.payouts.create({
  account_number: "account_abc",
  fund_account_id: "fund_xyz",  // Cleaner's bank/UPI linked
  amount: earningsInPaise,
  currency: "INR",
  mode: "UPI",
  purpose: "payout",
  queue_if_low_balance: true
});
```

### 13.4 Payout Schedule

| Frequency | Day | Calculates | Includes |
|-----------|:---:|-----------|----------|
| Daily | Next day | Yesterday's tasks | Base earnings |
| Weekly | Monday | Previous week | Base + overtime |
| Monthly | 1st | Previous month | Base + incentives + bonuses |

### 13.5 Refund Policy

| Scenario | Refund % | Processing |
|----------|:--------:|-----------|
| Cancel within 24h of purchase | 100% | Auto-initiated |
| Cancel after 24h, no service used | 75% | Admin approval |
| Cancel after service started | Pro-rata | Manual review |
| Service quality complaint | Varies | After investigation |
| Duplicate payment | 100% | Auto-initiated |

---

## 14. Microservices & Internal Communication

### 14.1 Service Boundary Definition (Future State)

```
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY (Nginx/Express)                   │
│  Routes requests to appropriate microservice                    │
└────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┘
     │    │    │    │    │    │    │    │    │    │    │    │
     ▼    ▼    ▼    ▼    ▼    ▼    ▼    ▼    ▼    ▼    ▼    ▼
┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐
│A │ │U │ │T │ │E │ │A │ │Q │ │S │ │P │ │N │ │S │ │F │ │C │
│u │ │s │ │a │ │a │ │t │ │R │ │u │ │a │ │ot│ │ea│ │r │ │h │
│t │ │er│ │sk│ │rn│ │t │ │Ma│ │b │ │ym│ │if│ │rc│ │an│ │at│
│h │ │   │ │   │ │in│ │en│ │na│ │sc│ │en│ │i │ │h │ │ch│ │  │
│  │ │ Se│ │   │ │gs│ │da│ │ge│ │ri│ │t │ │ca│ │is│ │is│ │  │
│  │ │rv│ │   │ │  │ │nc│ │me│ │pt│ │  │ │ti│ │e │ │e │ │  │
│  │ │ic│ │   │ │  │ │e │ │nt│ │io│ │  │ │on│ │  │ │  │ │  │
│  │ │e │ │   │ │  │ │  │ │  │ │n │ │  │ │  │ │  │ │  │ │  │
└──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘
```

### 14.2 Monolith-First Approach

Start as a **modular monolith** with clear service boundaries:
- Each "service" is a folder with its own routes, controllers, services
- Shared models and middleware remain common
- Easy to extract to microservices later when scale demands it

### 14.3 Background Jobs (Bull/BullMQ)

| Job | Queue | Schedule | Description |
|-----|-------|----------|-------------|
| Auto No-Show | attendance | Daily 10:30 AM | Mark cleaners without check-in as absent |
| Attendance Summary | attendance | Daily 11 PM | Calculate daily attendance stats |
| Task Reminder | notification | 15 min before task | Push reminder to cleaner |
| Subscription Expiry | subscription | Daily 8 AM | Check & notify expiring subscriptions |
| Auto Renewal | subscription | Daily 8 AM | Process auto-renewals |
| Incentive Calc | earnings | Monthly 1st | Calculate incentives |
| Payout Processing | payout | Per schedule | Process pending payouts |
| Performance Calc | performance | Weekly/Monthly | Recalculate scores |
| Data Cleanup | system | Weekly | Remove old temp files |

---

## 15. Admin Panel Architecture

### 15.1 Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18+ with Create React App / Vite |
| UI Library | Material UI 5+ |
| State Management | Redux Toolkit |
| API Client | Axios + RTK Query |
| Routing | React Router v6 |
| Charts | Recharts / Chart.js |
| Forms | React Hook Form + Zod |
| Real-time | Socket.IO Client |
| Tables | Material React Table / AG Grid |
| Date Handling | date-fns / dayjs |
| Build | Vite |

### 15.2 Admin Panel Pages Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  Admin Panel Navigation                                             │
│                                                                     │
│  📊 Dashboard                                                       │
│     ├── KPI Overview (Active Cleaners, Today Tasks, Revenue)        │
│     ├── Charts (Task Completion, Revenue Trend, Zone Dist.)         │
│     └── Recent Activity Feed                                        │
│                                                                     │
│  👤 Cleaners                                                        │
│     ├── List (Table with filters, search, pagination)               │
│     ├── Detail (Profile, Documents, Bank, Performance)              │
│     ├── Verification (Document queue with approve/reject)           │
│     └── Performance (Ratings, stats, training progress)             │
│                                                                     │
│  👥 Customers                                                       │
│     ├── List (Table with subscriptions, vehicles, activity)         │
│     ├── Detail (Profile, vehicles, subscription, history)           │
│     └── Subscriptions (Active, expired, cancelled)                  │
│                                                                     │
│  📋 Tasks                                                           │
│     ├── Board (Kanban view: Assigned→In Progress→Completed)         │
│     ├── List (Table with all fields)                                │
│     ├── Detail (Full task info, photos, timeline)                   │
│     └── Assignment (Manual/Auto assign cleaner)                     │
│                                                                     │
│  ⏰ Attendance                                                      │
│     ├── Live View (Today's check-ins on map)                        │
│     ├── History (Date-range with filters)                           │
│     ├── Report (Exportable, summary stats)                          │
│     └── Override (Manual status change with reason)                 │
│                                                                     │
│  💰 Earnings & Payouts                                              │
│     ├── Overview (charts, totals)                                   │
│     ├── Payout Queue (Pending payouts with process button)          │
│     ├── Payout History (Completed payouts)                          │
│     └── Incentive Settings (Targets, tiers, amounts)                │
│                                                                     │
│  💳 Payments                                                        │
│     ├── Transactions (All payments with status)                     │
│     ├── Refunds (Refund requests with approve/reject)               │
│     └── Subscription Payments                                       │
│                                                                     │
│  📦 Subscriptions                                                   │
│     ├── Packages (CRUD subscription plans)                          │
│     ├── All Subscriptions (List with status)                        │
│     └── Renewals (Upcoming renewals)                                │
│                                                                     │
│  📱 QR Management                                                   │
│     ├── QR Registry (All QR codes, status, vehicle)                │
│     ├── Replacement Requests (Approve/reject)                       │
│     └── Generate QR (Bulk generation)                               │
│                                                                     │
│  🎓 Training                                                        │
│     ├── Videos (List with categories, CRUD)                         │
│     ├── Upload (Video upload form)                                  │
│     └── Reports (Cleaner progress, completion stats)                │
│                                                                     │
│  🗺️ Zones                                                          │
│     ├── List (Zones with supervisors, cleaner count)                │
│     ├── Map (Visual zone boundaries)                                │
│     └── Assignments (Supervisor ↔ Zone mapping)                     │
│                                                                     │
│  🏪 Service Marketplace                                             │
│     ├── Categories (CRUD service categories)                        │
│     ├── Providers (List, verify, manage)                            │
│     └── Bookings (All service bookings)                             │
│                                                                     │
│  🏬 Franchises                                                      │
│     ├── List (All franchise partners)                               │
│     ├── Detail (Agreement, commission, performance)                 │
│     └── Verification (Document verification)                        │
│                                                                     │
│  🎫 Issues & Complaints                                            │
│     ├── Issue Queue (Cleaner-reported issues)                       │
│     ├── Complaint Queue (Customer grievances)                       │
│     └── Resolution Center (Assign, resolve, close)                  │
│                                                                     │
│  🔔 Notifications                                                   │
│     ├── Send Broadcast (Target: role, zone, individuals)            │
│     ├── History (Sent notifications)                                │
│     └── Announcements (CRUD)                                       │
│                                                                     │
│  📊 Analytics                                                       │
│     ├── Dashboard (Revenue, users, tasks, growth charts)            │
│     ├── Cleaner Performance (Top/bottom performers)                 │
│     ├── Customer Insights (Retention, churn, LTV)                   │
│     └── Reports (Export PDF/CSV)                                   │
│                                                                     │
│  ⚙️ Settings                                                        │
│     ├── General (App name, contact, branding)                       │
│     ├── Roles & Permissions (RBAC configuration)                   │
│     ├── Email Templates                                            │
│     └── System Config (API keys, limits, features)                  │
│                                                                     │
│  🆘 Support                                                         │
│     ├── Ticket List (Support tickets)                               │
│     ├── Chat Logs (Customer support chats)                          │
│     └── FAQ Management                                              │
└─────────────────────────────────────────────────────────────────────┘
```

### 15.3 Admin Panel Data Visualization

| Page | Chart Type | Data Source |
|------|-----------|-------------|
| Dashboard | Line chart (revenue trend) | Payments (last 30 days) |
| Dashboard | Bar chart (task completion) | Tasks (last 7 days) |
| Dashboard | Pie chart (zone distribution) | Tasks by zone |
| Dashboard | Number cards (KPIs) | Aggregated stats |
| Cleaner Performance | Radar chart | Multi-metric score |
| Earnings | Area chart | Daily/weekly earnings |
| Attendance | Heatmap | Daily check-in times |
| Customer Growth | Bar chart | New registrations |

---

## 16. Customer App Architecture

### 16.1 Navigation Structure

```
AppNavigator
├── AuthNavigator (unauthenticated)
│   ├── SplashScreen1 (Brand intro)
│   ├── SplashScreen2 (Feature carousel)
│   ├── SplashScreen3 (Get Started)
│   ├── LoginScreen (Phone number)
│   ├── OTPVerificationScreen (6-digit OTP)
│   └── RegistrationScreen (Name, email, etc.)
│
└── MainTabNavigator (authenticated)
    ├── HomeTab
    │   └── HomeDashboardScreen
    │       ├── HireCleanerScreen → ApartmentSelection → AddVehicle → Packages → Checkout → Success
    │       ├── SubscriptionDashboard → CleaningHistory / CleaningBalance / ChangeCleaner
    │       ├── MyQRSticker → QRActivation / QRReplacement
    │       └── SearchHome → SearchResults → ServiceProviderProfile → RatingScreen
    │
    ├── ServicesTab
    │   └── ServiceCategoriesScreen
    │       ├── ServiceDetailScreen → FranchiseList → SlotBooking → ServiceMode
    │       └── BookingSummary → Payment → BookingTracking → JobCardApproval → Invoice
    │
    ├── BookingsTab
    │   └── BookingsList (All bookings: cleaning + services)
    │       └── BookingDetail → Tracking / Invoice / Cancel
    │
    ├── NotificationsTab
    │   └── NotificationCenterScreen
    │
    └── ProfileTab
        └── ProfileDashboardScreen
            ├── MyVehicles / AddVehicle
            ├── AddressManagement
            ├── PaymentHistory
            ├── ReviewsScreen
            ├── FastTagRecharge → Success → History
            ├── OffersScreen
            ├── Complaints → RaiseComplaint / ComplaintTracking
            ├── Settings
            └── HelpSupport
```

### 16.2 Customer App Screens (49 Total)

| # | Screen | Module | Description |
|---|--------|--------|-------------|
| 1 | Splash Screen 1 | Onboarding | GoMotarCar logo, premium car illustration |
| 2 | Splash Screen 2 | Onboarding | Feature carousel (4 slides) |
| 3 | Splash Screen 3 | Onboarding | "Get Started" CTA |
| 4 | Login | Auth | Mobile number input, social login |
| 5 | OTP Verification | Auth | 6-digit OTP, timer, resend |
| 6 | Registration | Auth | Name, email, phone form |
| 7 | Home Dashboard | Home | Quick actions, subscription status, offers |
| 8 | Hire Cleaner Landing | Hire Cleaner | How it works, packages CTA |
| 9 | Apartment Selection | Hire Cleaner | Select/add apartment/society |
| 10 | Add Vehicle | Hire Cleaner | Vehicle number, brand, model, RC verify |
| 11 | Subscription Packages | Hire Cleaner | Package comparison, pricing |
| 12 | Checkout | Hire Cleaner | Summary, discount, total |
| 13 | Payment Success | Hire Cleaner | Confirmation, cleaner pending |
| 14 | Subscription Dashboard | Hire Cleaner | Active plan, balance, cleaner |
| 15 | Cleaning History | Hire Cleaner | Past cleanings, dates, status |
| 16 | Cleaning Balance | Hire Cleaner | Progress circle, remaining cleanings |
| 17 | Change Cleaner | Hire Cleaner | Reason dropdown, submit request |
| 18 | My QR Sticker | QR | Large QR display, download, replace |
| 19 | QR Activation | QR | Enter QR code, activate |
| 20 | QR Status | QR | Active/pending/replaced/damaged |
| 21 | QR Replacement | QR | Reason, photo upload, submit |
| 22 | Search Homepage | Search | Search bar, category grid |
| 23 | Search Results | Search | Provider cards with rating/distance |
| 24 | Service Provider Profile | Search | Gallery, services, reviews |
| 25 | Rating Screen | Search | Star rating, review text |
| 26 | Service Categories | Services | Grid of service types |
| 27 | Service Detail | Services | Images, pricing, duration |
| 28 | Franchise List | Services | Nearby franchises, distance, price |
| 29 | Slot Booking | Services | Calendar, time slots |
| 30 | Service Mode Selection | Services | Workshop/Pickup/Doorstep |
| 31 | Booking Summary | Services | Vehicle, service, slot, total |
| 32 | Payment | Services | UPI, card, wallet, netbanking |
| 33 | Booking Tracking | Services | Timeline, status updates |
| 34 | Job Card Approval | Services | Additional work approve/reject |
| 35 | Invoice | Services | PDF download, tax breakdown |
| 36 | FastTag Recharge | FastTag | Vehicle number, amount |
| 37 | Recharge Success | FastTag | Transaction ID, balance |
| 38 | Recharge History | FastTag | Past transactions |
| 39 | Offers | Offers | Coupons, discounts, seasonal |
| 40 | Notification Center | Notifications | All notifications by category |
| 41 | Raise Complaint | Complaints | Service type, description, photos |
| 42 | Complaint Tracking | Complaints | Ticket number, status, timeline |
| 43 | Profile Dashboard | Profile | Info, vehicles, addresses |
| 44 | My Vehicles | Profile | Vehicle list, RC, PUC, challan |
| 45 | Address Management | Profile | Home, office, other |
| 46 | Payment History | Profile | All payments, filters |
| 47 | Reviews & Ratings | Profile | Submitted/pending reviews |
| 48 | Settings | Profile | Language, notifications, privacy |
| 49 | Help & Support | Profile | FAQ, chat, call, email, tickets |

---

## 17. Cleaner App Architecture

### 17.1 Navigation Structure

```
AppNavigator
├── AuthNavigator (unauthenticated)
│   ├── SplashScreen
│   ├── LoginScreen
│   └── OTPVerificationScreen
│
└── MainTabNavigator (authenticated)
    ├── DashboardTab
    │   └── HomeDashboardScreen
    │       ├── StartDayAttendance (GPS + selfie)
    │       ├── AttendanceHistory
    │       └── ReportIssue
    │
    ├── TasksTab
    │   └── TaskListScreen (All/Pending/Completed/Missed filters)
    │       └── TaskDetailScreen → QRScan → QRVerification
    │           └── CleaningChecklist → PhotoUpload → Complete → Success
    │
    ├── ScanTab (Center FAB)
    │   └── ScanQRScreen (Camera view)
    │       └── QRVerificationScreen → Task auto-opens
    │
    ├── EarningsTab
    │   └── EarningsDashboardScreen
    │       ├── EarningsHistoryScreen
    │       └── IncentiveTrackerScreen
    │
    └── ProfileTab
        └── ProfileDashboardScreen
            ├── EditProfileScreen / BankDetailsScreen / DocumentsScreen
            ├── PerformanceDashboardScreen → CustomerReviewsScreen
            ├── TrainingListScreen → TrainingDetailScreen
            ├── ApplyLeaveScreen / LeaveStatusScreen
            ├── SupervisorDetailScreen / ChatScreen
            ├── SettingsScreen
            └── HelpSupportScreen
```

### 17.2 Cleaner App Screens (35 Total)

| # | Screen | Module | Description |
|---|--------|--------|-------------|
| 1 | Splash Screen | Onboarding | GoMotarCar logo, cleaner illustration |
| 2 | Login | Auth | Phone + password + "Login with OTP" |
| 3 | OTP Verification | Auth | 6 boxes, timer, resend |
| 4 | Home Dashboard | Dashboard | Photo, name, ID, performance card, quick actions, schedule |
| 5 | Start Day Attendance | Attendance | GPS, location, check-in time, selfie |
| 6 | Attendance History | Attendance | Date, check-in/out, hours, status |
| 7 | Today's Task List | Tasks | Filters, cards with customer/vehicle/package/time |
| 8 | Task Detail | Tasks | Customer, vehicle, package, instructions |
| 9 | Scan QR | QR | Camera, scanner frame, flash, gallery |
| 10 | QR Verification | QR | Customer name, vehicle, package, confirm |
| 11 | Cleaning Checklist | Tasks | Toggle items per package |
| 12 | Cleaning Completion | Tasks | Before/after photos, remarks |
| 13 | Success Screen | Tasks | Animation, points, next assignment |
| 14 | Customer Detail | Customer | Profile, vehicle list, subscription |
| 15 | Customer Vehicle | Customer | Photos, number, model, history |
| 16 | Report Issue | Issues | Category, photo, description |
| 17 | Issue Tracking | Issues | Ticket, status, timeline |
| 18 | Earnings Dashboard | Earnings | Today, weekly, monthly, incentives |
| 19 | Earnings History | Earnings | Date, tasks, amount, bonus |
| 20 | Incentive Tracker | Earnings | Monthly target, progress, leaderboard |
| 21 | Supervisor Detail | Supervisor | Photo, mobile, zone, call/WhatsApp |
| 22 | Chat Support | Supervisor | Messages, images, escalation |
| 23 | Apply Leave | Leave | Type, dates, reason, attachment |
| 24 | Leave Status | Leave | Pending/approved/rejected, history |
| 25 | Notification Center | Notifications | All types, categories |
| 26 | Training Videos | Training | Categories, video cards |
| 27 | Training Detail | Training | Video player, progress, quiz |
| 28 | Performance Dashboard | Performance | Ratings, attendance, completed/missed jobs |
| 29 | Customer Reviews | Performance | Review cards, ratings, comments |
| 30 | Profile Dashboard | Profile | Photo, ID, joining date, experience |
| 31 | Edit Profile | Profile | Mobile, address, emergency contact |
| 32 | Bank Details | Profile | Account, IFSC, UPI, preference |
| 33 | Documents | Profile | Aadhaar, PAN, DL, verification status |
| 34 | Settings | Profile | Language, notifications, privacy |
| 35 | Help & Support | Profile | FAQ, call, chat, ticket |

---

## Appendix A: Environment Variables

```bash
# ─── Server ───────────────────────────────────────────
NODE_ENV=development
PORT=5000
API_PREFIX=/api/v1

# ─── MongoDB ──────────────────────────────────────────
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gomotarcar

# ─── JWT ──────────────────────────────────────────────
JWT_SECRET=your-jwt-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# ─── Firebase ─────────────────────────────────────────
FIREBASE_PROJECT_ID=gomotarcar-xxx
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@gomotarcar.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://gomotarcar.firebaseio.com

# ─── Razorpay ─────────────────────────────────────────
RAZORPAY_KEY_ID=rzp_live_xxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# ─── AWS S3 / DigitalOcean Spaces ─────────────────────
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=gomotarcar-uploads
S3_REGION=ap-south-1
S3_ENDPOINT=https://blr1.digitaloceanspaces.com  # For DO Spaces

# ─── Redis ────────────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ─── SMS (Twilio / MSG91) ────────────────────────────
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# ─── Email ────────────────────────────────────────────
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
EMAIL_FROM=noreply@gomotarcar.com

# ─── Encryption ───────────────────────────────────────
ENCRYPTION_KEY=your-aes-256-key-32-chars-min
ENCRYPTION_IV=your-16-char-iv

# ─── Elasticsearch (Search Marketplace) ───────────────
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_API_KEY=your_api_key

# ─── Admin Panel ──────────────────────────────────────
ADMIN_PANEL_URL=https://admin.gomotarcar.com
CORS_ORIGINS=https://admin.gomotarcar.com,https://app.gomotarcar.com
```

## Appendix B: Brand Design System (from PDF Specs)

```javascript
// ─── Colors ──────────────────────────────────
const colors = {
  primaryBlue:   "#0D5BD7",
  secondaryBlue: "#2563EB",
  lightBlue:     "#EAF3FF",
  darkNavy:      "#0F172A",
  white:         "#FFFFFF",
  background:    "#F8FAFC",
  border:        "#E5E7EB",
  textPrimary:   "#111827",
  textSecondary: "#64748B",
  success:       "#22C55E",
  warning:       "#F59E0B",
  error:         "#EF4444"
};

// ─── Typography ──────────────────────────────
const typography = {
  heading:    "Inter Bold",
  subheading: "Inter SemiBold",
  body:       "Inter Regular",
  button:     "Inter Medium"
};

// ─── Components ──────────────────────────────
const components = {
  button: {
    height: 56,
    borderRadius: 14,
    primary: { bg: "#0D5BD7", text: "#FFFFFF" },
    secondary: { bg: "#FFFFFF", border: "#0D5BD7", text: "#0D5BD7" }
  },
  card: {
    bg: "#FFFFFF",
    borderRadius: 20,
    border: "1px solid #E5E7EB",
    shadow: "0px 10px 25px rgba(15,23,42,0.05)"
  },
  input: {
    height: 56,
    borderRadius: 14,
    border: "1px solid #E5E7EB"
  }
};
```

## Appendix C: Dependencies

### Backend
```
express, mongoose, bcryptjs, jsonwebtoken, joi/zod,
firebase-admin, socket.io, razorpay, multer, sharp,
@aws-sdk/client-s3, ioredis, bull/bullmq, node-cron,
helmet, cors, express-rate-limit, morgan, dotenv, winston,
express-mongo-sanitize, express-validator, axios,
uuid, slugify, dayjs, pdfkit, csv-writer
```

### Admin Panel (React + MUI)
```
react, react-dom, react-router-dom, @mui/material,
@mui/icons-material, @emotion/react, @emotion/styled,
@reduxjs/toolkit, react-redux, axios, socket.io-client,
recharts, react-hook-form, @hookform/resolvers, zod,
react-dropzone, date-fns, notistack, ag-grid-react,
react-csv, file-saver, lodash
```

### Customer App (React Native)
```
react-native, @react-navigation/native, @react-navigation/bottom-tabs,
@react-navigation/stack, react-native-vector-icons,
react-native-camera-kit, react-native-qrcode-scanner,
@react-native-community/geolocation, react-native-maps,
react-native-image-picker, react-native-reanimated,
react-native-gesture-handler, react-native-safe-area-context,
react-native-screens, @react-native-async-storage/async-storage,
redux, @reduxjs/toolkit, react-redux, axios, socket.io-client,
@react-native-firebase/app, @react-native-firebase/messaging,
react-native-razorpay, react-native-fast-image,
react-native-video, react-native-pdf, react-native-blob-util
```

### Cleaner App (React Native)
```
(Same as Customer App, plus:)
react-native-video, lottie-react-native (for success animation),
react-native-progress (for circular progress)
```

---

> **Document Version:** 2.0  
> **Last Updated:** June 15, 2026  
> **Sources:** Customer App Spec (49 screens), Cleaner App Spec (35 screens), Admin Panel Spec  
> **Build Status:** Architecture Phase — Awaiting Implementation
