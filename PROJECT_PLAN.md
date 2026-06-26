# GoMotarCar — Project Plan & Development Roadmap

> **Version:** 2.0  
> **Project:** GoMotarCar — Car Care Platform  
> **Duration:** 22 Weeks (≈5.5 Months)  
> **Team:** 1 Backend, 2 Mobile (React Native), 1 Web (Admin), 1 QA

---

## Phase 0: Foundation & Setup (Week 1)

**Goal:** Scaffold all projects, configure CI/CD, set up database, and establish coding standards.

### Week 1 Deliverables

| Task | Owner | Output |
|------|-------|--------|
| Initialize monorepo with Git | Backend | Repository structure |
| Scaffold Node.js + Express backend | Backend | Working Express server |
| Configure MongoDB connection + mongoose | Backend | Database connection |
| Set up environment variables & validation | Backend | .env.example |
| Initialize Firebase Admin SDK | Backend | Firebase config |
| Set up Redis | Backend | Cache layer |
| Configure AWS S3 / DO Spaces | Backend | File upload config |
| Set up ESLint + Prettier | All | Code standards |
| Create Docker Compose (dev) | Backend | docker-compose.yml |
| Scaffold React Native cleaner app | Mobile Lead | RN project |
| Scaffold React Native customer app | Mobile Lead | RN project |
| Scaffold React admin panel | Web Lead | React + MUI project |
| Set up Common shared package | Backend | Enums, types, constants |

**Milestone:** All 4 projects running successfully in dev mode with DB connection.

---

## Phase 1: Authentication & User Management (Weeks 2-3)

**Goal:** Complete auth system across all platforms + user profile management.

### Week 2 — Auth Backend

| Task | Details |
|------|---------|
| User model + migrations | phone, email, password hash, role |
| OTP generation + storage (5-min TTL) | Random 6-digit, store in MongoDB TTL index |
| Firebase OTP integration | Firebase Phone Auth |
| JWT access + refresh token strategy | Access: 15m, Refresh: 30d, stored hashed |
| Login endpoints | Phone+Password, Phone+OTP, Social |
| Registration endpoint | Customer registration with validation |
| Forgot/Reset password flow | OTP-based reset |
| Role-based guard middleware | super_admin, manager, supervisor, cleaner, customer |

### Week 3 — Profiles & Admin Auth

| Task | Details |
|------|---------|
| Cleaner model + CRUD | Full profile with bank, docs, stats |
| Customer model + CRUD | Profile, vehicles, addresses |
| Admin/Supervisor models | Admin dashboard ready |
| Document upload service | S3 with type validation (Aadhaar, PAN, DL) |
| Admin authentication panel | Login page with MUI |
| All auth screens (Customer App) | Login, OTP, Registration |
| All auth screens (Cleaner App) | Login, OTP |
| Device fingerprint + secure storage | AsyncStorage + device ID |

**Milestone:** Users can register, login via OTP/password, and manage profiles.

---

## Phase 2: Core Business Logic (Weeks 4-8)

**Goal:** Complete all business modules: tasks, attendance, leaves, earnings, incentives, QR.

### Week 4 — Task Management

| Task | Details |
|------|---------|
| Task model + full CRUD | All fields, statuses, checklist |
| Task assignment algorithm | Weighted round-robin by zone, rating, load |
| Task scheduling engine | Auto-generate from subscriptions |
| Status history tracking | Timeline array for audit |
| Task list, detail, checklist APIs | Filters, pagination |
| Socket events for task updates | Real-time assignment |
| **Cleaner App:** Task list screen | Filters: All/Pending/Completed/Missed |
| **Cleaner App:** Task detail screen | Full task info + begin service |

### Week 5 — Attendance & Leave

| Task | Details |
|------|---------|
| Attendance model + check-in/out | GPS validation, selfie capture |
| GPS distance calculation | 100m zone radius validation |
| Late/early detection logic | Configurable cutoff times |
| Attendance history with pagination | Calendar view support |
| Leave model + CRUD | Sick/casual/earned/emergency |
| Leave balance calculation | Monthly accrual logic |
| Leave approval flow | Supervisor → approve/reject |
| Auto no-show cron job | 10:30 AM auto-absent mark |
| **Cleaner App:** Start Day screen | GPS + selfie + Start Duty |
| **Cleaner App:** Attendance History | Calendar-based cards |
| **Cleaner App:** Apply Leave form | Type, date, reason, attachment |
| **Cleaner App:** Leave Status screen | Pending/approved/rejected |

