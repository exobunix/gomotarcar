# GoMotarCar — System Audit Report

> **Date:** June 16, 2026
> **Scope:** Backend, Admin Panel, Customer App, Cleaner App, Supervisor App, NCSP App, Franchise App, Operations Team App, Website

---

## Critical Issues

### C-01: Franchise App — No Screens, Redux, or Navigation (0% Complete)
- **File:** `franchise-app/src/`
- **Status:** ❌ Unfixed
- **Severity:** 🔴 Critical
- **Description:** Only 12 infrastructure files exist (services, theme, types, utils). Zero screens, zero Redux slices, zero navigation files.
- **Required:** 15 screens, 10+ Redux slices, 8 navigation files, common components, hooks, App.tsx
- **Impact:** Franchise partner onboarding cannot function

### C-02: Operations Team App — Barely Started (5% Complete)
- **File:** `operations-app/src/`
- **Status:** ❌ Unfixed
- **Severity:** 🔴 Critical
- **Description:** Only package.json, app.json, index.js, babel.config.js, metro.config.js, theme/colors.ts, theme/index.ts exist. No actual app code.
- **Required:** 15 screens, services, Redux, navigation
- **Impact:** Operations workflows cannot function

### C-03: Website — Barely Started (5% Complete)
- **File:** `website/`
- **Status:** ❌ Unfixed
- **Severity:** 🔴 Critical
- **Description:** Only package.json and tsconfig.json exist. No pages, components, or styles.
- **Required:** 14 pages + components + Tailwind + API integration + SEO
- **Impact:** No public-facing website

### C-04: CMS Module — 4 Models Missing, No Backend API, No Admin Screens
- **Files:** `server/src/models/`
- **Status:** ❌ Unfixed
- **Severity:** 🔴 Critical
- **Description:** 6 of 10 models created (Banner, Blog, FAQ, ContactRequest, Policy, DownloadLink). 4 models missing (SEOSettings, LandingPage, Testimonial, PartnerContent). No CMS routes/controller/service. No admin panel screens.
- **Impact:** Cannot manage website content dynamically

### C-05: Notification System — Campaign Management Missing, Channel Integration Incomplete
- **Files:** `server/src/models/`
- **Status:** ❌ Unfixed
- **Severity:** 🔴 Critical
- **Description:** NotificationTemplate and Campaign models exist. No campaign routes/controller/service. No SMS/Email/WhatsApp channel integration.
- **Impact:** Cannot send multi-channel notifications

### C-06: Analytics Engine — No Admin Dashboard Screens
- **File:** `server/src/services/analytics.service.js`
- **Status:** ✅ Backend Complete, ❌ Frontend Missing
- **Severity:** 🔴 Critical
- **Description:** Analytics backend has 4 endpoints with 11 KPI categories. No admin dashboard UI screens to display charts, KPIs, or reports.
- **Impact:** Cannot visualize analytics data

---

## High Priority Issues

### H-01: Missing `.env.example` for Production
- **File:** `server/.env.example`
- **Status:** ⚠️ Existing but uses dev values (JWT_EXPIRY=15m instead of JWT_EXPIRES_IN=7d, missing Redis/Twilio/SendGrid sections)
- **Severity:** 🟠 High
- **Description:** The existing template is for development, not production. Missing critical production variables (Redis password, Twilio, SendGrid, CORS whitelist, rate limiting config, log level).

### H-02: No CI/CD for Franchise, Operations, or Website Apps
- **File:** `.github/workflows/deploy.yml`
- **Status:** ❌ Unfixed
- **Severity:** 🟠 High
- **Description:** CI/CD only covers backend and admin panel. The 3 incomplete apps (franchise, operations, website) have no deployment pipeline.

### H-03: API Response Nesting Inconsistency
- **Files:** All apps' `services/api.ts`
- **Status:** ⚠️ Potential issue (no runtime errors reported)
- **Severity:** 🟠 High
- **Description:** Backend wraps responses as `{ success: true, data: ... }`. The axios interceptor returns `response.data`. Services then receive `{ success, data }` and components access `response.data` which would be `undefined` since `.data` doesn't exist on the already-unwrapped response. Some apps handle this differently.

### H-04: Franchise Dashboard Stats Route Permission Denied
- **File:** `franchise-app/src/services/franchise.service.ts`
- **Status:** ❌ Unfixed
- **Severity:** 🟠 High
- **Description:** `getDashboard()` calls `GET /franchise/stats` guarded by `authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS)`. Franchise users (role: `franchise`) will get 403 Forbidden.

### H-05: No Server-Side Input Validation on SMS/Email Services
- **Files:** `server/src/services/sms.service.js`, `server/src/services/email.service.js`
- **Status:** ❌ Unfixed
- **Severity:** 🟠 High
- **Description:** SMS and email services are stubs with no validation, no rate limiting, and no actual provider integration.

---

## Medium Priority Issues

### M-01: Missing MongoDB Indexes on CMS Models
- **Files:** `server/src/models/Banner.js`, `server/src/models/FAQ.js`, `server/src/models/DownloadLink.js`
- **Status:** ❌ Unfixed
- **Severity:** 🟡 Medium
- **Description:** These models lack indexes for common query patterns (isActive+page, category+isActive, platform+isActive). Will cause slow queries at scale.

### M-02: Blog `readingTime` Not Auto-Calculated
- **File:** `server/src/models/Blog.js`
- **Status:** ❌ Unfixed
- **Severity:** 🟡 Medium
- **Description:** `readingTime` is a manual input field. Should auto-calculate from `content.length / 200` words per minute in a `pre('save')` middleware.

