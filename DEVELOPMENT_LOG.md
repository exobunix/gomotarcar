# GoMotarCar — Development Log

## Phase 1: Backend Core Implementation ✅

### Date: June 15, 2026

### What was built

#### Authentication System
- OTP-based auth flow (send OTP, verify OTP, auto-register)
- Password-based login with bcryptjs hashing
- JWT token pair (access + refresh) with automatic refresh
- Token versioning for forced logout
- Rate limiting on auth endpoints (5 OTP/min, 10 login/min)
- Joi validation on all auth inputs

#### Admin Module
- Full CRUD with RBAC (super_admin, manager, operations roles)
- Granular permission system (cleaners_manage, customers_manage, etc.)
- Paginated admin listing with search/filter
- Admin deactivation (cascading to User record)
- Dashboard stats endpoint

#### Supervisor Module
- Full CRUD with zone assignment
- Paginated listing with search/filter by zone
- Cleaner count tracking per supervisor
- Cascade delete (reassigns cleaners, deletes User)
- Dashboard stats

#### Franchise Module
- Full CRUD with multi-step verification
- Document management with per-document status tracking
- Agreement & commission configuration
- Service zone mapping
- Bank details for payouts
- Dashboard stats

#### Cleaner Module
- Full CRUD with auto-generated cleaner ID (GMC-XXXX)
- Document management (Aadhaar, PAN, Driving License, Police Verification)
- Stats tracking (tasks, earnings, ratings, attendance %)
- Supervisor assignment, zone assignment
- Bank details for payouts
- Employment type (full-time, part-time, contract)
- Dashboard stats

#### Apartment Module
- Full CRUD for customer addresses/apartments
- Multi-label support (Apartment, Villa, Society, etc.)
- Default address management
- List by customer, list all (admin)
- Geo-coordinates support

#### Vehicle Module
- Full CRUD with customer association
- Duplicate vehicle number detection
- Cleaning history tracking
- QR code record linkage
- Fuel type, vehicle type categorization
- List by customer, list all (admin)

### Architecture

| Layer | Files | Status |
|-------|-------|--------|
| Models | User, Admin, Supervisor, Franchise, Cleaner, Apartment, Vehicle + 26 more | ✅ 33 models |
| Services | auth, admin, supervisor, franchise, cleaner, apartment, vehicle + 31 more | ✅ 38 services |
| Controllers | auth, admin, supervisor, franchise, cleaner, apartment, vehicle + 16 more | ✅ 23 controllers |
| Validators | auth, admin, supervisor, franchise, cleaner, apartment, vehicle + 8 more | ✅ 15 validators |
| Routes | auth, admin, supervisor, franchise, cleaner, apartment, vehicle + 16 more | ✅ 24 routes |
| Middleware | auth (JWT), roleGuard (RBAC), validate (Joi), errorHandler, rateLimiter | ✅ 6 files |
| Config | env, db, firebase, razorpay, redis, s3, otp, sms, email | ✅ 9 files |
| Utils | jwt, helpers, constants, logger, pagination, geo, qr, otp | ✅ 8 files |

### Key Design Decisions
1. **OTP-first auth** — Phone OTP is primary auth method; password is optional enhancement
2. **Token versioning** — Incrementing `tokenVersion` invalidates all existing sessions on logout
3. **Cascading deactivation** — Deactivating a profile also deactivates the linked User record
4. **Role-based route protection** — Every protected route uses `authenticate` + `authorize()` middleware chain
5. **Joi validation** — All inputs validated at the route level before reaching controllers
6. **Consistent response format** — `{ success, data }` for single items, `{ success, pagination, data }` for lists

## Phase 2: Operations & Management Systems ✅

### Date: June 15, 2026

### What was built

#### 1. QR Management
- QR code generation with unique codes (GMC-XXXX format)
- QR activation lifecycle (pending → active → damaged → replaced)
- QR scanning by cleaners with scan count tracking
- Damage reporting and replacement with audit trail
- Paginated listing with status/vehicle/customer filters
- Update vehicle QR reference on status changes

