import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusColorMap: Record<string, string> = {
  active: colors.success,
  inactive: colors.textSecondary,
  pending: colors.warning,
  confirmed: colors.primaryBlue,
  assigned: '#7C3AED',
  in_progress: colors.warning,
  completed: colors.success,
  cancelled: colors.error,
  expired: colors.textSecondary,
  paused: colors.warning,
  open: colors.warning,
  resolved: colors.success,
  closed: colors.textSecondary,
  damaged: colors.error,
  replaced: colors.primaryBlue,
  captured: colors.success,
  failed: colors.error,
  refunded: colors.warning,
  created: colors.primaryBlue,
  paid: colors.success,
  upcoming: colors.primaryBlue,
  high: colors.error,
  medium: colors.warning,
  low: colors.textSecondary,
};

const statusBgMap: Record<string, string> = {
  active: colors.success + '15',
  inactive: colors.border,
  pending: colors.warning + '15',
  confirmed: colors.primaryBlue + '15',
  assigned: '#7C3AED15',
  in_progress: colors.warning + '15',
  completed: colors.success + '15',
  cancelled: colors.error + '15',
  expired: colors.border,
  paused: colors.warning + '15',
  open: colors.warning + '15',
  resolved: colors.success + '15',
  closed: colors.border,
  damaged: colors.error + '15',
  replaced: colors.primaryBlue + '15',
  captured: colors.success + '15',
  failed: colors.error + '15',
  refunded: colors.warning + '15',
  created: colors.primaryBlue + '15',
  paid: colors.success + '15',
  upcoming: colors.primaryBlue + '15',
  high: colors.error + '15',
  medium: colors.warning + '15',
  low: colors.border,
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const color = statusColorMap[status] || colors.textSecondary;
  const bgColor = statusBgMap[status] || colors.border;
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }, size === 'md' && styles.badgeMd]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }, size === 'md' && styles.labelMd]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeMd: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    textTransform: 'capitalize',
  },
  labelMd: {
    fontSize: 13,
  },
});

export default StatusBadge;
