import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import AmountDisplay from '../../components/common/AmountDisplay';
import StatusBadge from '../../components/common/StatusBadge';
import { fetchPlans } from '../../redux/slices/subscriptionSlice';
import { AppDispatch, RootState } from '../../redux/store';

interface Props {
  navigation: any;
  route: any;
}

const packages = [
  { id: 'basic', name: 'Basic Wash', description: 'Exterior wash, windows, tyres', price: 149, icon: '🚿', type: 'basic' },
  { id: 'standard', name: 'Standard Wash', description: 'Full exterior + interior vacuum', price: 299, icon: '🧹', type: 'standard' },
  { id: 'premium', name: 'Premium Wash', description: 'Full exterior + interior + polish', price: 499, icon: '✨', type: 'premium' },
];

const PackageSelectionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { vehicleId, apartmentId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { plans } = useSelector((s: RootState) => s.subscription);
  const [selectedPackage, setSelectedPackage] = React.useState<string>('standard');

  useEffect(() => {
    dispatch(fetchPlans());
  }, []);

  const sel = packages.find((p) => p.id === selectedPackage)!;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Service</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card variant="elevated" padding={12} style={styles.planBanner}>
          <Text style={styles.planBannerIcon}>💡</Text>
          <Text style={styles.planBannerText}>
            Save up to 40% with a subscription plan. View our{' '}
            <Text style={styles.planBannerLink} onPress={() => navigation.navigate('Subscriptions')}>subscription plans</Text>
          </Text>
        </Card>

        {packages.map((pkg) => (
          <TouchableOpacity
            key={pkg.id}
            style={[styles.pkgCard, selectedPackage === pkg.id && styles.pkgCardActive]}
            onPress={() => setSelectedPackage(pkg.id)}
          >
            <View style={styles.pkgHeader}>
              <Text style={styles.pkgIcon}>{pkg.icon}</Text>
              <View style={styles.pkgInfo}>
                <Text style={styles.pkgName}>{pkg.name}</Text>
                <Text style={styles.pkgDesc}>{pkg.description}</Text>
              </View>
              <AmountDisplay amount={pkg.price} size="md" color={colors.primaryBlue} />
            </View>
            {selectedPackage === pkg.id && (
              <View style={styles.selectedIndicator}>
                <Text style={styles.selectedText}>✓ Selected</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {plans.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Subscription Plans</Text>
            {plans.slice(0, 2).map((plan) => (
              <TouchableOpacity
                key={plan._id}
                style={styles.planCard}
                onPress={() => navigation.navigate('Subscriptions')}
              >
                <View style={styles.planRow}>
                  <Text style={styles.planEmoji}>📋</Text>
                  <View style={styles.planInfo}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planCleanings}>{plan.cleaningsIncluded} cleanings / {plan.duration}</Text>
                  </View>
                  <AmountDisplay amount={plan.discountedPrice || plan.price} size="md" color={colors.primaryBlue} />
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <AmountDisplay amount={sel.price} size="lg" color={colors.textPrimary} />
        </View>
        <Button
          title="Proceed to Checkout"
          onPress={() => navigation.navigate('HireCheckout', {
            packageId: selectedPackage,
            vehicleId,
            apartmentId,
            amount: sel.price,
          })}
          size="lg"
          style={styles.checkoutBtn}
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
  scrollContent: { padding: 20, paddingBottom: 160 },
  planBanner: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  planBannerIcon: { fontSize: 20, marginRight: 10 },
  planBannerText: { flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 18, fontFamily: 'Inter-Regular' },
  planBannerLink: { color: colors.primaryBlue, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold', marginBottom: 12 },
  pkgCard: {
    backgroundColor: colors.white, borderRadius: 20, padding: 16, marginBottom: 10,
    borderWidth: 1.5, borderColor: colors.border,
  },
  pkgCardActive: { borderColor: colors.primaryBlue, backgroundColor: colors.lightBlue },
  pkgHeader: { flexDirection: 'row', alignItems: 'center' },
  pkgIcon: { fontSize: 28, marginRight: 14 },
  pkgInfo: { flex: 1 },
  pkgName: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  pkgDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 2, fontFamily: 'Inter-Regular' },
  selectedIndicator: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.primaryBlue + '30' },
  selectedText: { fontSize: 13, fontWeight: '600', color: colors.primaryBlue, fontFamily: 'Inter-SemiBold' },
  planCard: { backgroundColor: colors.white, borderRadius: 16, padding: 14, marginBottom: 8 },
  planRow: { flexDirection: 'row', alignItems: 'center' },
  planEmoji: { fontSize: 22, marginRight: 12 },
  planInfo: { flex: 1 },
  planName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  planCleanings: { fontSize: 12, color: colors.textSecondary, marginTop: 1, fontFamily: 'Inter-Regular' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 32,
    backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  totalLabel: { fontSize: 16, color: colors.textSecondary, fontFamily: 'Inter-Medium' },
  checkoutBtn: { width: '100%' },
});

export default PackageSelectionScreen;
