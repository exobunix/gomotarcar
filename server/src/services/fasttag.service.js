const FastTagTransaction = require('../models/FastTagTransaction');
const Vehicle = require('../models/Vehicle');
const Customer = require('../models/Customer');
const { AppError } = require('../middleware/errorHandler');
const { generateTransactionId } = require('../utils/helpers');

class FastTagService {
  /**
   * Recharge FastTag wallet
   */
  async recharge({ vehicleId, customerId, amount, paymentMethod = 'razorpay', paymentId, notes }) {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) throw new AppError('Vehicle not found', 404, 'FT_VEHICLE_NOT_FOUND');

    const customer = await Customer.findById(customerId);
    if (!customer) throw new AppError('Customer not found', 404, 'FT_CUSTOMER_NOT_FOUND');

    const transactionId = generateTransactionId('FT');

    // Get current balance
    const currentBalance = vehicle.fastTagBalance || 0;

    const transaction = await FastTagTransaction.create({
      transactionId,
      vehicleId,
      customerId,
      amount,
      openingBalance: currentBalance,
      closingBalance: currentBalance + amount,
      paymentMethod,
      paymentId,
      status: 'pending',
      type: 'recharge',
      notes,
    });

    return transaction;
  }

  /**
   * Confirm a FastTag recharge (after payment verification)
   */
  async confirmRecharge(transactionId) {
    const transaction = await FastTagTransaction.findOne({ transactionId });
    if (!transaction) throw new AppError('Transaction not found', 404, 'FT_NOT_FOUND');
    if (transaction.status !== 'pending') throw new AppError('Transaction already processed', 400, 'FT_ALREADY_PROCESSED');

    transaction.status = 'success';
    transaction.successAt = new Date();
    transaction.closingBalance = transaction.openingBalance + transaction.amount;
    await transaction.save();

    // Update vehicle balance
    await Vehicle.findByIdAndUpdate(transaction.vehicleId, {
      $inc: { fastTagBalance: transaction.amount },
      $push: {
        fastTagHistory: {
          transactionId: transaction._id,
          amount: transaction.amount,
          type: 'recharge',
          date: new Date(),
        },
      },
    });

    return transaction;
  }

  /**
   * Mark transaction as failed
   */
  async markFailed(transactionId, reason) {
    const transaction = await FastTagTransaction.findOne({ transactionId });
    if (!transaction) throw new AppError('Transaction not found', 404, 'FT_NOT_FOUND');

    transaction.status = 'failed';
    transaction.failedAt = new Date();
    transaction.failureReason = reason;
    await transaction.save();

    return transaction;
  }

  /**
   * Get FastTag balance for a vehicle
   */
  async getBalance(vehicleId) {
    const vehicle = await Vehicle.findById(vehicleId).select('vehicleNumber fastTagBalance');
    if (!vehicle) throw new AppError('Vehicle not found', 404, 'FT_VEHICLE_NOT_FOUND');

    return {
      vehicleId: vehicle._id,
      vehicleNumber: vehicle.vehicleNumber,
      balance: vehicle.fastTagBalance || 0,
    };
  }

  /**
   * Get transaction by ID
   */
  async getById(transactionId) {
    const transaction = await FastTagTransaction.findById(transactionId)
      .populate('vehicleId', 'vehicleNumber make model')
      .populate('customerId', 'firstName lastName phone');
    if (!transaction) throw new AppError('Transaction not found', 404, 'FT_NOT_FOUND');
    return transaction;
  }

  /**
   * List transactions with filtering
   */
  async list({ page = 1, limit = 20, vehicleId, customerId, status, type, fromDate, toDate } = {}) {
    const query = {};
    if (vehicleId) query.vehicleId = vehicleId;
    if (customerId) query.customerId = customerId;
    if (status) query.status = status;
    if (type) query.type = type;
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      FastTagTransaction.find(query)
        .populate('vehicleId', 'vehicleNumber')
        .populate('customerId', 'firstName lastName phone')
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      FastTagTransaction.countDocuments(query),
    ]);

    return {
      data: transactions,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get transaction history for a vehicle
   */
  async getVehicleHistory(vehicleId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      FastTagTransaction.find({ vehicleId })
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      FastTagTransaction.countDocuments({ vehicleId }),
    ]);

    return {
      data: transactions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 },
    };
  }

  /**
   * Get stats
   */
  async getStats() {
    const [total, success, failed, pending, totalAmount] = await Promise.all([
      FastTagTransaction.countDocuments(),
      FastTagTransaction.countDocuments({ status: 'success', type: 'recharge' }),
      FastTagTransaction.countDocuments({ status: 'failed' }),
      FastTagTransaction.countDocuments({ status: 'pending' }),
      FastTagTransaction.aggregate([
        { $match: { status: 'success', type: 'recharge' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    return {
      totalTransactions: total,
      successfulRecharges: success,
      failed: failed,
      pending,
      totalRechargeAmount: totalAmount[0]?.total || 0,
    };
  }
}

module.exports = new FastTagService();
