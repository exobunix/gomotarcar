import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import { Button, Card, LoadingOverlay, StatusBadge, AmountDisplay } from '../../components/common';
import { fetchPlans, fetchMySubscriptions, subscribe, cancelSubscription } from '../../redux/slices/subscriptionSlice';
import { fetchVehicles } from '../../redux/slices/vehicleSlice';
import { fetchApartments } from '../../redux/slices/apartmentSlice';
import { AppDispatch, RootState } from '../../redux/store';

interface Props {
  navigation: any;
}

const SubscriptionsScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { plans, mySubscriptions, loading } = useSelector((s: RootState) => s.subscription);
  const { vehicles } = useSelector((s: RootState) => s.vehicles);
  const { apartments } = useSelector((s: RootState) => s.apartments);
  const { user } = useSelector((s: RootState) => s.auth);
  const [tab, setTab] = useState<'plans' | 'my'>('plans');

  useEffect(() => {
    dispatch(fetchPlans());
    dispatch(fetchMySubscriptions());
    if (user?._id) {
      dispatch(fetchVehicles(user._id));
      dispatch(fetchApartments(user._id));
    }
  }, []);

  const handleSubscribe = (plan: any) => {
    const defaultV = vehicles.find((v) => v.isPrimary) || vehicles[0];
    const defaultA = apartments.find((a) => a.isDefault) || apartments[0];
    if (!defaultV || !defaultA) {
      Alert.alert('Required', 'Please add a vehicle and apartment first');
      return;
    }
    navigation.navigate('SubscriptionCheckout', {
      plan,
      vehicleId: defaultV._id,
      apartmentId: defaultA._id,
    });
  };

  const handleCancel = (id: string) => {
    Alert.alert('Cancel Subscription', 'Are you sure? This cannot be undone.', [
      { text: 'Keep', style: 'cancel' },
      { text: 'Cancel', style: 'destructive', onPress: () => dispatch(cancelSubscription(id)) },
    ]);
  };

  const active = mySubscriptions.filter((s) => s.status === 'active');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscriptions</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, tab === 'plans' && styles.tabActive]} onPress={() => setTab('plans')}>
          <Text style={[styles.tabText, tab === 'plans' && styles.tabTextActive]}>Plans</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'my' && styles.tabActive]} onPress={() => setTab('my')}>
          <Text style={[styles.tabText, tab === 'my' && styles.tabTextActive]}>My Plans ({active.length})</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {tab === 'plans' ? (
          plans.map((plan) => (
            <Card key={plan._id} variant="elevated" padding={20} style={styles.planCard}>
              <View style={styles.planHeader}>
                <Text style={styles.planEmoji}>{plan.icon || '📋'}</Text>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <StatusBadge status={plan.duration} size="sm" />
                </View>
                <View style={styles.planPrice}>
                  {plan.discountedPrice ? (
                    <>
                      <Text style={styles.oldPrice}>₹{plan.price}</Text>
                      <AmountDisplay amount={plan.discountedPrice} size="lg" color={colors.primaryBlue} />
                    </>
                  ) : (
                    <AmountDisplay amount={plan.price} size="lg" color={colors.primaryBlue} />
                  )}
                </View>
              </View>
              <Text style={styles.planDesc}>{plan.description}</Text>
              <View style={styles.featuresList}>
                {plan.features?.map((f, i) => (
                  <Text key={i} style={styles.featureItem}>✓ {f}</Text>
                ))}
                <Text style={styles.featureItem}>✓ {plan.cleaningsIncluded} cleanings included</Text>
              </View>
              <Button title="Subscribe Now" onPress={() => handleSubscribe(plan)} size="md" style={styles.subBtn} />
            </Card>
          ))
        ) : (
          mySubscriptions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No Active Plans</Text>
              <Text style={styles.emptySub}>Subscribe to a plan and save up to 40%</Text>
              <Button title="View Plans" variant="outline" onPress={() => setTab('plans')} style={{ marginTop: 16 }} />
            </View>
          ) : (
            mySubscriptions.map((sub) => (
              <Card key={sub._id} variant="elevated" padding={16} style={styles.subCard}>
                <View style={styles.subHeader}>
                  <Text style={styles.subPlanName}>{typeof sub.planId === 'object' ? sub.planId.name : 'Subscription'}</Text>
                  <StatusBadge status={sub.status} />
                </View>
                <View style={styles.progressRow}>
                  <Text style={styles.progressText}>{sub.cleaningsUsed} / {sub.cleaningsTotal} cleanings used</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${(sub.cleaningsUsed / sub.cleaningsTotal) * 100}%` }]} />
                </View>
                <View style={styles.subActions}>
                  <Text style={styles.expiryText}>
                    {sub.status === 'active' ? `Valid till ${new Date(sub.endDate).toLocaleDateString()}` : `Cancelled`}
                  </Text>
                  {sub.status === 'active' && (
                    <TouchableOpacity onPress={() => handleCancel(sub._id)}>
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            ))
          )
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
  tabBar: { flexDirection: 'row', backgroundColor: colors.white, paddingHorizontal: 20, paddingBottom: 12 },
  tab: { marginRight: 24, paddingBottom: 8 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primaryBlue },
  tabText: { fontSize: 15, color: colors.textSecondary, fontFamily: 'Inter-Medium' },
  tabTextActive: { color: colors.primaryBlue, fontWeight: '600' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  planCard: { marginBottom: 16 },
  planHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  planEmoji: { fontSize: 32, marginRight: 14 },
  planInfo: { flex: 1 },
  planName: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold', marginBottom: 4 },
  planDesc: { fontSize: 14, color: colors.textSecondary, marginBottom: 12, fontFamily: 'Inter-Regular' },
  planPrice: { alignItems: 'flex-end' },
  oldPrice: { fontSize: 14, color: colors.textSecondary, textDecorationLine: 'line-through', fontFamily: 'Inter-Regular' },
  featuresList: { marginBottom: 16 },
  featureItem: { fontSize: 13, color: colors.textSecondary, marginBottom: 4, fontFamily: 'Inter-Regular' },
  subBtn: { width: '100%' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold', marginBottom: 8 },
  emptySub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', fontFamily: 'Inter-Regular' },
  subCard: { marginBottom: 12 },
  subHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  subPlanName: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  progressRow: { marginBottom: 6 },
  progressText: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  progressBarBg: { height: 8, backgroundColor: colors.border, borderRadius: 4, marginBottom: 12, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: colors.primaryBlue, borderRadius: 4 },
  subActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  expiryText: { fontSize: 12, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  cancelText: { fontSize: 13, fontWeight: '600', color: colors.error, fontFamily: 'Inter-SemiBold' },
});

export default SubscriptionsScreen;
