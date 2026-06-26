# GoMotarCar — RBAC Audit Report

> **Date:** June 16, 2026
> **Roles Audited:** Customer, Cleaner, Supervisor, NCSP (Customer), Franchise, Operations, Admin, Super Admin

---

## Role Definitions

| Role | Constant | Description |
|------|----------|-------------|
| Super Admin | `SUPER_ADMIN` | Full system access, all operations |
| Admin / Manager | `MANAGER` | Day-to-day management, most operations |
| Operations | `OPERATIONS` | Approval workflows, monitoring, support |
| Supervisor | `SUPERVISOR` | Cleaner management, task assignment |
| Franchise | `FRANCHISE` | Service partner, booking management |
| Cleaner | `CLEANER` | Task execution, attendance, location |
| Customer / NCSP | `CUSTOMER` | Book services, manage profile |

---

## Route Permission Matrix

### ✅ Auth Routes — All Public or JWT
| Endpoint | Auth | CUSTOMER | CLEANER | SUPERVISOR | FRANCHISE | OPERATIONS | MANAGER | SUPER_ADMIN |
|----------|------|----------|---------|------------|-----------|------------|---------|-------------|
| `/auth/send-otp` | Public | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/auth/verify-otp` | Public | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/auth/register` | Public | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/auth/login` | Public | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/auth/refresh` | Public | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/auth/logout` | JWT | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/auth/profile` | JWT | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/auth/set-password` | JWT | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/auth/change-password` | JWT | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### ✅ Customer Routes — Self + Admin Access
| Endpoint | CUSTOMER | CLEANER | SUPERVISOR | FRANCHISE | OPERATIONS | MANAGER | SUPER_ADMIN |
|----------|----------|---------|------------|-----------|------------|---------|-------------|
| `GET /customer/profile` | ✅ Own | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `PUT /customer/profile` | ✅ Own | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `GET /customer/bookings` | ✅ Own | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `GET /customer/vehicles` | ✅ Own | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `POST /customer/vehicles` | ✅ Own | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `GET /customer/stats` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `GET /customer` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `GET /customer/:id` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `PUT /customer/:id` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `PATCH /customer/:id/deactivate` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

### ❌ Cleaner Routes — Admin/Operations Only (Cleaners Can't Access)
| Endpoint | CUSTOMER | CLEANER | SUPERVISOR | FRANCHISE | OPERATIONS | MANAGER | SUPER_ADMIN |
|----------|----------|---------|------------|-----------|------------|---------|-------------|
| `GET /cleaner/stats` | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `GET /cleaner` | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `POST /cleaner` | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `GET /cleaner/:id` | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `PUT /cleaner/:id` | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `PATCH /cleaner/:id/stats` | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `PATCH /cleaner/:id/document-status` | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `PATCH /cleaner/:id/verify` | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `PATCH /cleaner/:id/deactivate` | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `DELETE /cleaner/:id` | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |

### ⚠️ Franchise Routes — Partially Fixed✓
| Endpoint | CUSTOMER | CLEANER | SUPERVISOR | FRANCHISE | OPERATIONS | MANAGER | SUPER_ADMIN |
|----------|----------|---------|------------|-----------|------------|---------|-------------|
| `GET /franchise/stats` | ❌ | ❌ | ❌ | ✅ Own | ✅ | ✅ | ✅ |
| `GET /franchise` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `POST /franchise` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `GET /franchise/:id` | ❌ | ❌ | ❌ | ✅ Own | ✅ | ✅ | ✅ |
| `PUT /franchise/:id` | ❌ | ❌ | ❌ | ✅ Own | ✅ | ✅ | ✅ |
| `PATCH /franchise/:id/verify` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `PATCH /franchise/:id/deactivate` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `DELETE /franchise/:id` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |

### ✅ Supervisor Routes — Admin/Operations Only
| Endpoint | CUSTOMER | CLEANER | SUPERVISOR | FRANCHISE | OPERATIONS | MANAGER | SUPER_ADMIN |
|----------|----------|---------|------------|-----------|------------|---------|-------------|
| `GET /supervisor/stats` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `GET /supervisor` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `POST /supervisor` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `GET /supervisor/:id` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `PUT /supervisor/:id` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `PATCH /supervisor/:id/deactivate` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `DELETE /supervisor/:id` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `GET /supervisor/:id/cleaners` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |

