export const formatDate = (date: string | Date, format: 'short' | 'long' | 'time' = 'short'): string => {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: format === 'long' ? 'long' : 'short', year: 'numeric' };
  if (format === 'time') { options.hour = '2-digit'; options.minute = '2-digit'; }
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
  missed: '#EF4444',
  cancelled: '#64748B',
  present: '#22C55E',
  late: '#F59E0B',
  half_day: '#F97316',
  absent: '#EF4444',
};

export const statusLabel: Record<string, string> = {
  pending: 'Pending',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  completed: 'Completed',
  missed: 'Missed',
  cancelled: 'Cancelled',
  present: 'Present',
  late: 'Late',
  half_day: 'Half Day',
  absent: 'Absent',
};
