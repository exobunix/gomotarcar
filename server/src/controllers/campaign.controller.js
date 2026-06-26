const Campaign = require('../models/Campaign');
const Notification = require('../models/Notification');
const User = require('../models/User');
const logger = require('../utils/logger');

const getCampaigns = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.status = status;

    const campaigns = await Campaign.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('createdBy', 'name');

    const total = await Campaign.countDocuments(query);
    res.json({
      success: true,
      data: campaigns,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (err) {
    logger.error('Campaign list error:', err);
    res.status(500).json({ success: false, error: { code: 'CAMPAIGN_ERROR', message: err.message } });
  }
};

const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('createdBy', 'name');
    if (!campaign) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Campaign not found' } });
    res.json({ success: true, data: campaign });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'CAMPAIGN_ERROR', message: err.message } });
  }
};

const createCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: campaign });
  } catch (err) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.message } });
  }
};

const updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!campaign) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Campaign not found' } });
    res.json({ success: true, data: campaign });
  } catch (err) {
    res.status(400).json({ success: false, error: { code: 'UPDATE_ERROR', message: err.message } });
  }
};

const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Campaign not found' } });
    res.json({ success: true, data: { message: 'Campaign deleted' } });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DELETE_ERROR', message: err.message } });
  }
};

const sendCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Campaign not found' } });

    if (campaign.status === 'sent') {
      return res.status(400).json({ success: false, error: { code: 'ALREADY_SENT', message: 'Campaign already sent' } });
    }

    campaign.status = 'sending';
    await campaign.save();

    // Find target users
    const targetQuery = {};
    if (campaign.targetRole) targetQuery.role = campaign.targetRole;
    const users = await User.find(targetQuery).select('_id fcmToken');

    // Create notifications for each user
    const notifications = users.map(user => ({
      recipientId: user._id,
      recipientRole: campaign.targetRole || 'all',
      type: campaign.type || 'announcement',
      title: campaign.name,
      body: campaign.message,
      data: { screen: campaign.deepLink || 'Notifications' },
      priority: campaign.priority || 'normal'
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    campaign.status = 'sent';
    campaign.sentAt = new Date();
    campaign.recipientCount = notifications.length;
    await campaign.save();

    logger.info(`Campaign ${campaign.name} sent to ${notifications.length} users`);
    res.json({ success: true, data: { ...campaign.toObject(), recipientCount: notifications.length } });
  } catch (err) {
    await Campaign.findByIdAndUpdate(req.params.id, { $set: { status: 'failed' } });
    logger.error('Campaign send error:', err);
    res.status(500).json({ success: false, error: { code: 'SEND_ERROR', message: err.message } });
  }
};

const cancelCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'cancelled', cancelledBy: req.user._id } },
      { new: true }
    );
    if (!campaign) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Campaign not found' } });
    res.json({ success: true, data: campaign });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'CANCEL_ERROR', message: err.message } });
  }
};

const getCampaignStats = async (req, res) => {
  try {
    const stats = await Campaign.aggregate([
      { $group: {
        _id: null,
        totalCampaigns: { $sum: 1 },
        sentCampaigns: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
        scheduledCampaigns: { $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] } },
        draftCampaigns: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
        failedCampaigns: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        totalRecipients: { $sum: { $ifNull: ['$recipientCount', 0] } }
      }}
    ]);
    res.json({ success: true, data: stats[0] || { totalCampaigns: 0, sentCampaigns: 0, scheduledCampaigns: 0, draftCampaigns: 0, failedCampaigns: 0, totalRecipients: 0 } });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'STATS_ERROR', message: err.message } });
  }
};

module.exports = { getCampaigns, getCampaignById, createCampaign, updateCampaign, deleteCampaign, sendCampaign, cancelCampaign, getCampaignStats };
