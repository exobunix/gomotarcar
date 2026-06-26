/**
 * Centralized Socket.IO Emitter
 * 
 * Business logic services call these functions after performing operations
 * to emit real-time events to connected clients.
 */

let getIO = null;

const initialize = (ioGetter) => {
  getIO = ioGetter;
};

const getIOOrNull = () => {
  try {
    return getIO ? getIO() : null;
  } catch {
    return null;
  }
};

// ─────────────── BOOKING EVENTS ───────────────

const emitBookingCreated = (booking, customerId, franchiseId) => {
  const io = getIOOrNull();
  if (!io) return;
  const data = {
    bookingId: booking._id,
    bookingCode: booking.bookingId,
    serviceName: booking.serviceName,
    vehicleNumber: booking.vehicleNumber,
    slotDate: booking.slotDate,
    slotTime: booking.slotTime,
    status: booking.status,
    timestamp: new Date(),
  };
  if (customerId) io.to(`user:${customerId}`).emit('booking:created', data);
  if (franchiseId) io.to(`franchise:${franchiseId}`).emit('booking:new', data);
  io.to('role:super_admin').emit('booking:new', data);
  io.to('role:manager').emit('booking:new', data);
};

const emitBookingStatusChanged = (booking, previousStatus) => {
  const io = getIOOrNull();
  if (!io) return;
  const data = {
    bookingId: booking._id,
    bookingCode: booking.bookingId,
    status: booking.status,
    previousStatus,
    timestamp: new Date(),
  };
  if (booking.customerId) io.to(`user:${booking.customerId}`).emit('booking:status-changed', data);
  if (booking.franchiseId) io.to(`franchise:${booking.franchiseId}`).emit('booking:status-changed', data);
  io.to(`booking:${booking._id}`).emit('booking:status-changed', data);
};

const emitBookingAssigned = (booking, cleanerId) => {
  const io = getIOOrNull();
  if (!io) return;
  const data = {
    bookingId: booking._id,
    bookingCode: booking.bookingId,
    cleanerId,
    status: 'assigned',
    timestamp: new Date(),
  };
  if (cleanerId) io.to(`cleaner:${cleanerId}`).emit('booking:assigned', data);
  if (booking.customerId) io.to(`user:${booking.customerId}`).emit('booking:assigned', data);
};

// ─────────────── TASK EVENTS ───────────────

const emitTaskCreated = (task) => {
  const io = getIOOrNull();
  if (!io) return;
  const data = {
    taskId: task._id,
    taskCode: task.taskId,
    scheduledDate: task.scheduledDate,
    scheduledTime: task.scheduledTime,
    packageType: task.packageType,
    timestamp: new Date(),
  };
  if (task.cleanerId) io.to(`cleaner:${task.cleanerId}`).emit('task:new', data);
  if (task.zoneId) io.to(`zone:${task.zoneId}`).emit('task:new', data);
  io.to('role:super_admin').emit('task:new', data);
  io.to('role:manager').emit('task:new', data);
};

const emitTaskAssigned = (task) => {
  const io = getIOOrNull();
  if (!io) return;
  const data = {
    taskId: task._id,
    taskCode: task.taskId,
    scheduledDate: task.scheduledDate,
    scheduledTime: task.scheduledTime,
    customerName: task.customerName,
    vehicleNumber: task.vehicleNumber,
    packageType: task.packageType,
    timestamp: new Date(),
  };
  if (task.cleanerId?.userId) {
    io.to(`user:${task.cleanerId.userId}`).emit('task:assigned', data);
  }
  io.to('role:supervisor').emit('task:assigned', data);
};

const emitTaskStarted = (task) => {
  const io = getIOOrNull();
  if (!io) return;
  const data = {
    taskId: task._id,
    taskCode: task.taskId,
    status: 'in_progress',
    startedAt: task.actualStartTime,
    timestamp: new Date(),
  };
  if (task.customerId) io.to(`user:${task.customerId}`).emit('task:started', data);
  io.to('role:super_admin').emit('task:status-update', data);
  io.to('role:manager').emit('task:status-update', data);
};

const emitTaskCompleted = (task) => {
  const io = getIOOrNull();
  if (!io) return;
  const data = {
    taskId: task._id,
    taskCode: task.taskId,
    status: 'completed',
    completedAt: task.actualEndTime,
    timestamp: new Date(),
  };
  if (task.customerId) io.to(`user:${task.customerId}`).emit('task:completed', data);
  io.to('role:super_admin').emit('task:status-update', data);
  io.to('role:manager').emit('task:status-update', data);
};

const emitTaskCancelled = (task) => {
  const io = getIOOrNull();
  if (!io) return;
  const data = {
    taskId: task._id,
    taskCode: task.taskId,
    status: 'cancelled',
    timestamp: new Date(),
  };
  if (task.customerId) io.to(`user:${task.customerId}`).emit('task:cancelled', data);
  if (task.cleanerId) io.to(`cleaner:${task.cleanerId}`).emit('task:cancelled', data);
  io.to('role:super_admin').emit('task:status-update', data);
};

