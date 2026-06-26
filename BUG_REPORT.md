# GoMotarCar Bug Report

## Critical Bugs

### BUG-001: Analytics Controller `this.convertToCSV` binding
- **File:** `server/src/controllers/analytics.controller.js`
- **Status:** ✅ Fixed
- **Description:** `getExport` was defined as an arrow function, so `this.convertToCSV(data)` threw `TypeError: this.convertToCSV is not a function` when `format=csv` was requested.
- **Fix:** Changed `getExport: async (req, res, next) => {` to `async getExport(req, res, next) {`

### BUG-002: Wallet Slice — `fetchWallet()` called without dispatch
- **File:** `ncspp-app/src/redux/slices/walletSlice.ts`
- **Status:** ✅ Fixed
- **Description:** `requestPayout.fulfilled` reducer called `fetchWallet()` directly (returns a thunk) instead of dispatching it. The call had no effect.
- **Fix:** Removed the dead `fetchWallet()` call. The component already dispatches it after payout.

### BUG-003: API Response Nesting Mismatch
- **File:** All apps' `services/api.ts` files
- **Status:** ⚠️ Potential issue
- **Description:** The API interceptor returns `response.data` (axios wrapper removed). But the backend wraps data as `{ success: true, data: ... }`. Services then return `{ success: true, data: ... }` to components. Components calling `response.data` will get `undefined` because `.data` doesn't exist on the already-unwrapped response.
- **Fix:** Ensure components use `response.data` (the backend's `data` field) not `response.data.data`.

---

## High-Priority Issues

### BUG-004: Franchise Dashboard Stats Route Unavailable
- **File:** `franchise-app/src/services/franchise.service.ts`
- **Status:** ❌ Unfixed
- **Description:** `getDashboard()` calls `GET /franchise/stats` which is guarded by `authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS)`. Franchise users (role: `franchise`) will get 403 Forbidden.
- **Fix:** Change the route to a franchise-accessible endpoint or extend the backend role guard.

### BUG-005: Duplicate `getProfile()` in Two Services
- **File:** `franchise-app/src/services/auth.service.ts` and `franchise-app/src/services/franchise.service.ts`
- **Status:** ❌ Unfixed
- **Description:** Both `auth.service.ts` and `franchise.service.ts` have the same `getProfile()` method calling `GET /auth/profile`.
- **Fix:** Remove the duplicate from `franchise.service.ts`.

### BUG-006: Unused State Variable in GSTVerificationScreen
- **File:** `ncspp-app/src/screens/auth/GSTVerificationScreen.tsx`
- **Status:** ⚠️ Partially fixed
- **Description:** `skipMode` state variable declared but never read. The skip button was simplified to call `handleContinue` directly.
- **Fix:** Remove the `const [skipMode, setSkipMode] = useState(false);` line entirely (currently hidden behind `// eslint-disable-line`).

---

## Medium-Priority Issues

### BUG-007: Missing Mongoose Indexes on CMS Models
- **Files:** `server/src/models/Banner.js`, `server/src/models/FAQ.js`, `server/src/models/DownloadLink.js`
- **Status:** ❌ Unfixed
- **Description:** These models lack indexes for their common query patterns (isActive+page, category+isActive, platform+isActive).

### BUG-008: Blog `readingTime` Not Auto-Calculated
- **File:** `server/src/models/Blog.js`
- **Status:** ❌ Unfixed
- **Description:** `readingTime` is a manual input field. Should be auto-calculated from `content` length via `pre('save')` middleware.

### BUG-009: Inconsistent `createdBy` Pattern
- **Files:** `server/src/models/FAQ.js`, `server/src/models/ContactRequest.js`
- **Status:** ❌ Unfixed
- **Description:** These models are missing the `createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }` field that all other CMS models have.

### BUG-010: No Date Validation on Analytics Endpoints
- **File:** `server/src/services/analytics.service.js`
- **Status:** ❌ Unfixed
- **Description:** Arbitrary date strings accepted without validation. Invalid dates will cause MongoDB errors.

---

## Low-Priority Issues

### BUG-011: No Pagination on Cleaner Productivity
- **File:** `server/src/services/analytics.service.js`
- **Status:** ❌ Unfixed
- **Description:** Returns all cleaners unfiltered. Could be slow with 1000+ cleaners.

### BUG-012: Duplicate Revenue Field in Analytics Dashboard
- **File:** `server/src/services/analytics.service.js`
- **Status:** ❌ Unfixed
- **Description:** Returns both `revenue.total` and `revenue.totalRevenue` with the same value.

### BUG-013: CMS Campaign Model Missing Timezone Field
- **File:** `server/src/models/Campaign.js`
- **Status:** ❌ Unfixed
- **Description:** Scheduling "daily at 9AM" is ambiguous without a timezone field.

### BUG-014: CMS Campaign Missing SentBy/CancelledBy Tracking
- **File:** `server/src/models/Campaign.js`
- **Status:** ❌ Unfixed
- **Description:** Only `createdBy` is tracked. No record of who triggered the send or cancellation.

---

## Build Status

| App | Build | Status |
|-----|-------|--------|
| Backend (server) | Server loads | ✅ Verified |
| Supervisor App | RN bundle | ✅ Verified |
| NCSP App | RN bundle | ✅ Verified |
| Franchise App | Not tested | ❌ Not built |
| Operations App | Not tested | ❌ Not built |
| Website | Not tested | ❌ Not built |
| Admin Panel | React build | ✅ Verified (earlier) |
| Customer App | RN bundle | ✅ Verified (earlier) |
| Cleaner App | RN bundle | ✅ Verified (earlier) |
