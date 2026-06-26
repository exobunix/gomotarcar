const Notification = require('../models/Notification');

module.exports = (io, socket) => {
  // Subscribe to notification room
  socket.on('notifications:subscribe', () => {
    socket.join(`notifications:${socket.userId}`);
  });

  // Mark notification as read
  socket.on('notifications:read', async (notificationId) => {
    try {
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true, readAt: new Date() },
        { new: true }
      );

      if (notification) {
        socket.emit('notifications:read-confirmed', { notificationId });
        // Update unread count
        const unreadCount = await Notification.countDocuments({
          recipientId: socket.userId,
          isRead: false,
        });
        socket.emit('notifications:unread-count', { count: unreadCount });
      }
    } catch (error) {
      socket.emit('error', { code: 'NOTIF_READ_FAILED', message: error.message });
    }
  });

  // Mark all notifications as read
  socket.on('notifications:read-all', async () => {
    try {
      const result = await Notification.updateMany(
        { recipientId: socket.userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      socket.emit('notifications:read-all-confirmed', { modifiedCount: result.modifiedCount });
      socket.emit('notifications:unread-count', { count: 0 });
    } catch (error) {
      socket.emit('error', { code: 'NOTIF_READ_ALL_FAILED', message: error.message });
    }
  });

  // Get unread count
  socket.on('notifications:unread', async () => {
    try {
      const count = await Notification.countDocuments({
        recipientId: socket.userId,
        isRead: false,
      });
      socket.emit('notifications:unread-count', { count });
    } catch (error) {
      socket.emit('error', { code: 'NOTIF_COUNT_FAILED', message: error.message });
    }
  });

  // Join user's notification room on connect
  socket.join(`notifications:${socket.userId}`);

  // Send real-time notification helper
  const sendNotification = async ({ recipientId, title, body, type, data = {} }) => {
    io.to(`notifications:${recipientId}`).emit('notification', {
      title, body, type, data, timestamp: new Date(),
    });
  };

  socket._sendNotification = sendNotification;
};
