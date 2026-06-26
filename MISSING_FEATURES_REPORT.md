# 🚗 GoMotarCar — Complete Missing Features Report

> **Date:** June 16, 2026
> **Source Documents:** ARCHITECTURE.md, PROJECT_PLAN.md, API_DOCUMENTATION.md, PROJECT_AUDIT.md
> **Scope:** Backend API, Admin Panel, Customer App, Cleaner App, Supervisor App, NCSP App, Franchise App, Operations App, Website

---

## Executive Summary

| App/Module | Completion | Missing Items | Priority |
|------------|:----------:|:-------------:|:--------:|
| Backend API | 90% | 25 items | High |
| Admin Panel | 85% | 12 screens | High |
| Customer App | 95% | 3 screens | Low |
| Cleaner App | 95% | 2 screens | Low |
| Supervisor App | 100% | — | Complete |
| NCSP App | 100% | — | Complete |
| **Franchise App** | **5%** | **15+ items** | **🔴 Critical** |
| **Operations App** | **2%** | **15+ items** | **🔴 Critical** |
| **Website** | **2%** | **14+ items** | **🔴 Critical** |
| CMS Module | 40% | 10+ items | High |
| Notification System | 30% | 8 items | High |
| Analytics Dashboard | 60% | 7 items | Medium |

---

## 1. Backend API — Missing Items

### 1.1 Missing Cron Jobs (10 files)

ARCHITECTURE.md documents 10 cron job files but only `jobs/index.js` exists:

| # | Cron Job | File | Priority |
|---|----------|------|----------|
| 1 | Auto-mark attendance no-shows at 10:30 AM | `jobs/attendance.cron.js` | 🔴 High |
| 2 | Daily/weekly/monthly earnings calculation | `jobs/earnings.cron.js` | 🔴 High |
| 3 | Monthly incentive computation | `jobs/incentive.cron.js` | 🟠 Medium |
| 4 | Scheduled payout processing | `jobs/payout.cron.js` | 🟠 Medium |
| 5 | Auto-renew subscriptions, expiry alerts | `jobs/subscription.cron.js` | 🟠 Medium |
| 6 | Scheduled push notifications | `jobs/notification.cron.js` | 🟠 Medium |
| 7 | Performance recalculation | `jobs/performance.cron.js` | 🟡 Low |
| 8 | Temp file cleanup, log rotation | `jobs/cleanup.cron.js` | 🟡 Low |
| 9 | Auto-assign cleaners to tasks | `jobs/match.cron.js` | 🟠 Medium |
| 10 | Generate & email reports | `jobs/report.cron.js` | 🟢 Low |

### 1.2 Missing Templates (8+ files)

ARCHITECTURE.md documents email and push notification templates but none exist:

| # | Template | Purpose | Priority |
|---|----------|---------|----------|
| 1 | `templates/emails/welcome.html` | Welcome email for new users | 🟠 Medium |
| 2 | `templates/emails/payout.html` | Payout confirmation email | 🟠 Medium |
| 3 | `templates/emails/invoice.html` | Invoice email for bookings | 🟠 Medium |
| 4 | `templates/push/task-assigned.json` | Push notification: task assigned | 🟠 Medium |
| 5 | `templates/push/leave-approved.json` | Push: leave approved/rejected | 🟡 Low |
| 6 | `templates/push/payment-received.json` | Push: payment received | 🟠 Medium |
| 7 | `templates/push/subscription-expiring.json` | Push: subscription expiry warning | 🟠 Medium |
| 8 | `templates/push/booking-update.json` | Push: booking status update | 🟡 Low |

### 1.3 Missing API Endpoints

From API_DOCUMENTATION.md these endpoints are documented but not verified:

| # | Endpoint | Module | Priority |
|---|----------|--------|----------|
| 1 | `POST /auth/social-login` | Auth | 🟠 Medium |
| 2 | `POST /auth/forgot-password` | Auth | 🟠 Medium |
| 3 | `POST /auth/reset-password` | Auth | 🟠 Medium |
| 4 | `GET /api/v1/customer/wallet` | Customer | 🟡 Low |
| 5 | `POST /api/v1/customer/wallet/topup` | Customer | 🟡 Low |
| 6 | `POST /api/v1/admin/payments/refund` | Admin/Payments | 🟠 Medium |
| 7 | `POST /api/v1/admin/earnings/payout` | Admin/Earnings | 🟠 Medium |
| 8 | `POST /api/v1/admin/notifications/broadcast` | Admin/Notifications | 🟠 Medium |
| 9 | `POST /api/v1/admin/announcements` | Admin | 🟡 Low |
| 10 | `POST /api/v1/admin/zones` | Admin/Zones | 🟡 Low |

### 1.4 Missing CMS Backend API

ARCHITECTURE.md describes CMS models but no backend API exists:

