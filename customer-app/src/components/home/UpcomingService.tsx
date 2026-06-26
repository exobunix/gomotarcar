import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Card from '../common/Card';
import { colors } from '../../theme/colors';
import { formatDate } from '../../utils/helpers';

interface UpcomingServiceProps {
  hasService: boolean;
  serviceType?: string;
  vehicleNumber?: string;
  date?: string;
  time?: string;
  cleanerName?: string;
  status?: string;
  onViewBooking?: () => void;
}

const statusColors: Record<string, string> = {
  confirmed: colors.primaryBlue,
  in_progress: colors.warning,
  completed: colors.success,
  cancelled: colors.error,
};

const UpcomingService: React.FC<UpcomingServiceProps> = ({
  hasService,
  serviceType,
  vehicleNumber,
  date,
  time,
  cleanerName,
  status,
  onViewBooking,
}) => {
  if (!hasService) {
    return (
      <Card variant="elevated" padding={20} style={styles.noServiceCard}>
        <View style={styles.noServiceRow}>
          <Text style={styles.noServiceIcon}>🧹</Text>
          <View style={styles.noServiceContent}>
            <Text style={styles.noServiceTitle}>No Upcoming Services</Text>
            <Text style={styles.noServiceSub}>
              Book your first cleaning service today!
            </Text>
          </View>
          <TouchableOpacity style={styles.bookBtn}>
            <Text style={styles.bookBtnText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding={20}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Upcoming Service</Text>
        {status && (
          <View style={[styles.statusBadge, { backgroundColor: (statusColors[status] || colors.primaryBlue) + '20' }]}>
            <Text style={[styles.statusText, { color: statusColors[status] || colors.primaryBlue }]}>
              {status?.replace('_', ' ')}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.detailsRow}>
        <Text style={styles.serviceType}>{serviceType}</Text>
        <Text style={styles.vehicleNumber}>{vehicleNumber}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoIcon}>📅</Text>
        <Text style={styles.infoText}>{date && formatDate(date, 'long')} at {time}</Text>
      </View>
      {cleanerName && (
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>👤</Text>
          <Text style={styles.infoText}>Cleaner: {cleanerName}</Text>
        </View>
      )}
      <TouchableOpacity style={styles.viewBooking} onPress={onViewBooking}>
        <Text style={styles.viewBookingText}>View Details →</Text>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  noServiceCard: {
    backgroundColor: colors.lightBlue,
  },
  noServiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noServiceIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  noServiceContent: {
    flex: 1,
  },
  noServiceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: 'Inter-SemiBold',
  },
  noServiceSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  bookBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primaryBlue,
    borderRadius: 14,
  },
  bookBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
    fontFamily: 'Inter-SemiBold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'Inter-SemiBold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    textTransform: 'capitalize',
  },
  detailsRow: {
    marginBottom: 12,
  },
  serviceType: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: 'Inter-Bold',
  },
  vehicleNumber: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },
  viewBooking: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  viewBookingText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryBlue,
    fontFamily: 'Inter-SemiBold',
  },
});

export default UpcomingService;