### Week 6 — QR System

| Task | Details |
|------|---------|
| QR code model + generation | HMAC-signed payload, S3 storage |
| QR scanning & validation | Decode, verify HMAC, check expiry |
| QR status management | Active/pending/replaced/damaged |
| QR replacement workflow | Customer request → Admin approve |
| Subscription-QR linking | Auto-generate on subscription |
| **Cleaner App:** Scan QR screen | Camera view with flash + gallery |
| **Cleaner App:** QR Verification screen | Confirm vehicle + customer |
| **Customer App:** My QR Sticker | Large QR display, download |
| **Customer App:** QR Activation | New QR activation flow |
| **Customer App:** QR Replacement | Reason + photo upload |

### Week 7 — Earnings, Incentives & Payments

| Task | Details |
|------|---------|
| Earnings model + calculation | Base rate × zone × rating multipliers |
| Additional earnings: overtime, bonus, deduction | All types supported |
| Incentive tiers & calculation | Bronze/Silver/Gold/Platinum |
| Leaderboard ranking system | Zone + global ranking |
| Razorpay integration | Orders, payments, webhooks |
| Payment model + transaction history | All payment types |
| Payout processing | Daily/weekly/monthly schedules |
| Payout to bank account/UPI via Razorpay | Razorpay Payout API |
| Refund processing | Admin-initiated refunds |
| **Cleaner App:** Earnings Dashboard | Today/Weekly/Monthly cards |
| **Cleaner App:** Earnings History | Date-wise breakdown |
| **Cleaner App:** Incentive Tracker | Targets, progress, leaderboard |

### Week 8 — Reviews & Performance

| Task | Details |
|------|---------|
| Review model + CRUD | Task-specific + ratings categories |
| Performance calculation engine | Weighted: tasks (30%), rating (25%), attendance (20%), etc. |
| Performance tiers | Elite/Pro/Regular/Needs Improvement |
| Aggregated cleaner stats | Denormalized for dashboard |
| **Customer App:** Rating screen | Star rating + comment |
| **Cleaner App:** Customer Reviews | Review cards list |
| **Cleaner App:** Performance Dashboard | Ratings, attendance, jobs |

**Milestone:** All core business modules functional with backend APIs + mobile screens.

---

## Phase 3: Subscription & Booking (Weeks 9-11)

**Goal:** Complete customer subscription system, service marketplace, booking engine.

### Week 9 — Subscription Management

| Task | Details |
|------|---------|
| Subscription package model | Basic/Premium/Elite with pricing |
| Subscription creation + lifecycle | Trial → Active → Expired/Cancelled |
| Cleaning balance tracking | Total → used → remaining |
| Auto-renewal via Razorpay | Recurring subscription API |
| Extra cleaning purchase | One-off addition |
| Cleaner change request flow | Customer request → Supervisor assigns |
| **Customer App:** Subscription Landing | How it works + CTA |
| **Customer App:** Package Selection | Comparison table + pricing |
| **Customer App:** Subscription Dashboard | Active plan, cleaner, balance |
| **Customer App:** Cleaning Balance | Progress circle indicator |
| **Customer App:** Cleaning History | Past cleanings list |
| **Customer App:** Change Cleaner | Reason + submit |

### Week 10 — Service Marketplace

| Task | Details |
|------|---------|
| Service categories model | Categories + sub-categories |
| Service providers model | Registration, documents, verification |
| Search functionality | Category + location + keyword search |
| Provider detail page API | Services, reviews, photos |
| Rating system for providers | Aggregate scoring |
| **Customer App:** Search Homepage | Search bar + category grid |
| **Customer App:** Search Results | Cards with rating/distance |
| **Customer App:** Provider Profile | Gallery, services, reviews |
| **Admin Panel:** Service Categories | CRUD management |
| **Admin Panel:** Provider Verification | Document verification queue |

### Week 11 — Service Booking

| Task | Details |
|------|---------|
| Service booking model | Full lifecycle |
| Slot management | Calendar + time slot availability |
| Service mode selection | Workshop/Pickup & Drop/Doorstep |
| Booking status tracking | Timeline states |
| Job card approval workflow | Additional work → Customer approve |
| Invoice generation | PDF with tax breakdown |
| **Customer App:** Service Categories | Grid view |
| **Customer App:** Service Detail | Images, pricing, duration |
| **Customer App:** Franchise List | Distance-sorted |
| **Customer App:** Slot Booking | Calendar + slots |
| **Customer App:** Service Mode | Workshop/Pickup/Doorstep |
| **Customer App:** Booking Summary | Vehicle, service, slot, total |
| **Customer App:** Booking Tracking | Timeline |
| **Customer App:** Job Card Approval | Approve/reject extras |
| **Customer App:** Invoice | PDF download |