### ✅ Booking Routes — Multi-Role Access
| Endpoint | CUSTOMER | CLEANER | SUPERVISOR | FRANCHISE | OPERATIONS | MANAGER | SUPER_ADMIN |
|----------|----------|---------|------------|-----------|------------|---------|-------------|
| `GET /bookings/stats` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `GET /bookings` | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `POST /bookings` | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `GET /bookings/:id` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `PATCH /bookings/:id/status` | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| `PATCH /bookings/:id/cancel` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST /bookings/:id/extra-charges` | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| `PATCH /bookings/:id/extra-charges/:chargeId/approve` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `POST /bookings/:id/job-card` | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| `POST /bookings/:id/review` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### ✅ Complaint Routes — Customer + Admin Multi-Role
| Endpoint | CUSTOMER | CLEANER | SUPERVISOR | FRANCHISE | OPERATIONS | MANAGER | SUPER_ADMIN |
|----------|----------|---------|------------|-----------|------------|---------|-------------|
| `POST /complaints` | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `GET /complaints/ticket/:ticketNumber` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /complaints/stats` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `GET /complaints` | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `GET /complaints/:id` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `PATCH /complaints/:id/assign` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `PATCH /complaints/:id/resolve` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ |
| `PATCH /complaints/:id/close` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ |
| `PATCH /complaints/:id/priority` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

### ✅ Notification Routes — User-Facing + Admin
| Endpoint | CUSTOMER | CLEANER | SUPERVISOR | FRANCHISE | OPERATIONS | MANAGER | SUPER_ADMIN |
|----------|----------|---------|------------|-----------|------------|---------|-------------|
| `GET /notifications/user/:userId` | ✅ Own | ✅ Own | ✅ Own | ✅ Own | ✅ | ✅ | ✅ |
| `GET /notifications/user/:userId/unread` | ✅ Own | ✅ Own | ✅ Own | ✅ Own | ✅ | ✅ | ✅ |
| `PATCH /notifications/:id/read` | ✅ Own | ✅ Own | ✅ Own | ✅ Own | ✅ | ✅ | ✅ |
| `PATCH /notifications/user/:userId/read-all` | ✅ Own | ✅ Own | ✅ Own | ✅ Own | ✅ | ✅ | ✅ |
| `GET /notifications/stats` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `GET /notifications` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `POST /notifications` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ |
| `POST /notifications/bulk` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `DELETE /notifications/:id` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

### ✅ Task Routes — Multi-Role (Cleaners Included)
| Endpoint | CUSTOMER | CLEANER | SUPERVISOR | FRANCHISE | OPERATIONS | MANAGER | SUPER_ADMIN |
|----------|----------|---------|------------|-----------|------------|---------|-------------|
| `GET /tasks/stats` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `POST /tasks/auto-assign` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ |
| `GET /tasks/availability` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ |
| `GET /tasks` | ❌ | ✅? | ✅ | ❌ | ✅ | ✅ | ✅ |
| `POST /tasks` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ |
| `GET /tasks/:id` | ❌ | ✅? | ✅ | ❌ | ✅ | ✅ | ✅ |
| `GET /tasks/cleaner/:cleanerId/today` | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `PATCH /tasks/:id/assign` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ |
| `PATCH /tasks/:id/start` | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `PATCH /tasks/:id/complete` | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `PATCH /tasks/:id/miss` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ |
| `POST /tasks/:id/record-earnings` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

