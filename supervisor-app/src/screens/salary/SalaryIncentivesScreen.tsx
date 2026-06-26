import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import Header from '../../components/common/Header';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { fetchCleaners } from '../../redux/slices/cleanerSlice';
import { AppDispatch, RootState } from '../../redux/store';

interface Props { navigation: any }

const SalaryIncentivesScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { cleaners, loading } = useSelector((s: RootState) => s.cleaners);
  const [tab, setTab] = useState<'cleaners' | 'incentives'>('cleaners');

  const load = useCallback(() => { dispatch(fetchCleaners()); }, [dispatch]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { const unsub = navigation.addListener('focus', load); return unsub; }, [navigation, load]);

  const renderCleaner = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => navigation.navigate('SalaryDetail', { cleanerId: item._id })}>
      <Card variant="outlined" padding={14} style={styles.cleanerCard}>
        <View style={styles.cleanerTop}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{(item.name || '?')[0]}</Text></View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.cleanerName}>{item.name}</Text>
            <Text style={styles.cleanerStats}>{item.completedTasks || 0} tasks • Rating: {item.rating?.toFixed(1) || 'N/A'}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.earningsAmount}>₹{item.totalEarnings || 0}</Text>
            <Text style={styles.earningsLabel}>Earnings</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Salary & Incentives" onBack={() => navigation.goBack()} />
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tab, tab === 'cleaners' && styles.tabActive]} onPress={() => setTab('cleaners')}>
          <Text style={[styles.tabText, tab === 'cleaners' && styles.tabTextActive]}>Cleaner Earnings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'incentives' && styles.tabActive]} onPress={() => setTab('incentives')}>
          <Text style={[styles.tabText, tab === 'incentives' && styles.tabTextActive]}>Incentives</Text>
        </TouchableOpacity>
      </View>

      {tab === 'cleaners' ? (
        <FlatList data={cleaners} keyExtractor={(item) => item._id} contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primaryBlue} />}
          ListHeaderComponent={
            <Card variant="elevated" padding={16} style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Monthly Summary</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryStat}><Text style={styles.summaryValue}>{cleaners.length}</Text><Text style={styles.summaryLabel}>Cleaners</Text></View>
                <View style={styles.summaryDiv} />
                <View style={styles.summaryStat}><Text style={styles.summaryValue}>₹{cleaners.reduce((s: number, c: any) => s + (c.totalEarnings || 0), 0)}</Text><Text style={styles.summaryLabel}>Total Earnings</Text></View>
                <View style={styles.summaryDiv} />
                <View style={styles.summaryStat}><Text style={styles.summaryValue}>{cleaners.reduce((s: number, c: any) => s + (c.completedTasks || 0), 0)}</Text><Text style={styles.summaryLabel}>Tasks</Text></View>
              </View>
            </Card>
          }
          ListEmptyComponent={<EmptyState icon="💰" title="No Data" description="No cleaners available" />}
          renderItem={renderCleaner} />
      ) : (
        <View style={{ padding: 20 }}>
          <Card variant="elevated" padding={20}>
            <Text style={styles.incentiveTitle}>Leaderboard</Text>
            <Text style={styles.incentiveSub}>Top performers this month</Text>
            {cleaners.slice(0, 5).map((c: any, i: number) => (
              <View key={c._id} style={styles.leaderRow}>
                <Text style={styles.leaderRank}>#{i + 1}</Text>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.leaderName}>{c.name}</Text>
                  <Text style={styles.leaderMeta}>{c.completedTasks || 0} tasks</Text>
                </View>
                <Text style={styles.leaderScore}>{(c.rating || 0).toFixed(1)}</Text>
              </View>
            ))}
          </Card>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabRow: { flexDirection: 'row', margin: 20, marginBottom: 0, backgroundColor: colors.border, borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: colors.white },
  tabText: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Inter-Medium' },
  tabTextActive: { color: colors.primaryBlue, fontWeight: '600' },
  listContent: { padding: 20, paddingBottom: 40 },
  summaryCard: { marginBottom: 16 },
  summaryTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, textAlign: 'center', marginBottom: 12, fontFamily: 'Inter-SemiBold' },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryStat: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 20, fontWeight: '700', color: colors.primaryBlue, fontFamily: 'Inter-Bold' },
  summaryLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2, fontFamily: 'Inter-Regular' },
  summaryDiv: { width: 1, height: 36, backgroundColor: colors.border },
  cleanerCard: { marginBottom: 8 },
  cleanerTop: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700', color: colors.primaryBlue, fontFamily: 'Inter-Bold' },
  cleanerName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  cleanerStats: { fontSize: 12, color: colors.textSecondary, marginTop: 2, fontFamily: 'Inter-Regular' },
  earningsAmount: { fontSize: 16, fontWeight: '700', color: colors.success, fontFamily: 'Inter-Bold' },
  earningsLabel: { fontSize: 11, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  incentiveTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, textAlign: 'center', fontFamily: 'Inter-Bold' },
  incentiveSub: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginBottom: 20, fontFamily: 'Inter-Regular' },
  leaderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  leaderRank: { fontSize: 16, fontWeight: '700', color: colors.primaryBlue, fontFamily: 'Inter-Bold', width: 30 },
  leaderName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  leaderMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2, fontFamily: 'Inter-Regular' },
  leaderScore: { fontSize: 16, fontWeight: '700', color: colors.warning, fontFamily: 'Inter-Bold' },
});

export default SalaryIncentivesScreen;
