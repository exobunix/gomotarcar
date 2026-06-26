import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import { Button, LoadingOverlay } from '../../components/common';
import Card from '../../components/common/Card';
import AmountDisplay from '../../components/common/AmountDisplay';
import Input from '../../components/common/Input';
import { createBooking } from '../../redux/slices/bookingSlice';
import { AppDispatch, RootState } from '../../redux/store';

interface Props {
  navigation: any;
  route: any;
}

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '14:00', '15:00', '16:00', '17:00', '18:00',
];

const serviceNames: Record<string, string> = {
  basic: 'Basic Wash',
  standard: 'Standard Wash',
  premium: 'Premium Wash',
};

const CheckoutScreen: React.FC<Props> = ({ navigation, route }) => {
  const { packageId, vehicleId, apartmentId, amount } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { vehicles } = useSelector((s: RootState) => s.vehicles);
  const { apartments } = useSelector((s: RootState) => s.apartments);
  const vehicle = vehicles.find((v) => v._id === vehicleId);
  const apartment = apartments.find((a) => a._id === apartmentId);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Required', 'Please select a date and time slot');
      return;
    }

    setLoading(true);
    try {
      await dispatch(createBooking({
        vehicleId,
        apartmentId,
        serviceType: packageId,
        packageName: serviceNames[packageId] || packageId,
        amount,
        scheduledDate: selectedDate,
        scheduledTime: selectedTime,
        notes: notes.trim() || undefined,
      })).unwrap();

      Alert.alert('Success', 'Booking confirmed! A cleaner will be assigned shortly.', [
        { text: 'View Bookings', onPress: () => navigation.navigate('BookingsTab') },
      ]);
    } catch (err: any) {
      Alert.alert('Error', typeof err === 'string' ? err : 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: Date) => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  };

  const isToday = (d: Date) => d.toDateString() === today.toDateString();
  const dateValue = (d: Date) => d.toISOString().split('T')[0];

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading} message="Confirming booking..." />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card variant="elevated" padding={16} style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service</Text>
            <Text style={styles.summaryValue}>{serviceNames[packageId]}</Text>
          </View>
          {vehicle && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Vehicle</Text>
              <Text style={styles.summaryValue}>{vehicle.vehicleNumber} ({vehicle.make})</Text>
            </View>
          )}
          {apartment && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Location</Text>
              <Text style={styles.summaryValue}>{apartment.buildingName} - {apartment.unitNumber}</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <AmountDisplay amount={amount} size="lg" color={colors.primaryBlue} />
          </View>
        </Card>

        <Text style={styles.fieldLabel}>Select Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
          {dates.map((d) => {
            const val = dateValue(d);
            const active = selectedDate === val;
            return (
              <TouchableOpacity
                key={val}
                style={[styles.dateChip, active && styles.dateChipActive]}
                onPress={() => setSelectedDate(val)}
              >
                <Text style={[styles.dateDay, active && styles.dateDayActive]}>
                  {isToday(d) ? 'Today' : d.toLocaleDateString('en', { weekday: 'short' })}
                </Text>
                <Text style={[styles.dateNum, active && styles.dateNumActive]}>
                  {formatDate(d)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.fieldLabel}>Select Time</Text>
        <View style={styles.timeGrid}>
          {timeSlots.map((time) => (
            <TouchableOpacity
              key={time}
              style={[styles.timeChip, selectedTime === time && styles.timeChipActive]}
              onPress={() => setSelectedTime(time)}
            >
              <Text style={[styles.timeText, selectedTime === time && styles.timeTextActive]}>{time}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Notes (Optional)"
          placeholder="Any special instructions..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          style={{ minHeight: 72, textAlignVertical: 'top' }}
        />
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          title={`Pay ₹${amount} & Confirm`}
          onPress={handleBook}
          size="lg"
          loading={loading}
          disabled={!selectedDate || !selectedTime}
          style={styles.payBtn}
        />
      </View>
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
  scrollContent: { padding: 20, paddingBottom: 120 },
  summaryCard: { marginBottom: 24 },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 14, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  totalRow: { paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border, marginBottom: 0 },
  totalLabel: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  fieldLabel: { fontSize: 14, fontWeight: '500', color: colors.textPrimary, fontFamily: 'Inter-Medium', marginBottom: 10, marginTop: 8 },
  dateScroll: { marginBottom: 20 },
  dateChip: {
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14,
    backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.border,
    marginRight: 8, alignItems: 'center', minWidth: 72,
  },
  dateChipActive: { borderColor: colors.primaryBlue, backgroundColor: colors.lightBlue },
  dateDay: { fontSize: 12, color: colors.textSecondary, fontFamily: 'Inter-Medium' },
  dateDayActive: { color: colors.primaryBlue },
  dateNum: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold', marginTop: 2 },
  dateNumActive: { color: colors.primaryBlue },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  timeChip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14,
    backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.border,
  },
  timeChipActive: { borderColor: colors.primaryBlue, backgroundColor: colors.lightBlue },
  timeText: { fontSize: 14, color: colors.textSecondary, fontFamily: 'Inter-Medium' },
  timeTextActive: { color: colors.primaryBlue, fontWeight: '600' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 32, backgroundColor: colors.white,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  payBtn: { width: '100%' },
});

export default CheckoutScreen;
