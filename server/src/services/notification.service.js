const Notification = require('../models/Notification');
const User = require('../models/User');
let _messagingModule = null;
const { AppError } = require('../middleware/errorHandler');

const socketEmitter = require('../socket/emitter');

class NotificationService {
  /**
   * Send a notification
   */
  async send(data) {
    const { recipientId, recipientRole, type, title, body, data: notifData, priority, imageUrl } = data;

    // Verify recipient exists
    const user = await User.findById(recipientId);
    if (!user) throw new AppError('Recipient not found', 404, 'NOTIF_USER_NOT_FOUND');

    const notification = await Notification.create({
      recipientId, recipientRole: recipientRole || user.role,
      type, title, body,
      data: notifData || {},
      priority: priority || 'normal',
      imageUrl,
    });

    // Attempt push notification (firebase)
    if (user.fcmToken) {
      try {
        if (!_messagingModule) _messagingModule = require('../config/firebase');
        const messaging = _messagingModule.getMessaging();
        if (messaging) {
          await messaging.send({
            token: user.fcmToken,
            notification: { title, body },
            data: { type, ...(notifData || {}) },
          });
          notification.pushSent = true;
          notification.pushSentAt = new Date();
          await notification.save();
        }
      } catch (pushError) {
        console.error('Push notification failed:', pushError.message);
        // Don't throw - notification is still saved in DB
      }
    }

    socketEmitter.emitNewNotification(notification);
    return notification;
  }

  /**
   * Send bulk notification to users by role
   */
  async sendBulk({ roles, type, title, body, data, priority } = {}) {
    const users = await User.find({ role: { $in: roles }, isActive: true });
    const notifications = [];

    for (const user of users) {
      try {
        const notif = await this.send({
          recipientId: user._id,
          recipientRole: user.role,
          type, title, body, data, priority,
        });
        notifications.push(notif);
      } catch (e) {
        // Continue sending to others
      }
    }

    return { sent: notifications.length, total: users.length };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    if (!notification) throw new AppError('Notification not found', 404, 'NOTIF_NOT_FOUND');
    return notification;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    const result = await Notification.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    return { modifiedCount: result.modifiedCount };
  }

  /**
   * Get notification by ID
   */
  async getById(notificationId) {
    const notification = await Notification.findById(notificationId);
    if (!notification) throw new AppError('Notification not found', 404, 'NOTIF_NOT_FOUND');
    return notification;
  }

  /**
   * List notifications for a user
   */
  async listForUser(userId, { page = 1, limit = 20, isRead, type } = {}) {
    const query = { recipientId: userId };
    if (isRead !== undefined) query.isRead = isRead;
    if (type) query.type = type;

    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(query),
    ]);

    return {
      data: notifications,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 },
    };
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId) {
    return Notification.countDocuments({ recipientId: userId, isRead: false });
  }

  /**
   * List all notifications (admin)
   */
  async list({ page = 1, limit = 20, type, isRead, recipientRole, fromDate, toDate } = {}) {
    const query = {};
    if (type) query.type = type;
    if (isRead !== undefined) query.isRead = isRead;
    if (recipientRole) query.recipientRole = recipientRole;
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .populate('recipientId', 'phone role')
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(query),
    ]);

    return {
      data: notifications,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 },
    };
  }

  /**
   * Delete notification
   */
  async delete(notificationId) {
    const notification = await Notification.findByIdAndDelete(notificationId);
    if (!notification) throw new AppError('Notification not found', 404, 'NOTIF_NOT_FOUND');
    return { message: 'Notification deleted' };
  }

  /**
   * Get stats
   */
  async getStats() {
    const [total, read, unread, pushSent] = await Promise.all([
      Notification.countDocuments(),
      Notification.countDocuments({ isRead: true }),
      Notification.countDocuments({ isRead: false }),
      Notification.countDocuments({ pushSent: true }),
    ]);
    return { total, read, unread, pushSent };
  }
}

module.exports = new NotificationService();