**Milestone:** Complete subscription + service marketplace + booking engine.

---

## Phase 4: Advanced Features (Weeks 12-14)

**Goal:** Training, chat, notifications, FastTag, complaints, offers.

### Week 12 — Training & Notifications

| Task | Details |
|------|---------|
| Training video model + CRUD | Categories, video upload |
| Training progress tracking | Watch %, completion, quiz |
| Quiz system | Create, attempt, score, pass |
| Gamification badges | Learner/Expert/Master/Trainer |
| Notification model + CRUD | All notification types |
| Push notification delivery (FCM) | Firebase Cloud Messaging |
| In-app notification (Socket.IO) | Real-time delivery |
| Notification templates | All event types |
| Broadcast notification system | Admin → targeted users |
| **Cleaner App:** Training Videos | Categorized video list |
| **Cleaner App:** Training Detail | Video player + quiz |
| **Cleaner App:** Notification Center | Inbox with categories |
| **Customer App:** Notification Center | Separate inbox |

### Week 13 — FastTag, Offers & Complaints

| Task | Details |
|------|---------|
| FastTag recharge model | Provider integration stub |
| FastTag recharge history | Transaction records |
| Offer/coupon model | Discount types, validation |
| Coupon validation logic | Min amount, expiry, usage limit |
| Complaint model + tracking | Customer grievance system |
| Complaint → Issue escalation | Internal workflow |
| **Customer App:** FastTag Recharge | Vehicle + amount |
| **Customer App:** FastTag History | Past recharges |
| **Customer App:** Offers Screen | Coupons + seasonal |
| **Customer App:** Raise Complaint | Form + photo upload |
| **Customer App:** Complaint Tracking | Status + timeline |

### Week 14 — Chat & Support

| Task | Details |
|------|---------|
| Chat model + Socket.IO messaging | Conversations, typing, read receipts |
| Chat between cleaner ↔ supervisor | Direct messaging |
| Chat for customer support | Customer ↔ Support agent |
| Issue escalation in chat | Auto-create issue from chat |
| Help & Support content | FAQ, contact info |
| **Cleaner App:** Chat Screen | Messages, images |
| **Cleaner App:** Supervisor Detail | Contact info |
| **Cleaner App:** Help & Support | FAQ, call, chat, ticket |
| **Customer App:** Help & Support | Full support options |

**Milestone:** All advanced features functional.

---

## Phase 5: Admin Panel Full Build (Weeks 14-17)

**Goal:** Complete admin panel with all management pages.

### Week 14-15 — Admin Core Pages

| Page | Components | API Integration |
|------|-----------|-----------------|
| Dashboard | KPI cards, charts (Recharts), activity feed | Admin dashboard endpoint |
| Cleaners List | Data table, search, filters, status badges | GET/PATCH cleaners |
| Cleaner Detail | Profile tabs, documents, bank, performance | Full cleaner endpoint |
| Document Verification | Queue with approve/reject, image preview | PATCH verify-document |
| Customers List | Data table with subscription info | GET customers |
| Customer Detail | Profile, vehicles, subscription, history | Full customer endpoint |
| Tasks Board | Kanban view (drag & drop) + List view | GET/PATCH tasks |
| Task Assignment | Auto-assign + manual override | POST assign |

### Week 16 — Admin Operations Pages

| Page | Components | API Integration |
|------|-----------|-----------------|
| Attendance | Live map view, history, override form | Attendance endpoints |
| Earnings | Charts, cleaner earnings view | Earnings endpoints |
| Payouts | Queue, history, process button | Payout endpoints |
| Transactions | All payments, search, filter | Payment endpoints |
| Refunds | Queue with approve/reject | Refund endpoints |
| Subscriptions | All subscriptions, expiry view | Subscription endpoints |
| Packages | CRUD form for subscription plans | Package endpoints |
| QR Registry | QR list, status, search | QR endpoints |

### Week 17 — Admin Extended Pages

