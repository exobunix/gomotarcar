const Complaint = require('../models/Complaint');
const Customer = require('../models/Customer');
const { AppError } = require('../middleware/errorHandler');
const { generateComplaintId } = require('../utils/helpers');

const socketEmitter = require('../socket/emitter');

class ComplaintService {
  /**
   * Create a new complaint
   */
  async create(data) {
    const { customerId, serviceType, referenceId, category, description, images, priority } = data;

    const customer = await Customer.findById(customerId);
    if (!customer) throw new AppError('Customer not found', 404, 'CMP_CUSTOMER_NOT_FOUND');

    const ticketNumber = generateComplaintId();

    const complaint = await Complaint.create({
      ticketNumber, customerId, serviceType, referenceId,
      category, description, images: images || [],
      priority: priority || 'medium',
      status: 'open',
    });

    socketEmitter.emitComplaintCreated(complaint, customerId);
    return complaint.populate('customerId', 'firstName lastName phone');
  }

  /**
   * Assign complaint to staff
   */
  async assign(complaintId, userId) {
    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      { assignedTo: userId, status: 'in_progress' },
      { new: true }
    );
    if (!complaint) throw new AppError('Complaint not found', 404, 'CMP_NOT_FOUND');
    return complaint;
  }

  /**
   * Resolve complaint
   */
  async resolve(complaintId, { resolution, resolvedBy } = {}) {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) throw new AppError('Complaint not found', 404, 'CMP_NOT_FOUND');

    complaint.status = 'resolved';
    complaint.resolution = resolution;
    complaint.resolvedAt = new Date();
    if (resolvedBy) complaint.assignedTo = resolvedBy;
    await complaint.save();

    socketEmitter.emitComplaintResolved(complaint, complaint.customerId);
    return complaint;
  }

  /**
   * Close complaint
   */
  async close(complaintId, { customerRating } = {}) {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) throw new AppError('Complaint not found', 404, 'CMP_NOT_FOUND');

    complaint.status = 'closed';
    if (customerRating !== undefined) complaint.customerRating = customerRating;
    await complaint.save();

    return complaint;
  }

  /**
   * Update priority
   */
  async updatePriority(complaintId, priority) {
    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      { priority },
      { new: true }
    );
    if (!complaint) throw new AppError('Complaint not found', 404, 'CMP_NOT_FOUND');
    return complaint;
  }

  /**
   * Get complaint by ID
   */
  async getById(complaintId) {
    const complaint = await Complaint.findById(complaintId)
      .populate('customerId', 'firstName lastName phone')
      .populate('assignedTo', 'phone');
    if (!complaint) throw new AppError('Complaint not found', 404, 'CMP_NOT_FOUND');
    return complaint;
  }

  /**
   * Get complaint by ticket number
   */
  async getByTicketNumber(ticketNumber) {
    const complaint = await Complaint.findOne({ ticketNumber })
      .populate('customerId', 'firstName lastName phone')
      .populate('assignedTo', 'phone');
    if (!complaint) throw new AppError('Complaint not found', 404, 'CMP_NOT_FOUND');
    return complaint;
  }

  /**
   * List complaints
   */
  async list({ page = 1, limit = 20, status, priority, category, customerId, serviceType, search } = {}) {
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (customerId) query.customerId = customerId;
    if (serviceType) query.serviceType = serviceType;
    if (search) {
      query.$or = [
        { ticketNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .populate('customerId', 'firstName lastName phone')
        .populate('assignedTo', 'phone')
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      Complaint.countDocuments(query),
    ]);

    return {
      data: complaints,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 },
    };
  }

  /**
   * Get stats
   */
  async getStats() {
    const [total, open, inProgress, resolved, closed, critical] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'open' }),
      Complaint.countDocuments({ status: 'in_progress' }),
      Complaint.countDocuments({ status: 'resolved' }),
      Complaint.countDocuments({ status: 'closed' }),
      Complaint.countDocuments({ priority: 'critical', status: { $ne: 'closed' } }),
    ]);
    return { totalComplaints: total, open, inProgress, resolved, closed, critical };
  }
}

module.exports = new ComplaintService();
