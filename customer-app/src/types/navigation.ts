export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  OTPVerification: { phone: string; mode?: 'login' | 'register' };
  Registration: { phone: string };
};

export type MainTabParamList = {
  Home: undefined;
  Services: undefined;
  BookingsTab: undefined;
  Alerts: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  Subscriptions: undefined;
  SubscriptionCheckout: { plan: SubscriptionPlan; vehicleId: string; apartmentId: string };
  HireCleaner: undefined;
  HirePackageSelect: { vehicleId: string; apartmentId: string };
  HireCheckout: { packageId: string; vehicleId: string; apartmentId: string; amount: number };
  Wallet: undefined;
  QRList: undefined;
  ServiceHistory: undefined;
};

export type BookingsStackParamList = {
  BookingList: undefined;
  BookingDetail: { bookingId: string };
  WriteReview: { bookingId: string; cleanerName: string };
};

export type ServicesStackParamList = {
  ServicesMain: undefined;
  ComplaintList: undefined;
  CreateComplaint: undefined;
  ComplaintDetail: { complaintId: string };
  PaymentHistory: undefined;
};

export type NotificationsStackParamList = {
  NotificationsMain: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  MyVehicles: undefined;
  AddVehicle: { vehicle?: VehicleData };
  MyApartments: undefined;
  AddApartment: { apartment?: ApartmentData };
  Settings: undefined;
  MyReviews: undefined;
};

// --- Data Interfaces ---

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  _id: string;
  phone: string;
  name?: string;
  email?: string;
  avatar?: string;
  role: string;
  isActive: boolean;
}

export interface VehicleData {
  _id?: string;
  vehicleNumber: string;
  make: string;
  model: string;
  year: string;
  color: string;
  fuelType: 'petrol' | 'diesel' | 'electric' | 'cng' | 'hybrid';
  vehicleType: 'hatchback' | 'sedan' | 'suv' | 'muv' | 'pickup' | 'luxury';
  rcDocument?: string;
  pucDocument?: string;
  isActive?: boolean;
  isPrimary?: boolean;
}

export interface ApartmentData {
  _id?: string;
  name: string;
  buildingName: string;
  unitNumber: string;
  floor?: string;
  wing?: string;
  fullAddress: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface SubscriptionPlan {
  _id: string;
  name: string;
  description: string;
  duration: 'weekly' | 'monthly' | 'quarterly';
  cleaningsIncluded: number;
  price: number;
  discountedPrice?: number;
  features: string[];
  isActive: boolean;
  color?: string;
  icon?: string;
}

export interface ActiveSubscription {
  _id: string;
  customerId: string;
  planId: SubscriptionPlan | string;
  vehicleId: VehicleData | string;
  apartmentId: ApartmentData | string;
  startDate: string;
  endDate: string;
  cleaningsUsed: number;
  cleaningsTotal: number;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  autoRenew: boolean;
  nextBillingDate?: string;
  createdAt: string;
}

export interface ServiceBooking {
  _id: string;
  bookingNumber: string;
  customerId: string;
  vehicleId: VehicleData | string;
  apartmentId: ApartmentData | string;
  cleanerId?: any;
  subscriptionId?: string;
  serviceType: 'basic' | 'standard' | 'premium';
  packageName: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  scheduledTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  cleanerName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QRCodeData {
  _id: string;
  code: string;
  vehicleId: VehicleData | string;
  vehicleNumber: string;
  status: 'active' | 'inactive' | 'damaged' | 'replaced';
  generatedAt: string;
  activatedAt?: string;
  imageUrl?: string;
}

export interface WalletData {
  _id: string;
  customerId: string;
  balance: number;
  lifetimeCredited: number;
  lifetimeDebited: number;
  updatedAt: string;
}

export interface WalletTransaction {
  _id: string;
  walletId: string;
  type: 'credit' | 'debit';
  amount: number;
  balanceAfter: number;
  description: string;
  referenceType?: 'payment' | 'refund' | 'topup' | 'incentive' | 'transfer';
  referenceId?: string;
  createdAt: string;
}

export interface PaymentData {
  _id: string;
  paymentId: string;
  razorpayOrderId?: string;
  amount: number;
  currency: string;
  status: 'created' | 'captured' | 'failed' | 'refunded';
  purpose: 'subscription' | 'booking' | 'topup' | 'other';
  payerId: string;
  description?: string;
  refundAmount?: number;
  refundStatus?: 'none' | 'partial' | 'full';
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  userId: string;
  type: 'booking' | 'payment' | 'subscription' | 'complaint' | 'general';
  title: string;
  message: string;
  isRead: boolean;
  data?: any;
  createdAt: string;
}

export interface ComplaintData {
  _id: string;
  ticketNumber: string;
  customerId: string;
  bookingId?: string;
  subject: string;
  description: string;
  category: 'service' | 'cleaner' | 'billing' | 'vehicle' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  attachments?: string[];
  resolution?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewData {
  _id: string;
  bookingId: string;
  customerId: string;
  cleanerId: string;
  rating: number;
  comment?: string;
  categories?: {
    punctuality: number;
    quality: number;
    behavior: number;
  };
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
