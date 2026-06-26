# GoMotarCar API Documentation

**Base URL:** `http://localhost:5000/api/v1`

**Auth:** JWT Bearer token in `Authorization` header.

---

## Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | No | Login with phone + password |
| POST | `/auth/send-otp` | No | Send OTP to phone |
| POST | `/auth/verify-otp` | No | Verify OTP |
| POST | `/auth/refresh` | No | Refresh access token |
| POST | `/auth/logout` | Yes | Logout (blacklists token) |
| POST | `/auth/forgot-password` | No | Send password reset OTP |
| POST | `/auth/reset-password` | No | Reset password with OTP |
| GET | `/auth/profile` | Yes | Get current user profile |

---

## Dashboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dashboard/admin` | admin/manager/ops | Full platform overview with aggregation |
| GET | `/dashboard/cleaner` | cleaner/admin | Cleaner-specific dashboard |
| GET | `/dashboard/cleaner/:userId` | admin/manager | Dashboard for a specific cleaner |
| GET | `/dashboard/customer` | customer/admin | Customer-specific dashboard |
| GET | `/dashboard/customer/:userId` | admin/manager | Dashboard for a specific customer |
| GET | `/dashboard/franchise` | franchise/admin | Franchise-specific dashboard |
| GET | `/dashboard/franchise/:userId` | admin/manager | Dashboard for a specific franchise |

### Admin Dashboard Response
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalCustomers": 100,
      "totalCleaners": 50,
      "totalVehicles": 150,
      "totalBookings": 500,
      "totalRevenue": 2500000,
      "activeSubscriptions": 45,
      "todayAttendance": 30,
      "openComplaints": 12,
      "activeQRCodes": 80
    },
    "bookings": { "booked": 50, "inProgress": 30, "completed": 380, "cancelled": 40 },
    "revenue": {
      "total": 2500000,
      "monthly": [{ "month": "2026-05", "revenue": 450000, "bookings": 85 }],
      "averageOrderValue": 5000
    },
    "trends": {
      "bookingTrend": [{ "date": "2026-06-01", "bookings": 18 }]
    }
  }
}
```

---

## Cleaners

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/cleaner` | admin/manager/supervisor | List cleaners (paginated, filterable) |
| POST | `/cleaner` | admin/manager/supervisor | Create cleaner |
| GET | `/cleaner/stats` | admin/manager/supervisor | Get cleaner statistics |
| GET | `/cleaner/:id` | admin/manager/supervisor | Get cleaner by ID |
| PUT | `/cleaner/:id` | admin/manager/supervisor | Update cleaner |
| PATCH | `/cleaner/:id/stats` | admin/manager/supervisor | Update cleaner stats |
| PATCH | `/cleaner/:id/document-status` | admin/manager | Update document verification |
| PATCH | `/cleaner/:id/verify` | admin/manager | Verify cleaner |
| PATCH | `/cleaner/:id/deactivate` | admin/manager/supervisor | Deactivate cleaner |
| DELETE | `/cleaner/:id` | admin/manager | Delete cleaner permanently |

### Create Cleaner Request
```json
{
  "firstName": "Rahul",
  "lastName": "Kumar",
  "phone": "+919876543210",
  "email": "rahul@example.com",
  "password": "password123",
  "employmentType": "full-time",
  "experience": 3,
  "language": "en",
  "assignedZone": "60d5f484f1a2c8b1f8e4e1a1"
}
```

---

## QR Code Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/qr` | admin/manager/ops | List QR codes (paginated) |
| POST | `/qr` | admin/manager | Generate single QR code |
| POST | `/qr/bulk-generate` | admin/manager | Bulk generate QR for vehicles |
| GET | `/qr/stats` | Yes | QR statistics |
| GET | `/qr/analytics` | Yes | QR scan analytics (trends, unique scanners) |
| GET | `/qr/verify/:code` | **No** | Public QR verification (records scan) |
| POST | `/qr/scan` | Yes | Scan QR by code |
| GET | `/qr/code/:code` | Yes | Get QR by code string |
| GET | `/qr/:id` | Yes | Get QR by ID |
| GET | `/qr/:id/history` | Yes | Get scan history for QR |
| GET | `/qr/:id/download/png` | Yes | Download QR as PNG |
| GET | `/qr/:id/download/svg` | Yes | Download QR as SVG |
| PATCH | `/qr/:id/activate` | admin/manager | Activate QR code |
| PATCH | `/qr/:id/damaged` | admin/manager/supervisor | Report QR as damaged |
| POST | `/qr/:id/replace` | admin/manager | Replace QR code |
| DELETE | `/qr/:id` | admin/manager | Delete QR code permanently |

