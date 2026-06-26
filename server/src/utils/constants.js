module.exports = {
  // User roles
  ROLES: {
    SUPER_ADMIN: 'super_admin',
    MANAGER: 'manager',
    SUPERVISOR: 'supervisor',
    OPERATIONS: 'operations',
    FRANCHISE: 'franchise',
    CLEANER: 'cleaner',
    CUSTOMER: 'customer',
  },

  // Task statuses
  TASK_STATUS: {
    ASSIGNED: 'assigned',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    MISSED: 'missed',
    CANCELLED: 'cancelled',
  },

  // Attendance statuses
  ATTENDANCE_STATUS: {
    PRESENT: 'present',
    ABSENT: 'absent',
    HALF_DAY: 'half-day',
    LATE: 'late',
    LEAVE: 'leave',
    HOLIDAY: 'holiday',
  },

  // Leave types
  LEAVE_TYPE: {
    SICK: 'sick',
    CASUAL: 'casual',
    EARNED: 'earned',
    EMERGENCY: 'emergency',
    OTHER: 'other',
  },

  LEAVE_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
  },

  // Subscription statuses
  SUBSCRIPTION_STATUS: {
    TRIAL: 'trial',
    ACTIVE: 'active',
    EXPIRED: 'expired',
    CANCELLED: 'cancelled',
  },

  SUBSCRIPTION_PACKAGES: {
    BASIC: 'basic',
    PREMIUM: 'premium',
    ELITE: 'elite',
  },

  // Payment statuses
  PAYMENT_STATUS: {
    CREATED: 'created',
    CAPTURED: 'captured',
    REFUNDED: 'refunded',
    FAILED: 'failed',
    PARTIAL_REFUNDED: 'partial_refunded',
  },

  PAYMENT_PURPOSE: {
    SUBSCRIPTION: 'subscription',
    SERVICE_BOOKING: 'service_booking',
    FASTTAG: 'fasttag_recharge',
    CLEANER_PAYOUT: 'cleaner_payout',
    INCENTIVE_PAYOUT: 'incentive_payout',
    REFUND: 'refund',
  },

  // QR statuses
  QR_STATUS: {
    PENDING: 'pending_activation',
    ACTIVE: 'active',
    REPLACED: 'replaced',
    DAMAGED: 'damaged',
  },

  // Issue categories
  ISSUE_CATEGORY: {
    VEHICLE_LOCKED: 'vehicle_locked',
    VEHICLE_MISSING: 'vehicle_missing',
    CUSTOMER_COMPLAINT: 'customer_complaint',
    QR_DAMAGED: 'qr_damaged',
    PAYMENT_ISSUE: 'payment_issue',
    OTHER: 'other',
  },

  ISSUE_STATUS: {
    OPEN: 'open',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    CLOSED: 'closed',
  },

  // Document types
  DOCUMENT_TYPE: {
    AADHAAR: 'aadhaar',
    PAN: 'pan',
    DRIVING_LICENSE: 'driving_license',
    POLICE_VERIFICATION: 'police_verification',
  },

  DOCUMENT_STATUS: {
    PENDING: 'pending',
    VERIFIED: 'verified',
    REJECTED: 'rejected',
  },

  // Service modes
  SERVICE_MODE: {
    WORKSHOP: 'workshop',
    PICKUP_DROP: 'pickup_drop',
    DOORSTEP: 'doorstep',
  },

  // Notification types
  NOTIFICATION_TYPE: {
    TASK_ASSIGNMENT: 'task_assignment',
    TASK_REMINDER: 'task_reminder',
    ATTENDANCE_ALERT: 'attendance_alert',
    ISSUE_UPDATE: 'issue_update',
    PAYMENT_UPDATE: 'payment_update',
    LEAVE_STATUS: 'leave_status',
    INCENTIVE: 'incentive',
    BOOKING_UPDATE: 'booking_update',
    SUBSCRIPTION_REMINDER: 'subscription_reminder',
    COMPLAINT_UPDATE: 'complaint_update',
    ANNOUNCEMENT: 'announcement',
    SYSTEM: 'system',
  },

  // Performance tiers
  PERFORMANCE_TIER: {
    ELITE: 'elite',
    PRO: 'pro',
    REGULAR: 'regular',
    NEEDS_IMPROVEMENT: 'needs_improvement',
  },

  // Incentive tiers
  INCENTIVE_TIER: {
    PLATINUM: 'platinum',
    GOLD: 'gold',
    SILVER: 'silver',
    BRONZE: 'bronze',
    NONE: 'none',
  },

  // Time slots
  TIME_SLOTS: {
    MORNING: 'morning',
    AFTERNOON: 'afternoon',
    EVENING: 'evening',
  },

  // GPS radius
  GPS_ALLOWED_RADIUS: 100, // meters

  // Check-in cutoff
  CHECKIN_CUTOFF_HOUR: 10,
  CHECKIN_CUTOFF_MINUTE: 30,
  LATE_THRESHOLD_HOUR: 8,

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
};
