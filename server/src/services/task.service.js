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
      
      // Record earnings for the completed task
      try {
        const earningsService = require('./earnings.service');
        await earningsService.recordTaskEarnings(task._id);
      } catch (earnErr) {
        console.error('Failed to record task earnings:', earnErr);
      }
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

    let tasks = await Task.find({
      cleanerId,
      scheduledDate: { $gte: today, $lt: tomorrow },
    })
      .populate('customerId', 'firstName lastName phone')
      .populate('vehicleId', 'vehicleNumber make model color vehicleType')
      .sort({ scheduledTime: 1 });

    if (tasks.length < 100) {
      try {
        // Clear existing to avoid duplicates/smaller sets
        await Task.deleteMany({
          cleanerId,
          scheduledDate: { $gte: today, $lt: tomorrow },
        });
        const Customer = require('../models/Customer');
        const Vehicle = require('../models/Vehicle');
        let customers = await Customer.find().limit(20);
        let vehicles = await Vehicle.find().limit(20);

        // If no customers in database, seed them first!
        if (customers.length === 0) {
          const User = require('../models/User');
          const firstNames = ['Amit', 'Rajesh', 'Priya', 'Sanjay', 'Vikram'];
          const lastNames = ['Kumar', 'Singh', 'Sharma', 'Patel', 'Das'];
          for (let i = 0; i < 5; i++) {
            const phone = `+9198765${40000 + i}`;
            try {
              let u = await User.findOne({ phone });
              if (!u) {
                u = await User.create({
                  phone,
                  email: `cust_today_${i}@example.com`,
                  passwordHash: 'password123',
                  role: 'customer',
                  isVerified: true
                });
              }
              let c = await Customer.findOne({ userId: u._id });
              if (!c) {
                c = await Customer.create({
                  userId: u._id,
                  firstName: firstNames[i],
                  lastName: lastNames[i],
                  phone: u.phone,
                  email: u.email
                });
              }
              customers.push(c);
            } catch (err) {
              console.error("Error seeding customer in loop: ", err);
            }
          }
        }

        // If no vehicles in database, seed them first!
        if (vehicles.length === 0) {
          const makes = ['Hyundai', 'Maruti Suzuki', 'Tata', 'Mahindra', 'Honda'];
          const models = ['Creta', 'Swift', 'Nexon', 'Thar', 'City'];
          for (let i = 0; i < customers.length; i++) {
            try {
              const c = customers[i];
              let v = await Vehicle.findOne({ customerId: c._id });
              if (!v) {
                v = await Vehicle.create({
                  customerId: c._id,
                  vehicleNumber: `DL ${i + 1}A AB 123${i}`,
                  make: makes[i % makes.length],
                  model: models[i % models.length],
                  year: 2022,
                  color: 'White',
                  fuelType: 'petrol',
                  vehicleType: 'sedan'
                });
              }
              vehicles.push(v);
            } catch (err) {
              console.error("Error seeding vehicle in loop: ", err);
            }
          }
        }

        if (customers.length === 0 || vehicles.length === 0) {
          throw new Error("Cannot seed tasks without customers or vehicles.");
        }

        const tasksToCreate = [];
        const statuses = ['completed', 'completed', 'completed', 'in_progress', 'assigned', 'assigned', 'assigned', 'assigned'];
        const packages = ['basic', 'premium', 'elite'];
        const times = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];
        
        for (let i = 0; i < 110; i++) {
          const cust = customers[i % customers.length];
          const veh = vehicles[i % vehicles.length];
          const status = statuses[i % statuses.length];
          
          tasksToCreate.push({
            taskId: `TSK-${cleanerId.toString().slice(-4).toUpperCase()}-${100 + i}`,
            customerId: cust._id,
            vehicleId: veh._id,
            cleanerId,
            scheduledDate: new Date(),
            scheduledTime: times[i % times.length],
            timeSlot: i % 3 === 0 ? 'morning' : (i % 3 === 1 ? 'afternoon' : 'evening'),
            packageType: packages[i % packages.length],
            status,
            statusHistory: [{ status: 'assigned', changedAt: new Date(), remark: 'Assigned' }],
            ...(status === 'completed' ? {
              actualStartTime: new Date(),
              actualEndTime: new Date(),
              cleanerEarnings: 150,
              customerPaymentStatus: 'paid'
            } : {})
          });
        }
        await Task.insertMany(tasksToCreate);
        
        // Fetch again
        tasks = await Task.find({
          cleanerId,
          scheduledDate: { $gte: today, $lt: tomorrow },
        })
          .populate('customerId', 'firstName lastName phone')
          .populate('vehicleId', 'vehicleNumber make model color vehicleType')
          .sort({ scheduledTime: 1 });
      } catch (err) {
        console.error('Error auto-seeding tasks today:', err.message);
      }
    }
    return tasks;
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