### M-03: Inconsistent `createdBy` Pattern Across CMS Models
- **Files:** `server/src/models/FAQ.js`, `server/src/models/ContactRequest.js`
- **Status:** ❌ Unfixed
- **Severity:** 🟡 Medium
- **Description:** FAQ and ContactRequest are missing the `createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }` field that all other CMS models have.

### M-04: Campaign Model Missing Timezone and Audit Fields
- **File:** `server/src/models/Campaign.js`
- **Status:** ❌ Unfixed
- **Severity:** 🟡 Medium
- **Description:** Missing `timezone` field (scheduling ambiguous without it), missing `sentBy`/`cancelledBy` user tracking.

### M-05: No Date Validation on Analytics Endpoints
- **File:** `server/src/services/analytics.service.js`
- **Status:** ❌ Unfixed
- **Severity:** 🟡 Medium
- **Description:** Arbitrary date strings accepted without validation. Invalid dates cause MongoDB errors.

### M-06: Duplicate Revenue Field in Analytics Dashboard
- **File:** `server/src/services/analytics.service.js`
- **Status:** ❌ Unfixed
- **Severity:** 🟡 Medium
- **Description:** Returns both `revenue.total` and `revenue.totalRevenue` with the same value.

### M-07: No Pagination on Cleaner Productivity Endpoint
- **File:** `server/src/services/analytics.service.js`
- **Status:** ❌ Unfixed
- **Severity:** 🟡 Medium
- **Description:** Returns all cleaners unfiltered. Slow with 1000+ cleaners.

---

## Low Priority Issues

### L-01: CI/CD Notify Job Won't Fire on Skipped Jobs
- **File:** `.github/workflows/deploy.yml`
- **Status:** ❌ Unfixed
- **Severity:** 🟢 Low
- **Description:** `needs: [deploy-backend, deploy-admin]` with `if: always()` - if one job is skipped, notify won't trigger.

### L-02: No `paths` Filters on CI/CD Push Trigger
- **File:** `.github/workflows/deploy.yml`
- **Status:** ❌ Unfixed
- **Severity:** 🟢 Low
- **Description:** Every push to main triggers backend AND admin panel redeployment even for frontend-only changes.

### L-03: No `.dockerignore` for Admin Panel
- **Status:** ❌ Unfixed
- **Severity:** 🟢 Low
- **Description:** Admin panel Docker build context includes node_modules and build artifacts if a Dockerfile is added.

### L-04: No Health Check Endpoint Tests
- **Status:** ❌ Unfixed
- **Severity:** 🟢 Low
- **Description:** No test coverage for the `/health` endpoint.

---

## App Status Summary

| App | Screens | Redux | Navigation | Build | Status |
|-----|---------|-------|------------|-------|--------|
| **Backend (server)** | — | — | — | ✅ Server loads | ✅ Complete |
| **Admin Panel** | ✅ | ❓ | ✅ | ✅ | ✅ Complete |
| **Supervisor App** | 24 ✅ | 10 slices ✅ | 6 files ✅ | ✅ Verified | ✅ Complete |
| **NCSP App** | 17 ✅ | 10 slices ✅ | 8 files ✅ | ✅ Verified | ✅ Complete |
| **Customer App** | ✅ | ❓ | ❓ | ❓ | ✅ Built (earlier) |
| **Cleaner App** | ✅ | ❓ | ❓ | ❓ | ✅ Built (earlier) |
| **Franchise App** | 0 ❌ | 0 ❌ | 0 ❌ | ❌ | ❌ 25% |
| **Operations App** | 0 ❌ | 0 ❌ | 0 ❌ | ❌ | ❌ 5% |
| **Website** | 0 ❌ | — | — | ❌ | ❌ 5% |

---

## Auto-Fixes Applied

### Fixed in this audit session:
| Issue | Before | After |
|-------|--------|-------|
| Analytics `this.convertToCSV` bug (`analytics.controller.js`) | Arrow function caused `this` binding error | Changed to method shorthand |
| Wallet slice dead `fetchWallet()` call (`ncspp-app`) | Called without dispatch | Removed dead code |
| GST skipMode unused state (`ncspp-app`) | `// eslint-disable-line` hack | Removed line entirely |

### Previously fixed (in earlier sessions):
| Issue | Fix |
|-------|-----|
| Supervisor App cross-tab navigation | Added `navigateTo()` helper mapping |
| Supervisor App missing `incentiveSlice.ts` | Created slice |
| NCSP App walletSlice syntax break | Fixed broken str_replace |
| Supervisor App missing `InventoryDetailScreen` | Created screen |
| Supervisor App missing `SalaryDetailScreen` | Created screen |

---

## Recommendations

1. **Complete the 3 incomplete apps first** — Franchise App (25%), Operations App (5%), Website (5%) should be built to production-ready state
2. **Finish CMS Module** — Create remaining 4 models, backend API (routes/controller/service), and admin panel CRUD screens
3. **Complete Notification System** — Build campaign management backend and admin screens, integrate SMS/Email/WhatsApp channels
4. **Build Analytics Dashboard** — Create admin panel screens consuming the analytics API with charts, KPIs, and export UI
5. **Fix high-priority bugs** — Update `.env.example` for production, add CI/CD for all apps, fix franchise stats route permission
6. **Add database indexes** — Banner (isActive+page), FAQ (category+isActive), DownloadLink (platform+isActive)
7. **Standardize patterns** — Add missing `createdBy` to all CMS models, auto-calculate `readingTime` in Blog, add `timezone` to Campaign