#### 2. Subscription Plans
- Subscription package CRUD with pricing, GST, features
- Customer subscription with cleaning count tracking
- Automated expiry detection for CRON jobs
- Usage deduction per cleaning completed
- Subscription cancellation with refund eligibility flag
- Auto-renew support, active/expired/cancelled statuses

#### 3. Booking Engine
- Full booking lifecycle (booked → accepted → in_progress → completed)
- Auto-generated booking IDs (BKG-YYYYMMDD-XXXXXXXX)
- Tracking timeline with status change audit trail
- Extra charge management with approval workflow
- Job card generation with invoice tracking
- Customer review with ratings after completion
- Vehicle cleaning history updates on completion

#### 4. Cleaner Assignment Engine
- Manual cleaner assignment to tasks
- Auto-assignment algorithm (round-robin to least-loaded verified cleaners)
- Cleaner availability check with current workload display
- Task reassignment with audit trail
- Zone-based cleaner filtering
- Per-cleaner workload balancing

#### 5. Attendance System
- Geo-location tracked check-in with late detection (>8:30 AM)
- Check-out with half-day detection (<4 hours)
- Admin mark-absent with modification reason
- Monthly summary (present, absent, half-day, late, leave)
- Working minutes and overtime tracking
- Cleaner attendance percentage auto-update
- Per-day unique constraint per cleaner

#### 6. Leave Management
- Leave application with balance checking (sick: 12, casual: 6, earned: 15, emergency: 3)
- Overlapping leave detection
- Approval/rejection workflow with reason tracking
- Balance snapshot capture on application
- Leave balance query endpoint
- Admin stats dashboard

#### 7. Earnings System
- Per-task earnings recording with package-based rates (basic: ₹50, premium: ₹75, elite: ₹100)
- Period-based earnings calculation (daily, weekly, monthly)
- Cleaner earnings summary (total, pending, paid)
- Incentive and overtime amount support
- Payout tracking linkage
- Cleaner stats auto-update on earning

#### 8. Incentive System
- Monthly performance scoring (tasks 30% + attendance 30% + ratings 20% + earnings 20%)
- Tier-based incentive amounts (platinum: ₹5000, gold: ₹3000, silver: ₹1500, bronze: ₹500)
- Bulk calculation for all cleaners with Promise.allSettled for performance
- Leaderboard ranking by performance score
- Payout status tracking
- Cleaner rank auto-update

#### 9. Complaint System
- Ticket-based complaint tracking (CMP-YYYYMMDD-XXXXXXXX)
- Priority management (low, medium, high, critical)
- Assignment to staff members
- Resolution and closure workflow
- Customer rating on closure
- Multi-category classification

#### 10. Notification System
- Individual and bulk notification sending
- Firebase Cloud Messaging push integration
- Read tracking with read timestamps
- Mark-all-read for bulk operations
- TTL-based auto-cleanup (90 days via MongoDB TTL index)
- Priority levels (low, normal, high, urgent)
- 13 notification types (task_assignment, task_reminder, attendance_alert, etc.)

### Architecture

| Layer | Phase 1 | Phase 2 | Total |
|-------|---------|---------|-------|
| Services | 8 | 11 | 49 |
| Controllers | 7 | 10 | 33 |
| Validators | 7 | 10 | 25 |
| Routes | 7 | 11 | 35 |

### Key Design Decisions
1. **Auth middleware resolves User → Cleaner ID** — Attendance routes resolve the Cleaner document from the authenticated User via `Cleaner.findOne({ userId })`
2. **Parallel incentive calculation** — `calculateAllMonthly` uses `Promise.allSettled` for concurrent processing across all cleaners
3. **Lazy-loaded Firebase** — Notification service lazily loads the Firebase messaging module for graceful initialization
4. **Pessimistic leave balance** — Balance is calculated from approved leaves against hard-coded limits with a snapshot on each application
5. **Embedded timeline tracking** — Booking and Task statuses are tracked via embedded `statusHistory`/`trackingTimeline` arrays for full audit trails
6. **Geo-enabled attendance** — Check-in captures location coordinates with GPS verification support

