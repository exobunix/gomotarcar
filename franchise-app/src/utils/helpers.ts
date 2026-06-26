export const formatCurrency = (amount: number): string => {
  return `₹${(amount || 0).toLocaleString('en-IN')}`;
};

export const formatDate = (date: string | Date, format: 'short' | 'long' | 'full' = 'short'): string => {
  const d = new Date(date);
  if (format === 'short') return d.toLocaleDateString('en-IN');
  if (format === 'long') return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

export const formatTime = (date: string | Date): string => {
  return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    booked: '#2196F3', accepted: '#4CAF50', in_progress: '#FF9800',
    completed: '#4CAF50', cancelled: '#F44336', pending: '#FF9800',
    job_card_pending: '#9C27B0', job_card_approved: '#4CAF50',
    paid: '#4CAF50', refunded: '#F44336',
  };
  return colors[status] || '#9E9E9E';
};

export const getStatusLabel = (status: string): string => {
  return status
    ? status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Unknown';
};

export const getModeIcon = (mode: string): string => {
  const icons: Record<string, string> = {
    workshop: '🏪', pickup_drop: '🚚', doorstep: '🏠',
  };
  return icons[mode] || '📍';
};
