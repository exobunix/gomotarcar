export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type DashboardStackParamList = {
  DashboardMain: undefined;
};

export type BookingStackParamList = {
  BookingList: undefined;
  BookingDetail: { bookingId: string };
  CustomerApproval: { bookingId: string };
  WorkProgress: { bookingId: string };
};

export type JobCardStackParamList = {
  JobCardList: undefined;
  JobCardDetail: { bookingId: string };
  Invoice: { bookingId: string };
  Warranty: { bookingId: string };
};

export type StaffStackParamList = {
  StaffList: undefined;
  StaffDetail: { staffId: string };
  AddStaff: undefined;
};

export type WalletStackParamList = {
  Wallet: undefined;
  PaymentSettlement: { settlementId?: string };
  SettlementHistory: undefined;
};

export type MoreStackParamList = {
  ServiceManagement: undefined;
  Reports: undefined;
  Ratings: undefined;
  Reviews: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type MainTabParamList = {
  DashboardTab: undefined;
  BookingsTab: undefined;
  JobCardsTab: undefined;
  StaffTab: undefined;
  WalletTab: undefined;
  MoreTab: undefined;
};
