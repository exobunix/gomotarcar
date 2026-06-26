import React from 'react';
import Chip from '@mui/material/Chip';

const STATUS_COLORS = {
  // Task
  assigned: { bg: '#EAF3FF', color: '#0D5BD7' },
  in_progress: { bg: '#FEF3C7', color: '#D97706' },
  completed: { bg: '#D1FAE5', color: '#059669' },
  missed: { bg: '#FEE2E2', color: '#DC2626' },
  cancelled: { bg: '#F3F4F6', color: '#6B7280' },

  // Attendance
  present: { bg: '#D1FAE5', color: '#059669' },
  absent: { bg: '#FEE2E2', color: '#DC2626' },
  'half-day': { bg: '#FEF3C7', color: '#D97706' },
  late: { bg: '#FFF7ED', color: '#EA580C' },
  leave: { bg: '#EAF3FF', color: '#0D5BD7' },
  holiday: { bg: '#F3F4F6', color: '#6B7280' },

  // Subscription
  active: { bg: '#D1FAE5', color: '#059669' },
  trial: { bg: '#EAF3FF', color: '#0D5BD7' },
  expired: { bg: '#F3F4F6', color: '#6B7280' },

  // Payment
  created: { bg: '#EAF3FF', color: '#0D5BD7' },
  captured: { bg: '#D1FAE5', color: '#059669' },
  refunded: { bg: '#FEF3C7', color: '#D97706' },
  failed: { bg: '#FEE2E2', color: '#DC2626' },
  partial_refunded: { bg: '#FFF7ED', color: '#EA580C' },

  // Booking
  booked: { bg: '#EAF3FF', color: '#0D5BD7' },
  accepted: { bg: '#D1FAE5', color: '#059669' },
  job_card_pending: { bg: '#FEF3C7', color: '#D97706' },
  job_card_approved: { bg: '#D1FAE5', color: '#059669' },

  // QR
  pending_activation: { bg: '#FEF3C7', color: '#D97706' },
  active_qr: { bg: '#D1FAE5', color: '#059669' },
  replaced: { bg: '#F3F4F6', color: '#6B7280' },
  damaged: { bg: '#FEE2E2', color: '#DC2626' },

  // Complaint
  open: { bg: '#FEE2E2', color: '#DC2626' },
  resolved: { bg: '#D1FAE5', color: '#059669' },
  closed: { bg: '#F3F4F6', color: '#6B7280' },

  // Leave
  pending: { bg: '#FEF3C7', color: '#D97706' },
  approved: { bg: '#D1FAE5', color: '#059669' },
  rejected: { bg: '#FEE2E2', color: '#DC2626' },

  // Verification
  verified: { bg: '#D1FAE5', color: '#059669' },
  unverified: { bg: '#FEF3C7', color: '#D97706' },

  // Generic
  yes: { bg: '#D1FAE5', color: '#059669' },
  no: { bg: '#FEE2E2', color: '#DC2626' },
  true: { bg: '#D1FAE5', color: '#059669' },
  false: { bg: '#F3F4F6', color: '#6B7280' },
  default: { bg: '#F3F4F6', color: '#374151' },
};

const StatusChip = ({ status, label, size = 'small' }) => {
  const key = (status || '').toLowerCase();
  const colors = STATUS_COLORS[key] || STATUS_COLORS.default;

  return (
    <Chip
      label={label || status?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'N/A'}
      size={size}
      sx={{
        bgcolor: colors.bg,
        color: colors.color,
        fontWeight: 600,
        fontSize: size === 'small' ? '0.75rem' : '0.8125rem',
        borderRadius: '8px',
        height: size === 'small' ? 24 : 32,
      }}
    />
  );
};

export default StatusChip;
