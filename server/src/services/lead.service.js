const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

class LeadService {
  /**
   * Create a new lead
   */
  async create(data) {
    const { name, phone, email, service, vehicleType, location, source, notes, customerId, createdBy } = data;

    // Check for duplicate by phone
    const existing = await Lead.findOne({ phone });
    if (existing) {
      throw new AppError('Lead with this phone number already exists', 409, 'LEAD_PHONE_EXISTS');
    }

    const lead = await Lead.create({
      name, phone, email, service, vehicleType, location,
      source: source || 'search',
      notes, customerId, createdBy,
      status: 'New',
      statusHistory: [{ status: 'New', changedBy: createdBy, remark: 'Lead created' }],
    });

    return lead.populate('createdBy', 'phone');
  }

  /**
   * List leads with filtering
   */
  async list({ page = 1, limit = 20, status, source, assignedTo, search, fromDate, toDate } = {}) {
    const query = {};
    if (status) query.status = status;
    if (source) query.source = source;
    if (assignedTo) query.assignedTo = assignedTo;
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { service: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [leads, total] = await Promise.all([
      Lead.find(query)
        .populate('assignedTo', 'phone')
        .populate('createdBy', 'phone')
        .populate('convertedToCustomerId', 'firstName lastName phone')
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      Lead.countDocuments(query),
    ]);

    return {
      data: leads,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get lead by ID
   */
  async getById(leadId) {
    const lead = await Lead.findById(leadId)
      .populate('assignedTo', 'phone role')
      .populate('createdBy', 'phone')
      .populate('convertedToCustomerId', 'firstName lastName phone email');
    if (!lead) throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND');
    return lead;
  }

  /**
   * Update lead status
   */
  async updateStatus(leadId, status, { notes, changedBy } = {}) {
    const lead = await Lead.findById(leadId);
    if (!lead) throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND');

    const validTransitions = {
      'New': ['Contacted', 'Lost'],
      'Contacted': ['Interested', 'Lost'],
      'Interested': ['Converted', 'Lost'],
      'Converted': [],
      'Lost': ['New', 'Contacted'],
    };

    const allowedTransitions = validTransitions[lead.status] || [];
    if (!allowedTransitions.includes(status) && status !== lead.status) {
      throw new AppError(
        `Cannot transition from ${lead.status} to ${status}. Allowed: ${allowedTransitions.join(', ') || 'none'}`,
        400,
        'LEAD_INVALID_TRANSITION'
      );
    }

    lead.status = status;
    if (notes) lead.notes = notes;
    
    lead.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy,
      remark: notes || `Status changed to ${status}`,
    });

    if (status === 'Converted') {
      lead.convertedAt = new Date();
    }
    if (status === 'Lost' && notes) {
      lead.lostReason = notes;
    }

    await lead.save();
    return lead;
  }

  /**
   * Convert lead to customer
   */
  async convertToCustomer(leadId, { createdBy } = {}) {
    const lead = await Lead.findById(leadId);
    if (!lead) throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND');
    if (lead.status === 'Converted') throw new AppError('Lead already converted', 400, 'LEAD_ALREADY_CONVERTED');

    // Check if customer already exists
    let customer = await Customer.findOne({ phone: lead.phone });
    if (!customer) {
      // Create user if doesn't exist
      let user = await User.findOne({ phone: lead.phone });
      if (!user) {
        user = await User.create({
          phone: lead.phone,
          email: lead.email,
          role: 'customer',
          isVerified: true,
          phoneVerified: true,
        });
      }

      const nameParts = (lead.name || '').split(' ');
      customer = await Customer.create({
        userId: user._id,
        firstName: nameParts[0] || lead.name || 'Lead',
        lastName: nameParts.slice(1).join(' ') || '',
        phone: lead.phone,
        email: lead.email,
      });
    }

    // Update lead
    lead.status = 'Converted';
    lead.convertedAt = new Date();
    lead.convertedToCustomerId = customer._id;
    lead.statusHistory.push({
      status: 'Converted',
      changedAt: new Date(),
      changedBy: createdBy,
      remark: 'Lead converted to customer',
    });
    await lead.save();

    return { lead, customer };
  }

  /**
   * Assign lead to staff
   */
  async assign(leadId, userId) {
    const lead = await Lead.findByIdAndUpdate(
      leadId,
      { assignedTo: userId, assignedAt: new Date() },
      { new: true }
    );
    if (!lead) throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND');
    return lead;
  }

  /**
   * Get lead analytics
   */
  async getAnalytics({ fromDate, toDate } = {}) {
    const match = {};
    if (fromDate || toDate) {
      match.createdAt = {};
      if (fromDate) match.createdAt.$gte = new Date(fromDate);
      if (toDate) match.createdAt.$lte = new Date(toDate);
    }

    const [total, byStatus, bySource, conversionRate] = await Promise.all([
      Lead.countDocuments(match),
      Lead.aggregate([
        { $match: match },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Lead.aggregate([
        { $match: match },
        { $group: { _id: '$source', count: { $sum: 1 } } },
      ]),
      Lead.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            converted: { $sum: { $cond: [{ $eq: ['$status', 'Converted'] }, 1, 0] } },
          },
        },
      ]),
    ]);

    const rate = conversionRate[0];
    return {
      totalLeads: total,
      byStatus: byStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
      bySource: bySource.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
      conversionRate: rate ? ((rate.converted / rate.total) * 100).toFixed(1) + '%' : '0%',
      totalConverted: rate?.converted || 0,
    };
  }
}

module.exports = new LeadService();
