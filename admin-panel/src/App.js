import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './pages/Login/LoginPage';

// Lazy load all pages - only import pages that exist
const Dashboard = React.lazy(() => import('./pages/Dashboard/DashboardPage'));
const Subscriptions = React.lazy(() => import('./pages/Subscriptions/SubscriptionListPage'));
const Bookings = React.lazy(() => import('./pages/Bookings/BookingListPage'));
const QRList = React.lazy(() => import('./pages/QR/QRListPage'));
const Apartments = React.lazy(() => import('./pages/Apartments/ApartmentListPage'));
const Vehicles = React.lazy(() => import('./pages/Vehicles/VehicleListPage'));
const Payments = React.lazy(() => import('./pages/Payments/PaymentListPage'));
const Complaints = React.lazy(() => import('./pages/Complaints/ComplaintListPage'));
const Notifications = React.lazy(() => import('./pages/Notifications/NotificationCenterPage'));
const Analytics = React.lazy(() => import('./pages/Analytics/AnalyticsPage'));
const Reports = React.lazy(() => import('./pages/Reports/ReportsPage'));
const Cleaners = React.lazy(() => import('./pages/Cleaners/CleanerListPage'));
const Supervisors = React.lazy(() => import('./pages/Supervisors/SupervisorListPage'));
const Ncsp = React.lazy(() => import('./pages/NCSP/NcspPartnerListPage'));
const Customers = React.lazy(() => import('./pages/Customers/CustomerListPage'));
const Tasks = React.lazy(() => import('./pages/Tasks/TaskListPage'));
const Attendance = React.lazy(() => import('./pages/Attendance/AttendanceListPage'));
const Earnings = React.lazy(() => import('./pages/Earnings/EarningsListPage'));
const Franchises = React.lazy(() => import('./pages/Franchise/FranchiseListPage'));
const OperationsTeam = React.lazy(() => import('./pages/Operations/OperationsTeamPage'));
const Zones = React.lazy(() => import('./pages/Zones/ZoneListPage'));
const Marketplace = React.lazy(() => import('./pages/Marketplace/MarketplacePage'));
const Issues = React.lazy(() => import('./pages/Issues/IssuesPage'));
const Training = React.lazy(() => import('./pages/Training/TrainingPage'));
const Settings = React.lazy(() => import('./pages/Settings/SettingsPage'));
const CMS = React.lazy(() => import('./pages/CMS/CMSPage'));

const LoadingFallback = () => (
  <div style={{
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    height: '100%', minHeight: 400,
    flexDirection: 'column', gap: 2
  }}>
    <div style={{
      width: 40, height: 40,
      border: '3px solid #E5E7EB',
      borderTopColor: '#2563EB',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>Loading...</span>
  </div>
);

function App() {
  return (
    <React.Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Login page — outside AdminLayout so no sidebar/header */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* All admin routes — inside AdminLayout with sidebar/header */}
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="cleaners" element={<Cleaners />} />
          <Route path="supervisors" element={<Supervisors />} />
          <Route path="ncsp" element={<Ncsp />} />
          <Route path="ncsp-partners" element={<Ncsp />} />
          <Route path="franchises" element={<Franchises />} />
          <Route path="operations-team" element={<OperationsTeam />} />
          <Route path="operations" element={<OperationsTeam />} />
          <Route path="leads" element={<Franchises />} />
          <Route path="qr" element={<QRList />} />
          <Route path="payments" element={<Payments />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="apartments" element={<Apartments />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="inventory" element={<Vehicles />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="earnings" element={<Earnings />} />
          <Route path="zones" element={<Zones />} />
          <Route path="issues" element={<Issues />} />
          <Route path="training" element={<Training />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="reports" element={<Reports />} />
          <Route path="cms" element={<CMS />} />
          <Route path="audit-logs" element={<Analytics />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="admin-users" element={<Settings />} />
          <Route path="*" element={
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <h2 style={{ color: '#111827', marginBottom: '0.5rem' }}>404 — Page Not Found</h2>
              <p style={{ color: '#6B7280' }}>The page you're looking for doesn't exist.</p>
            </div>
          } />
        </Route>
      </Routes>
    </React.Suspense>
  );
}

export default App;