| Page | Components | API Integration |
|------|-----------|-----------------|
| Training | Video list, upload form, progress reports | Training endpoints |
| Issues | Queue, assignment, resolution | Issue endpoints |
| Complaints | Queue, resolution, feedback | Complaint endpoints |
| Zones | List, map, create/edit form | Zone endpoints |
| Marketplace | Categories, providers, verification | Service endpoints |
| Franchise | List, detail, verification | Franchise endpoints |
| Broadcast | Notification form with targeting | Broadcast endpoint |
| Analytics | Charts, export, date range selector | Analytics endpoints |
| Settings | General, roles, templates, system | Settings endpoints |

**Milestone:** Complete admin panel with all management features.

---

## Phase 6: Customer App Full Build (Weeks 14-18)

**Overlaps with Phase 5 — parallel development.**

### Week 14-15 — Customer App Core

| Screens | Dependencies |
|---------|-------------|
| Splash screens (3) | Brand assets, animations |
| Auth screens (3) | Auth APIs |
| Home Dashboard | Dashboard API |
| Hire Cleaner (10 screens) | Subscription APIs |
| Subscription Dashboard | Subscription + cleaning balance |

### Week 16 — Customer App Services

| Screens | Dependencies |
|---------|-------------|
| QR Management (4 screens) | QR APIs |
| Search (4 screens) | Search APIs |
| Service Booking (10 screens) | Booking APIs |
| FastTag (3 screens) | FastTag APIs |

### Week 17-18 — Customer App Profile

| Screens | Dependencies |
|---------|-------------|
| Offers | Offer APIs |
| Notifications | Notification APIs |
| Complaints (2 screens) | Complaint APIs |
| Profile (7 screens) | Customer APIs |
| Reviews | Review APIs |
| Settings | Update APIs |

**Milestone:** Complete customer app with all 49 screens.

---

## Phase 7: Cleaner App Full Build (Weeks 15-18)

**Overlaps with Phases 5 & 6.**

### Week 15 — Cleaner App Core

| Screens | Dependencies |
|---------|-------------|
| Splash + Auth (3 screens) | Auth APIs |
| Dashboard + Attendance (3 screens) | Dashboard/Attendance APIs |
| Task Management (4 screens) | Task APIs |
| QR System (3 screens) | QR APIs |

### Week 16-17 — Cleaner App Extended

| Screens | Dependencies |
|---------|-------------|
| Customer screens (2) | Customer APIs |
| Issue screens (2) | Issue APIs |
| Earnings screens (3) | Earnings APIs |
| Leave screens (2) | Leave APIs |

### Week 18 — Cleaner App Profile

| Screens | Dependencies |
|---------|-------------|
| Supervisor + Chat (2) | Chat APIs |
| Training (2) | Training APIs |
| Performance (2) | Performance APIs |
| Profile (6 screens) | Cleaner APIs |
| Notifications | Notification APIs |

**Milestone:** Complete cleaner app with all 35 screens.

---

## Phase 8: Testing & QA (Weeks 19-20)

**Goal:** Comprehensive testing across all platforms.

### Week 19 — Backend Testing

| Type | Tools | Coverage Target |
|------|-------|:--------------:|
| Unit tests | Jest | 80%+ services |
| Integration tests | Supertest + MongoDB Memory | All endpoints |
| API contract tests | Postman / Newman | All documented endpoints |
| Authentication tests | Jest + Supertest | Edge cases (expired token, invalid OTP) |

### Week 20 — Mobile & Admin Testing

| Type | Tools | Coverage Target |
|------|-------|:--------------:|
| Component unit tests | Jest + React Native Testing Library | 70%+ components |
| Integration tests | Detox (E2E) | Critical flows (login→task complete) |
| Admin panel tests | Jest + React Testing Library | 70%+ pages |
| E2E admin flow | Cypress | CRUD flows |
| Cross-platform testing | Physical iOS + Android devices | UI consistency |

### Manual Testing Checklist

| Flow | Tester | Expected Result |
|------|--------|-----------------|
| Customer: Register → Subscribe → QR → Cleaning | QA | Full subscription flow |
| Cleaner: Login → Attendance → QR Scan → Checklist → Complete | QA | Full task flow |
| Admin: Create cleaner → Verify docs → Assign task | QA | Full admin flow |
| Payment: Razorpay success → Failure → Refund | QA | All payment states |
| Push notification delivery | QA | All notification types |
| GPS attendance validation | QA | Geo-fence working |
| QR scan with invalid/broken QR | QA | Error handling |

