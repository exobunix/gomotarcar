# Database Architecture Audit — GoMotarCar

> Generated: June 16, 2026  
> Models audited: 46 (MongoDB/Mongoose)

---

## Overview

The database uses MongoDB with Mongoose ODM across **46 model files** (including 2 dual-model files: Tracking.js, Wallet.js). The schema follows a hybrid pattern with embedded subdocuments for frequently-accessed data and references (`ObjectId`) for relationships.

---

## Critical Issues Found & Fixed

### 1. 🔴 Missing Indexes on 3 CMS Models (Fixed)

| Model | Missing Index | Reason | Status |
|-------|--------------|--------|--------|
| **Banner** | `{ isActive: 1, page: 1, startDate: 1, endDate: 1 }` | Homepage fetches active banners by page with date range | ✅ **Fixed** |
| **Banner** | `{ position: 1 }` | Sort order for display | ✅ **Fixed** |
| **FAQ** | `{ category: 1, isActive: 1, position: 1 }` | Filter active FAQs by category sorted by position | ✅ **Fixed** |
| **FAQ** | `{ isActive: 1 }` | Toggle active FAQs | ✅ **Fixed** |
| **DownloadLink** | `{ platform: 1, isActive: 1 }` | Fetch active download links by platform | ✅ **Fixed** |
| **DownloadLink** | `{ position: 1 }` | Sort order | ✅ **Fixed** |

**Files fixed:** `Banner.js`, `FAQ.js`, `DownloadLink.js`

### 2. 🔴 ContactRequest Missing `createdBy` (Fixed)

ContactRequest was the only CMS model (besides FAQ which already has it) missing the `createdBy: { type: ObjectId, ref: 'User' }` field. All other CMS models (Banner, Blog, Policy, DownloadLink) have it.

**Impact:** Admin cannot track who submitted or was assigned to contact requests.

**File fixed:** `ContactRequest.js`

---

## High Priority Issues

### 3. ⚠️ 5 Models are Empty TODOs

| Model | Purpose | Status |
|-------|---------|--------|
| `Announcement.js` | In-app announcements | ❌ Empty schema |
| `AuditLog.js` | Admin audit trail | ❌ Empty schema |
| `Coupon.js` | Discount coupon system | ❌ Empty schema |
| `Offer.js` | Promotional offers | ❌ Empty schema |
| `ServiceProvider.js` | Service marketplace providers | ❌ Empty schema |

**Impact:** These features cannot function. The models exist as files but have zero fields.

### 4. ⚠️ No Cascade Delete / Pre-Remove Hooks

Zero models have `pre('remove')` or `pre('findOneAndDelete')` middleware. When a parent document is deleted:
- **User deleted** → Orphaned `Customer`, `Cleaner`, `Supervisor`, `Franchise`, `Admin` records
- **Vehicle deleted** → Orphaned `QRCode`, `Task` records
- **Customer deleted** → Orphaned `Address`, `Subscription`, `Booking`, `Complaint` records
- **Cleaner deleted** → Orphaned `Attendance`, `Earnings`, `Leave`, `Performance` records

**Recommended fix:** Add `pre('findOneAndDelete')` and `pre('remove')` middleware to User, Customer, Cleaner, and Vehicle models.

### 5. ⚠️ Embedded Arrays That Can Grow Unbounded

| Model | Embedded Array | Risk |
|-------|---------------|------|
| `Vehicle.cleaningHistory` | Array of cleaning records | Unlimited growth per vehicle |
| `ServiceBooking.trackingTimeline` | Status change log | Unlimited growth per booking |
| `Task.statusHistory` | Status change log | Unlimited growth per task |
| `Task.services` | Service checklist | Bounded (services are fixed) ⚠️ Ok |
| `User.loginHistory` | Login records | Unlimited growth per user |

**Recommended fix:** Convert high-growth arrays (cleaningHistory, trackingTimeline, statusHistory, loginHistory) to separate collections with TTL indexes.

### 6. ⚠️ Duplicate Data Across Models

| Data | Stored In | Derived From |
|------|-----------|-------------|
| `Customer.totalBookings` | Customer | Booking collection aggregation |
| `Customer.totalSpent` | Customer | Payment collection aggregation |
| `Customer.totalCleanings` | Customer | Task collection aggregation |
| `Cleaner.stats.*` | Cleaner | Task/Earnings/Attendance aggregations |
| `Vehicle.totalCleanings` | Vehicle | Task collection aggregation |
| `Franchise.stats.*` | Franchise | Booking/Payment aggregations |

**Impact:** These denormalized counters can drift out of sync if data is modified outside the service layer (e.g., direct DB updates, migrations, or buggy code paths).

**Recommended fix:** Create a periodic sync job (e.g., cron) that recalculates these counters from source collections.

---

## Medium Priority Issues

### 7. ⚠️ Missing Indexes on Commonly Queried Fields