### ✅ Tracking Routes — Cleaner + Admin Access
| Endpoint | CUSTOMER | CLEANER | SUPERVISOR | FRANCHISE | OPERATIONS | MANAGER | SUPER_ADMIN |
|----------|----------|---------|------------|-----------|------------|---------|-------------|
| `PUT /tracking/cleaner/:cleanerId/location` | ❌ | ✅ Own | ✅ | ❌ | ❌ | ✅ | ✅ |
| `POST /tracking/cleaner/:cleanerId/offline` | ❌ | ✅ Own | ✅ | ❌ | ❌ | ✅ | ✅ |
| `GET /tracking/online` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /tracking/nearest` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /tracking/zones/nearby` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /tracking/cleaner/:cleanerId/location` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /tracking/cleaner/:cleanerId/history` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST /tracking/verify-gps/:cleanerId` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ |
| `POST /tracking/check-geofence/:zoneId` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST /tracking/optimal-cleaner` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ |
| `GET /tracking/cleaner/:cleanerId/optimize-route` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ |
| `POST /tracking/estimate-travel-time` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### ❌ Analytics Routes — Admin/Operations Only
| Endpoint | CUSTOMER | CLEANER | SUPERVISOR | FRANCHISE | OPERATIONS | MANAGER | SUPER_ADMIN |
|----------|----------|---------|------------|-----------|------------|---------|-------------|
| `GET /analytics/dashboard` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `GET /analytics/revenue` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `GET /analytics/cleaner-productivity` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `GET /analytics/export` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |

---

## Permission Leaks Found

### 🔴 Critical

| # | Route | Issue | Status |
|---|-------|-------|--------|
| 1 | `GET /bookings/:id` | Any authenticated user can view ANY booking. No ownership check. Breaks data isolation. | ❌ Unfixed |
| 2 | `GET /complaints/:id` | Any authenticated user can view ANY complaint by ID. No ownership check. | ❌ Unfixed |
| 3 | `GET /tasks` | No role guard — `router.use(authenticate)` allows all authenticated roles. No `authorize()` on the route itself. | ❌ Unfixed |
| 4 | `GET /tasks/:id` | Same as above — no role guard, all auth users can view any task. | ❌ Unfixed |

### 🟠 High

| # | Route | Issue | Status |
|---|-------|-------|--------|
| 5 | `GET /franchise/stats` | Now allows FRANCHISE role but controller doesn't filter by ownership (franchise A can see franchise B's stats). | ⚠️ Controller fix needed |
| 6 | `GET /franchise/:id` | FRANCHISE role can call with ANY ID — no ownership check in controller | ⚠️ Controller fix needed |
| 7 | `PUT /franchise/:id` | Same as above — no ownership check | ⚠️ Controller fix needed |
| 8 | Franchise role blocked from franchise endpoints | ✅ FIXED — FRANCHISE now has self-service access |

### 🟡 Medium

| # | Route | Issue | Status |
|---|-------|-------|--------|
| 9 | `GET /cleaner` | Cleaner role cannot view themselves (admin-only). No self-profile endpoint. | ❌ Unfixed |
| 10 | `PATCH /bookings/:id/cancel` | No validators for request body. Any authenticated user can cancel any booking. | ❌ Unfixed |
| 11 | Supervisor role missing from `complaint/stats`, `payment/stats`, `wallet/stats` | Supervisors can't view complaint/payment/wallet statistics | ❌ Unfixed |

### 🟢 Low

| # | Route | Issue | Status |
|---|-------|-------|--------|
| 12 | Customer role missing from tracking endpoints | Customers can't see cleaner tracking data (though they might not need to) | ❌ Unclear |
| 13 | Analytics reports restricted to admin only | Operations team can view but supervisors/franchise can't see their own metrics | ❌ Unfixed |

---

## Auto-Fixes Applied

| Issue | Fix |
|-------|-----|
| **#8 Franchise routes blocked** | ✅ Changed `franchise.routes.js` from router-level guard to per-route authorization. FRANCHISE role added to `GET /stats`, `GET /:id`, `PUT /:id`. |

## Recommended Fixes

1. **Add ownership checks to franchise controller** — `getById` and `update` must verify `req.user.franchiseId === req.params.id`
2. **Add role guards to unprotected routes** — `GET /tasks`, `GET /tasks/:id`, `GET /bookings/:id`, `GET /complaints/:id`
3. **Add self-profile endpoint for cleaners** — `GET /cleaner/profile` with no role guard (just auth)
4. **Add validators to cancel endpoint** — Add `cancelBookingSchema` to validate cancellation reason/notes
