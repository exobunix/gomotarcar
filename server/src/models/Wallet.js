const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  ownerType: {
    type: String,
    enum: ['customer', 'cleaner', 'franchise'],
    required: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'ownerType',
  },
  balance: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalCredited: {
    type: Number,
    default: 0,
  },
  totalDebited: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'frozen', 'closed'],
    default: 'active',
  },
  lastTransactionAt: {
    type: Date,
  },
  pin: {
    type: String,
    select: false,
  },
}, { timestamps: true });

walletSchema.index({ ownerType: 1, ownerId: 1 }, { unique: true });

const walletTransactionSchema = new mongoose.Schema({
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true,
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  balanceBefore: {
    type: Number,
    required: true,
  },
  balanceAfter: {
    type: Number,
    required: true,
  },
  purpose: {
    type: String,
    enum: [
      'wallet_topup', 'payment', 'refund', 'payout',
      'incentive', 'bonus', 'adjustment', 'fee_deduction',
    ],
    required: true,
  },
  referenceType: {
    type: String,
    enum: ['payment', 'subscription', 'booking', 'payout', 'earnings'],
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  description: {
    type: String,
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'bank_transfer', 'upi', 'adjustment'],
  },
  razorpayPaymentId: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'reversed'],
    default: 'completed',
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  note: String,
}, { timestamps: true });

walletTransactionSchema.index({ walletId: 1, createdAt: -1 });
walletTransactionSchema.index({ referenceId: 1 });

module.exports = {
  Wallet: mongoose.model('Wallet', walletSchema),
  WalletTransaction: mongoose.model('WalletTransaction', walletTransactionSchema),
};
