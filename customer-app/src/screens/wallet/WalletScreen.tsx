import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import AmountDisplay from '../../components/common/AmountDisplay';
import EmptyState from '../../components/common/EmptyState';
import Input from '../../components/common/Input';
import { fetchWallet, fetchTransactions } from '../../redux/slices/walletSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { formatDate } from '../../utils/helpers';

interface Props {
  navigation: any;
}

const topUpAmounts = [500, 1000, 2000, 5000];

const WalletScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { wallet, transactions, loading } = useSelector((s: RootState) => s.wallet);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(500);

  const load = useCallback(() => {
    dispatch(fetchWallet());
    dispatch(fetchTransactions({ limit: 20 }));
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const unsub = navigation.addListener('focus', load); return unsub; }, [navigation, load]);

  const handleTopUp = () => {
    Alert.alert('Top Up', `Add ₹${topUpAmount} to your wallet?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Proceed', onPress: () => Alert.alert('Success', 'Top-up initiated. Complete payment through the payment screen.') },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet</Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primaryBlue} />}
        ListHeaderComponent={
          <>
            {/* Balance Card */}
            <Card variant="elevated" padding={24} style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <AmountDisplay amount={wallet?.balance || 0} size="lg" color={colors.white} style={styles.balanceAmount} />
              <View style={styles.balanceRow}>
                <Text style={styles.balanceMeta}>Credited: ₹{(wallet?.lifetimeCredited || 0).toLocaleString('en-IN')}</Text>
                <Text style={styles.balanceMeta}>|</Text>
                <Text style={styles.balanceMeta}>Debited: ₹{(wallet?.lifetimeDebited || 0).toLocaleString('en-IN')}</Text>
              </View>
              {showTopUp ? (
                <View style={styles.topUpSection}>
                  <View style={styles.topUpChips}>
                    {topUpAmounts.map((amt) => (
                      <TouchableOpacity
                        key={amt}
                        style={[styles.topUpChip, topUpAmount === amt && styles.topUpChipActive]}
                        onPress={() => setTopUpAmount(amt)}
                      >
                        <Text style={[styles.topUpChipText, topUpAmount === amt && styles.topUpChipTextActive]}>₹{amt}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Button title={`Add ₹${topUpAmount}`} onPress={handleTopUp} size="md" style={styles.topUpBtn} />
                  <TouchableOpacity onPress={() => setShowTopUp(false)}>
                    <Text style={styles.cancelTopUp}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Button title="Add Money" variant="secondary" size="md" onPress={() => setShowTopUp(true)} style={styles.addMoneyBtn} />
              )}
            </Card>

            <Text style={styles.sectionTitle}>Transaction History</Text>
          </>
        }
        ListEmptyComponent={
          <EmptyState icon="💰" title="No Transactions" description="Your wallet transactions will appear here" />
        }
        renderItem={({ item }) => (
          <View style={styles.txnItem}>
            <View style={styles.txnLeft}>
              <Text style={styles.txnIcon}>{item.type === 'credit' ? '📥' : '📤'}</Text>
              <View style={styles.txnInfo}>
                <Text style={styles.txnDesc}>{item.description}</Text>
                <Text style={styles.txnDate}>{formatDate(item.createdAt, 'time')}</Text>
              </View>
            </View>
            <View style={styles.txnRight}>
              <AmountDisplay
                amount={item.amount}
                size="sm"
                color={item.type === 'credit' ? colors.success : colors.error}
                style={{ fontWeight: '700' }}
              />
              {item.type === 'credit' && <Text style={styles.txnArrow}>+</Text>}
              {item.type === 'debit' && <Text style={[styles.txnArrow, { color: colors.error }]}>-</Text>}
            </View>
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
  balanceCard: { margin: 20, marginBottom: 8, backgroundColor: colors.primaryBlue, borderRadius: 24 },
  balanceLabel: { fontSize: 14, color: colors.lightBlue, fontFamily: 'Inter-Medium' },
  balanceAmount: { fontSize: 36, marginVertical: 8, fontWeight: '700' },
  balanceRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  balanceMeta: { fontSize: 12, color: colors.lightBlue, fontFamily: 'Inter-Regular' },
  addMoneyBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14 },
  topUpSection: { alignItems: 'center' },
  topUpChips: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap', justifyContent: 'center' },
  topUpChip: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  topUpChipActive: { backgroundColor: colors.white },
  topUpChipText: { fontSize: 14, fontWeight: '600', color: colors.white, fontFamily: 'Inter-SemiBold' },
  topUpChipTextActive: { color: colors.primaryBlue },
  topUpBtn: { width: '100%', marginBottom: 8 },
  cancelTopUp: { fontSize: 13, color: colors.lightBlue, fontFamily: 'Inter-Medium' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold', marginHorizontal: 20, marginBottom: 12, marginTop: 8 },
  txnItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  txnLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  txnIcon: { fontSize: 18, marginRight: 12 },
  txnInfo: { flex: 1 },
  txnDesc: { fontSize: 14, color: colors.textPrimary, fontFamily: 'Inter-Medium' },
  txnDate: { fontSize: 12, color: colors.textSecondary, marginTop: 2, fontFamily: 'Inter-Regular' },
  txnRight: { alignItems: 'flex-end' },
  txnArrow: { fontSize: 14, color: colors.success, fontWeight: '700', marginTop: -2 },
});

export default WalletScreen;
