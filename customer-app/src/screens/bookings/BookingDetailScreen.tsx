import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import { Button, Card, LoadingOverlay, StatusBadge, AmountDisplay } from '../../components/common';
import { fetchBookingById, cancelBooking } from '../../redux/slices/bookingSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { formatDate } from '../../utils/helpers';

interface Props {
  navigation: any;
  route: any;
}

const timelineSteps = [
  { key: 'pending', label: 'Booking Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'assigned', label: 'Cleaner Assigned' },
  { key: 'in_progress', label: 'Service Started' },
  { key: 'completed', label: 'Completed' },
];

const statusOrder = ['pending', 'confirmed', 'assigned', 'in_progress', 'completed'];

const BookingDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { bookingId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { selectedBooking, loading } = useSelector((s: RootState) => s.booking);
  const booking = selectedBooking;

  useEffect(() => {
    dispatch(fetchBookingById(bookingId));
  }, [bookingId]);

  const handleCancel = () => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'Keep', style: 'cancel' },
      { text: 'Cancel', style: 'destructive', onPress: async () => {
        try {
          await dispatch(cancelBooking(bookingId)).unwrap();
          Alert.alert('Cancelled', 'Booking has been cancelled');
          navigation.goBack();
        } catch { Alert.alert('Error', 'Failed to cancel'); }
      }},
    ]);
  };

  const getVehicleInfo = () => {
    if (!booking?.vehicleId) return '';
    return typeof booking.vehicleId === 'object'
      ? `${booking.vehicleId.vehicleNumber} (${booking.vehicleId.make} ${booking.vehicleId.model})`
      : 'Vehicle';
  };

  const currentStatusIndex = booking ? statusOrder.indexOf(booking.status) : -1;

  if (!booking) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Detail</Text>
          <View style={{ width: 44 }} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Detail</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Bar */}
        <Card variant="elevated" padding={16} style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.bookingNum}>#{booking.bookingNumber || booking._id.slice(-6).toUpperCase()}</Text>
              <Text style={styles.serviceName}>{booking.packageName || booking.serviceType}</Text>
            </View>
            <StatusBadge status={booking.status} size="md" />
          </View>
        </Card>

        {/* Timeline */}
        <Card variant="outlined" padding={16} style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>Progress</Text>
          {timelineSteps.map((step, idx) => {
            const isCompleted = idx <= currentStatusIndex;
            const isCurrent = idx === currentStatusIndex;
            const isLast = idx === timelineSteps.length - 1;
            return (
              <View key={step.key} style={styles.timelineStep}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, isCompleted && styles.timelineDotActive, isCurrent && styles.timelineDotCurrent]} />
                  {!isLast && <View style={[styles.timelineLine, isCompleted && styles.timelineLineActive]} />}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineLabel, isCompleted && styles.timelineLabelActive, isCurrent && { fontWeight: '700' }]}>
                    {step.label}
                  </Text>
                </View>
              </View>
            );
          })}
        </Card>

        {/* Details */}
        <Card variant="outlined" padding={16} style={styles.detailCard}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Vehicle</Text>
            <Text style={styles.detailValue}>{getVehicleInfo()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{formatDate(booking.scheduledDate, 'long')}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>{booking.scheduledTime}</Text>
          </View>
          {booking.cleanerName && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Cleaner</Text>
              <Text style={styles.detailValue}>{booking.cleanerName}</Text>
            </View>
          )}
          <View style={[styles.detailRow, styles.amountRow]}>
            <Text style={styles.detailLabel}>Amount</Text>
            <AmountDisplay amount={booking.amount} size="lg" color={colors.primaryBlue} />
          </View>
        </Card>

        {/* Actions */}
        {(booking.status === 'pending' || booking.status === 'confirmed') && (
          <Button
            title="Cancel Booking"
            onPress={handleCancel}
            variant="outline"
            style={styles.cancelBtn}
            textStyle={{ color: colors.error }}
          />
        )}

        {booking.status === 'completed' && (
          <Button
            title="Write a Review"
            onPress={() => navigation.navigate('WriteReview', { bookingId: booking._id, cleanerName: booking.cleanerName || 'Cleaner' })}
            variant="secondary"
            style={styles.reviewBtn}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: colors.white,
  },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 22, color: colors.primaryBlue, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  statusCard: { marginBottom: 16 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bookingNum: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  serviceName: { fontSize: 14, color: colors.textSecondary, marginTop: 2, fontFamily: 'Inter-Regular' },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold', marginBottom: 16 },
  timelineCard: { marginBottom: 16 },
  timelineStep: { flexDirection: 'row', minHeight: 44 },
  timelineLeft: { alignItems: 'center', width: 24, marginRight: 12 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.border, marginTop: 4 },
  timelineDotActive: { backgroundColor: colors.success },
  timelineDotCurrent: { backgroundColor: colors.primaryBlue, width: 14, height: 14, borderRadius: 7 },
  timelineLine: { width: 2, flex: 1, backgroundColor: colors.border, marginVertical: 4 },
  timelineLineActive: { backgroundColor: colors.success },
  timelineContent: { flex: 1, paddingBottom: 16 },
  timelineLabel: { fontSize: 14, color: colors.textSecondary, fontFamily: 'Inter-Medium', marginTop: 2 },
  timelineLabelActive: { color: colors.textPrimary },
  detailCard: { marginBottom: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  detailLabel: { fontSize: 14, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  detailValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  amountRow: { paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border, marginBottom: 0 },
  cancelBtn: { borderColor: colors.error, marginTop: 8 },
  reviewBtn: { marginTop: 12 },
});

export default BookingDetailScreen;
