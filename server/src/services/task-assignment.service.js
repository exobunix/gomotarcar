const Task = require('../models/Task');
const Cleaner = require('../models/Cleaner');
const { AppError } = require('../middleware/errorHandler');

class TaskAssignmentService {
  /**
   * Auto-assign tasks to available cleaners
   */
  async autoAssign({ date, zoneId, preferredCleanerId } = {}) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Find unassigned tasks for the date
    const unassignedTasks = await Task.find({
      scheduledDate: { $gte: targetDate, $lte: endOfDay },
      cleanerId: { $exists: false },
      status: 'assigned',
    }).sort({ scheduledTime: 1 });

    if (unassignedTasks.length === 0) {
      return { assigned: 0, message: 'No unassigned tasks found' };
    }

    // Find available cleaners
    const query = { isActive: true, verificationStatus: 'verified' };
    if (zoneId) query.assignedZone = zoneId;

    const cleaners = await Cleaner.find(query).sort({ 'stats.totalTasksCompleted': 1 });

    if (cleaners.length === 0) {
      return { assigned: 0, message: 'No available cleaners found' };
    }

    // Calculate cleaner workload for the day
    const todayTasks = await Task.aggregate([
      {
        $match: {
          cleanerId: { $in: cleaners.map(c => c._id) },
          scheduledDate: { $gte: targetDate, $lte: endOfDay },
          status: { $in: ['assigned', 'in_progress'] },
        },
      },
      {
        $group: {
          _id: '$cleanerId',
          count: { $sum: 1 },
        },
      },
    ]);

    const workloadMap = {};
    todayTasks.forEach(t => { workloadMap[t._id.toString()] = t.count; });

    // Sort cleaners by workload (least loaded first)
    cleaners.sort((a, b) => (workloadMap[a._id.toString()] || 0) - (workloadMap[b._id.toString()] || 0));

    // Assign tasks round-robin to least loaded cleaners
    let assigned = 0;
    for (const task of unassignedTasks) {
      const cleaner = cleaners[assigned % cleaners.length];
      task.cleanerId = cleaner._id;
      task.statusHistory.push({
        status: 'assigned',
        changedAt: new Date(),
        remark: `Auto-assigned to ${cleaner.firstName} ${cleaner.lastName || ''}`,
      });
      await task.save();
      assigned++;
    }

    return { assigned, totalTasks: unassignedTasks.length, cleanersUsed: Math.min(cleaners.length, assigned) };
  }

  /**
   * Get cleaner availability for a date
   */
  async getCleanerAvailability({ date, zoneId } = {}) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const query = { isActive: true, verificationStatus: 'verified' };
    if (zoneId) query.assignedZone = zoneId;

    const cleaners = await Cleaner.find(query).select('firstName lastName cleanerId stats assignedZone');

    const tasks = await Task.aggregate([
      {
        $match: {
          cleanerId: { $in: cleaners.map(c => c._id) },
          scheduledDate: { $gte: targetDate, $lte: endOfDay },
          status: { $in: ['assigned', 'in_progress', 'completed'] },
        },
      },
      {
        $group: {
          _id: '$cleanerId',
          taskCount: { $sum: 1 },
          completedCount: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        },
      },
    ]);

    const taskMap = {};
    tasks.forEach(t => { taskMap[t._id.toString()] = t; });

    return cleaners.map(cleaner => ({
      _id: cleaner._id,
      cleanerId: cleaner.cleanerId,
      name: `${cleaner.firstName} ${cleaner.lastName || ''}`,
      assignedZone: cleaner.assignedZone,
      stats: cleaner.stats,
      currentLoad: taskMap[cleaner._id.toString()]?.taskCount || 0,
      completedToday: taskMap[cleaner._id.toString()]?.completedCount || 0,
      available: !taskMap[cleaner._id.toString()] || taskMap[cleaner._id.toString()].taskCount < 5,
    }));
  }

  /**
   * Reassign task to another cleaner
   */
  async reassign(taskId, newCleanerId, reason) {
    const task = await Task.findById(taskId);
    if (!task) throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');

    const cleaner = await Cleaner.findById(newCleanerId);
    if (!cleaner) throw new AppError('Cleaner not found', 404, 'TASK_CLEANER_NOT_FOUND');
    if (!cleaner.isActive) throw new AppError('Cleaner is not active', 400, 'TASK_CLEANER_INACTIVE');

    const oldCleanerId = task.cleanerId;
    task.cleanerId = newCleanerId;
    task.statusHistory.push({
      status: task.status,
      changedAt: new Date(),
      remark: `Reassigned from ${oldCleanerId} to ${newCleanerId}. Reason: ${reason || 'Manual reassignment'}`,
    });
    await task.save();
    return task;
  }
}

module.exports = new TaskAssignmentService();
