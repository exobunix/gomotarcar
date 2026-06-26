# ⚠️ GoMotarCar — Known Limitations v1.0

**Version:** 1.0.0  
**Last Updated:** June 16, 2026  

---

This document lists all known limitations, technical debt items, and deferred features that exist in the GoMotarCar platform at the time of v1.0 release.

---

## 🔴 Critical Limitations

| # | Limitation | Impact | Target Fix | Affected Modules |
|---|-----------|--------|------------|------------------|
| L-001 | **Customer API routes are empty/placeholder** | Customer CRUD endpoints (profile, vehicles, addresses) return 404. Apps currently use alternative flows. | v1.1 | Backend |
| L-002 | **Franchise App — only 5 of 15 screens built** | Franchise partners cannot manage job cards, customer approvals, payment settlements, wallet, or reports via mobile. | v1.1 | Franchise App |
| L-003 | **Operations App — only 4 of 15 screens built** | Operations team cannot onboard partners, approve cleaners, manage escalations, grievances, or monitoring via mobile. | v1.1 | Operations App |
| L-004 | **Website — 3 of 14 pages built** | Only Home, Contact, and Franchise pages exist. About, Blog, FAQ, Privacy, Terms, Services pages missing. | v1.1 | Website |
| L-005 | **Missing ownership checks on bookings/complaints/tasks** | `GET /bookings/:id`, `GET /complaints/:id`, `GET /tasks/:id` allow any authenticated user to view any resource by ID. No data isolation. | v1.1 | Backend Security |

---

## 🟠 High Limitations

| # | Limitation | Impact | Target Fix | Affected Modules |
|---|-----------|--------|------------|------------------|
| L-006 | **No Redis for OTP/token storage** | OTP and token blacklist use MongoDB (functional but slower than Redis). Horizontal scaling requires Redis adapter for Socket.IO. | v1.1 | Backend Infrastructure |
| L-007 | **Analytics dashboard screens not built** | Backend analytics API is complete (4 endpoints, 11 KPIs) but admin panel has no chart/report UI. | v1.1 | Admin Panel |
| L-008 | **Campaign management UI missing** | Campaign API is built (routes + controller) but admin panel has no campaign create/schedule UI. | v1.1 | Admin Panel |
| L-009 | **No CSRF token validation** | While CORS is configured, state-changing requests lack CSRF token verification. Low risk with current CORS config. | v1.2 | Backend Security |
| L-010 | **No SMS/WhatsApp channel integration** | SMS and WhatsApp notification channels are stubs. Only in-app + FCM push notifications are active. | v1.2 | Backend Notifications |
| L-011 | **No cascade delete hooks** | Deleting a User/Customer/Cleaner/Vehicle leaves orphaned records in related collections. Manual cleanup needed. | v1.2 | Backend Database |
| L-012 | **Customer app partial** | Customer app is built but specific screens (social-login, forgot-password, wallet management) need the corresponding backend endpoints. | v1.1 | Customer App |

---

## 🟡 Medium Limitations

| # | Limitation | Impact | Target Fix | Affected Modules |
|---|-----------|--------|------------|------------------|
| L-013 | **No `.lean()` on list queries** | Mongoose list endpoints hydrate full documents without `.lean()`, adding 2-5x memory overhead. Performance impact at scale. | v1.2 | Backend Performance |
| L-014 | **Unbounded embedded arrays** | `Vehicle.cleaningHistory`, `ServiceBooking.trackingTimeline`, `Task.statusHistory`, `User.loginHistory` grow indefinitely. Should be separate collections with TTL. | v1.2 | Backend Database |
| L-015 | **Analytics default date range** | `getDashboardMetrics()` runs 18 parallel queries without default date filter, scanning entire collections. | v1.2 | Backend Performance |
| L-016 | **No dark mode support** | All 6 mobile apps lack dark mode color definitions. Users on dark mode see bright white backgrounds. | v1.2 | All Mobile Apps |
| L-017 | **No server-side input validation on analytics endpoints** | Analytics endpoints accept arbitrary date strings without Joi validation. Malformed dates cause MongoDB errors. | v1.2 | Backend Analytics |

---

## 🟢 Low Limitations

| # | Limitation | Impact | Target Fix | Affected Modules |
|---|-----------|--------|------------|------------------|
| L-018 | **No unit test coverage** | No Jest/supertest test files exist. All testing has been manual or via audit automation. | v1.3 | All |
| L-019 | **No CodePush OTA updates** | Mobile apps require full store updates. CodePush not configured. | v1.2 | Customer/Cleaner Apps |
| L-020 | **No pagination on cleaner productivity endpoint** | Returns all cleaners unfiltered. Slow with 1000+ cleaners. | v1.2 | Backend Analytics |
| L-021 | **Blog `readingTime` not auto-calculated** | Reading time is a manual input. Should calculate from content length. | v1.3 | Backend CMS |
| L-022 | **No mobile responsive admin sidebar** | Admin panel sidebar doesn't collapse on mobile. | v1.3 | Admin Panel |
| L-023 | **No `createdBy` on ContactRequest model** | Cannot track who submitted or was assigned to contact requests. | v1.3 | Backend CMS |
| L-024 | **Campaign model missing timezone field** | Scheduled campaigns don't specify timezone, causing ambiguous scheduling. | v1.3 | Backend Notifications |
| L-025 | **Duplicate revenue field in analytics** | Returns both `revenue.total` and `revenue.totalRevenue` with same value. | v1.3 | Backend Analytics |

---

## Deferred Features (Not in v1.0)

| Feature | Rationale | Planned Version |
|---------|-----------|-----------------|
| Elasticsearch integration for search | MongoDB text search sufficient for v1 | v2.0 |
| AI-powered cleaner recommendations | Need production data for training | v2.0 |
| Real-time customer tracking (cleaner location on map) | Socket.IO infrastructure ready, UI deferred | v1.2 |
| Multi-language support (Hindi, etc.) | All strings currently English | v2.0 |
| WhatsApp notification channel | Stub exists, integration deferred | v1.2 |
| Video call support for customer support | Need WebRTC integration | v2.0 |
| Offline-first architecture for mobile apps | Offline queue service built, UI integration deferred | v1.2 |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|:----------:|:------:|------------|
| Ownership leak on bookings/complaints | Medium | High | Known limitation L-005 — implement ASAP post-launch |
| Franchise app unusable | Medium | High | Known limitation L-002 — franchise partners use admin panel as workaround |
| Analytics slow with large datasets | Low | Medium | Known limitation L-015 — add date filter default |
| Database query performance | Low | Medium | Known limitation L-013 — optimize in v1.2 |
| SMS channel not functional | Low | Low | OTP delivered via in-app; SMS is secondary channel |

---

*This document is part of the Enterprise Release Certification. Limitations are prioritized for resolution in subsequent releases.*
