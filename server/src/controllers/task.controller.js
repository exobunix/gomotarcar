const taskService = require('../services/task.service');
const taskAssignmentService = require('../services/task-assignment.service');

const taskController = {
  // Task CRUD
  create: async (req, res, next) => {
    try {
      const task = await taskService.create(req.body);
      res.status(201).json({ success: true, data: task });
    } catch (error) { next(error); }
  },

  list: async (req, res, next) => {
    try {
      const result = await taskService.list(req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) { next(error); }
  },

  getById: async (req, res, next) => {
    try {
      const task = await taskService.getById(req.params.id);
      res.status(200).json({ success: true, data: task });
    } catch (error) { next(error); }
  },

  getByTaskId: async (req, res, next) => {
    try {
      const task = await taskService.getByTaskId(req.params.taskId);
      res.status(200).json({ success: true, data: task });
    } catch (error) { next(error); }
  },

  getTodayTasks: async (req, res, next) => {
    try {
      const tasks = await taskService.getTodayTasks(req.params.cleanerId);
      res.status(200).json({ success: true, data: tasks });
    } catch (error) { next(error); }
  },

  // Assignment
  assignCleaner: async (req, res, next) => {
    try {
      const { cleanerId } = req.body;
      const task = await taskService.assignCleaner(req.params.id, cleanerId);
      res.status(200).json({ success: true, data: task });
    } catch (error) { next(error); }
  },

  autoAssign: async (req, res, next) => {
    try {
      const result = await taskAssignmentService.autoAssign(req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  getAvailability: async (req, res, next) => {
    try {
      const result = await taskAssignmentService.getCleanerAvailability(req.query);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  reassign: async (req, res, next) => {
    try {
      const { cleanerId, reason } = req.body;
      const task = await taskAssignmentService.reassign(req.params.id, cleanerId, reason);
      res.status(200).json({ success: true, data: task });
    } catch (error) { next(error); }
  },

  // Status transitions
  startTask: async (req, res, next) => {
    try {
      const task = await taskService.startTask(req.params.id);
      res.status(200).json({ success: true, data: task });
    } catch (error) { next(error); }
  },

  completeTask: async (req, res, next) => {
    try {
      const task = await taskService.completeTask(req.params.id, req.body);
      res.status(200).json({ success: true, data: task });
    } catch (error) { next(error); }
  },

  markMissed: async (req, res, next) => {
    try {
      const { reason } = req.body;
      const task = await taskService.markMissed(req.params.id, reason);
      res.status(200).json({ success: true, data: task });
    } catch (error) { next(error); }
  },

  recordEarnings: async (req, res, next) => {
    try {
      const earningsService = require('../services/earnings.service');
      const earnings = await earningsService.recordTaskEarnings(req.params.id);
      res.status(200).json({ success: true, data: earnings });
    } catch (error) { next(error); }
  },

  getStats: async (req, res, next) => {
    try {
      const stats = await taskService.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) { next(error); }
  },
};

module.exports = taskController;
