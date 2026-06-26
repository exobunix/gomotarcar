const { Wallet, WalletTransaction } = require('../models/Wallet');
const Payment = require('../models/Payment');
const { AppError } = require('../middleware/errorHandler');
const paymentService = require('./payment.service');

class WalletService {
  /**
   * Get or create wallet for an entity
   */
  async getOrCreateWallet(ownerType, ownerId) {
    let wallet = await Wallet.findOne({ ownerType, ownerId });
    if (!wallet) {
      wallet = await Wallet.create({ ownerType, ownerId, balance: 0 });
    }
    return wallet;
  }

  /**
   * Get wallet balance
   */
  async getBalance(ownerType, ownerId) {
    const wallet = await this.getOrCreateWallet(ownerType, ownerId);
    return { balance: wallet.balance, walletId: wallet._id };
  }

  /**
   * Top-up wallet via Razorpay
   */
  async topUp(ownerType, ownerId, amount, { payerId } = {}) {
    const wallet = await this.getOrCreateWallet(ownerType, ownerId);
    const payer = payerId || ownerId;

    // Create Razorpay order
    const order = await paymentService.createOrder({
      amount,
      purpose: 'wallet_topup',
      payerId: payer,
      payerType: ownerType,
      notes: { walletId: wallet._id.toString(), ownerType, ownerId: ownerId.toString() },
    });

    return order;
  }

  /**
   * Complete wallet top-up after payment verification
   */
  async completeTopUp({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
    const payment = await paymentService.capturePayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature });
    const walletId = payment.notes?.walletId;

    if (!walletId) {
      throw new AppError('Wallet reference not found in payment', 400, 'WALLET_REF_MISSING');
    }

    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      throw new AppError('Wallet not found', 404, 'WALLET_NOT_FOUND');
    }

    const balanceBefore = wallet.balance;
    wallet.balance += payment.amount;
    wallet.totalCredited += payment.amount;
    wallet.lastTransactionAt = new Date();
    await wallet.save();

    // Record transaction
    await WalletTransaction.create({
      walletId: wallet._id,
      type: 'credit',
      amount: payment.amount,
      balanceBefore,
      balanceAfter: wallet.balance,
      purpose: 'wallet_topup',
      referenceType: 'payment',
      referenceId: payment._id,
      description: `Wallet top-up of ₹${payment.amount}`,
      paymentMethod: 'razorpay',
      razorpayPaymentId,
      status: 'completed',
    });

    return { wallet, payment };
  }

  /**
   * Deduct from wallet (for payments)
   */
  async deduct(walletId, amount, { purpose, referenceType, referenceId, description, performedBy } = {}) {
    const wallet = await Wallet.findById(walletId);
    if (!wallet) throw new AppError('Wallet not found', 404, 'WALLET_NOT_FOUND');
    if (wallet.status !== 'active') throw new AppError('Wallet is frozen', 400, 'WALLET_FROZEN');
    if (wallet.balance < amount) throw new AppError('Insufficient wallet balance', 400, 'WALLET_INSUFFICIENT_BALANCE');

    const balanceBefore = wallet.balance;
    wallet.balance -= amount;
    wallet.totalDebited += amount;
    wallet.lastTransactionAt = new Date();
    await wallet.save();

    const transaction = await WalletTransaction.create({
      walletId: wallet._id,
      type: 'debit',
      amount,
      balanceBefore,
      balanceAfter: wallet.balance,
      purpose: purpose || 'payment',
      referenceType,
      referenceId,
      description: description || `Debit of ₹${amount}`,
      status: 'completed',
      performedBy,
    });

    return { wallet, transaction };
  }

  /**
   * Credit to wallet (for refunds, incentives, bonuses)
   */
  async credit(walletId, amount, { purpose, referenceType, referenceId, description, performedBy } = {}) {
    const wallet = await Wallet.findById(walletId);
    if (!wallet) throw new AppError('Wallet not found', 404, 'WALLET_NOT_FOUND');

    const balanceBefore = wallet.balance;
    wallet.balance += amount;
    wallet.totalCredited += amount;
    wallet.lastTransactionAt = new Date();
    await wallet.save();

    const transaction = await WalletTransaction.create({
      walletId: wallet._id,
      type: 'credit',
      amount,
      balanceBefore,
      balanceAfter: wallet.balance,
      purpose: purpose || 'refund',
      referenceType,
      referenceId,
      description: description || `Credit of ₹${amount}`,
      status: 'completed',
      performedBy,
    });

    return { wallet, transaction };
  }

  /**
   * Get transaction history
   */
  async getTransactions(walletId, { page = 1, limit = 20, type, purpose } = {}) {
    const query = { walletId };
    if (type) query.type = type;
    if (purpose) query.purpose = purpose;

    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      WalletTransaction.find(query)
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      WalletTransaction.countDocuments(query),
    ]);

    return {
      data: transactions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 },
    };
  }

  /**
   * Get wallet details with stats
   */
  async getWalletDetails(ownerType, ownerId) {
    const wallet = await this.getOrCreateWallet(ownerType, ownerId);
    const recentTransactions = await WalletTransaction.find({ walletId: wallet._id })
      .sort({ createdAt: -1 }).limit(10);

    return {
      wallet,
      recentTransactions,
    };
  }

  /**
   * Transfer between wallets (admin only)
   */
  async transfer(fromWalletId, toWalletId, amount, { description, performedBy } = {}) {
    await this.deduct(fromWalletId, amount, {
      purpose: 'adjustment',
      description: description || `Transfer to ${toWalletId}`,
      performedBy,
    });
    await this.credit(toWalletId, amount, {
      purpose: 'adjustment',
      description: description || `Transfer from ${fromWalletId}`,
      performedBy,
    });
    return { amount, fromWalletId, toWalletId };
  }

  /**
   * Get wallet stats
   */
  async getStats() {
    const totalWallets = await Wallet.countDocuments();
    const activeWallets = await Wallet.countDocuments({ status: 'active' });
    const totalBalance = await Wallet.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$balance' } } },
    ]);
    return { totalWallets, activeWallets, totalBalance: totalBalance[0]?.total || 0 };
  }
}

module.exports = new WalletService();