// ─────────────── ATTENDANCE EVENTS ───────────────

const emitAttendanceCheckIn = (attendance, cleanerId) => {
  const io = getIOOrNull();
  if (!io) return;
  const data = {
    cleanerId,
    status: attendance.status,
    checkInTime: attendance.checkIn?.time,
    isLate: attendance.checkIn?.isLate,
    lateMinutes: attendance.checkIn?.lateMinutes,
    timestamp: new Date(),
  };
  io.to('role:super_admin').emit('attendance:checkin', data);
  io.to('role:manager').emit('attendance:checkin', data);
  io.to('role:supervisor').emit('attendance:checkin', data);
};

const emitAttendanceCheckOut = (attendance, cleanerId) => {
  const io = getIOOrNull();
  if (!io) return;
  const data = {
    cleanerId,
    status: attendance.status,
    checkOutTime: attendance.checkOut?.time,
    workingMinutes: attendance.summary?.totalWorkingMinutes,
    timestamp: new Date(),
  };
  io.to('role:super_admin').emit('attendance:checkout', data);
  io.to('role:manager').emit('attendance:checkout', data);
  io.to('role:supervisor').emit('attendance:checkout', data);
};

// ─────────────── PAYMENT EVENTS ───────────────

const emitPaymentReceived = (payment, customerId) => {
  const io = getIOOrNull();
  if (!io) return;
  const data = {
    paymentId: payment._id,
    amount: payment.amount,
    purpose: payment.purpose,
    status: payment.status,
    timestamp: new Date(),
  };
  if (customerId) io.to(`user:${customerId}`).emit('payment:received', data);
  io.to('role:super_admin').emit('payment:received', data);
  io.to('role:manager').emit('payment:received', data);
};

const emitPaymentFailed = (payment, customerId) => {
  const io = getIOOrNull();
  if (!io) return;
  const data = {
    paymentId: payment._id,
    amount: payment.amount,
    purpose: payment.purpose,
    status: 'failed',
    timestamp: new Date(),
  };
  if (customerId) io.to(`user:${customerId}`).emit('payment:failed', data);
};

// ─────────────── COMPLAINT EVENTS ───────────────

const emitComplaintCreated = (complaint, customerId) => {
  const io = getIOOrNull();
  if (!io) return;
  const data = {
    complaintId: complaint._id,
    ticketNumber: complaint.ticketNumber,
    category: complaint.category,
    priority: complaint.priority,
    status: complaint.status,
    timestamp: new Date(),
  };
  if (customerId) io.to(`user:${customerId}`).emit('complaint:created', data);
  io.to('role:super_admin').emit('complaint:new', data);
  io.to('role:manager').emit('complaint:new', data);
};

const emitComplaintResolved = (complaint, customerId) => {
  const io = getIOOrNull();
  if (!io) return;
  const data = {
    complaintId: complaint._id,
    ticketNumber: complaint.ticketNumber,
    status: 'resolved',
    timestamp: new Date(),
  };
  if (customerId) io.to(`user:${customerId}`).emit('complaint:resolved', data);
};

// ─────────────── NOTIFICATION EVENTS ───────────────

const emitNewNotification = (notification) => {
  const io = getIOOrNull();
  if (!io) return;
  const data = {
    _id: notification._id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    priority: notification.priority,
    data: notification.data,
    createdAt: notification.createdAt,
    isRead: false,
  };
  if (notification.recipientId) {
    io.to(`notifications:${notification.recipientId}`).emit('notification:new', data);
    io.to(`user:${notification.recipientId}`).emit('notification', data);
  }
};

// ─────────────── DASHBOARD EVENTS ───────────────

const emitDashboardUpdate = (data) => {
  const io = getIOOrNull();
  if (!io) return;
  io.to('role:super_admin').emit('dashboard:update', { ...data, timestamp: new Date() });
  io.to('role:manager').emit('dashboard:update', { ...data, timestamp: new Date() });
};

// ─────────────── EXPORT ───────────────

module.exports = {
  initialize,
  // Booking
  emitBookingCreated,
  emitBookingStatusChanged,
  emitBookingAssigned,
  // Task
  emitTaskCreated,
  emitTaskAssigned,
  emitTaskStarted,
  emitTaskCompleted,
  emitTaskCancelled,
  // Attendance
  emitAttendanceCheckIn,
  emitAttendanceCheckOut,
  // Payment
  emitPaymentReceived,
  emitPaymentFailed,
  // Complaint
  emitComplaintCreated,
  emitComplaintResolved,
  // Notification
  emitNewNotification,
  // Dashboard
  emitDashboardUpdate,
};