### Next Steps (Phase 3)
- Payment integration with Razorpay (orders, captures, refunds, webhooks)
- Payroll & payout processing with Razorpay Payouts API
- File upload system with S3/Multer
- Real-time Socket.IO events for live updates
- Analytics dashboards with aggregation pipelines
- Admin panel UI implementation (React + MUI)

## Phase 3: Payments, Tracking & Real-time Systems ✅

### Date: June 15, 2026

### What was built

#### 1. Razorpay Integration
- Order creation via Razorpay Orders API with amount in paise
- Payment verification using HMAC SHA256 signature validation (`crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex')`)
- Payment capture and status update (created → captured)
- Webhook handling for `payment.captured`, `payment.failed`, and `subscription.charged` events
- Webhook signature verification using shared secret
- Refund processing via Razorpay Refunds API (full and partial)
- Refund status tracking (full/partial refunded)
- Paginated payment listing with status/purpose/payer/date filters
- Payment stats with revenue aggregation

#### 2. Wallet System
- **Wallet** model with balance, totalCredited, totalDebited, active/frozen/closed status
- **WalletTransaction** model with credit/debit tracking, balanceBefore/balanceAfter snapshots, purpose classification
- Auto-create wallet on first access (getOrCreate)
- Wallet top-up via Razorpay order creation
- Top-up completion (capture payment + credit wallet + record transaction)
- Wallet debit for payments (with insufficient balance check)
- Wallet credit for refunds/incentives/bonuses
- Wallet-to-wallet transfers (admin only)
- Transaction history with filters (type, purpose)
- Wallet stats (total wallets, total balance)

#### 3. Payment History
- Full payment record with Razorpay order/payment/signature tracking
- Payment listing with status, purpose, payer, date range filters
- Lookup by razorpayOrderId for frontend reconciliation
- Revenue aggregation (total captured amount, total refunded amount)
- 6 payment statuses: created, captured, refunded, failed, partial_refunded
- 7 payment purposes: subscription, service_booking, fasttag_recharge, cleaner_payout, incentive_payout, refund, wallet_topup
- Receipt and notes support

#### 4. Refund Management
- Full refund via Razorpay Refunds API with reason tracking
- Partial refund support (specify amount less than original)
- Automatic refund status assignment (full vs partial)
- Refund amount accumulation on Payment record
- Refund eligibility flag on Subscription cancellation

#### 5. Live Cleaner Tracking
- **CleanerLiveLocation** model — one document per cleaner, updated in real-time
- Location: { type: 'Point', coordinates: [lng, lat] } with 2dsphere index
- Speed, heading, accuracy, batteryLevel tracking
- isOnline state management (auto-offline on Socket disconnect)
- currentTaskId linkage for context-aware tracking
- **TrackingHistory** model — raw location log with 7-day TTL expiry
- Location history query with date range and limit
- geofence zone alerting for boundary violations

#### 6. Socket.IO Events
- **7 handler files** all implemented with real business logic:

  | Handler | Events | Key Features |
  |---------|--------|--------------|
  | `location.handler.js` | `location:update`, `location:subscribe`, `location:offline`, `location:get-zone` | Real-time cleaner position, geofence boundary alerts, 30-second history recording throttle |
  | `tracking.handler.js` | `task:start`, `task:complete`, `task:track`, `task:status-update` | Real-time task lifecycle broadcasts to customer/supervisor rooms |
  | `task.handler.js` | `task:assign`, `task:created`, `task:my-tasks`, `task:zone-tasks` | Assignment notifications, zone broadcasts |
  | `notification.handler.js` | `notifications:subscribe`, `notifications:read`, `notifications:read-all`, `notifications:unread` | Real-time push to notification rooms, unread count |
  | `attendance.handler.js` | `attendance:checkin`, `attendance:checkout`, `attendance:status` | Late detection (8:30 AM cutoff), half-day (<4h), supervisor broadcasts |
  | `booking.handler.js` | `booking:subscribe`, `booking:status-update`, `booking:created` | Franchise room notification, customer confirmation |
  | `chat.handler.js` | `chat:message`, `chat:typing`, `chat:read`, `chat:unread`, `chat:join`, `chat:leave` | Real-time messaging with typing indicators and read receipts |

