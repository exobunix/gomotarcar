import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import AmountDisplay from '../../components/common/AmountDisplay';
import EmptyState from '../../components/common/EmptyState';
import { paymentService } from '../../services/payment.service';
import { PaymentData } from '../../types/navigation';
import { formatDate } from '../../utils/helpers';

interface Props {
  navigation: any;
}

const PaymentHistoryScreen: React.FC<Props> = ({ navigation }) => {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentService.list({ limit: 50 });
      setPayments(res.data);
    } catch { }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const unsub = navigation.addListener('focus', load); return unsub; }, [navigation, load]);

  const totalSpent = payments
    .filter((p) => p.status === 'captured')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment History</Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={payments}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primaryBlue} />}
        ListHeaderComponent={
          <Card variant="elevated" padding={16} style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{payments.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <AmountDisplay amount={totalSpent} size="md" color={colors.primaryBlue} />
                <Text style={styles.statLabel}>Spent</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{payments.filter((p) => p.status === 'captured').length}</Text>
                <Text style={styles.statLabel}>Paid</Text>
              </View>
            </View>
          </Card>
        }
        ListEmptyComponent={
          <EmptyState icon="💳" title="No Payments" description="Your payment history will appear here" />
        }
        renderItem={({ item }) => (
          <View>
            <Card variant="outlined" padding={14} style={styles.paymentCard}>
              <View style={styles.payHeader}>
                <View style={styles.payInfo}>
                  <Text style={styles.payId}>#{item.paymentId?.slice(-8).toUpperCase()}</Text>
                  <Text style={styles.payPurpose}>{item.purpose}</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>
              <View style={styles.payFooter}>
                <AmountDisplay amount={item.amount} size="md" color={colors.textPrimary} />
                <Text style={styles.payDate}>{formatDate(item.createdAt, 'time')}</Text>
              </View>
            </Card>
          </View>
        )}
      />
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
  statsCard: { margin: 20, marginBottom: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 4, fontFamily: 'Inter-Regular' },
  statDivider: { width: 1, height: 40, backgroundColor: colors.border },
  paymentCard: { marginHorizontal: 20, marginBottom: 8 },
  payHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  payInfo: { flex: 1 },
  payId: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  payPurpose: { fontSize: 12, color: colors.textSecondary, marginTop: 2, fontFamily: 'Inter-Regular', textTransform: 'capitalize' },
  payFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border },
  payDate: { fontSize: 12, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
});

export default PaymentHistoryScreen;
