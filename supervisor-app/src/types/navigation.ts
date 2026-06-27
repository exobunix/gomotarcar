export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  DashboardTab: undefined;
  ApartmentsTab: undefined;
  CleanersTab: undefined;
  TodayCleaningTab: undefined;
  AttendanceTab: undefined;
  ApprovalsTab: undefined;
  InventoryTab: undefined;
  ComplaintsTab: undefined;
  NotificationsTab: undefined;
  ReportsTab: undefined;
  EarningsTab: undefined;
  LeavesTab: undefined;
  MoreTab: undefined;
};

export type DashboardStackParamList = {
  DashboardMain: undefined;
  OnboardingDashboard: undefined;
  DailyWorkMonitoring: undefined;
  WorkApproval: { taskId?: string };
  RejectionHandling: { taskId?: string };
  Notifications: undefined;
};

export type ApartmentStackParamList = {
  ApartmentList: undefined;
  ApartmentDetail: { apartmentId: string };
  AddApartment: { customerId?: string };
  QRAssignment: { apartmentId: string };
  QRReassignment: { apartmentId: string; qrId: string };
};

export type CustomerStackParamList = {
  CustomerList: undefined;
  CustomerDetail: { customerId: string };
  NewOnboarding: undefined;
};

export type AttendanceStackParamList = {
  DailyAttendance: undefined;
};

export type TodayCleaningStackParamList = {
  TodayCleaningMain: undefined;
};

export type CleanerStackParamList = {
  CleanerList: undefined;
  CleanerDetail: { cleanerId: string };
  CleanerAllocation: undefined;
  SalaryIncentives: undefined;
  SalaryDetail: { cleanerId: string };
};

export type WorkStackParamList = {
  WorkDashboard: undefined;
  DailyWorkList: { date?: string };
  WorkApprovalList: undefined;
  WorkApprovalDetail: { taskId: string };
  RejectionList: undefined;
  RejectionDetail: { taskId: string };
};

export type QRStackParamList = {
  QRList: undefined;
  QRAssignment: { apartmentId?: string };
  QRReassignment: { qrId: string; apartmentId: string };
};

export type GrievanceStackParamList = {
  GrievanceList: undefined;
  GrievanceDetail: { grievanceId: string };
  CreateGrievance: undefined;
};

export type InventoryStackParamList = {
  InventoryList: undefined;
  InventoryDetail: { itemId: string };
  AddInventoryItem: undefined;
  InventoryAllocation: { itemId: string };
};

export type MoreStackParamList = {
  MoreMain: undefined;
  Profile: undefined;
  ProfileManagement: undefined;
  GrievanceManagement: undefined;
  InventoryManagement: undefined;
  Settings: undefined;
  Notifications: undefined;
  SupportCenter: undefined;
};

export interface SupervisorProfile {
  _id: string;
  userId: string;
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  photo?: string;
  assignedZone?: any;
  cleanerCount: number;
  isActive: boolean;
  joiningDate: string;
  experience: number;
}

export interface CleanerItem {
  _id: string;
  cleanerId: string;
  name: string;
  phone: string;
  email?: string;
  photo?: string;
  zone?: string;
  rating: number;
  totalTasks: number;
  completedTasks: number;
  isActive: boolean;
  documents: any[];
  bankDetails?: any;
}

export interface ApartmentItem {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  customerId: any;
  isDefault: boolean;
  qrAssigned: boolean;
  qrCode?: any;
}

export interface CustomerItem {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  apartments: number;
  vehicles: number;
  subscriptions: number;
  createdAt: string;
}

export interface TaskItem {
  _id: string;
  taskId: string;
  bookingId?: string;
  cleanerId?: any;
  customerId: any;
  vehicleNumber: string;
  vehicleModel?: string;
  apartmentName: string;
  serviceType: string;
  packageName: string;
  amount: number;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'approved' | 'rejected' | 'cancelled';
  scheduledDate: string;
  scheduledTime: string;
  qrVerified: boolean;
  beforePhotos: string[];
  afterPhotos: string[];
  startedAt?: string;
  completedAt?: string;
  rejectionReason?: string;
  redoRequired: boolean;
  createdAt: string;
}

export interface QRItem {
  _id: string;
  code: string;
  apartmentId?: any;
  customerId?: any;
  status: 'pending_activation' | 'active' | 'damaged' | 'replaced';
  generatedAt: string;
  activatedAt?: string;
}

export interface ComplaintItem {
  _id: string;
  ticketNumber: string;
  customerId: any;
  subject: string;
  description: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: any;
  createdAt: string;
  resolvedAt?: string;
}

export interface InventoryItem {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  allocated: number;
  available: number;
  createdAt: string;
}

export interface IncentiveItem {
  _id: string;
  cleanerId: any;
  month: number;
  year: number;
  tier: string;
  tasksCompleted: number;
  attendanceRate: number;
  avgRating: number;
  incentiveAmount: number;
  paid: boolean;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  data?: any;
  createdAt: string;
}
