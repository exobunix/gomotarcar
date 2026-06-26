import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { colors } from '../../theme/colors';
import { fetchTransactions } from '../../redux/slices/walletSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus';

const PaymentHistoryScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { transactions, loading } = useSelector((state: RootState) => state.wallet);

  useRefreshOnFocus(() => dispatch(fetchTransactions({ limit: 50 })));

  useEffect(() => {
    dispatch(fetchTransactions({ limit: 50 }));
  }, [dispatch]);

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      credit: '💰', debit: '💸', refund: '↩️', payout: '🏦',
    };
    return icons[type] || '💳';
  };

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading} />
      <ScrollView contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => dispatch(fetchTransactions({ limit: 50 }))} />}
      >
        {transactions.length === 0 ? (
          <EmptyState icon="💳" title="No Transactions" message="Payment history will appear here once you start receiving payments." />
        ) : (
          transactions.map((txn: any) => (
            <Card key={txn._id} style={styles.txnCard}>
              <View style={styles.txnHeader}>
                <Text style={styles.txnIcon}>{getTypeIcon(txn.type)}</Text>
                <View style={styles.txnInfo}>
                  <Text style={styles.txnType}>{txn.type || 'Transaction'}</Text>
                  <Text style={styles.txnDate}>
                    {new Date(txn.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </Text>
                </View>
                <Text style={[
                  styles.txnAmount,
                  txn.type === 'credit' || txn.type === 'refund'
                    ? styles.amountPositive
                    : styles.amountNegative,
                ]}>
                  {txn.type === 'credit' || txn.type === 'refund' ? '+' : '-'}₹
                  {Math.abs(txn.amount || 0).toLocaleString()}
                </Text>
              </View>
              {txn.description && (
                <Text style={styles.txnDesc}>{txn.description}</Text>
              )}
              <View style={styles.txnFooter}>
                <StatusBadge status={txn.status || 'completed'} />
                {txn.method && (
                  <Text style={styles.txnMethod}>{txn.method}</Text>
                )}
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16, gap: 10, paddingBottom: 32 },
  txnCard: {},
  txnHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  txnIcon: { fontSize: 24 },
  txnInfo: { flex: 1 },
  txnType: { fontSize: 15, fontWeight: '600', color: colors.text, textTransform: 'capitalize' },
  txnDate: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  txnAmount: { fontSize: 16, fontWeight: '700' },
  amountPositive: { color: '#2E7D32' },
  amountNegative: { color: '#C62828' },
  txnDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 6, marginLeft: 34 },
  txnFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 8, marginLeft: 34,
  },
  txnMethod: { fontSize: 12, color: colors.textSecondary },
});

export default PaymentHistoryScreen;