### Generate QR Request
```json
{
  "vehicleId": "60d5f484f1a2c8b1f8e4e1a1",
  "customerId": "60d5f484f1a2c8b1f8e4e1b2"
}
```

### Bulk Generate Request
```json
{
  "vehicleIds": ["id1", "id2"],  // optional — omit to generate for all eligible vehicles
  "customerId": "60d5f..."  // optional — defaults to vehicle owner
}
```

### QR Verification Response (Public)
```json
{
  "success": true,
  "data": {
    "code": "GMC-ABCD1234-XYZ789",
    "status": "active",
    "vehicle": {
      "number": "MH-01-AB1234",
      "make": "Maruti",
      "model": "Swift",
      "color": "White",
      "type": "hatchback",
      "year": 2023
    },
    "customer": {
      "name": "Priya Sharma",
      "phone": "+919910000000"
    },
    "scannedCount": 5,
    "issuedAt": "2026-01-15T10:00:00Z",
    "activatedAt": "2026-01-15T11:00:00Z"
  }
}
```

---

## Bookings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/bookings` | Yes | List bookings |
| GET | `/bookings/stats` | Yes | Booking statistics |
| POST | `/bookings` | Yes | Create booking |
| GET | `/bookings/:id` | Yes | Get booking by ID |
| PATCH | `/bookings/:id/status` | Yes | Update booking status |
| PATCH | `/bookings/:id/cancel` | Yes | Cancel booking |
| POST | `/bookings/:id/extra-charges` | Yes | Add extra charge |
| POST | `/bookings/:id/job-card` | Yes | Generate job card |

---

## Tasks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/tasks` | Yes | List tasks (paginated) |
| GET | `/tasks/stats` | Yes | Task statistics |
| POST | `/tasks` | Yes | Create task |
| GET | `/tasks/:id` | Yes | Get task by ID |
| PATCH | `/tasks/:id/assign` | Yes | Assign cleaner to task |
| PATCH | `/tasks/:id/start` | Yes | Start task |
| PATCH | `/tasks/:id/complete` | Yes | Complete task |
| PATCH | `/tasks/:id/miss` | Yes | Mark task as missed |

---

## Attendance

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/attendance` | Yes | List attendance records |
| GET | `/attendance/stats` | Yes | Attendance statistics |
| GET | `/attendance/:id` | Yes | Get attendance by ID |
| GET | `/attendance/cleaner/:id/monthly/:month/:year` | Yes | Monthly summary per cleaner |
| POST | `/attendance/cleaner/:id/mark-absent` | Yes | Mark cleaner absent |

---

## Payments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/payments` | Yes | List payments |
| GET | `/payments/stats` | Yes | Payment statistics |
| POST | `/payments/create-order` | Yes | Create payment order |
| POST | `/payments/verify` | Yes | Verify payment |
| POST | `/payments/:id/refund` | Yes | Process refund |
| POST | `/payments/wallet-topup` | Yes | Wallet top-up |

---

## Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | Yes | List notifications |
| GET | `/notifications/stats` | Yes | Notification statistics |
| POST | `/notifications` | Yes | Send notification |
| POST | `/notifications/bulk` | Yes | Send bulk notifications |
| PATCH | `/notifications/:id/read` | Yes | Mark as read |

---

