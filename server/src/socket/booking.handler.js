const ServiceBooking = require('../models/ServiceBooking');

module.exports = (io, socket) => {
  // Subscribe to booking updates
  socket.on('booking:subscribe', (bookingId) => {
    socket.join(`booking:${bookingId}`);
  });

  // Unsubscribe from booking updates
  socket.on('booking:unsubscribe', (bookingId) => {
    socket.leave(`booking:${bookingId}`);
  });

  // Booking status update
  socket.on('booking:status-update', async (data) => {
    try {
      const { bookingId, status, note } = data;
      const booking = await ServiceBooking.findById(bookingId);

      if (!booking) {
        return socket.emit('error', { code: 'BOOKING_NOT_FOUND', message: 'Booking not found' });
      }

      booking.status = status;
      booking.trackingTimeline.push({
        status,
        timestamp: new Date(),
        note: note || `Status changed to ${status}`,
      });
      await booking.save();

      // Broadcast to all subscribed
      io.to(`booking:${bookingId}`).emit('booking:status-changed', {
        bookingId: booking._id,
        bookingIdCode: booking.bookingId,
        status,
        timestamp: new Date(),
        note: note || '',
      });

      socket.emit('booking:status-update-confirmed', { bookingId: booking._id, status });
    } catch (error) {
      socket.emit('error', { code: 'BOOKING_UPDATE_FAILED', message: error.message });
    }
  });

  // New booking created
  socket.on('booking:created', async (bookingId) => {
    try {
      const booking = await ServiceBooking.findById(bookingId);

      if (!booking) {
        return socket.emit('error', { code: 'BOOKING_NOT_FOUND', message: 'Booking not found' });
      }

      // Notify franchise
      if (booking.franchiseId) {
        io.to(`franchise:${booking.franchiseId}`).emit('booking:new', {
          bookingId: booking._id,
          bookingIdCode: booking.bookingId,
          serviceName: booking.serviceName,
          slotDate: booking.slotDate,
          slotTime: booking.slotTime,
          status: booking.status,
        });
      }

      // Notify customer
      if (booking.customerId) {
        io.to(`user:${booking.customerId}`).emit('booking:confirmed', {
          bookingId: booking._id,
          bookingIdCode: booking.bookingId,
          status: 'booked',
        });
      }

      socket.emit('booking:created-broadcasted', { bookingId: booking._id });
    } catch (error) {
      socket.emit('error', { code: 'BOOKING_BROADCAST_FAILED', message: error.message });
    }
  });
};