| # | Component | File | Priority |
|---|-----------|------|----------|
| 1 | CMS routes | `routes/cms.routes.js` | 🟠 Medium |
| 2 | CMS controller | `controllers/cms.controller.js` | 🟠 Medium |
| 3 | CMS service | `services/cms.service.js` | 🟠 Medium |
| 4 | CMS validators | `validators/cms.validator.js` | 🟠 Medium |
| 5 | CMS models (SEOSettings, LandingPage, Testimonial, PartnerContent) | `models/` | 🟠 Medium |

### 1.5 Missing Campaign Backend API

| # | Component | File | Priority |
|---|-----------|------|----------|
| 1 | Campaign routes | `routes/campaign.routes.js` | 🟠 Medium |
| 2 | Campaign controller | `controllers/campaign.controller.js` | 🟠 Medium |
| 3 | Campaign service | `services/campaign.service.js` | 🟠 Medium |
| 4 | Campaign validators | `validators/campaign.validator.js` | 🟠 Medium |

---

## 2. Franchise App — 15 Screens Missing

**Status:** Only 6 services + theme + types + utils exist. Zero screens, navigation, or Redux.

### Required Screens (0 of 15 built)

| # | Screen | Module | Priority |
|---|--------|--------|----------|
| 1 | LoginScreen | Auth | 🔴 Critical |
| 2 | DashboardScreen | Dashboard | 🔴 Critical |
| 3 | BookingManagementScreen | Bookings | 🔴 Critical |
| 4 | JobCardManagementScreen | Job Cards | 🔴 Critical |
| 5 | CustomerApprovalScreen | Approvals | 🟠 High |
| 6 | WorkProgressScreen | Progress | 🟠 High |
| 7 | PaymentSettlementScreen | Payments | 🟠 High |
| 8 | WalletScreen | Wallet | 🟠 High |
| 9 | RatingsScreen | Reviews | 🟡 Medium |
| 10 | ReviewsScreen | Reviews | 🟡 Medium |
| 11 | NotificationsScreen | Notifications | 🟡 Medium |
| 12 | StaffManagementScreen | Staff | 🟠 High |
| 13 | ServiceManagementScreen | Services | 🟠 High |
| 14 | ReportsScreen | Reports | 🟡 Medium |
| 15 | ProfileScreen | Profile | 🟡 Medium |

### Required Infrastructure

| # | Component | Priority |
|---|-----------|----------|
| 1 | Redux store + slices (8+) | 🔴 Critical |
| 2 | Navigation (AppNavigator, AuthNavigator, MainTabNavigator, 5 stacks) | 🔴 Critical |
| 3 | Common components (Button, Card, Input, Loader, EmptyState) | 🔴 Critical |
| 4 | API services (connect to existing backend) | 🔴 Critical |
| 5 | Hooks (useAuth, useNotifications) | 🔴 Critical |
| 6 | App.tsx entry point | 🔴 Critical |

---

## 3. Operations Team App — 15 Screens Missing

**Status:** Only theme directory exists. Zero app code.

### Required Screens (0 of 15 built)

| # | Screen | Module | Priority |
|---|--------|--------|----------|
| 1 | LoginScreen | Auth | 🔴 Critical |
| 2 | DashboardScreen | Dashboard | 🔴 Critical |
| 3 | PartnerOnboardingScreen | Onboarding | 🔴 Critical |
| 4 | CleanerApprovalScreen | Approvals | 🔴 Critical |
| 5 | SupervisorApprovalScreen | Approvals | 🟠 High |
| 6 | NCSPApprovalScreen | Approvals | 🟠 High |
| 7 | FranchiseApprovalScreen | Approvals | 🟠 High |
| 8 | EscalationCenterScreen | Issues | 🟠 High |
| 9 | GrievanceManagementScreen | Grievances | 🟠 High |
| 10 | BookingSupportScreen | Support | 🟠 High |
| 11 | CustomerSupportScreen | Support | 🟠 High |
| 12 | MonitoringDashboardScreen | Monitoring | 🟠 High |
| 13 | ReportsScreen | Reports | 🟡 Medium |
| 14 | NotificationsScreen | Notifications | 🟡 Medium |
| 15 | ProfileScreen | Profile | 🟡 Medium |

### Required Infrastructure

| # | Component | Priority |
|---|-----------|----------|
| 1 | Redux store + slices (8+) | 🔴 Critical |
| 2 | Navigation (Auth + MainTab + stacks) | 🔴 Critical |
| 3 | Common components | 🔴 Critical |
| 4 | API services (8+) | 🔴 Critical |
| 5 | Hooks | 🔴 Critical |
| 6 | App.tsx entry point | 🔴 Critical |

---

## 4. Website — 14 Pages Missing

**Status:** Only package.json + tsconfig.json exist.

### Required Pages (0 of 14 built)

