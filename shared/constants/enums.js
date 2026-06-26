module.exports = {
  ROLES: {
    SUPER_ADMIN: 'super_admin',
    MANAGER: 'manager',
    SUPERVISOR: 'supervisor',
    OPERATIONS: 'operations',
    FRANCHISE: 'franchise',
    CLEANER: 'cleaner',
    CUSTOMER: 'customer',
  },
  TASK_STATUS: {
    ASSIGNED: 'assigned',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    MISSED: 'missed',
    CANCELLED: 'cancelled',
  },
  ATTENDANCE_STATUS: {
    PRESENT: 'present',
    ABSENT: 'absent',
    HALF_DAY: 'half-day',
    LATE: 'late',
    LEAVE: 'leave',
    HOLIDAY: 'holiday',
  },
  SUBSCRIPTION_STATUS: {
    TRIAL: 'trial',
    ACTIVE: 'active',
    EXPIRED: 'expired',
    CANCELLED: 'cancelled',
  },
  PAYMENT_STATUS: {
    CREATED: 'created',
    CAPTURED: 'captured',
    REFUNDED: 'refunded',
    FAILED: 'failed',
  },
  QR_STATUS: {
    PENDING: 'pending_activation',
    ACTIVE: 'active',
    REPLACED: 'replaced',
    DAMAGED: 'damaged',
  },
};
