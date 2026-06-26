import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: '#E8F5E9', text: '#2E7D32', dot: '#4CAF50' },
  pending: { bg: '#FFF3E0', text: '#E65100', dot: '#FF9800' },
  completed: { bg: '#E3F2FD', text: '#1565C0', dot: '#2196F3' },
  rejected: { bg: '#FFEBEE', text: '#C62828', dot: '#F44336' },
  approved: { bg: '#E8F5E9', text: '#2E7D32', dot: '#4CAF50' },
  new: { bg: '#F3E5F5', text: '#7B1FA2', dot: '#9C27B0' },
  contacted: { bg: '#E3F2FD', text: '#1565C0', dot: '#2196F3' },
  converted: { bg: '#E8F5E9', text: '#2E7D32', dot: '#4CAF50' },
  lost: { bg: '#FFEBEE', text: '#C62828', dot: '#F44336' },
  inactive: { bg: '#F5F5F5', text: '#616161', dot: '#9E9E9E' },
};

interface StatusBadgeProps {
  status: string;
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'small',
}) => {
  const normalizedStatus = status?.toLowerCase() || 'pending';
  const colorConfig = statusColors[normalizedStatus] || statusColors.pending;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colorConfig.bg },
        size === 'medium' && styles.badgeMedium,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: colorConfig.dot }]} />
      <Text
        style={[
          styles.text,
          { color: colorConfig.text },
          size === 'medium' && styles.textMedium,
        ]}
      >
        {status || 'Pending'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 5,
  },
  badgeMedium: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  textMedium: {
    fontSize: 12,
  },
});
