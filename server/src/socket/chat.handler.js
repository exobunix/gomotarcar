const ChatMessage = require('../models/ChatMessage');

module.exports = (io, socket) => {
  // Join conversation room
  socket.on('chat:join', (conversationId) => {
    socket.join(`chat:${conversationId}`);
  });

  // Leave conversation room
  socket.on('chat:leave', (conversationId) => {
    socket.leave(`chat:${conversationId}`);
  });

  // Send message
  socket.on('chat:message', async (data) => {
    try {
      const { conversationId, receiverId, message, messageType = 'text', attachment } = data;

      const chatMessage = await ChatMessage.create({
        conversationId,
        senderId: socket.userId,
        receiverId,
        message,
        messageType,
        attachment,
        isRead: false,
        sentAt: new Date(),
      });

      // Send to conversation room
      io.to(`chat:${conversationId}`).emit('chat:message', {
        _id: chatMessage._id,
        conversationId,
        senderId: socket.userId,
        receiverId,
        message,
        messageType,
        attachment,
        sentAt: chatMessage.sentAt,
      });

      // Send notification to receiver
      io.to(`user:${receiverId}`).emit('chat:new-message', {
        conversationId,
        senderId: socket.userId,
        preview: message?.slice(0, 100),
        sentAt: chatMessage.sentAt,
      });

      socket.emit('chat:message-sent', { messageId: chatMessage._id });
    } catch (error) {
      socket.emit('error', { code: 'CHAT_SEND_FAILED', message: error.message });
    }
  });

  // Typing indicator
  socket.on('chat:typing', (data) => {
    const { conversationId, receiverId, isTyping } = data;
    socket.to(`chat:${conversationId}`).emit('chat:typing', {
      conversationId,
      senderId: socket.userId,
      isTyping,
    });
  });

  // Mark messages as read
  socket.on('chat:read', async (data) => {
    try {
      const { conversationId, messageIds } = data;

      const result = await ChatMessage.updateMany(
        { _id: { $in: messageIds }, receiverId: socket.userId },
        { isRead: true, readAt: new Date() }
      );

      io.to(`chat:${conversationId}`).emit('chat:read-receipt', {
        messageIds,
        readBy: socket.userId,
        readAt: new Date(),
      });

      socket.emit('chat:read-confirmed', { modifiedCount: result.modifiedCount });
    } catch (error) {
      socket.emit('error', { code: 'CHAT_READ_FAILED', message: error.message });
    }
  });

  // Get unread count
  socket.on('chat:unread', async () => {
    try {
      const count = await ChatMessage.countDocuments({
        receiverId: socket.userId,
        isRead: false,
      });
      socket.emit('chat:unread-count', { count });
    } catch (error) {
      socket.emit('error', { code: 'CHAT_UNREAD_FAILED', message: error.message });
    }
  });
};
