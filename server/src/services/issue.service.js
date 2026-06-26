const Issue = require('../models/Issue');
const { AppError } = require('../middleware/errorHandler');
const { generateIssueId } = require('../utils/helpers');

class IssueService {
  async create(data, userId) {
    const issue = await Issue.create({
      ...data,
      ticketNumber: generateIssueId(),
      reportedBy: userId,
      timeline: [{ status: 'open', note: 'Issue created', updatedBy: userId }],
    });
    return issue;
  }

  async getById(issueId) {
    const issue = await Issue.findById(issueId)
      .populate('reportedBy', 'firstName lastName cleanerId')
      .populate('assignedTo', 'firstName lastName phone')
      .populate('taskId');
    if (!issue) throw new AppError('Issue not found', 404, 'ISSUE_NOT_FOUND');
    return issue;
  }

  async list({ page = 1, limit = 20, status, priority, category, search } = {}) {
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { ticketNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [issues, total] = await Promise.all([
      Issue.find(query)
        .populate('reportedBy', 'firstName lastName cleanerId')
        .populate('assignedTo', 'firstName lastName phone')
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      Issue.countDocuments(query),
    ]);

    return {
      data: issues,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 },
    };
  }

  async update(issueId, updates, userId) {
    const issue = await Issue.findById(issueId);
    if (!issue) throw new AppError('Issue not found', 404, 'ISSUE_NOT_FOUND');

    if (updates.status) {
      issue.status = updates.status;
      issue.timeline.push({ status: updates.status, note: updates.note || '', updatedBy: userId });
      if (updates.status === 'resolved') {
        issue.resolvedAt = new Date();
        issue.resolvedBy = userId;
        issue.resolution = updates.resolution || '';
      }
    }
    if (updates.priority) issue.priority = updates.priority;
    if (updates.assignedTo) {
      issue.assignedTo = updates.assignedTo;
      issue.assignedAt = new Date();
      issue.timeline.push({ status: 'assigned', note: `Assigned to ${updates.assignedTo}`, updatedBy: userId });
    }
    if (updates.description) issue.description = updates.description;

    await issue.save();
    return issue;
  }

  async delete(issueId) {
    const issue = await Issue.findByIdAndDelete(issueId);
    if (!issue) throw new AppError('Issue not found', 404, 'ISSUE_NOT_FOUND');
    return { message: 'Issue deleted' };
  }

  async getStats() {
    const [total, open, inProgress, resolved, closed] = await Promise.all([
      Issue.countDocuments(),
      Issue.countDocuments({ status: 'open' }),
      Issue.countDocuments({ status: 'in_progress' }),
      Issue.countDocuments({ status: 'resolved' }),
      Issue.countDocuments({ status: 'closed' }),
    ]);
    const critical = await Issue.countDocuments({ priority: 'critical', status: { $ne: 'closed' } });
    return { totalIssues: total, open, inProgress, resolved, closed, critical };
  }
}

module.exports = new IssueService();