## Customers

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/customer` | Yes | List customers |
| GET | `/customer/stats` | Yes | Customer statistics |
| POST | `/customer` | Yes | Create customer |
| GET | `/customer/:id` | Yes | Get customer by ID |
| PUT | `/customer/:id` | Yes | Update customer |
| PATCH | `/customer/:id/deactivate` | Yes | Deactivate customer |

---

## Vehicles

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/vehicles` | Yes | List vehicles |
| GET | `/vehicles/stats` | Yes | Vehicle statistics |
| POST | `/vehicles` | Yes | Create vehicle |
| GET | `/vehicles/:id` | Yes | Get vehicle by ID |
| PUT | `/vehicles/:id` | Yes | Update vehicle |
| PATCH | `/vehicles/:id/deactivate` | Yes | Deactivate vehicle |
| DELETE | `/vehicles/:id` | Yes | Delete vehicle |

---

## Franchises

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/franchise` | Yes | List franchises |
| GET | `/franchise/stats` | Yes | Franchise statistics |
| POST | `/franchise` | Yes | Create franchise |
| GET | `/franchise/:id` | Yes | Get franchise by ID |
| PUT | `/franchise/:id` | Yes | Update franchise |
| PATCH | `/franchise/:id/verify` | Yes | Verify franchise |
| PATCH | `/franchise/:id/deactivate` | Yes | Deactivate franchise |
| DELETE | `/franchise/:id` | Yes | Delete franchise |

---

## Complaints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/complaints` | Yes | List complaints |
| GET | `/complaints/stats` | Yes | Complaint statistics |
| POST | `/complaints` | Yes | Create complaint |
| GET | `/complaints/:id` | Yes | Get complaint by ID |
| PATCH | `/complaints/:id/assign` | Yes | Assign complaint |
| PATCH | `/complaints/:id/resolve` | Yes | Resolve complaint |
| PATCH | `/complaints/:id/close` | Yes | Close complaint |

---

## Analytics

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/analytics/dashboard` | Yes | Dashboard analytics |
| GET | `/analytics/revenue` | Yes | Revenue report |
| GET | `/analytics/cleaner-productivity` | Yes | Cleaner performance report |

---

## Uploads

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/upload/image` | Yes | Upload image (JPEG/PNG, max 5MB) |
| POST | `/upload/document` | Yes | Upload document (PDF, max 10MB) |
| POST | `/upload/video` | Yes | Upload video (MP4, max 50MB) |

---

## Additional Resources

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| CRUD | `/zones` | Yes | Zone management |
| CRUD | `/services/categories` | Yes | Service marketplace categories |
| CRUD | `/services/providers` | Yes | Service marketplace providers |
| CRUD | `/issues` | Yes | Issue tracking |
| CRUD | `/training` | Yes | Training modules |
| CRUD | `/settings` | Yes | App settings |
| CRUD | `/earnings` | Yes | Earnings management |
| CRUD | `/subscriptions` | Yes | Subscription management |
| CRUD | `/apartments` | Yes | Apartment management |
| CRUD | `/wallet` | Yes | Wallet management |

---

## Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "VAL_VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "phone", "message": "Phone number is required" }
    ]
  }
}
```

### Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VAL_VALIDATION_ERROR` | 400 | Request validation failed |
| `AUTH_NO_TOKEN` | 401 | No auth token provided |
| `AUTH_TOKEN_EXPIRED` | 401 | Token has expired |
| `AUTH_INVALID_TOKEN` | 401 | Token is invalid |
| `AUTH_TOKEN_REVOKED` | 401 | Token has been revoked |
| `AUTH_USER_INACTIVE` | 401 | User account is inactive |
| `AUTH_INVALID_CREDENTIALS` | 401 | Invalid login credentials |
| `FORBIDDEN` | 403 | Insufficient role permissions |
| `*_NOT_FOUND` | 404 | Resource not found |
| `*_EXISTS` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Internal server error |

---

## Pagination

List endpoints support pagination via query params:

```
GET /api/v1/cleaner?page=1&limit=20&search=rahul&employmentType=full-time&verificationStatus=verified
```

Response includes pagination metadata:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Common Filter Parameters
| Parameter | Type | Example |
|-----------|------|---------|
| `page` | int | 1 |
| `limit` | int | 20 (max 100) |
| `search` | string | "rahul" |
| `status` | string | "active" |
| `startDate` | ISO date | "2026-01-01" |
| `endDate` | ISO date | "2026-06-30" |
