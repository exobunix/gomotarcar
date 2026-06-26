const Task = require('../models/Task');
const Cleaner = require('../models/Cleaner');
const Customer = require('../models/Customer');
const Vehicle = require('../models/Vehicle');
const { AppError } = require('../middleware/errorHandler');
const { generateTaskId } = require('../utils/helpers');
const socketEmitter = require('../socket/emitter');

class TaskService {
  /**
   * Create a new cleaning task
   */
  async create(data) {
    const { customerId, vehicleId, cleanerId, supervisorId, subscriptionId,
      scheduledDate, scheduledTime, timeSlot, packageType, cleaningType,
      services, specialInstructions, location } = data;

    const taskId = generateTaskId();

    const task = await Task.create({
      taskId, customerId, vehicleId, cleanerId, supervisorId,
      subscriptionId, scheduledDate, scheduledTime,
      timeSlot: timeSlot || 'morning', packageType, cleaningType,
      services: services || [], specialInstructions, location,
      status: 'assigned',
      statusHistory: [{ status: 'assigned', changedAt: new Date(), remark: 'Task created' }],
    });

    return task;
  }

  /**
   * Get task by ID
   */
  async getById(taskId) {
    const task = await Task.findById(taskId)
      .populate('customerId', 'firstName lastName phone')
      .populate('vehicleId', 'vehicleNumber make model color')
      .populate('cleanerId', 'firstName lastName cleanerId phone photo')
      .populate('supervisorId', 'phone');
    if (!task) throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
    return task;
  }

  /**
   * Get task by task ID string
   */
  async getByTaskId(taskIdStr) {
    const task = await Task.findOne({ taskId: taskIdStr })
      .populate('customerId', 'firstName lastName phone')
      .populate('vehicleId', 'vehicleNumber make model')
      .populate('cleanerId', 'firstName lastName cleanerId');
    if (!task) throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
    return task;
  }

  /**
   * Assign cleaner to task
   */
  async assignCleaner(taskId, cleanerId) {
    const task = await Task.findById(taskId);
    if (!task) throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');

    const cleaner = await Cleaner.findById(cleanerId);
    if (!cleaner) throw new AppError('Cleaner not found', 404, 'TASK_CLEANER_NOT_FOUND');
    if (!cleaner.isActive) throw new AppError('Cleaner is not active', 400, 'TASK_CLEANER_INACTIVE');

    task.cleanerId = cleanerId;
    task.status = 'assigned';
    task.statusHistory.push({
      status: 'assigned',
      changedBy: cleanerId,
      changedAt: new Date(),
      remark: `Assigned to ${cleaner.firstName} ${cleaner.lastName || ''}`,
    });
    socketEmitter.emitTaskAssigned(task);
    socketEmitter.emitDashboardUpdate({ type: 'task_assigned', taskId: task._id, cleanerId });
    await task.save();
    return task;
  }

  /**
   * Start task (cleaner check-in)
   */
  async startTask(taskId) {
    const task = await Task.findById(taskId);
    if (!task) throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
    if (task.status !== 'assigned') throw new AppError('Task is not in assigned state', 400, 'TASK_WRONG_STATUS');

    task.status = 'in_progress';
    task.actualStartTime = new Date();
    task.statusHistory.push({
      status: 'in_progress',
      changedAt: new Date(),
      remark: 'Task started',
    });
    socketEmitter.emitTaskStarted(task);
    socketEmitter.emitDashboardUpdate({ type: 'task_started', taskId: task._id });
    await task.save();
    return task;
  }