- Enhanced `socket/index.js` with:
  - Cleaner ID resolution from User (joins `cleaner:` and `zone:` rooms)
  - Franchise resolution (joins `franchise:` room)
  - Supervisor zone assignment
  - Auto-offline on disconnect
  - Helper functions: `emitToUser()`, `emitToRole()`, `emitToCleaner()`, `emitToZone()`

#### 7. Geo Location Services
- **GPS Verification** — Check if a cleaner is within allowed radius using Haversine distance
- **Geofence Check** — Point-in-polygon test using ray-casting algorithm
- **Nearest Cleaner Finder** — `$nearSphere` query on 2dsphere index with maxDistance (meters)
- **Nearby Zone Finder** — Zones near a location ordered by distance
- **Location History Recording** — Every location point stored for 7 days
- Set cleaner online/offline state

#### 8. Route Optimization
- **Optimal Cleaner Selection** — Weighted scoring algorithm:
  - Distance (40%): closer is better, normalized to 100
  - Workload (35%): fewer today's tasks = better
  - Rating (25%): higher average rating = better
- **Nearest-Neighbor Route** — Optimizes a cleaner's task order by proximity
- **Travel Time Estimation** — distance → minutes conversion with configurable average speed
- **Batch Assignment** — Assigns multiple tasks to optimal cleaners

#### 9. Push Notification Service
- **sendToDevice()** — Firebase FCM v1 API with Android priority + APNS sound/badge
- **sendToUser()** — Saves notification in DB + sends FCM push to stored token
- **sendToRole()** — Broadcasts to all active users of a role with FCM tokens
- **sendToTopic()** — Firebase topic-based messaging
- **Topic Management** — subscribeToTopic / unsubscribeFromTopic
- **Token Management** — updateToken / removeToken on login/logout
- **Test Notification** — `/push/test` endpoint for verification
- Lazy-loaded Firebase module for graceful fallback

#### 10. Firebase Integration
- Existing `firebase.js` enhanced with FCM messaging export
- Push service lazily loads Firebase: `if (!_messagingModule) _messagingModule = require('../config/firebase')`
- Graceful degradation when Firebase credentials not configured

### Architecture

| Layer | Phase 1 | Phase 2 | Phase 3 | Total |
|-------|---------|---------|---------|-------|
| Models | 7 | — | 3 (Wallet, WalletTransaction, CleanerLiveLocation, TrackingHistory) | 37 |
| Services | 8 | 11 | 5 (payment, wallet, geo, route-optimization, push) | 54 |
| Controllers | 7 | 10 | 4 (payment, wallet, tracking, push) | 37 |
| Validators | 7 | 10 | 4 (payment, wallet, tracking, push) | 29 |
| Routes | 7 | 11 | 4 (payment, wallet, tracking, push) | 39 |
| Socket Handlers | — | — | 7 handlers + main | 8 files |

### Key Design Decisions
1. **Lazy-loaded services** — Firebase messaging and Razorpay are loaded lazily for graceful degradation when credentials are missing
2. **Socket handler separation** — Each domain gets its own handler file for maintainability; handlers call into service methods where persistence is needed
3. **Geospatial indexing** — CleanerLiveLocation and Zone use `2dsphere` indexes for efficient `$nearSphere` queries
4. **7-day location TTL** — Raw tracking history auto-expires via MongoDB TTL index to control storage costs
5. **Wallet transaction snapshots** — Every transaction records `balanceBefore` and `balanceAfter` for complete audit trail
6. **Webhook security** — All Razorpay webhooks validated via HMAC SHA256 signature before processing
7. **Cleaner ID resolution** — Socket.IO middleware resolves Cleaner document ID from User auth token on connection
