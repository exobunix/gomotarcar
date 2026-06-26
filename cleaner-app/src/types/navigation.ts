export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  OTPVerification: { phone: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Tasks: undefined;
  Scan: undefined;
  Earnings: undefined;
  Profile: undefined;
};

export type DashboardStackParamList = {
  DashboardMain: undefined;
  Attendance: undefined;
  Notifications: undefined;
  Training: undefined;
  TrainingDetail: { moduleId: string };
  Support: undefined;
  SupervisorContact: undefined;
  IssueTicket: undefined;
  IssueTracking: { issueId?: string };
  ReportIssue: undefined;
  CustomerReviews: undefined;
};

export type TasksStackParamList = {
  TaskList: undefined;
  TaskDetail: { taskId: string };
  Checklist: { taskId: string };
  CleaningCompletion: { taskId: string };
  CustomerDetail: { customerId?: string };
  CustomerVehicleDetail: { vehicleId?: string };
};

export type EarningsStackParamList = {
  EarningsMain: undefined;
  Incentives: undefined;
  Leaderboard: undefined;
  EarningsHistory: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  Documents: undefined;
  BankDetails: undefined;
  LeaveManagement: undefined;
  ApplyLeave: undefined;
  LeaveDetail: { leaveId: string };
  Performance: undefined;
  Achievements: undefined;
  Settings: undefined;
  TaskHistory: undefined;
  HelpSupport: undefined;
  PersonalInformation: undefined;
};

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface CleanerProfile {
  _id: string;
  cleanerId: string;
  phone: string;
  name?: string;
  email?: string;
  avatar?: string;
  zone?: string;
  isActive: boolean;
  rating?: number;
  totalTasks?: number;
  completedTasks?: number;
  role: string;
  joinDate?: string;
}

export interface TaskItem {
  _id: string;
  taskId: string;
  customerName: string;
  customerPhone?: string;
  vehicleNumber: string;
  vehicleModel?: string;
  apartmentName: string;
  apartmentAddress: string;
  serviceType: string;
  packageName: string;
  amount: number;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'missed' | 'cancelled';
  scheduledDate: string;
  scheduledTime: string;
  notes?: string;
  qrVerified?: boolean;
  beforePhotos?: string[];
  afterPhotos?: string[];
  startedAt?: string;
  completedAt?: string;
  customerId?: any;
  createdAt: string;
}

export interface AttendanceRecord {
  _id: string;
  cleanerId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'present' | 'late' | 'half_day' | 'absent';
  checkInPhoto?: string;
  checkInLatitude?: number;
  checkInLongitude?: number;
  isLate?: boolean;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'task' | 'attendance' | 'payment' | 'general';
  isRead: boolean;
  data?: any;
  createdAt: string;
}

export interface EarningsSummary {
  today: number;
  week: number;
  month: number;
  pending: number;
  totalPaid: number;
  taskCount: number;
  incentiveEarned: number;
  totalEarnings: number;
}

export interface IncentiveData {
  _id: string;
  month: number;
  year: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  tasksCompleted: number;
  attendanceRate: number;
  avgRating: number;
  incentiveAmount: number;
  paid: boolean;
  paidAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  cleanerId: string;
  name: string;
  tasksCompleted: number;
  rating: number;
  incentiveAmount: number;
}

export interface LeaveRequest {
  _id: string;
  cleanerId: string;
  fromDate: string;
  toDate: string;
  reason: string;
  type: 'sick' | 'vacation' | 'personal' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewNotes?: string;
  appliedAt: string;
  approvedAt?: string;
}

export interface LeaveBalance {
  total: number;
  used: number;
  remaining: number;
  sick: number;
  vacation: number;
  personal: number;
}

export interface TrainingVideo {
  _id: string;
  title: string;
  description: string;
  category: 'exterior' | 'interior' | 'safety' | 'customer_service';
  duration: string;
  thumbnail?: string;
  videoUrl?: string;
  completed: boolean;
  createdAt: string;
}

export interface TrainingCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
  color: string;
}

export interface PerformanceData {
  period: string;
  tasksAssigned: number;
  tasksCompleted: number;
  completionRate: number;
  onTimeRate: number;
  avgRating: number;
  ratingBreakdown: { 1: number; 2: number; 3: number; 4: number; 5: number };
  attendanceRate: number;
  lateDays: number;
  absentDays: number;
  points: number;
  level: string;
}

export interface Achievement {
  _id: string;
  title: string;
  description: string;
  icon: string;
  category: 'tasks' | 'attendance' | 'rating' | 'milestone';
  unlockedAt?: string;
  progress: number;
  target: number;
  points: number;
}

export interface SupportTicket {
  _id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: 'supervisor' | 'payment' | 'task' | 'technical' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
}

export interface ActivityLog {
  _id: string;
  type: 'task' | 'earning' | 'attendance' | 'leave' | 'achievement';
  title: string;
  description: string;
  amount?: number;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}
