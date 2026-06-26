export type RootStackParamList = { Auth: undefined; Main: undefined };
export type AuthStackParamList = { Login: undefined; Register: undefined; GstVerification: { registrationData?: any } };
export type MainTabParamList = { DashboardTab: undefined; LeadsTab: undefined; ServicesTab: undefined; WalletTab: undefined; MoreTab: undefined };
export type DashboardStackParamList = {
  DashboardMain: undefined; Notifications: undefined;
  LeadAnalytics: undefined; PaymentHistory: undefined;
};
export type LeadStackParamList = { LeadList: undefined; LeadDetail: { leadId: string }; AddLead: undefined };
export type ServicesStackParamList = {
  ServiceList: undefined; AddService: undefined;
  PricingManagement: undefined; OffersManagement: undefined;
  AddOffer: undefined;
};
export type WalletStackParamList = { WalletMain: undefined; PaymentHistory: undefined };
export type MoreStackParamList = {
  MoreMain: undefined; Profile: undefined; Notifications: undefined;
  ReviewsRatings: undefined; Settings: undefined;
};

export interface PartnerProfile {
  _id: string; userId: string; businessName: string; ownerName: string;
  phone: string; email?: string; gstNumber?: string; gstVerified: boolean;
  address: { street?: string; city: string; state: string; pincode?: string };
  type: string; servicesOffered: string[]; isActive: boolean;
  verificationStatus: string; stats: { totalRevenue: number; totalBookings: number; rating: number };
  bankDetails?: any; createdAt: string;
}

export interface LeadItem {
  _id: string; customerId: any; customerName: string; phone: string;
  serviceType: string; status: string; source: string;
  notes?: string; assignedTo?: any; createdAt: string;
}

export interface ServiceItem {
  _id: string; name: string; description: string; category: string;
  basePrice: number; isActive: boolean; image?: string;
}

export interface OfferItem {
  _id: string; title: string; description: string; discountType: string;
  discountValue: number; serviceId?: any; validFrom: string; validTo: string;
  isActive: boolean; usageCount: number; maxUsage: number;
}

export interface WalletData { balance: number; pendingPayout: number; lifetimeEarnings: number; }
export interface TransactionItem { _id: string; amount: number; type: string; description: string; status: string; createdAt: string; }
export interface ReviewItem { _id: string; customerId: any; rating: number; comment: string; createdAt: string; }
export interface NotificationItem { _id: string; title: string; message: string; type: string; isRead: boolean; data?: any; createdAt: string; }
