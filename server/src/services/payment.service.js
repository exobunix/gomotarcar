const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const Customer = require('../models/Customer');
const { getRazorpay } = require('../config/razorpay');
const { AppError } = require('../middleware/errorHandler');
const crypto = require('crypto');
const config = require('../config/env');

const socketEmitter = require('../socket/emitter');

class PaymentService {
  /**
   * Create a Razorpay order
   */
  async createOrder({ amount, currency = 'INR', receipt, notes = {}, purpose, referenceType, referenceId, payerId, payerType = 'customer' }) {
    const razorpay = getRazorpay();
    if (!razorpay) {
      throw new AppError('Payment gateway not configured', 503, 'PAY_GATEWAY_NOT_CONFIGURED');
    }

    const amountInPaise = Math.round(amount * 100);

    try {
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency,
        receipt: receipt || `rcpt_${Date.now()}`,
        notes,
      });

      // Save payment record
      const payment = await Payment.create({
        razorpayOrderId: order.id,
        payerType,
        payerId,
        amount,
        currency,
        purpose,
        referenceType,
        referenceId,
        receipt: order.receipt,
        notes,
        status: 'created',
      });

      return {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
        paymentId: payment._id,
        key: config.razorpayKeyId,
      };
    } catch (error) {
      throw new AppError(`Razorpay order creation failed: ${error.message}`, 502, 'PAY_ORDER_FAILED');
    }
  }

  /**
   * Verify payment signature
   */
  verifySignature({ orderId, paymentId, signature }) {
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpayKeySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new AppError('Invalid payment signature', 400, 'PAY_INVALID_SIGNATURE');
    }
    return true;
  }

  /**
   * Capture (confirm) a payment after verification with idempotency
   */
  async capturePayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
    // Verify signature
    this.verifySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      throw new AppError('Payment record not found', 404, 'PAY_NOT_FOUND');
    }

    // Idempotency: if already captured, return existing record
    if (payment.status === 'captured') {
      return payment;
    }

    // Prevent re-capturing refunded or failed payments
    if (['refunded', 'partial_refunded', 'failed'].includes(payment.status)) {
      throw new AppError(
        `Payment cannot be captured (current status: ${payment.status})`,
        400,
        'PAY_INVALID_STATUS_TRANSITION'
      );
    }

    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = 'captured';

    // Update reference if any
    if (payment.referenceType === 'subscription' && payment.referenceId) {
      await Subscription.findByIdAndUpdate(payment.referenceId, { paymentId: payment._id });
    }

    await payment.save();

    socketEmitter.emitPaymentReceived(payment, payment.payerId);
    return payment;
  }

  /**
   * Process refund
   */
  async refund({ paymentId, amount, reason }) {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new AppError('Payment not found', 404, 'PAY_NOT_FOUND');
    }
    if (payment.status !== 'captured') {
      throw new AppError('Payment cannot be refunded', 400, 'PAY_CANNOT_REFUND');
    }

    const razorpay = getRazorpay();
    if (!razorpay) {
      throw new AppError('Payment gateway not configured', 503, 'PAY_GATEWAY_NOT_CONFIGURED');
    }

    const refundAmount = amount || payment.amount;
    const amountInPaise = Math.round(refundAmount * 100);

    try {
      const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
        amount: amountInPaise,
        notes: { reason: reason || 'Customer requested refund' },
      });

      if (refundAmount >= payment.amount) {
        payment.status = 'refunded';
        payment.refundStatus = 'full';
      } else {
        payment.status = 'partial_refunded';
        payment.refundStatus = 'partial';
      }
      payment.refundAmount = (payment.refundAmount || 0) + refundAmount;
      await payment.save();

      return {
        refundId: refund.id,
        paymentId: payment._id,
        amount: refundAmount,
        status: refund.status,
        paymentStatus: payment.status,
      };
    } catch (error) {
      throw new AppError(`Refund failed: ${error.message}`, 502, 'PAY_REFUND_FAILED');
    }
  }

  /**
   * Handle Razorpay webhook
   */
  async handleWebhook(event, payload) {
    switch (event) {
      case 'payment.captured': {
        const payment = payload.payment.entity;
        await Payment.findOneAndUpdate(
          { razorpayOrderId: payment.order_id },
          {
            razorpayPaymentId: payment.id,
            status: 'captured',
          }
        );
        break;
      }

      case 'payment.failed': {
        const failedPayment = payload.payment.entity;
        await Payment.findOneAndUpdate(
          { razorpayOrderId: failedPayment.order_id },
          { status: 'failed' }
        );
        break;
      }

      case 'subscription.charged': {
        const sub = payload.subscription.entity;
        // Handle recurring subscription charge
        const localSub = await Subscription.findOne({ razorpaySubscriptionId: sub.id });
        if (localSub) {
          const payment = await Payment.create({
            razorpayPaymentId: sub.payment_id,
            razorpayOrderId: sub.order_id,
            payerType: 'customer',
            payerId: localSub.customerId,
            amount: sub.amount / 100,
            purpose: 'subscription',
            referenceType: 'subscription',
            referenceId: localSub._id,
            status: 'captured',
          });
          localSub.paymentId = payment._id;
          await localSub.save();
        }
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${event}`);
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(body, signature, secret) {
    const expectedSignature = crypto
      .createHmac('sha256', secret || config.razorpayWebhookSecret)
      .update(JSON.stringify(body))
      .digest('hex');
    return expectedSignature === signature;
  }

  /**
   * Get payment by ID
   */
  /**
   * Get payment by ID
   */
  async getById(paymentId) {
    const mongoose = require('mongoose');
    const payment = await Payment.findById(paymentId)
      .populate('payerId', 'phone role email');
    if (!payment) throw new AppError('Payment not found', 404, 'PAY_NOT_FOUND');
    
    const paymentObj = payment.toObject();
    paymentObj.payerName = 'Customer';
    paymentObj.payerEmail = payment.payerId?.email || 'customer@gmail.com';

    if (payment.payerId) {
      if (payment.payerId.role === 'customer') {
        const cust = await mongoose.model('Customer').findOne({ userId: payment.payerId._id });
        if (cust) {
          paymentObj.payerName = `${cust.firstName} ${cust.lastName || ''}`.trim();
          paymentObj.payerEmail = cust.email || paymentObj.payerEmail;
        }
      } else if (payment.payerId.role === 'cleaner') {
        const cleaner = await mongoose.model('Cleaner').findOne({ userId: payment.payerId._id });
        if (cleaner) {
          paymentObj.payerName = `${cleaner.firstName} ${cleaner.lastName || ''}`.trim();
          paymentObj.payerEmail = cleaner.email || paymentObj.payerEmail;
        }
      }
    }
    return paymentObj;
  }

  /**
   * Get payment by Razorpay order ID
   */
  async getByOrderId(orderId) {
    const payment = await Payment.findOne({ razorpayOrderId: orderId })
      .populate('payerId', 'phone role');
    if (!payment) throw new AppError('Payment not found', 404, 'PAY_NOT_FOUND');
    return payment;
  }

  /**
   * List payments with filtering
   */
  async list({ page = 1, limit = 20, status, purpose, payerId, fromDate, toDate } = {}) {
    const mongoose = require('mongoose');
    const query = {};
    if (status) query.status = status;
    if (purpose) query.purpose = purpose;
    if (payerId) query.payerId = payerId;
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    const skip = (page - 1) * limit;
    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate('payerId', 'phone role email')
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      Payment.countDocuments(query),
    ]);

    const populatedPayments = await Promise.all(payments.map(async (p) => {
      const paymentObj = p.toObject();
      paymentObj.payerName = 'Customer';
      paymentObj.payerEmail = p.payerId?.email || 'customer@gmail.com';

      if (p.payerId) {
        if (p.payerId.role === 'customer') {
          const cust = await mongoose.model('Customer').findOne({ userId: p.payerId._id });
          if (cust) {
            paymentObj.payerName = `${cust.firstName} ${cust.lastName || ''}`.trim();
            paymentObj.payerEmail = cust.email || paymentObj.payerEmail;
          }
        } else if (p.payerId.role === 'cleaner') {
          const cleaner = await mongoose.model('Cleaner').findOne({ userId: p.payerId._id });
          if (cleaner) {
            paymentObj.payerName = `${cleaner.firstName} ${cleaner.lastName || ''}`.trim();
            paymentObj.payerEmail = cleaner.email || paymentObj.payerEmail;
          }
        }
      }
      return paymentObj;
    }));

    return {
      data: populatedPayments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 },
    };
  }

  /**
   * Get payment stats
   */
  async getStats() {
    const [total, captured, refunded, failed] = await Promise.all([
      Payment.countDocuments(),
      Payment.countDocuments({ status: 'captured' }),
      Payment.countDocuments({ status: { $in: ['refunded', 'partial_refunded'] } }),
      Payment.countDocuments({ status: 'failed' }),
    ]);
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'captured' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRefunded = await Payment.aggregate([
      { $match: { status: { $in: ['refunded', 'partial_refunded'] } } },
      { $group: { _id: null, total: { $sum: '$refundAmount' } } },
    ]);
    return {
      total, captured, refunded, failed,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalRefunded: totalRefunded[0]?.total || 0,
    };
  }
}

module.exports = new PaymentService();
