import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import Header from '../../components/common/Header';
import { cleanerService } from '../../services/cleaner.service';

interface Props { navigation: any; route: any }

const SalaryDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { cleanerId } = route.params;
  const [cleaner, setCleaner] = useState<any>(null);

  useEffect(() => {
    cleanerService.getById(cleanerId).then((r) => setCleaner(r.data)).catch(() => null);
  }, [cleanerId]);

  if (!cleaner) return <View style={styles.container}><Header title="Salary" onBack={() => navigation.goBack()} /></View>;

  const earnings = cleaner.totalEarnings || 0;
  const monthEarnings = Math.round(earnings * 0.3); // estimated monthly

  return (
    <View style={styles.container}>
      <Header title={`${cleaner.name || 'Cleaner'} - Salary`} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card variant="elevated" padding={20}>
          <Text style={styles.totalLabel}>Total Earnings</Text>
          <Text style={styles.totalAmount}>₹{earnings.toLocaleString('en-IN')}</Text>
          <Text style={styles.totalSub}>{cleaner.completedTasks || 0} tasks completed</Text>
        </Card>

        <View style={styles.periodRow}>
          <View style={styles.periodCard}><Text style={styles.periodIcon}>📅</Text><Text style={styles.periodLabel}>This Month</Text><Text style={styles.periodValue}>₹{monthEarnings}</Text></View>
          <View style={styles.periodCard}><Text style={styles.periodIcon}>⭐</Text><Text style={styles.periodLabel}>Rating</Text><Text style={styles.periodValue}>{(cleaner.rating || 0).toFixed(1)}</Text></View>
          <View style={styles.periodCard}><Text style={styles.periodIcon}>📊</Text><Text style={styles.periodLabel}>Tasks</Text><Text style={styles.periodValue}>{cleaner.completedTasks || 0}</Text></View>
        </View>

        <Card variant="outlined" padding={16}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          {cleaner.payments?.length > 0 ? cleaner.payments.map((p: any, i: number) => (
            <View key={i} style={styles.paymentRow}>
              <Text style={styles.paymentDate}>{p.date || 'N/A'}</Text>
              <Text style={styles.paymentAmount}>₹{p.amount || 0}</Text>
            </View>
          )) : (
            <Text style={styles.noData}>No payment history available</Text>
          )}
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  totalLabel: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', fontFamily: 'Inter-Regular' },
  totalAmount: { fontSize: 36, fontWeight: '700', color: colors.success, textAlign: 'center', marginVertical: 8, fontFamily: 'Inter-Bold' },
  totalSub: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', fontFamily: 'Inter-Regular' },
  periodRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 16 },
  periodCard: { width: '31%', backgroundColor: colors.white, borderRadius: 16, padding: 14, alignItems: 'center' },
  periodIcon: { fontSize: 20, marginBottom: 4 },
  periodLabel: { fontSize: 11, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  periodValue: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginTop: 4, fontFamily: 'Inter-Bold' },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold', marginBottom: 12 },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  paymentDate: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  paymentAmount: { fontSize: 14, fontWeight: '600', color: colors.success, fontFamily: 'Inter-SemiBold' },
  noData: { fontSize: 13, color: colors.textLight, textAlign: 'center', fontFamily: 'Inter-Regular' },
});

export default SalaryDetailScreen;
