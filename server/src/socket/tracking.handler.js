const Task = require('../models/Task');

module.exports = (io, socket) => {
  // Cleaner starts a task
  socket.on('task:start', async (taskId) => {
    try {
      const task = await Task.findById(taskId)
        .populate('customerId', 'firstName lastName')
        .populate('vehicleId', 'vehicleNumber make model');

      if (!task) {
        return socket.emit('error', { code: 'TASK_NOT_FOUND', message: 'Task not found' });
      }

      task.status = 'in_progress';
      task.actualStartTime = new Date();
      task.statusHistory.push({
        status: 'in_progress',
        changedAt: new Date(),
        remark: 'Task started via socket',
      });
      await task.save();

      // Notify customer
      io.to(`user:${task.customerId}`).emit('task:started', {
        taskId: task._id,
        taskIdCode: task.taskId,
        vehicleNumber: task.vehicleId?.vehicleNumber,
        status: 'in_progress',
        startedAt: task.actualStartTime,
      });

      // Notify supervisors
      if (task.supervisorId) {
        io.to(`user:${task.supervisorId}`).emit('task:started', {
          taskId: task._id,
          taskIdCode: task.taskId,
          cleanerId: socket.cleanerId,
          status: 'in_progress',
        });
      }

      socket.emit('task:start-confirmed', { taskId: task._id, status: 'in_progress' });
    } catch (error) {
      socket.emit('error', { code: 'TASK_START_FAILED', message: error.message });
    }
  });

  // Cleaner completes a task
  socket.on('task:complete', async (data) => {
    try {
      const { taskId, afterPhotos, qrVerified } = data;
      const task = await Task.findById(taskId)
        .populate('customerId', 'firstName lastName')
        .populate('vehicleId', 'vehicleNumber make model');

      if (!task) {
        return socket.emit('error', { code: 'TASK_NOT_FOUND', message: 'Task not found' });
      }

      task.status = 'completed';
      task.actualEndTime = new Date();
      if (afterPhotos) task.afterPhotos = afterPhotos;
      if (qrVerified !== undefined) {
        task.qrVerified = qrVerified;
        if (qrVerified) task.qrScannedAt = new Date();
      }
      task.statusHistory.push({
        status: 'completed',
        changedAt: new Date(),
        remark: 'Task completed via socket',
      });
      await task.save();

      // Notify customer
      io.to(`user:${task.customerId}`).emit('task:completed', {
        taskId: task._id,
        taskIdCode: task.taskId,
        vehicleNumber: task.vehicleId?.vehicleNumber,
        status: 'completed',
        completedAt: task.actualEndTime,
      });

      // Notify supervisors
      if (task.supervisorId) {
        io.to(`user:${task.supervisorId}`).emit('task:completed', {
          taskId: task._id,
          cleanerId: socket.cleanerId,
          status: 'completed',
        });
      }

      socket.emit('task:complete-confirmed', { taskId: task._id, status: 'completed' });
    } catch (error) {
      socket.emit('error', { code: 'TASK_COMPLETE_FAILED', message: error.message });
    }
  });

  // Customer requests task tracking
  socket.on('task:track', async (taskId) => {
    try {
      const task = await Task.findById(taskId)
        .select('taskId status scheduledDate scheduledTime actualStartTime actualEndTime cleanerId')
        .populate('cleanerId', 'firstName lastName cleanerId');

      if (!task) {
        return socket.emit('error', { code: 'TASK_NOT_FOUND', message: 'Task not found' });
      }

      socket.emit('task:tracking-data', {
        taskId: task._id,
        taskIdCode: task.taskId,
        status: task.status,
        scheduledDate: task.scheduledDate,
        scheduledTime: task.scheduledTime,
        actualStartTime: task.actualStartTime,
        actualEndTime: task.actualEndTime,
        cleaner: task.cleanerId ? {
          name: `${task.cleanerId.firstName} ${task.cleanerId.lastName || ''}`.trim(),
          cleanerId: task.cleanerId.cleanerId,
        } : null,
      });
    } catch (error) {
      socket.emit('error', { code: 'TRACKING_FAILED', message: error.message });
    }
  });

  // Admin requests task status update broadcast
  socket.on('task:status-update', async (data) => {
    try {
      const { taskId, status, note } = data;
      const task = await Task.findById(taskId);
      if (!task) {
        return socket.emit('error', { code: 'TASK_NOT_FOUND', message: 'Task not found' });
      }

      task.status = status;
      task.statusHistory.push({
        status,
        changedAt: new Date(),
        remark: note || `Status changed to ${status}`,
      });
      await task.save();

      // Broadcast to all stakeholders
      const rooms = [`task:${taskId}`];
      if (task.customerId) rooms.push(`user:${task.customerId}`);
      if (task.cleanerId) rooms.push(`cleaner:${task.cleanerId}`);
      if (task.supervisorId) rooms.push(`user:${task.supervisorId}`);

      io.to(rooms).emit('task:status-changed', {
        taskId: task._id,
        taskIdCode: task.taskId,
        status,
        note: note || '',
        timestamp: new Date(),
      });

      socket.emit('task:status-update-confirmed', { taskId: task._id, status });
    } catch (error) {
      socket.emit('error', { code: 'STATUS_UPDATE_FAILED', message: error.message });
    }
  });
};
