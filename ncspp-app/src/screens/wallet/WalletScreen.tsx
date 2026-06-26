import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { colors } from '../../theme/colors';
import { fetchWallet, requestPayout } from '../../redux/slices/walletSlice';
import { fetchTransactions } from '../../redux/slices/walletSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus';

const WalletScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { wallet, loading } = useSelector((state: RootState) => state.wallet);
  const [showPayout, setShowPayout] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [upiId, setUpiId] = useState('');

  useRefreshOnFocus(() => {
    dispatch(fetchWallet());
    dispatch(fetchTransactions({ limit: 10 }));
  });

  useEffect(() => {
    dispatch(fetchWallet());
    dispatch(fetchTransactions({ limit: 10 }));
  }, [dispatch]);

  const handlePayout = async () => {
    if (!payoutAmount || parseFloat(payoutAmount) <= 0) return;
    const amount = parseFloat(payoutAmount);
    if (wallet && amount > (wallet.balance || 0)) {
      Alert.alert('Insufficient Balance', 'You do not have enough balance for this payout.');
      return;
    }
    await dispatch(requestPayout({ amount, upiId: upiId || undefined }));
    setShowPayout(false);
    setPayoutAmount('');
    setUpiId('');
    dispatch(fetchWallet());
  };

  const balance = wallet?.balance || 0;
  const pendingPayouts = wallet?.pendingPayouts || 0;
  const totalEarned = wallet?.totalEarned || 0;

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>₹{balance.toLocaleString()}</Text>
          <View style={styles.balanceMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Total Earned</Text>
              <Text style={styles.metaValue}>₹{totalEarned.toLocaleString()}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Pending</Text>
              <Text style={styles.metaValue}>₹{pendingPayouts.toLocaleString()}</Text>
            </View>
          </View>
        </Card>

        <View style={styles.actionRow}>
          <Button
            title="Request Payout"
            onPress={() => setShowPayout(!showPayout)}
            variant="primary"
            size="medium"
            style={styles.actionBtn}
            disabled={balance <= 0}
          />
          <Button
            title="History"
            onPress={() => navigation.navigate('PaymentHistory')}
            variant="outline"
            size="medium"
            style={styles.actionBtn}
          />
        </View>

        {showPayout && (
          <Card style={styles.payoutCard}>
            <Text style={styles.payoutTitle}>Request Payout</Text>
            <View style={styles.payoutField}>
              <Text style={styles.payoutLabel}>Amount (₹)</Text>
              <TextInput
                style={styles.payoutInput}
                value={payoutAmount}
                onChangeText={setPayoutAmount}
                placeholder="Enter amount"
                keyboardType="numeric"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <View style={styles.payoutField}>
              <Text style={styles.payoutLabel}>UPI ID (Optional)</Text>
              <TextInput
                style={styles.payoutInput}
                value={upiId}
                onChangeText={setUpiId}
                placeholder="e.g., name@upi"
                autoCapitalize="none"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <Button
              title="Submit Request"
              onPress={handlePayout}
              variant="primary"
              size="medium"
              disabled={!payoutAmount}
            />
          </Card>
        )}

        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <Button
          title="View All Transactions →"
          onPress={() => navigation.navigate('PaymentHistory')}
          variant="outline"
          size="small"
          style={styles.viewAllBtn}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16, paddingBottom: 32 },
  balanceCard: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 24,
    marginBottom: 16,
  },
  balanceLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  balanceAmount: { fontSize: 40, fontWeight: '700', color: colors.white, marginVertical: 8 },
  balanceMeta: {
    flexDirection: 'row', gap: 40, marginTop: 8,
  },
  metaItem: { alignItems: 'center' },
  metaLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  metaValue: { fontSize: 16, fontWeight: '600', color: colors.white, marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  actionBtn: { flex: 1 },
  payoutCard: { marginBottom: 16 },
  payoutTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 },
  payoutField: { marginBottom: 12 },
  payoutLabel: { fontSize: 13, fontWeight: '500', color: colors.textSecondary, marginBottom: 6 },
  payoutInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 8,
    paddingVertical: 10, paddingHorizontal: 12, fontSize: 15, color: colors.text,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 },
  viewAllBtn: { marginBottom: 16 },
});

export default WalletScreen;
