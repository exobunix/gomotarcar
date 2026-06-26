import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import { Button, Card, LoadingOverlay, AmountDisplay } from '../../components/common';
import { subscribe } from '../../redux/slices/subscriptionSlice';
import { AppDispatch, RootState } from '../../redux/store';

interface Props {
  navigation: any;
  route: any;
}

const SubscriptionCheckoutScreen: React.FC<Props> = ({ navigation, route }) => {
  const { plan, vehicleId, apartmentId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { vehicles } = useSelector((s: RootState) => s.vehicles);
  const { apartments } = useSelector((s: RootState) => s.apartments);
  const [loading, setLoading] = useState(false);

  const vehicle = vehicles.find((v) => v._id === vehicleId);
  const apartment = apartments.find((a) => a._id === apartmentId);
  const price = plan.discountedPrice || plan.price;

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      await dispatch(subscribe({ planId: plan._id, vehicleId, apartmentId })).unwrap();
      Alert.alert('Success', `You're now subscribed to ${plan.name}!`, [
        { text: 'View My Plans', onPress: () => navigation.navigate('Subscriptions') },
      ]);
    } catch (err: any) {
      Alert.alert('Error', typeof err === 'string' ? err : 'Subscription failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading} message="Processing subscription..." />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Plan</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        <Card variant="elevated" padding={20} style={styles.planCard}>
          <View style={styles.planRow}>
            <Text style={styles.planEmoji}>{plan.icon || '📋'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planDuration}>{plan.cleaningsIncluded} cleanings / {plan.duration}</Text>
            </View>
            <AmountDisplay amount={price} size="lg" color={colors.primaryBlue} />
          </View>
        </Card>

        <Card variant="outlined" padding={16} style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Vehicle</Text>
            <Text style={styles.detailValue}>{vehicle?.vehicleNumber} ({vehicle?.make})</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>{apartment?.buildingName} - {apartment?.unitNumber}</Text>
          </View>
          <View style={[styles.detailRow, styles.detailTotal]}>
            <Text style={styles.detailTotalLabel}>Total</Text>
            <AmountDisplay amount={price} size="lg" color={colors.primaryBlue} />
          </View>
        </Card>

        <Card variant="outlined" padding={16} style={styles.featureCard}>
          <Text style={styles.featureTitle}>What's Included</Text>
          {plan.features?.map((f: string, i: number) => (
            <Text key={i} style={styles.featureItem}>✓ {f}</Text>
          ))}
          <Text style={styles.featureItem}>✓ {plan.cleaningsIncluded} professional cleanings</Text>
        </Card>
      </View>

      <View style={styles.bottomBar}>
        <Button title={`Subscribe ₹${price}`} onPress={handleSubscribe} size="lg" loading={loading} style={{ width: '100%' }} />
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
  content: { flex: 1, padding: 20 },
  planCard: { marginBottom: 16 },
  planRow: { flexDirection: 'row', alignItems: 'center' },
  planEmoji: { fontSize: 32, marginRight: 14 },
  planName: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  planDuration: { fontSize: 13, color: colors.textSecondary, marginTop: 2, fontFamily: 'Inter-Regular' },
  detailCard: { marginBottom: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  detailLabel: { fontSize: 14, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  detailValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  detailTotal: { paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border, marginBottom: 0 },
  detailTotalLabel: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  featureCard: { marginBottom: 16 },
  featureTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold', marginBottom: 10 },
  featureItem: { fontSize: 13, color: colors.textSecondary, marginBottom: 6, fontFamily: 'Inter-Regular' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 32,
    backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border,
  },
});

export default SubscriptionCheckoutScreen;
