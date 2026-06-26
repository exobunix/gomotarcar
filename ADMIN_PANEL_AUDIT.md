# Admin Panel Audit — GoMotarCar

> Generated: June 16, 2026  
> Source: `admin-panel/src/`

---

## Module Status Overview

| Module | Page | Status | Notes |
|--------|------|--------|-------|
| **Dashboard** | `DashboardPage.jsx` | ✅ Complete | 4 KPI cards, charts, quick actions |
| **Bookings** | `BookingListPage.jsx` | ✅ Complete | CRUD, status stepper, dialogs |
| **Payments** | `PaymentListPage.jsx` | ✅ Complete | List, detail, refund workflow |
| **Complaints** | `ComplaintListPage.jsx` | ✅ Complete | Full workflow: assign→resolve→close |
| **Notifications** | `NotificationCenterPage.jsx` | ✅ Complete | History, single send, bulk send |
| **Analytics** | `AnalyticsPage.jsx` | ✅ Complete | 4 tabs, charts (Pie, Bar), KPIs |
| **Subscriptions** | `SubscriptionListPage.jsx` | ✅ Built | Full CRUD |
| **QR Management** | `QRListPage.jsx` | ✅ Built | Full CRUD |
| **Apartments** | `ApartmentListPage.jsx` | ✅ Built | Full CRUD |
| **Vehicles** | `VehicleListPage.jsx` | ✅ Built | Full CRUD |
| **Cleaners** | Placeholder (`<div>`) | ❌ Not built | Slated for Phase 2 |
| **Customers** | Placeholder (`<div>`) | ❌ Not built | Slated for Phase 2 |
| **Tasks** | Placeholder (`<div>`) | ❌ Not built | Slated for Phase 2 |
| **Attendance** | Placeholder (`<div>`) | ❌ Not built | Slated for Phase 2 |
| **Earnings** | Placeholder (`<div>`) | ❌ Not built | Slated for Phase 2 |
| **Franchises** | Placeholder (`<div>`) | ❌ Not built | Not in sidebar |
| **Zones** | Placeholder (`<div>`) | ❌ Not built | Not in sidebar |
| **Marketplace** | Placeholder (`<div>`) | ❌ Not built | Not in sidebar |
| **Issues** | Placeholder (`<div>`) | ❌ Not built | Not in sidebar |
| **Training** | Placeholder (`<div>`) | ❌ Not built | Not in sidebar |
| **Settings** | Placeholder (`<div>`) | ❌ Not built | |
| **Support** | Placeholder (`<div>`) | ❌ Not built | |

---

## Critical Issues Found & Fixed

### 1. 🔴 Analytics API Endpoint Mismatch (Fixed)

| API Method | URL Called (Before) | Backend URL | Status |
|------------|-------------------|-------------|--------|
| `getCleanerPerformance` | `/analytics/cleaner-performance` | `/analytics/cleaner-productivity` | ✅ **Fixed** |
| `getAttendanceReport` | `/analytics/attendance` | ❌ Does not exist | ❌ Removed |
| `getSubscriptionReport` | `/analytics/subscriptions` | ❌ Does not exist | ❌ Removed |
| `getBookingReport` | `/analytics/bookings` | ❌ Does not exist | ❌ Removed |

**What was fixed:** 
- Changed `cleaner-performance` → `cleaner-productivity` to match the backend endpoint
- Removed `getAttendanceReport`, `getSubscriptionReport`, `getBookingReport` as the backend does not implement these
- Added `getExportData` method that calls the existing `/analytics/export` backend endpoint

**File:** `admin-panel/src/services/api.js`

---

## High Priority Issues

### 2. ⚠️ Missing CMS Module

The admin panel has no CMS pages for managing:
- Homepage Banners
- Blogs
- FAQs
- Policies
- Testimonials
- SEO Settings
- Download Links

**Backend models exist** (`Banner.js`, `Blog.js`, `FAQ.js`, `Policy.js`, `DownloadLink.js`) but no admin UI is connected.

### 3. ⚠️ Missing Lead Management

The NCSP app has lead screens but the admin panel has no lead management page.

**Backend routes exist** (`/leads` with CRUD, status transitions, analytics) but no admin UI.

### 4. ⚠️ Missing FastTag Management

No admin page for FastTag recharge management or transaction history.

**Backend routes exist** (`/fasttag` with recharge, confirm, list, stats) but no admin UI.

### 5. ⚠️ Missing Invoice Management

No admin page for viewing generated invoices.

**Backend routes exist** (`/invoices` with list, get by booking, generate) but no admin UI.

### 6. ⚠️ Missing Cleaner & Customer Detail Pages

Sidebar links to `/cleaners/:id` and `/customers/:id` both render `<div>Cleaner Detail</div>` and `<div>Customer Detail</div>`. These are essential for day-to-day operations.

---

## Medium Priority Issues

### 7. ⚠️ Sidebar Routes Not Connected to App Routes

Sidebar includes these routes that aren't registered in App.js:
- `/franchises` → renders `<div>Franchises</div>` (in App.js as `/franchises`)
- `/zones` → not in App.js!
- `/marketplace` → not in App.js!
- `/issues` → renders `<div>Issues</div>` (in App.js as `/issues`)
- `/training` → renders `<div>Training</div>` (in App.js as `/training`)

**Missing routes in App.js:** Sidebar has items for Zones, Marketplace, Issues which are not handled.

### 8. ⚠️ SearchBar Component Not Found

The SearchBar component is imported in BookingListPage, PaymentListPage, and ComplaintListPage:
```jsx
import SearchBar from '../../components/SearchBar';
```
This file exists at `admin-panel/src/components/SearchBar.jsx` ✅. Verified it exists.

### 9. ⚠️ Placeholder Routes Use Div Instead of Shared Components

All 13 placeholder routes render raw `<div>` tags instead of the shared `PageHeader` + `DataTable` pattern. This creates an inconsistent UX when clicking sidebar links.

---

## Low Priority Issues

### 10. ✅ Theme Consistency

- `theme.js` sets primary as `#0D5BD7` ✅ (matches GoMotarCar brand)
- `Sidebar.jsx` uses `#0D5BD7` for active states ✅
- MUI Card borderRadius: 20 ✅ (matches mobile app design system)
- MUI Button borderRadius: 14 ✅

### 11. ✅ MUI Version in package.json

Need to verify version compatibility. MUI v5 is used with `@mui/material` imports.

### 12. ✅ API Client Configuration

- Base URL from `REACT_APP_API_URL` env var ✅
- Axios timeout: 30s ✅
- Token refresh on 401 ✅ (clears storage, redirects to /login)

---

## Summary

| Severity | Count | Fixed |
|----------|-------|-------|
| 🔴 Critical API mismatch | 4 | ✅ **4 fixed** |
| ⚠️ High (Missing pages) | 6 | ❌ Deferred |
| ⚠️ Medium (Route gaps) | 3 | ❌ Deferred |
| ✅ Low / Verified | 3 | ✅ Verified |

### Files Modified

| File | Fix |
|------|-----|
| `admin-panel/src/services/api.js` | Fixed 4 API endpoint URLs, removed non-existent endpoints |

### Recommended Quick Wins

1. Implement Cleaner List/Detail pages (reuse DataTable + StatCard pattern)
2. Implement Customer List/Detail pages (reuse existing patterns)
3. Add FastTag management page
4. Add Invoice management page
5. Fix zone/marketplace routes in App.js
