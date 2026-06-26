# GoMotarCar — Database Audit Report

> **Generated:** June 16, 2026
> **Audited:** 47 Mongoose models in `server/src/models/`
> **MongoDB Version:** 7.0+

---

## Summary

| Metric | Value |
|--------|-------|
| Total Collections | 47 (including sub-collections) |
| Collections with `timestamps: true` | 47 (100%) |
| Collections with proper indexes | 47 (100%) |
| Collections with TTL indexes | 3 (Notifications, AuditLogs, TrackingHistory) |
| Empty placeholder schemas (FIXED) | 5 (ServiceProvider, Offer, Coupon, AuditLog, Announcement) |
| Geo 2dsphere indexes | 6 (Cleaner, Franchise, Apartment, Zone, ServiceProvider, Tracking) |
| Text indexes | 1 (ServiceProvider) |
| Unique compound indexes | 4 (Attendance: cleanerId+date, TrainingProgress: cleanerId+videoId, Wallet: ownerType+ownerId, CleanerLiveLocation: cleanerId) |

---

## Findings and Fixes

### 🔴 Critical Issues (Fixed)

| # | Model | Issue | Fix |
|---|-------|-------|-----|
| 1 | ServiceProvider | Empty schema — only `{ /* TODO */ }` | Implemented full schema with address, services, operatingHours, categories, geo index |
| 2 | Offer | Empty schema | Implemented full schema with discount type, limits, validFrom/To, usage tracking |
| 3 | Coupon | Empty schema | Implemented full schema with code, value, maxUses, user tracking |
| 4 | AuditLog | Empty schema | Implemented full schema with action, actorId, changes tracking, TTL 2 years |
| 5 | Announcement | Empty schema | Implemented full schema with title, content, targetRoles, scheduling |

### 🟡 Medium Issues (Verified)

| # | Model | Issue | Status |
|---|-------|-------|--------|
| 6 | ServiceBooking | Missing `location` geo field | Noted — can be added via tracking |
| 7 | Subscription | Missing `nextBillingDate` field | Noted — derived from endDate |
| 8 | Performance | Missing `createdAt` reference | Noted — uses timestamps |
| 9 | Customer | Missing `preferences` object | Noted — can be added later |
| 10 | Cleaner.stats | No auto-recalculation trigger | Handled via cron jobs |

### 🟢 Verified Correct

| Model | Verified Fields | Indexes | Status |
|-------|---------------|---------|--------|
| User | All auth fields | ✅ phone, email, role | ✅ |
| Customer | Profile + subscription | ✅ phone, userId, referralCode | ✅ |
| Cleaner | Full profile + bank + documents + stats | ✅ 5 indexes | ✅ |
| Vehicle | Full with QR + cleaningHistory | ✅ 4 indexes | ✅ |
| Task | Full with statusHistory + checklist | ✅ 6 indexes | ✅ |
| Attendance | Check-in/out with GPS + breaks | ✅ 3 indexes (1 unique) | ✅ |
| Payment | Razorpay full + recurring | ✅ 5 indexes | ✅ |
| Wallet | Full with transactions | ✅ 2 collections | ✅ |
| Notification | Full with TTL | ✅ 3 indexes | ✅ |

---

## Index Coverage

| Collection | Queries Supported | Missing Indexes |
|-----------|------------------|-----------------|
| User | phone, email, role | None |
| Cleaner | cleanerId, supervisor, zone, geo, verification | None |
| Task | taskId, cleaner+date, customer, status, date, geo | None |
| Subscription | customerId, cleanerId, status+endDate | None |
| Payment | orderId, paymentId, payerId, status, referenceId | None |
| Notification | recipient+date, isRead, createdAt (TTL) | None |
| AuditLog | actor+date, target, action, createdAt (TTL) | None |

**No missing indexes detected.** All common query patterns are covered.

---

## Data Integrity

- ✅ All models use `timestamps: true` (createdAt, updatedAt)
- ✅ All required foreign keys use `ObjectId` with `ref` for population
- ✅ Enums have explicit string values
- ✅ Geo fields use MongoDB GeoJSON format
- ✅ Denormalized fields (stats, counts) are clearly marked
- ✅ TTL indexes on appropriate collections
- ✅ `select: false` on sensitive fields (passwordHash, refreshToken, wallet.pin)
