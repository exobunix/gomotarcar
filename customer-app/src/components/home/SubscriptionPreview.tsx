import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Card from '../common/Card';
import { colors } from '../../theme/colors';

interface SubscriptionPreviewProps {
  hasActiveSubscription: boolean;
  planName?: string;
  remainingCleanings?: number;
  expiryDate?: string;
  onViewSubscriptions: () => void;
}

const SubscriptionPreview: React.FC<SubscriptionPreviewProps> = ({
  hasActiveSubscription,
  planName,
  remainingCleanings,
  expiryDate,
  onViewSubscriptions,
}) => {
  if (!hasActiveSubscription) {
    return (
      <Card variant="elevated" padding={20}>
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <Text style={styles.planIcon}>📋</Text>
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>No Active Plan</Text>
            <Text style={styles.subtitle}>
              Subscribe to a cleaning plan and save up to 40%
            </Text>
          </View>
          <TouchableOpacity style={styles.viewBtn} onPress={onViewSubscriptions}>
            <Text style={styles.viewBtnText}>View Plans</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding={20}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Active</Text>
        </View>
        <TouchableOpacity onPress={onViewSubscriptions}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.planName}>{planName}</Text>
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{remainingCleanings}</Text>
          <Text style={styles.statLabel}>Cleanings Left</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{expiryDate}</Text>
          <Text style={styles.statLabel}>Valid Till</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  planIcon: {
    fontSize: 22,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: 'Inter-SemiBold',
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  viewBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.lightBlue,
    borderRadius: 14,
    marginLeft: 12,
  },
  viewBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryBlue,
    fontFamily: 'Inter-SemiBold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
    fontFamily: 'Inter-SemiBold',
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryBlue,
    fontFamily: 'Inter-SemiBold',
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryBlue,
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
});

export default SubscriptionPreview;
