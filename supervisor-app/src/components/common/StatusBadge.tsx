import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { statusColorMap, statusLabel } from '../../utils/helpers';

interface Props {
  status: string;
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<Props> = ({ status, size = 'sm' }) => {
  const bgColor = (statusColorMap[status] || '#64748B') + '20';
  const textColor = statusColorMap[status] || '#64748B';
  const label = statusLabel[status] || status;

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }, size === 'sm' ? styles.sm : styles.md]}>
      <Text style={[styles.text, { color: textColor }, size === 'sm' ? styles.smText : styles.mdText]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: { borderRadius: 8, alignSelf: 'flex-start' },
  sm: { paddingHorizontal: 8, paddingVertical: 3 },
  md: { paddingHorizontal: 12, paddingVertical: 5 },
  text: { fontWeight: '600', fontFamily: 'Inter-SemiBold' },
  smText: { fontSize: 11 },
  mdText: { fontSize: 13 },
});

export default StatusBadge;
