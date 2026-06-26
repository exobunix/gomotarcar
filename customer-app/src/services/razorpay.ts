import { Alert, Platform, Linking } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import api from './api';

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    contact?: string;
    email?: string;
    name?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
}

export interface PaymentResult {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

class PaymentService {
  private readonly RAZORPAY_KEY = __DEV__
    ? 'rzp_test_xxxxxxxxxxxx'
    : 'rzp_live_xxxxxxxxxxxx';

  /**
   * Create a Razorpay order via the backend
   */
  async createOrder(params: {
    amount: number;
    currency?: string;
    receipt?: string;
    notes?: Record<string, string>;
  }): Promise<{ orderId: string; amount: number; currency: string }> {
    const response = await api.post('/payments/create-order', {
      amount: params.amount,
      currency: params.currency || 'INR',
      receipt: params.receipt,
      notes: params.notes,
    });
    return response.data.data;
  }

  /**
   * Open the Razorpay checkout and process payment
   */
  async initiatePayment(params: {
    amount: number;
    orderId: string;
    currency?: string;
    customerName?: string;
    customerContact?: string;
    customerEmail?: string;
    description?: string;
    notes?: Record<string, string>;
  }): Promise<PaymentResult> {
    const options: RazorpayOptions = {
      key: this.RAZORPAY_KEY,
      amount: params.amount,
      currency: params.currency || 'INR',
      name: 'GoMotarCar',
      description: params.description || 'Car Cleaning Service',
      order_id: params.orderId,
      prefill: {
        name: params.customerName,
        contact: params.customerContact,
        email: params.customerEmail,
      },
      notes: params.notes,
      theme: { color: '#0D5BD7' },
    };

    return new Promise((resolve, reject) => {
      RazorpayCheckout.open(options)
        .then((data: any) => {
          resolve({
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_order_id: data.razorpay_order_id,
            razorpay_signature: data.razorpay_signature,
          });
        })
        .catch((error: any) => {
          if (error.code === 0) {
            reject(new Error('Payment cancelled by user'));
          } else {
            reject(error);
          }
        });
    });
  }

  /**
   * Verify payment signature on the backend
   */
  async verifyPayment(params: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }): Promise<any> {
    const response = await api.post('/payments/verify', params);
    return response.data.data;
  }

  /**
   * Complete full payment flow: create order → pay → verify
   */
  async processPayment(params: {
    amount: number;
    customerName?: string;
    customerContact?: string;
    customerEmail?: string;
    description?: string;
    notes?: Record<string, string>;
  }): Promise<{ success: boolean; payment?: any; error?: string }> {
    try {
      // Convert rupees to paise for Razorpay
      const amountPaise = Math.round(params.amount * 100);

      // Step 1: Create order
      const order = await this.createOrder({
        amount: amountPaise,
        notes: params.notes,
      });

      // Step 2: Initiate payment
      const paymentResult = await this.initiatePayment({
        amount: order.amount,
        orderId: order.orderId,
        customerName: params.customerName,
        customerContact: params.customerContact,
        customerEmail: params.customerEmail,
        description: params.description,
        notes: params.notes,
      });

      // Step 3: Verify payment
      const verified = await this.verifyPayment(paymentResult);

      return { success: true, payment: verified };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Payment failed',
      };
    }
  }

  /**
   * Process wallet top-up
   */
  async walletTopUp(params: {
    amount: number;
    customerId: string;
  }): Promise<{ success: boolean; payment?: any; error?: string }> {
    return this.processPayment({
      amount: params.amount,
      description: 'Wallet Top-Up',
      notes: { type: 'wallet_topup', customerId: params.customerId },
    });
  }

  /**
   * Process subscription payment
   */
  async processSubscriptionPayment(params: {
    amount: number;
    subscriptionId: string;
    customerName?: string;
    customerContact?: string;
    customerEmail?: string;
  }): Promise<{ success: boolean; payment?: any; error?: string }> {
    return this.processPayment({
      amount: params.amount,
      description: 'Subscription Payment',
      customerName: params.customerName,
      customerContact: params.customerContact,
      customerEmail: params.customerEmail,
      notes: { type: 'subscription', subscriptionId: params.subscriptionId },
    });
  }
}

export const paymentService = new PaymentService();
export default paymentService;