| Model | Recommended Index | Query Pattern |
|-------|------------------|---------------|
| `SubscriptionPackage` | `{ isActive: 1, sortOrder: 1 }` | List active packages sorted |
| `ServiceCategory` | `{ parentId: 1, isActive: 1 }` | List active subcategories |
| `TrainingVideo` | `{ category: 1, isActive: 1 }` | Filter videos by category |
| `Review` | `{ reviewedEntityId: 1, rating: -1 }` | Get top-rated entities |
| `WalletTransaction` | `{ type: 1, createdAt: -1 }` | Recent transactions by type |

### 8. ⚠️ Inconsistent Enum Definitions

| Field | Model 1 | Model 2 | Conflict |
|-------|---------|---------|----------|
| `status` | Task: `assigned/in_progress/completed/missed/cancelled` | ServiceBooking: `booked/accepted/in_progress/completed/cancelled/job_card_pending/job_card_approved` | **Different** — Task and Booking use different status workflows |
| `status` | Complaint: `open/in_progress/resolved/closed` | Issue: `open/in_progress/resolved/closed` | ✅ Same |
| `status` | Subscription: `trial/active/expired/cancelled` | Payment: `created/captured/refunded/failed/partial_refunded` | Different purposes — ✅ Ok |

### 9. ⚠️ `refPath` in Wallet Model

Wallet uses `refPath: 'ownerType'` which references `Customer`, `Cleaner`, or `Franchise` — but mongoose dynamic refs can cause population issues if the ref'd model name doesn't match exactly. The current setup references `ownerType` values like `'customer'`, `'cleaner'`, `'franchise'` — which **do match** the mongoose model names. ✅

---

## Low Priority Issues

### 10. ✅ TTL Indexes Present

- `Notification` — TTL 90 days ✅
- `TrackingHistory` — TTL 7 days ✅

**Missing:** No TTL on `User.loginHistory` — old login records accumulate forever.

### 11. ✅ Unique Constraints Verified

- `User.phone` — `unique: true` ✅
- `User.email` — `unique: true, sparse: true` ✅ (handles null)
- `Blog.slug` — `unique: true` ✅
- `Customer.referralCode` — `unique: true, sparse: true` ✅
- `SubscriptionPackage.code` — `unique: true` ✅
- `Attendance` — compound `{ cleanerId, date }` unique ✅
- `TrainingProgress` — compound `{ cleanerId, videoId }` unique ✅
- `Wallet` — compound `{ ownerType, ownerId }` unique ✅

### 12. ✅ 2dsphere GeoIndexes Present

| Model | Geo Field |
|-------|-----------|
| `Apartment` | `coordinates` |
| `Cleaner` | `address.coordinates` |
| `Franchise` | `address.coordinates` |
| `Task` | `location` |
| `TrackingHistory` | `location` |
| `CleanerLiveLocation` | `location` |
| `Zone` | `boundary`, `center` |
| `Address` | `coordinates` |

All geospatial models have proper `'2dsphere'` indexes. ✅

---

## Schema Relationship Map

```
User ─┬─ Admin (1:1, via userId)
      ├─ Customer (1:1, via userId) ─┬─ Address (1:N)
      │                               ├─ Vehicle (1:N) ─┬─ QRCode (1:N)
      │                               │                  ├─ Task (1:N)
      │                               │                  └─ FastTagTransaction (1:N)
      │                               ├─ Subscription (1:N) ── SubscriptionPackage (N:1)
      │                               ├─ ServiceBooking (1:N)
      │                               ├─ Complaint (1:N)
      │                               └─ Review (1:N)
      ├─ Cleaner (1:1, via userId) ─┬─ Attendance (1:N)
      │                             ├─ Earnings (1:N)
      │                             ├─ Leave (1:N)
      │                             ├─ Performance (1:N)
      │                             ├─ Incentive (1:N)
      │                             ├─ TrainingProgress (1:N)
      │                             ├─ TrackingHistory (1:N)
      │                             └─ Issue (1:N)
      ├─ Supervisor (1:1, via userId) ── Zone (N:1)
      ├─ Franchise (1:1, via userId)
      └─ Notification (1:N)
```

---

## Summary

| Severity | Count | Fixed |
|----------|-------|-------|
| 🔴 Critical (Missing indexes) | 6 | ✅ **All 6 fixed** |
| 🔴 Critical (Missing field) | 1 | ✅ **Fixed** |
| ⚠️ High (Empty TODOs) | 5 | ❌ Deferred |
| ⚠️ High (No cascade delete) | 4+ | ❌ Deferred |
| ⚠️ High (Unbounded arrays) | 4 | ❌ Deferred |
| ⚠️ Medium (Missing indexes) | 5 | ❌ Deferred |
| ✅ Verified | 12+ | ✅ Verified |

### Files Modified

| File | Fix |
|------|-----|
| `server/src/models/Banner.js` | Added compound index `{ isActive, page, startDate, endDate }` + `{ position }` |
| `server/src/models/FAQ.js` | Added compound index `{ category, isActive, position }` + `{ isActive }` |
| `server/src/models/DownloadLink.js` | Added compound index `{ platform, isActive }` + `{ position }` |
| `server/src/models/ContactRequest.js` | Added `createdBy: { type: ObjectId, ref: 'User' }` field |
