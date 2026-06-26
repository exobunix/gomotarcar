const Task = require('../models/Task');
const Cleaner = require('../models/Cleaner');

module.exports = (io, socket) => {
  // Admin assigns a cleaner to a task
  socket.on('task:assign', async (data) => {
    try {
      const { taskId, cleanerId } = data;

      const task = await Task.findByIdAndUpdate(
        taskId,
        { cleanerId, status: 'assigned' },
        { new: true }
      ).populate('cleanerId', 'firstName lastName cleanerId userId');

      if (!task) {
        return socket.emit('error', { code: 'TASK_NOT_FOUND', message: 'Task not found' });
      }

      // Notify the cleaner
      if (task.cleanerId?.userId) {
        io.to(`user:${task.cleanerId.userId}`).emit('task:assigned', {
          taskId: task._id,
          taskIdCode: task.taskId,
          scheduledDate: task.scheduledDate,
          scheduledTime: task.scheduledTime,
        });
      }

      socket.emit('task:assign-confirmed', {
        taskId: task._id,
        cleanerId: task.cleanerId?._id,
        status: 'assigned',
      });
    } catch (error) {
      socket.emit('error', { code: 'ASSIGN_FAILED', message: error.message });
    }
  });

  // New task created - notify available cleaners in zone
  socket.on('task:created', async (data) => {
    try {
      const { taskId, zoneId } = data;
      const task = await Task.findById(taskId);

      if (!task) {
        return socket.emit('error', { code: 'TASK_NOT_FOUND', message: 'Task not found' });
      }

      // Notify zone or supervisor
      if (zoneId) {
        io.to(`zone:${zoneId}`).emit('task:new', {
          taskId: task._id,
          taskIdCode: task.taskId,
          scheduledDate: task.scheduledDate,
          scheduledTime: task.scheduledTime,
          vehicleId: task.vehicleId,
          packageType: task.packageType,
        });
      }

      socket.emit('task:created-broadcasted', { taskId: task._id });
    } catch (error) {
      socket.emit('error', { code: 'TASK_BROADCAST_FAILED', message: error.message });
    }
  });

  // Cleaner requests task summary
  socket.on('task:my-tasks', async (date) => {
    try {
      const targetDate = date ? new Date(date) : new Date();
      targetDate.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const tasks = await Task.find({
        cleanerId: socket.cleanerId,
        scheduledDate: { $gte: targetDate, $lte: endOfDay },
      })
        .populate('customerId', 'firstName lastName phone')
        .populate('vehicleId', 'vehicleNumber make model color')
        .sort({ scheduledTime: 1 });

      socket.emit('task:my-tasks-data', tasks);
    } catch (error) {
      socket.emit('error', { code: 'MY_TASKS_FAILED', message: error.message });
    }
  });

  // Supervisor requests tasks for their zone
  socket.on('task:zone-tasks', async (zoneId) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      const tasks = await Task.find({
        scheduledDate: { $gte: today, $lte: endOfDay },
      })
        .populate('cleanerId', 'firstName lastName cleanerId')
        .populate('vehicleId', 'vehicleNumber')
        .sort({ scheduledTime: 1 });

      socket.emit('task:zone-tasks-data', tasks);
    } catch (error) {
      socket.emit('error', { code: 'ZONE_TASKS_FAILED', message: error.message });
    }
  });
};