  /**
   * Complete task
   */
  async completeTask(taskId, { afterPhotos, qrVerified, cleanerEarnings } = {}) {
    const task = await Task.findById(taskId);
    if (!task) throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
    if (task.status !== 'in_progress') throw new AppError('Task is not in progress', 400, 'TASK_WRONG_STATUS');

    task.status = 'completed';
    task.actualEndTime = new Date();
    if (afterPhotos) task.afterPhotos = afterPhotos;
    if (qrVerified !== undefined) task.qrVerified = qrVerified;
    if (qrVerified) task.qrScannedAt = new Date();
    if (cleanerEarnings !== undefined) task.cleanerEarnings = cleanerEarnings;
    task.statusHistory.push({
      status: 'completed',
      changedAt: new Date(),
      remark: 'Task completed',
    });
    await task.save();

    // Update vehicle cleaning history
    const cleaner = task.cleanerId ? await Cleaner.findById(task.cleanerId).select('firstName lastName') : null;
    await Vehicle.findByIdAndUpdate(task.vehicleId, {
      $inc: { totalCleanings: 1 },
      lastCleaning: new Date(),
      $push: {
        cleaningHistory: {
          taskId: task._id,
          date: new Date(),
          cleanerId: task.cleanerId,
          cleanerName: cleaner ? `${cleaner.firstName} ${cleaner.lastName}` : '',
          packageType: task.packageType,
          status: 'completed',
        },
      },
    });

    // Update cleaner stats
    if (task.cleanerId) {
      await Cleaner.findByIdAndUpdate(task.cleanerId, {
        $inc: { 'stats.totalTasksCompleted': 1, 'stats.currentMonthTasks': 1 },
      });
    }

    socketEmitter.emitTaskCompleted(task);
    socketEmitter.emitDashboardUpdate({ type: 'task_completed', taskId: task._id });
    return task;
  }

  /**
   * Mark task as missed
   */
  async markMissed(taskId, reason) {
    const task = await Task.findById(taskId);
    if (!task) throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');

    task.status = 'missed';
    task.statusHistory.push({
      status: 'missed',
      changedAt: new Date(),
      remark: reason || 'Task missed',
    });
    await task.save();
    return task;
  }

  /**
   * Report issue on task
   */
  async reportIssue(taskId, issueId) {
    const task = await Task.findByIdAndUpdate(taskId, { hasIssue: true, issueId }, { new: true });
    if (!task) throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
    return task;
  }

  /**
   * List tasks with filtering
   */
  async list({ page = 1, limit = 20, status, cleanerId, customerId, vehicleId,
    supervisorId, scheduledDate, fromDate, toDate, search } = {}) {
    const query = {};
    if (status) query.status = status;
    if (cleanerId) query.cleanerId = cleanerId;
    if (customerId) query.customerId = customerId;
    if (vehicleId) query.vehicleId = vehicleId;
    if (supervisorId) query.supervisorId = supervisorId;
    if (scheduledDate) query.scheduledDate = new Date(scheduledDate);
    if (fromDate || toDate) {
      query.scheduledDate = {};
      if (fromDate) query.scheduledDate.$gte = new Date(fromDate);
      if (toDate) query.scheduledDate.$lte = new Date(toDate);
    }

    const skip = (page - 1) * limit;
    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('customerId', 'firstName lastName phone')
        .populate('vehicleId', 'vehicleNumber make model')
        .populate('cleanerId', 'firstName lastName cleanerId')
        .sort({ scheduledDate: -1, createdAt: -1 }).skip(skip).limit(limit),
      Task.countDocuments(query),
    ]);

    return {
      data: tasks,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 },
    };
  }

  /**
   * Get today's tasks for a cleaner
   */
  async getTodayTasks(cleanerId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return Task.find({
      cleanerId,
      scheduledDate: { $gte: today, $lt: tomorrow },
    })
      .populate('customerId', 'firstName lastName phone')
      .populate('vehicleId', 'vehicleNumber make model color vehicleType')
      .sort({ scheduledTime: 1 });
  }

  /**
   * Get stats
   */
  async getStats() {
    const [total, assigned, inProgress, completed, missed] = await Promise.all([
      Task.countDocuments(),
      Task.countDocuments({ status: 'assigned' }),
      Task.countDocuments({ status: 'in_progress' }),
      Task.countDocuments({ status: 'completed' }),
      Task.countDocuments({ status: 'missed' }),
    ]);
    return { totalTasks: total, assigned, inProgress, completed, missed };
  }
}

module.exports = new TaskService();