---

## Phase 9: Load Testing & Security Audit (Week 21)

**Goal:** Ensure platform can handle production load.

### Load Testing

| Test | Tool | Target |
|------|------|--------|
| Concurrent cleaner check-ins | k6 | 1000 simultaneous |
| Peak hour task distribution | k6 | 500 tasks/minute |
| Payment processing throughput | k6 | 100 payments/minute |
| DB query performance | MongoDB Profiler | All queries < 200ms |
| API response time | k6 | P95 < 500ms |
| WebSocket connections | custom | 10,000 concurrent |

### Security Audit

| Area | Tool | Check |
|------|------|-------|
| API security | OWASP ZAP | Top 10 vulnerabilities |
| JWT implementation | Manual review | Token leakage, expiry |
| Data encryption | Manual review | Bank details, Aadhaar |
| File upload | Manual testing | Malicious file prevention |
| Rate limiting | k6 | Blocking threshold |
| CORS configuration | Manual review | Origin whitelist |
| XSS/CSRF | OWASP ZAP | Input sanitization |

---

## Phase 10: Deployment & Launch (Week 22)

**Goal:** Production deployment with monitoring.

### Pre-Launch Checklist

| Task | Details |
|------|---------|
| Domain configuration | api.gomotarcar.com, admin.gomotarcar.com |
| SSL certificates | Let's Encrypt / AWS Certificate Manager |
| MongoDB Atlas production cluster | M30+ with replica set |
| Redis production instance | Upstash / ElastiCache |
| S3 bucket configuration | CORS, public read for images |
| Firebase production project | FCM + Auth |
| Razorpay live keys | API keys + webhook setup |
| Environment variables | Production values configured |
| CI/CD pipeline | GitHub Actions → Deploy |
| Docker image build | Multi-stage build for backend |
| Monitoring setup | Sentry (errors), New Relic (APM) |
| Logging | Winston → CloudWatch / Papertrail |
| Backup strategy | Daily MongoDB dumps, S3 backup |
| Alerting | PagerDuty / Slack for critical errors |

### Deployment Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                         AWS / DigitalOcean                     │
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌────────────────┐  │
│  │  Load         │    │  EC2 / DO    │    │  MongoDB Atlas │  │
│  │  Balancer    │───►│  App Nodes   │───►│  (Managed DB)  │  │
│  │  (Nginx)     │    │  × 2 (min)   │    └────────────────┘  │
│  └──────────────┘    └──────┬───────┘                         │
│                             │    ┌───────────────────────┐    │
│                             │    │  Redis (Upstash)      │    │
│                             └───►│  Cache + Bull Queue   │    │
│                                  └───────────────────────┘    │
│  ┌──────────────┐    ┌──────────────┐    ┌────────────────┐  │
│  │  DO Spaces   │    │  Firebase    │    │  Razorpay      │  │
│  │  (File Store)│    │  (Push/Auth) │    │  (Payments)    │  │
│  └──────────────┘    └──────────────┘    └────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Monitoring Stack                                    │    │
│  │  Sentry (Errors) + New Relic (APM) + PM2 (Process)  │    │
│  └──────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────┘
```

### Launch Phases

| Phase | Scope | Duration | Users |
|-------|-------|:--------:|:-----:|
| Alpha | Internal team | 1 week | 10-20 |
| Beta | Limited cleaners + customers | 2 weeks | 100-200 |
| Soft Launch | Single city (Gurgaon Sector 14) | 2 weeks | 500-1000 |
| Full Launch | Delhi NCR | Ongoing | Unlimited |

### Post-Launch (Weeks 23+)

| Area | Tasks |
|------|-------|
| Bug fixes | Priority queue from Sentry + user feedback |
| Performance optimization | DB query optimization, caching |
| Feature refinement | Based on user analytics |
| New features | V2 planning: AI recommendations, analytics |
| Scaling | Auto-scaling groups, CDN for images |

---

## Team & Resource Allocation

### Recommended Team Structure

| Role | Count | Responsibility |
|------|:-----:|---------------|
| Backend Engineer | 1 | All server-side code, APIs, DB |
| React Native Developer | 2 | Customer App + Cleaner App |
| React/Web Developer | 1 | Admin Panel |
| QA Engineer | 1 | Testing across all platforms |
| Project Manager | 1 | Coordination, sprint planning |

### Estimated Timeline by Role

```
                    W1  W2  W3  W4  W5  W6  W7  W8  W9  W10 W11 W12 W13 W14 W15 W16 W17 W18 W19 W20 W21 W22
