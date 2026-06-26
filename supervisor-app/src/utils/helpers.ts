export const formatDate = (date: string | Date, format: 'short' | 'long' | 'time' | 'full' = 'short'): string => {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: format === 'long' ? 'long' : 'short', year: 'numeric' };
  if (format === 'time') { options.hour = '2-digit'; options.minute = '2-digit'; }
  if (format === 'full') { options.hour = '2-digit'; options.minute = '2-digit'; options.weekday = 'short'; }
  return d.toLocaleDateString('en-IN', options);
};

export const formatTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

export const getInitials = (name: string): string => {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

export const statusColorMap: Record<string, string> = {
  pending: '#F59E0B',
  assigned: '#7C3AED',
  in_progress: '#2563EB',
  completed: '#22C55E',
  approved: '#22C55E',
  rejected: '#EF4444',
  cancelled: '#64748B',
  open: '#F59E0B',
  resolved: '#22C55E',
  closed: '#64748B',
  active: '#22C55E',
  damaged: '#EF4444',
  pending_activation: '#F59E0B',
  replaced: '#64748B',
};

export const statusLabel: Record<string, string> = {
  pending: 'Pending',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  completed: 'Completed',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
  active: 'Active',
  damaged: 'Damaged',
  pending_activation: 'Pending',
  replaced: 'Replaced',
};

export const maskPhone = (phone: string): string => {
  if (!phone) return '';
  return phone.length >= 10
    ? `${phone.slice(0, 3)}****${phone.slice(7)}`
    : phone;
};
