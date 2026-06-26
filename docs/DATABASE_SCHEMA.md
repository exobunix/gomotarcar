# GoMotarCar — Database Schema Documentation

> **Generated:** June 16, 2026
> **Database:** MongoDB 7.0+
> **Connection:** `mongodb+srv://adarshdeepsachan_db_user:***@gomatar.zcg6q0c.mongodb.net/gomotar_prod`

---

## Collection Index

| # | Collection | Documents | Type | Key Fields |
|---|-----------|-----------|------|------------|
| 1 | Users | Auth base | Core | phone, email, role |
| 2 | Admins | Admin profiles | Core | userId, role, permissions |
| 3 | Customers | Customer profiles | Core | userId, phone, referralCode |
| 4 | Cleaners | Cleaner profiles | Core | cleanerId, userId, assignedZone |
| 5 | Supervisors | Supervisor profiles | Core | userId, assignedZone |
| 6 | Franchises | Franchise partners | Core | userId, franchiseName |
| 7 | Vehicles | Customer vehicles | Core | vehicleNumber, customerId |
| 8 | Apartments | Customer apartments | Location | customerId, coordinates |
| 9 | Addresses | Customer addresses | Location | customerId, coordinates |
| 10 | Subscriptions | Customer subscriptions | Billing | customerId, packageId, status |
| 11 | SubscriptionPackages | Available packages | Config | code, isActive |
| 12 | Tasks | Cleaning tasks | Operations | taskId, cleanerId, status |
| 13 | Attendance | Cleaner attendance | Operations | cleanerId, date |
| 14 | Leaves | Leave requests | HR | cleanerId, status |
| 15 | Earnings | Cleaner earnings | Finance | cleanerId, periodStart |
| 16 | Incentives | Monthly incentives | Finance | cleanerId, month, year |
| 17 | Payouts | Bulk/single payouts | Finance | payoutId, status |
| 18 | Payments | All transactions | Finance | razorpayOrderId, status |
| 19 | Wallets | User wallets | Finance | ownerType, ownerId |
| 20 | WalletTransactions | Wallet ledger | Finance | walletId |
| 21 | QRCodes | QR stickers | Operations | code, vehicleId, status |
| 22 | Reviews | Customer reviews | Social | reviewedEntityId |
| 23 | Notifications | In-app notifications | Comms | recipientId |
| 24 | Complaints | Customer complaints | Support | ticketNumber, customerId |
| 25 | Issues | Cleaner-reported issues | Support | ticketNumber, reportedBy |
| 26 | ChatMessages | Chat history | Comms | conversationId |
| 27 | ServiceBookings | Non-cleaning bookings | Services | bookingId, customerId |
| 28 | ServiceProviders | Service partners | Services | name, categories |
| 29 | ServiceCategories | Service categories | Services | slug, parentId |
| 30 | FastTagTransactions | FastTag recharges | Services | transactionId, vehicleId |
| 31 | TrainingVideos | Training content | Learning | category, isActive |
| 32 | TrainingProgress | Cleaner progress | Learning | cleanerId, videoId |
| 33 | Performances | Cleaner metrics | HR | cleanerId, periodType |
| 34 | Zones | Operational zones | Config | name, boundary |
| 35 | Offers | Discounts/promos | Marketing | code, validFrom, validTo |
| 36 | Coupons | Coupon codes | Marketing | code, validFrom, validTo |
| 37 | AuditLogs | System audit trail | Security | action, actorId |
| 38 | Tracking (History) | Location history | Operations | cleanerId |
| 39 | Tracking (Live) | Live location | Operations | cleanerId |
| 40 | Announcements | Broadcast messages | Comms | targetRoles |
| 41 | Banners | Promotional banners | CMS | page, isActive |
| 42 | Blogs | Blog content | CMS | slug, isPublished |
| 43 | ContactRequests | Website inquiries | CMS | status |
| 44 | DownloadLinks | App download links | CMS | platform, isActive |
| 45 | FAQs | FAQ content | CMS | category, isActive |
| 46 | Policies | Legal policies | CMS | type, isPublished |
| 47 | Campaigns | Notification campaigns | Marketing | status, scheduledAt |
| 48 | NotificationTemplates | Push/email templates | Comms | slug, category |
| 49 | Leads | Sales leads | CRM | phone, status |
| 50 | Leads (status history) | Lead tracking | CRM | leadId |

---

## Detailed Schema Reference

The following directories contain the complete Mongoose schema definitions:

```
server/src/models/*.js
```

Each file exports a `mongoose.model()` with full field definitions, including:
- Field names and types
- Required fields
- Default values
- Enums and validation
- References to other collections
- Timestamps (createdAt, updatedAt)

---

## Indexes Summary

| Collection | Indexes | Purpose |
|-----------|---------|---------|
| User | phone, email (sparse), role | Auth lookups |
| Customer | phone, userId, referralCode | Profile queries |
| Cleaner | cleanerId, supervisorId, assignedZone, address.coordinates (2dsphere), verificationStatus | Task assignment, geo queries |
| Task | taskId, cleanerId+scheduledDate, customerId, status, scheduledDate, location (2dsphere) | Task management |
| Attendance | cleanerId+date (unique), date, status | Daily records |
| Subscription | customerId, cleanerId, status+endDate | Billing |
| Payment | razorpayOrderId, razorpayPaymentId, payerId, status, referenceId | Transaction lookup |
| Notification | recipientId+createdAt, isRead, createdAt (TTL: 90 days) | Inbox |
| AuditLog | actorId+timestamp, targetType+targetId, timestamp, action, createdAt (TTL: 2 years) | Audit |
| Tracking | cleanerId+timestamp (TTL: 7 days), location (2dsphere) | Location |

---

## TTL Indexes (Auto-Expiry)

| Collection | Field | Duration | Purpose |
|-----------|-------|----------|---------|
| Notifications | createdAt | 90 days | Auto-clean old notifications |
| AuditLogs | createdAt | 2 years | Compliance retention |
| TrackingHistory | timestamp | 7 days | Raw location data cleanup |
| OTPs (in-memory) | — | 5 minutes | Phone verification |

---

## Key Relationships Diagram

```
User (1) ── (1) Admin/Customer/Cleaner/Supervisor/Franchise
Customer (1) ── (1..N) Vehicle/Address/Apartment/Subscription/Complaint/Review
Customer (1) ── (0..1) Subscription (active) ── (1) SubscriptionPackage
Vehicle (1) ── (1) QRCode
Cleaner (1) ── (1..N) Task/Attendance/Leave/Earnings/Incentive/TrainingProgress/Performance
Cleaner (1) ── (1) Zone
Task (1) ── (0..1) Issue/Review/Earnings
ServiceCategory (1) ── (1..N) ServiceProvider
ServiceBooking (1) ── (1) Payment
Payment (1) ── (0..1) WalletTransaction
Wallet (1) ── (1..N) WalletTransaction
```
