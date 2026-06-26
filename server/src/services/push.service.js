const User = require('../models/User');
const Notification = require('../models/Notification');
const NotificationService = require('./notification.service');
const { AppError } = require('../middleware/errorHandler');

let _messagingModule = null;
const _getMessaging = () => {
  try {
    if (!_messagingModule) _messagingModule = require('../config/firebase');
    return _messagingModule.getMessaging();
  } catch {
    return null;
  }
};

class PushService {
  /**
   * Send push notification to a specific device
   */
  async sendToDevice(fcmToken, { title, body, data = {}, priority = 'high' }) {
    const messaging = _getMessaging();
    if (!messaging) {
      console.warn('Firebase not configured — push notification skipped');
      return { sent: false, reason: 'Firebase not configured' };
    }

    try {
      const message = {
        token: fcmToken,
        notification: { title, body },
        data: Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, String(v)])
        ),
        android: { priority },
        apns: { payload: { aps: { sound: 'default', badge: 1 } } },
      };

      const response = await messaging.send(message);
      return { sent: true, messageId: response };
    } catch (error) {
      // Handle token errors
      if (error.code === 'messaging/invalid-argument' ||
          error.code === 'messaging/registration-token-not-registered') {
        return { sent: false, reason: 'Invalid token', error: error.message };
      }
      throw error;
    }
  }

  /**
   * Send push notification to a user (by ID) using their stored FCM token
   */
  async sendToUser(userId, { title, body, type, data = {}, priority = 'high' }) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404, 'PUSH_USER_NOT_FOUND');

    // Save notification in DB first
    const notification = await NotificationService.send({
      recipientId: userId,
      recipientRole: user.role,
      type: type || 'system',
      title,
      body,
      data,
      priority: priority === 'high' ? 'urgent' : 'normal',
    });

    // Send push if FCM token exists
    let pushResult = { sent: false, reason: 'No FCM token' };
    if (user.fcmToken) {
      pushResult = await this.sendToDevice(user.fcmToken, { title, body, data, priority });
      if (pushResult.sent) {
        notification.pushSent = true;
        notification.pushSentAt = new Date();
        await notification.save();
      }
    }

    return { notification, push: pushResult };
  }

  /**
   * Send push to multiple users by role
   */
  async sendToRole(role, { title, body, type, data = {}, priority = 'high' }) {
    const users = await User.find({ role, isActive: true, fcmToken: { $exists: true, $ne: null } });
    const results = [];

    for (const user of users) {
      try {
        const result = await this.sendToUser(user._id, { title, body, type, data, priority });
        results.push({ userId: user._id, success: true, pushSent: result.push?.sent });
      } catch (e) {
        results.push({ userId: user._id, success: false, error: e.message });
      }
    }

    return { total: users.length, sent: results.filter(r => r.pushSent).length, results };
  }

  /**
   * Update a user's FCM token
   */
  async updateToken(userId, fcmToken, deviceId) {
    const update = { fcmToken };
    if (deviceId) update.deviceId = deviceId;
    await User.findByIdAndUpdate(userId, update);
    return { updated: true };
  }

  /**
   * Remove a user's FCM token (on logout)
   */
  async removeToken(userId) {
    await User.findByIdAndUpdate(userId, { $unset: { fcmToken: '' } });
    return { removed: true };
  }

  /**
   * Send notification to topic
   */
  async sendToTopic(topic, { title, body, data = {} }) {
    const messaging = _getMessaging();
    if (!messaging) return { sent: false, reason: 'Firebase not configured' };

    try {
      const message = {
        topic,
        notification: { title, body },
        data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
      };

      const response = await messaging.send(message);
      return { sent: true, messageId: response };
    } catch (error) {
      return { sent: false, error: error.message };
    }
  }

  /**
   * Subscribe device to topic
   */
  async subscribeToTopic(fcmTokens, topic) {
    const messaging = _getMessaging();
    if (!messaging) throw new AppError('Firebase not configured', 503, 'FCM_NOT_CONFIGURED');

    const tokens = Array.isArray(fcmTokens) ? fcmTokens : [fcmTokens];
    const response = await messaging.subscribeToTopic(tokens, topic);
    return { successCount: response.successCount, failureCount: response.failureCount };
  }

  /**
   * Unsubscribe device from topic
   */
  async unsubscribeFromTopic(fcmTokens, topic) {
    const messaging = _getMessaging();
    if (!messaging) throw new AppError('Firebase not configured', 503, 'FCM_NOT_CONFIGURED');

    const tokens = Array.isArray(fcmTokens) ? fcmTokens : [fcmTokens];
    const response = await messaging.unsubscribeFromTopic(tokens, topic);
    return { successCount: response.successCount, failureCount: response.failureCount };
  }

  /**
   * Send test notification
   */
  async sendTest(userId) {
    return this.sendToUser(userId, {
      title: '🔔 Test Notification',
      body: 'This is a test notification from GoMotarCar. If you receive this, push notifications are working correctly!',
      type: 'system',
      data: { test: 'true', timestamp: Date.now().toString() },
    });
  }
}

module.exports = new PushService();
