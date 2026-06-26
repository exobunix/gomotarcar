# 🧪 GoMotarCar — Testing Checklist

> **Pre-deployment testing checklist for all GoMotarCar platform modules**
> All items must pass before production deployment.

---

## 📋 Table of Contents

1. [Backend API Testing](#backend-api-testing)
2. [Authentication Testing](#authentication-testing)
3. [Customer App Testing](#customer-app-testing)
4. [Cleaner App Testing](#cleaner-app-testing)
5. [Admin Panel Testing](#admin-panel-testing)
6. [Payment Testing](#payment-testing)
7. [Notification Testing](#notification-testing)
8. [QR Scanning Testing](#qr-scanning-testing)
9. [WebSocket/Real-time Testing](#websocketreal-time-testing)
10. [Integration Testing](#integration-testing)
11. [Security Testing](#security-testing)
12. [Performance Testing](#performance-testing)
13. [Device Compatibility](#device-compatibility)
14. [Pre-Deployment Sign-off](#pre-deployment-sign-off)

---

## Backend API Testing

### Health & Connectivity

- [ ] `GET /health` returns `200` with status `ok`
- [ ] MongoDB connection is stable
- [ ] Redis connection is stable
- [ ] Firebase Admin SDK initializes without errors
- [ ] Razorpay SDK initializes without errors
- [ ] S3 connection is verified

### API Response Format

- [ ] All endpoints return `{ success: true, data: ... }` on success
- [ ] All endpoints return `{ success: false, error: { code, message } }` on failure
- [ ] All errors include appropriate HTTP status codes
- [ ] Paginated endpoints return `pagination` object
- [ ] CORS headers are present and correct

### Error Handling

- [ ] Missing required fields return `400` with validation error
- [ ] Invalid auth token returns `401` with `AUTH_INVALID_TOKEN`
- [ ] Expired token returns `401` with `AUTH_TOKEN_EXPIRED`
- [ ] Inactive user returns `401` with `AUTH_USER_INACTIVE`
- [ ] Accessing forbidden resource returns `403`
- [ ] Non-existent resource returns `404`
- [ ] Rate limiting returns `429` after threshold exceeded
- [ ] Malformed JSON returns `400`

### API Endpoint Tests

| Endpoint | Test | Expected |
|----------|------|----------|
| `POST /auth/send-otp` | Send OTP to valid phone | `200`, OTP sent |
| `POST /auth/send-otp` | Send OTP to invalid phone | `400` validation error |
| `POST /auth/register` | Register with all required fields | `201`, user created |
| `POST /auth/register` | Register with existing phone | `409` conflict |
| `POST /auth/login` | Login with correct credentials | `200`, tokens returned |
| `POST /auth/login` | Login with wrong password | `401` unauthorized |
| `POST /auth/refresh` | Refresh with valid token | `200`, new tokens |
| `POST /auth/refresh` | Refresh with expired token | `401` |
| `POST /auth/logout` | Logout authenticated user | `200` |
| `GET /subscriptions` | List subscriptions (authenticated) | `200`, paginated |
| `GET /subscriptions` | List subscriptions (no auth) | `401` |
| `POST /bookings` | Create booking with valid data | `201` |
| `POST /bookings` | Create booking with past date | `400` validation |
| `PATCH /bookings/:id/cancel` | Cancel existing booking | `200` |
| `PATCH /bookings/:id/cancel` | Cancel completed booking | `400` |
| `POST /payments/create-order` | Create valid order | `200`, order_id |
| `POST /payments/verify` | Verify with valid signature | `200`, verified |
| `POST /payments/verify` | Verify with invalid signature | `400` |
| `POST /attendance/check-in` | Check-in with GPS | `201` |
| `POST /attendance/check-in` | Check-in without GPS | `400` |
| `POST /attendance/check-out` | Check-out after check-in | `200` |
| `POST /attendance/check-out` | Check-out without check-in | `400` |

---

## Authentication Testing

### Login Flow

- [ ] User can log in with phone + password
- [ ] User can log in with phone + OTP
- [ ] OTP is sent successfully via SMS
- [ ] OTP expires after configured duration (5 min)
- [ ] Resend OTP cooldown works (30 seconds)
- [ ] Invalid OTP shows error message
- [ ] Max OTP attempts lock account temporarily
- [ ] Token refresh works seamlessly
- [ ] Logout invalidates refresh token
- [ ] Password change requires current password
- [ ] Password change updates token

### Authorization

- [ ] Customer cannot access cleaner endpoints
- [ ] Cleaner cannot access admin endpoints
- [ ] Admin can access all endpoints
- [ ] Unauthenticated requests return 401
- [ ] Expired token triggers refresh flow

---

## Customer App Testing

### Splash & Onboarding

- [ ] Splash screen displays branding correctly
- [ ] Onboarding carousel shows 3 feature slides
- [ ] Swipe and dot indicators work
- [ ] Skip button navigates to auth
- [ ] Get Started button navigates to login

### Authentication

- [ ] Phone number input accepts 10-digit format
- [ ] OTP auto-read works on supported devices
- [ ] 30-second OTP resend timer works
- [ ] Registration form validates all fields
- [ ] Terms checkbox is required for registration

### Home Dashboard

- [ ] Dashboard loads user stats correctly
- [ ] Quick action cards navigate to correct screens
- [ ] Wallet balance is displayed
- [ ] Subscription preview shows remaining credits
- [ ] Upcoming booking card appears
- [ ] Pull-to-refresh works

### Hire Cleaner

- [ ] Apartment/Vehicle selection works
- [ ] Package selection shows correct pricing
- [ ] Date/time picker works
- [ ] Booking summary displays correctly
- [ ] Payment integration works
- [ ] Booking confirmation screen shows

### Booking Management

- [ ] Booking list loads with status tabs (all/upcoming/completed/cancelled)
- [ ] Tab switching works correctly
- [ ] Booking detail shows progress timeline
- [ ] Cancel booking shows confirmation
- [ ] Cancel booking updates list

### Subscription

- [ ] Available plans display correctly
- [ ] Plan comparison works
- [ ] Subscription purchase flow completes
- [ ] My Plans tab shows active subscriptions
- [ ] Cleaning credits decrement correctly

### QR Management

- [ ] QR list displays all user's QR codes
- [ ] QR code images render correctly
- [ ] Activate QR flow works
- [ ] Report damaged flow works
- [ ] Replace QR flow works

### Wallet & Payments

- [ ] Wallet balance is accurate
- [ ] Transaction history loads
- [ ] Top-up shows amount options
- [ ] Top-up payment processes correctly
- [ ] Payment history loads

### Notifications

- [ ] Notification list loads
- [ ] Unread count badge updates
- [ ] Mark as read works
- [ ] Pull-to-refresh works
- [ ] Tap notification navigates to relevant screen

### Complaints

- [ ] Complaint list loads with status filter
- [ ] Create complaint form validates
- [ ] Category selection works
- [ ] Attach image works
- [ ] Complaint detail shows status timeline

### Service History

- [ ] Completed services list loads
- [ ] Cleaner info displays
- [ ] Rate & Review works
- [ ] Rating submission works

### Profile

- [ ] Profile data loads correctly
- [ ] Edit profile saves changes
- [ ] Vehicle management CRUD works
- [ ] Apartment management CRUD works
- [ ] Settings toggle works

---

## Cleaner App Testing

### Login & Authentication

- [ ] Cleaner log in with credentials
- [ ] OTP verification works
- [ ] Password reset works
- [ ] Session persists across app restarts

### Dashboard

- [ ] Cleaner profile loads
- [ ] Stats cards show correct data (tasks/completed/pending)
- [ ] Attendance status displays correctly
- [ ] Quick actions navigate to correct screens
- [ ] Today's schedule shows assigned tasks
- [ ] Earnings snapshot loads
- [ ] Rating displays correctly
- [ ] Pull-to-refresh works

### Attendance

- [ ] Check-in button works
- [ ] GPS location is captured
- [ ] Selfie capture works (if configured)
- [ ] Late detection works
- [ ] Check-out button works
- [ ] Attendance history loads
- [ ] Monthly summary (present/late/absent) displays

### QR Scan

- [ ] Camera viewfinder renders
- [ ] QR code scanning works
- [ ] Manual QR code entry works
- [ ] Verified QR shows success
- [ ] Invalid QR shows error
- [ ] Return-to-task navigation works

### Today's Tasks

- [ ] Task list loads with status filter chips
- [ ] Filter chips work (all/pending/active/done)
- [ ] Task cards show vehicle, customer, time
- [ ] Tap navigates to task detail

### Task Detail

- [ ] Customer info displays
- [ ] Vehicle info displays
- [ ] Service checklist items render
- [ ] Checkboxes toggle correctly
- [ ] Before photos can be uploaded
- [ ] After photos can be uploaded
- [ ] Start task button works
- [ ] Complete task button works
- [ ] Task completion shows summary

### Earnings Dashboard

- [ ] Total earnings card displays
- [ ] Today/Week/Month period breakdown works
- [ ] Payment status (pending/paid/incentive) displays
- [ ] Incentives preview shows
- [ ] Leaderboard link works

### Incentives

- [ ] Current tier badge displays
- [ ] Tier progression ladder shows all tiers
- [ ] Incentive history loads
- [ ] Payout status (paid/pending) displays

### Leave Management

- [ ] Leave balance (remaining/used/total) loads
- [ ] Apply for leave form validates
- [ ] Leave type selection works
- [ ] Leave history loads
- [ ] Status badges (pending/approved/rejected) display

### Training

- [ ] Training list loads with categories
- [ ] Search works
- [ ] Progress stats display
- [ ] Video placeholder renders
- [ ] Quiz questions display
- [ ] Quiz answer selection works
- [ ] Quiz submission shows score

### Performance

- [ ] Overall rating displays
- [ ] Metrics grid shows (quality/efficiency/attendance/on-time)
- [ ] Category breakdown bars display
- [ ] Recent feedback loads
- [ ] vs Last Month comparison displays

### Achievements

- [ ] Progress card shows earned/total
- [ ] Achievement grid renders
- [ ] Locked achievements show lock icon
- [ ] Unlocked achievements show checkmark

### Support

- [ ] Call button opens dialer
- [ ] WhatsApp button opens WhatsApp
- [ ] Raise ticket form validates
- [ ] Category selection works
- [ ] FAQ accordion works

### History

- [ ] Task history loads with stats
- [ ] Period filtering works
- [ ] Search works
- [ ] Earnings history loads

### Profile

- [ ] Profile data loads
- [ ] Settings toggles work
- [ ] Logout works

---

## Admin Panel Testing

### Dashboard

- [ ] KPI cards display correct metrics
- [ ] Charts render without errors
- [ ] Recent activity list loads
- [ ] Quick action buttons work
- [ ] Date range filter works

### Cleaners Management

- [ ] Cleaner list loads
- [ ] Search/filter works
- [ ] Cleaner detail shows all info
- [ ] Document verification works
- [ ] Status toggle works

### Customers Management

- [ ] Customer list loads
- [ ] Search/filter works
- [ ] Customer detail shows subscriptions/bookings
- [ ] Subscription management works

### Bookings Management

- [ ] Booking list loads with filters
- [ ] Status management works
- [ ] Assign cleaner works
- [ ] Job card generation works

### Payments

- [ ] Payment list loads
- [ ] Refund processing works
- [ ] Payment filters work

### QR Management

- [ ] QR list loads
- [ ] QR generation works
- [ ] QR status management works

### Notifications

- [ ] Send notification form works
- [ ] Broadcast to role works
- [ ] Notification history loads

### Analytics

- [ ] Charts render correctly
- [ ] Date range picker works
- [ ] Data export works
- [ ] Filter controls work

### Navigation

- [ ] Sidebar navigation works
- [ ] Mobile responsive menu works
- [ ] Breadcrumbs display correctly

---

## Payment Testing

### Razorpay Integration

- [ ] Order creation matches amount
- [ ] Checkout opens with correct amount
- [ ] Payment success redirects to confirmation
- [ ] Payment failure shows error
- [ ] Payment cancellation handled gracefully
- [ ] Refund processes correctly
- [ ] Webhook verifies signature
- [ ] Webhook updates payment status

### Wallet

- [ ] Wallet balance reflects top-ups
- [ ] Wallet balance reflects deductions
- [ ] Transaction history is accurate
- [ ] Insufficient balance shows error

### Edge Cases

- [ ] Network timeout during payment shows error
- [ ] Duplicate payment ID doesn't double-charge
- [ ] Partial refund works
- [ ] Payment for ₹0 shows error
- [ ] Maximum amount limit enforced (if configured)

---

## Notification Testing

### Push Notifications (FCM)

- [ ] FCM registration works on Android
- [ ] FCM registration works on iOS
- [ ] Foreground push shows custom UI
- [ ] Background push shows system notification
- [ ] Tap notification navigates to relevant screen
- [ ] Notification badge count updates
- [ ] Multiple notifications stack correctly

### In-App Notifications

- [ ] Notification list loads
- [ ] Mark as read updates badge
- [ ] Mark all as read works
- [ ] Pull-to-refresh works
- [ ] Notification types show correct icons

### Notification Types

- [ ] Task assigned notification arrives
- [ ] Booking confirmed notification arrives
- [ ] Payment received notification arrives
- [ ] Attendance reminder notification arrives
- [ ] Leave approved notification arrives

---

## QR Scanning Testing

### Scanner Functionality

- [ ] Camera permission prompt appears
- [ ] Scanner viewfinder displays correctly
- [ ] Valid QR code is detected and processed
- [ ] Invalid QR code shows error
- [ ] Manual code entry works
- [ ] Scanner works in low light

### QR Verification (Task)

- [ ] Scan QR at task location works
- [ ] QR verification updates task status
- [ ] Already verified QR shows status
- [ ] Wrong task QR shows mismatch error
- [ ] Expired QR code shows error

### QR Management (Customer)

- [ ] QR code renders correctly
- [ ] Download QR works (if available)
- [ ] Activate QR flow works
- [ ] Report damaged updates status
- [ ] Replace QR generates new code
- [ ] QR code is scannable by cleaner app

---

## WebSocket/Real-time Testing

### Connection

- [ ] Socket connects with valid JWT
- [ ] Socket rejects invalid JWT
- [ ] Socket reconnects on disconnect
- [ ] Socket reconnects on token refresh
- [ ] Multiple connections from same user handled

### Real-time Events

- [ ] Task assigned → immediate notification to cleaner
- [ ] Task status update → real-time UI update
- [ ] Booking created → admin panel updates
- [ ] Location update → customer sees cleaner movement
- [ ] Chat message → instant delivery
- [ ] Payment completed → notification sent

### Location Tracking

- [ ] Cleaner location broadcasts periodically
- [ ] Customer receives location updates
- [ ] Location updates stop when task completes
- [ ] Offline cleaner marked inactive
- [ ] Location accuracy is reasonable

---

## Integration Testing

### Customer → Cleaner Flow

- [ ] Customer books a service
- [ ] Booking appears in admin panel
- [ ] Admin assigns cleaner
- [ ] Cleaner receives task notification
- [ ] Cleaner checks in and completes task
- [ ] Customer receives completion notification
- [ ] Customer can rate and review
- [ ] Cleaner earnings update

### Customer → Payment Flow

- [ ] Customer selects subscription package
- [ ] Razorpay checkout opens
- [ ] Payment succeeds
- [ ] Subscription activates
- [ ] Cleaning credits are credited
- [ ] Wallet top-up works
- [ ] Payment reflects in admin panel

### Cleaner → Attendance Flow

- [ ] Cleaner checks in with GPS
- [ ] Attendance recorded in database
- [ ] Late detection works
- [ ] Admin panel shows attendance
- [ ] Monthly summary calculates correctly
- [ ] Earnings reflect attendance

### Push Notification Flow

- [ ] Firebase token registered on login
- [ ] Token stored in user document
- [ ] Push sent when event occurs
- [ ] Push received on device
- [ ] App handles foreground push
- [ ] App handles background push

---

## Security Testing

### Authentication & Authorization

- [ ] Passwords hashed with bcrypt (min 10 rounds)
- [ ] JWT tokens expire after configured time
- [ ] Refresh tokens are one-time use
- [ ] OTP codes are time-limited (5 min)
- [ ] Rate limiting applies to auth endpoints
- [ ] MongoDB injection prevention works
- [ ] XSS prevention via helmet
- [ ] CORS restricted to allowed origins

### Data Protection

- [ ] Sensitive data not exposed in API responses
- [ ] Phone numbers masked where appropriate
- [ ] File uploads validated for type and size
- [ ] S3 bucket not publicly writable
- [ ] Encryption for sensitive fields (if configured)

### Input Validation

- [ ] All inputs validated (Joi/Zod schemas)
- [ ] SQL/MongoDB injection attempts blocked
- [ ] Malformed JSON rejected
- [ ] Buffer overflow attempts blocked
- [ ] Path traversal on file uploads blocked

---

## Performance Testing

### API Response Times

- [ ] List endpoints respond within 500ms (100 items)
- [ ] Single resource endpoints respond within 200ms
- [ ] Auth endpoints respond within 1s (including OTP SMS)
- [ ] Payment processing responds within 2s
- [ ] File uploads (1MB) complete within 5s

### Load Testing

- [ ] Server handles 100 concurrent users
- [ ] Server handles 50 concurrent socket connections
- [ ] MongoDB handles 1000 queries/minute
- [ ] Redis handles reads/writes without lag
- [ ] Rate limiting prevents abuse

### App Performance

- [ ] App cold start < 3s
- [ ] Screen transitions < 300ms
- [ ] Image loading < 2s (on good connection)
- [ ] List scrolling is smooth (> 60fps)
- [ ] App memory usage < 200MB
- [ ] App crash-free rate > 99.5%

---

## Device Compatibility

### Android

- [ ] Android 8.0+ (API 26)
- [ ] Screen sizes: small (5"), medium (6"), large (6.7"+)
- [ ] Camera permission handling
- [ ] Location permission handling
- [ ] Storage permission handling
- [ ] Notification permission (Android 13+)
- [ ] Back gesture navigation
- [ ] Dark mode (if supported)
- [ ] Notch/status bar handling

### iOS

- [ ] iOS 14.0+
- [ ] iPhone SE, 12, 13, 14, 15 series
- [ ] Camera permission handling
- [ ] Location permission handling
- [ ] Notification permission handling
- [ ] Face ID / Touch ID (if used)
- [ ] Home indicator handling
- [ ] Dynamic Island compatibility

### Admin Panel (Web)

- [ ] Chrome (last 2 versions)
- [ ] Firefox (last 2 versions)
- [ ] Safari (last 2 versions)
- [ ] Edge (last 2 versions)
- [ ] Mobile browsers (Chrome, Safari)
- [ ] Screen width: 1024px+ (desktop), 768px (tablet), 375px (mobile)
- [ ] Touch events on tablet

---

## Pre-Deployment Sign-off

### Checklist

- [ ] All backend API endpoints tested and working
- [ ] All mobile app flows tested on both Android and iOS
- [ ] Admin panel pages render correctly
- [ ] Payment integration tested with Razorpay test keys
- [ ] Push notifications working on both platforms
- [ ] QR scanning working on both platforms
- [ ] WebSocket real-time events functioning
- [ ] All critical edge cases handled
- [ ] No known security vulnerabilities
- [ ] Performance meets baseline thresholds
- [ ] Error tracking configured (Sentry/LogRocket)
- [ ] Analytics tracking configured (if applicable)
- [ ] SSL/HTTPS configured
- [ ] Database backups configured
- [ ] Monitoring alerts configured
- [ ] Rollback procedure documented
- [ ] Environment variables set in production
- [ ] Version numbers updated
- [ ] Release notes prepared

### Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | | | |
| Tech Lead | | | |
| Product Owner | | | |
| DevOps | | | |

---

> **After sign-off:** Proceed to [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for production deployment instructions.
