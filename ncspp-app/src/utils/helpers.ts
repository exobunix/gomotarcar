export const formatDate = (date: string | Date, format: 'short' | 'long' | 'time' | 'full' = 'short'): string => {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: format === 'long' ? 'long' : 'short', year: 'numeric' };
  if (format === 'time') { options.hour = '2-digit'; options.minute = '2-digit'; }
  if (format === 'full') { options.hour = '2-digit'; options.minute = '2-digit'; options.weekday = 'short'; }
  return d.toLocaleDateString('en-IN', options);
};

export const maskPhone = (phone: string): string => {
  if (!phone || phone.length < 10) return phone || '';
  return `${phone.slice(0, 3)}****${phone.slice(7)}`;
};

export const statusColorMap: Record<string, string> = {
  pending: '#F59E0B', verified: '#22C55E', rejected: '#EF4444',
  active: '#22C55E', inactive: '#64748B', paid: '#22C55E', due: '#F59E0B',
  open: '#F59E0B', resolved: '#22C55E', closed: '#64748B',
  new: '#3B82F6', contacted: '#7C3AED', converted: '#22C55E', lost: '#EF4444',
};

export const statusLabel: Record<string, string> = {
  pending: 'Pending', verified: 'Verified', rejected: 'Rejected',
  active: 'Active', inactive: 'Inactive', paid: 'Paid', due: 'Due',
  open: 'Open', resolved: 'Resolved', closed: 'Closed',
  new: 'New', contacted: 'Contacted', converted: 'Converted', lost: 'Lost',
};