Backend (1)         ██  ██  ██  ██  ██  ██  ██  ██  ██  ██  ██  ██  ██  ██  ██  ██  ██  ██  ██  ██  ██  ██
RN Cleaner App (1)  ██  ██                  ██  ██  ██  ██  ██                  ██  ██  ██  ██  ██  ██  ██  ██
RN Customer App (1)      ██  ██                      ██  ██  ██  ██  ██  ██  ██  ██  ██  ██  ██  ██  ██  ██
Admin Panel (1)                         ██  ██  ██      ██  ██  ██  ██  ██  ██  ██  ██  ██  ██  ██  ██  ██  ██
QA (1)                                                                      ██  ██  ██  ██  ██  ██  ██  ██
```

---

## Risk Management

| Risk | Probability | Impact | Mitigation |
|------|:-----------:|:------:|------------|
| Scope creep | High | Medium | Strict phase gates, feature freeze after Phase 7 |
| Third-party API failure (Razorpay) | Low | High | Webhook retry + manual fallback |
| GPS accuracy issues | Medium | Medium | Allow admin-attendance override |
| QR scan failure (low light) | Medium | Low | Flash + manual code entry fallback |
| Payment reconciliation errors | Low | Critical | Daily reconciliation cron job |
| MongoDB query performance | Medium | Medium | Index optimization, aggregation pipeline review |
| Push notification delivery delay | Medium | Low | In-app Socket.IO as primary, FCM as fallback |
| Security breach | Low | Critical | Encryption, audit logs, rate limiting, OWASP testing |

---

## Appendix: Weekly Sprint Breakdown

| Sprint | Weeks | Theme | Points | Key Deliverables |
|--------|-------|-------|:------:|------------------|
| 1 | 1 | Foundation | 8 | Project scaffolding, DB setup, CI/CD |
| 2 | 2 | Auth Backend | 13 | All auth APIs + middleware |
| 3 | 3 | Profiles | 13 | Cleaner/Customer CRUD, documents |
| 4 | 4 | Tasks | 13 | Task CRUD, assignment, scheduling |
| 5 | 5 | Attendance + Leave | 13 | Check-in/out, leave management |
| 6 | 6 | QR System | 13 | QR generation, scanning, replacement |
| 7 | 7 | Earnings + Payments | 13 | Razorpay, payouts, incentives |
| 8 | 8 | Reviews + Performance | 8 | Reviews, performance calc |
| 9 | 9 | Subscriptions | 13 | Packages, purchase, balance |
| 10 | 10 | Service Marketplace | 13 | Categories, providers, search |
| 11 | 11 | Service Booking | 13 | Booking, slots, job cards, invoices |
| 12 | 12 | Training + Notifications | 13 | Videos, FCM, notifications |
| 13 | 13 | FastTag + Offers + Complaints | 8 | Additional features |
| 14 | 14 | Chat + Support | 8 | Messaging, FAQ |
| 15 | 15-16 | Admin Core | 21 | Dashboard, cleaners, customers, tasks |
| 16 | 16-17 | Admin Operations | 21 | Attendance, earnings, payments, QR |
| 17 | 17 | Admin Extended | 21 | Training, issues, zones, analytics |
| 18 | 14-15 | Customer App Core | 21 | Splash, auth, home, hire cleaner |
| 19 | 16 | Customer App Services | 21 | QR, search, bookings, FastTag |
| 20 | 17-18 | Customer App Profile | 21 | Offers, complaints, profile, reviews |
| 21 | 15-16 | Cleaner App Core | 21 | Auth, dashboard, tasks, QR, attendance |
| 22 | 16-18 | Cleaner App Extended | 21 | Earnings, leave, training, performance, profile |
| 23 | 19-20 | Testing | 21 | Unit, integration, E2E, load testing |
| 24 | 21 | Security + Load | 13 | Security audit, k6 load tests |
| 25 | 22 | Deployment | 13 | Production deploy, monitoring |

---

> **Total Estimated Effort:** 22 Weeks  
> **Total Story Points:** ~380  
> **Team Velocity:** ~18 points/sprint (assuming 1 backend, 2 mobile, 1 web developer)  
> **Tech Stack:** Node.js · Express.js · MongoDB · React Native · React + MUI · Firebase · Socket.IO · Razorpay