| # | Page | Features | Priority |
|---|------|----------|----------|
| 1 | Home | Hero, features, download CTAs, testimonials | 🔴 Critical |
| 2 | About Us | Company info, team, mission | 🟡 Medium |
| 3 | Hire Car Cleaner | Lead capture form, pricing | 🟠 High |
| 4 | Search Services | Category search, filters | 🟡 Medium |
| 5 | Franchise Program | Program details, apply form | 🟠 High |
| 6 | NCSP Program | Partner program info, registration | 🟠 High |
| 7 | Steam Car Wash | Service details, booking lead | 🟡 Medium |
| 8 | FastTag Recharge | Recharge form, partners | 🟡 Medium |
| 9 | Contact Us | Contact form, map, info | 🟠 High |
| 10 | Blog | Post listing, detail pages | 🟡 Medium |
| 11 | FAQ | Accordion FAQ with categories | 🟡 Medium |
| 12 | Privacy Policy | Policy content | 🟢 Low |
| 13 | Terms | Terms content | 🟢 Low |
| 14 | Refund Policy | Policy content | 🟢 Low |

### Required Infrastructure

| # | Component | Priority |
|---|-----------|----------|
| 1 | Layout (Header, Footer) | 🔴 Critical |
| 2 | Tailwind CSS or styled-components setup | 🔴 Critical |
| 3 | API integration for CMS content | 🟠 High |
| 4 | SEO metadata | 🟠 High |
| 5 | Mobile responsive styling | 🟠 High |

---

## 5. Admin Panel — Missing Screens

### Analytics Dashboard (7 screens/components)

| # | Screen/Component | Status |
|---|-----------------|--------|
| 1 | KPI dashboard with stat cards | ❌ Missing |
| 2 | Revenue chart (day/week/month) | ❌ Missing |
| 3 | Bookings by status chart | ❌ Missing |
| 4 | Cleaner productivity table | ❌ Missing |
| 5 | Payments by method chart | ❌ Missing |
| 6 | Date range filter bar | ❌ Missing |
| 7 | Data export UI (JSON/CSV) | ❌ Missing |

### CMS Management (10 screens)

| # | Screen | Status |
|---|--------|--------|
| 1 | Banners management | ❌ Missing |
| 2 | Blog editor | ❌ Missing |
| 3 | FAQ management | ❌ Missing |
| 4 | Policies management | ❌ Missing |
| 5 | Contact Requests inbox | ❌ Missing |
| 6 | Download Links management | ❌ Missing |
| 7 | SEO Settings | ❌ Missing |
| 8 | Landing Pages builder | ❌ Missing |
| 9 | Testimonials management | ❌ Missing |
| 10 | Partner Content | ❌ Missing |

### Notification Campaign Management (4 screens)

| # | Screen | Status |
|---|--------|--------|
| 1 | Campaign list/create/send | ❌ Missing |
| 2 | Template management | ❌ Missing |
| 3 | Broadcast tool | ❌ Missing |
| 4 | Delivery logs | ❌ Missing |

---

## 6. Summary of All Missing Items

| Category | Total Missing | Critical | High | Medium | Low |
|----------|:------------:|:--------:|:----:|:------:|:---:|
| Backend Cron Jobs | 10 | 2 | 3 | 3 | 2 |
| Backend Templates | 8 | 0 | 0 | 6 | 2 |
| CMS Backend API | 5 | 0 | 0 | 5 | 0 |
| Campaign Backend API | 4 | 0 | 3 | 1 | 0 |
| Missing API Endpoints | 10 | 0 | 4 | 4 | 2 |
| **Franchise App** | **21** | **8** | **7** | **5** | **1** |
| **Operations App** | **21** | **8** | **7** | **5** | **1** |
| **Website** | **19** | **5** | **6** | **5** | **3** |
| Admin Analytics Screens | 7 | 0 | 0 | 7 | 0 |
| Admin CMS Screens | 10 | 0 | 5 | 5 | 0 |
| Admin Campaign Screens | 4 | 0 | 4 | 0 | 0 |
| **TOTAL** | **119** | **23** | **39** | **46** | **11** |

---

## 7. Implementation Progress

| Fix | Status |
|-----|--------|
| Backend cron jobs (attendance, earnings, subscription, payout, incentive, notification, performance, cleanup, match, report) | ❌ Pending |
| Backend templates (email + push) | ❌ Pending |
| CMS Backend API (routes + controller + service + validators + 4 models) | ❌ Pending |
| Campaign Backend API (routes + controller + service + validators) | ❌ Pending |
| Missing auth endpoints (social-login, forgot-password, reset-password) | ❌ Pending |
| Franchise App (navigation, Redux, 15 screens, App.tsx) | ❌ Pending |
| Operations App (navigation, Redux, 15 screens, App.tsx) | ❌ Pending |
| Website (layout, 14 pages, components) | ❌ Pending |
| Admin Analytics Dashboard (7 screens) | ❌ Pending |
| Admin CMS screens (10 screens) | ❌ Pending |
| Admin Campaign screens (4 screens) | ❌ Pending |
