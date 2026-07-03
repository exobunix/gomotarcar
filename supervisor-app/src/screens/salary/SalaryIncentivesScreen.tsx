import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Dimensions,
  StatusBar, RefreshControl, ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchIncentives, fetchLeaderboard } from '../../redux/slices/incentiveSlice';
import incentiveService from '../../services/incentive.service';

const { width } = Dimensions.get('window');
interface Props { navigation: any }

type SalaryTab = 'incentives' | 'leaderboard';

const TIER_META: Record<string, { bg: string; color: string; icon: string }> = {
  platinum: { bg: '#FAF5FF', color: '#8B5CF6', icon: 'star-circle' },
  gold: { bg: '#FFF7ED', color: '#D97706', icon: 'star' },
  silver: { bg: '#F1F5F9', color: '#64748B', icon: 'star-half-full' },
  bronze: { bg: '#FEF2F2', color: '#C2410C', icon: 'star-outline' },
  none: { bg: '#F8FAFC', color: '#94A3B8', icon: 'star-off-outline' },
};

const formatCurrency = (v: number) => `₹ ${(v || 0).toLocaleString('en-IN')}`;

const getCleanerName = (item: any) =>
  item.cleanerId?.firstName
    ? `${item.cleanerId.firstName} ${item.cleanerId.lastName || ''}`.trim()
    : 'Cleaner';

const SalaryIncentivesScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();
  const { incentives, leaderboard, loading } = useSelector((s: RootState) => s.incentives);
  const [tab, setTab] = useState<SalaryTab>('incentives');
  const [search, setSearch] = useState('');
  const [calculatingAll, setCalculatingAll] = useState(false);

  const now = new Date();
  const [selectedMonth] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });

  const load = useCallback(() => {
    dispatch(fetchIncentives({ month: selectedMonth.month, year: selectedMonth.year }));
    dispatch(fetchLeaderboard({ month: selectedMonth.month, year: selectedMonth.year }));
  }, [dispatch, selectedMonth]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const unsub = navigation.addListener('focus', load); return unsub; }, [navigation, load]);

  const handleCalculateAll = async () => {
    Alert.alert('Calculate Incentives', `Calculate all incentives for ${selectedMonth.month}/${selectedMonth.year}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Calculate',
        onPress: async () => {
          setCalculatingAll(true);
          try {
            await incentiveService.calculateAll({ month: selectedMonth.month, year: selectedMonth.year });
            load();
            Alert.alert('✓ Done', 'Incentives calculated for all cleaners.');
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'Failed to calculate.');
          }
          setCalculatingAll(false);
        },
      },
    ]);
  };

  const filteredIncentives = incentives.filter(inc =>
    !search.trim() || getCleanerName(inc).toLowerCase().includes(search.toLowerCase())
  );

  // Summary
  const totalPaid = incentives.filter(i => i.paymentStatus === 'paid').reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalPending = incentives.filter(i => i.paymentStatus !== 'paid').reduce((sum, i) => sum + (i.amount || 0), 0);

  const renderIncentiveItem = ({ item, index }: { item: any; index: number }) => {
    const tier = (item.tier || 'none').toLowerCase();
    const tierMeta = TIER_META[tier] || TIER_META.none;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankTxt}>{index + 1}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cleanerName}>{getCleanerName(item)}</Text>
            <Text style={styles.cleanerId}>{item.cleanerId?.cleanerId || '—'}</Text>
          </View>
          <View style={[styles.tierBadge, { backgroundColor: tierMeta.bg }]}>
            <Icon name={tierMeta.icon} size={12} color={tierMeta.color} />
            <Text style={[styles.tierTxt, { color: tierMeta.color }]}>{tier.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.statCell}>
            <Text style={styles.statVal}>{item.tasksCompleted || 0}</Text>
            <Text style={styles.statLabel}>Tasks</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statVal}>{item.attendancePercentage?.toFixed(0) || 0}%</Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statVal}>{item.performanceScore || 0}</Text>
            <Text style={styles.statLabel}>Score</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={[styles.statVal, { color: '#16A34A' }]}>{formatCurrency(item.amount)}</Text>
            <Text style={styles.statLabel}>Amount</Text>
          </View>
        </View>
        <View style={styles.paymentRow}>
          <View style={[styles.payBadge, item.paymentStatus === 'paid' ? styles.payBadgePaid : styles.payBadgePending]}>
            <Text style={[styles.payBadgeTxt, { color: item.paymentStatus === 'paid' ? '#16A34A' : '#D97706' }]}>
              {item.paymentStatus === 'paid' ? '✓ PAID' : '⏳ PENDING'}
            </Text>
          </View>
          {item.paymentStatus !== 'paid' && (
            <TouchableOpacity style={styles.markPaidBtn} onPress={() => {
              Alert.alert('Mark Paid', `Mark ${getCleanerName(item)}'s incentive as paid?`, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Confirm', onPress: () => incentiveService.markPaid(item._id, { paymentMethod: 'bank' }).then(load) },
              ]);
            }}>
              <Text style={styles.markPaidTxt}>Mark Paid</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderLeaderboardItem = ({ item, index }: { item: any; index: number }) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
    return (
      <View style={styles.lbCard}>
        <Text style={styles.lbMedal}>{medal}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.lbName}>{getCleanerName(item)}</Text>
          <Text style={styles.lbSub}>{item.tasksCompleted || 0} tasks · Score: {item.performanceScore || 0}</Text>
        </View>
        <Text style={[styles.lbAmount, { color: '#16A34A' }]}>{formatCurrency(item.amount)}</Text>
      </View>
    );
  };

  const monthName = new Date(selectedMonth.year, selectedMonth.month - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1D4ED8" />
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top + 8 : (Platform.OS === 'ios' ? 52 : 16) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-left" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Salary & Incentives</Text>
            <Text style={styles.headerSub}>{monthName}</Text>
          </View>
          <TouchableOpacity style={styles.calcBtn} onPress={handleCalculateAll} disabled={calculatingAll}>
            {calculatingAll ? <ActivityIndicator size="small" color="#FFF" /> : <Icon name="calculator-variant-outline" size={16} color="#FFF" />}
            <Text style={styles.calcBtnTxt}>Calc All</Text>
          </TouchableOpacity>
        </View>
        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>{incentives.length}</Text>
            <Text style={styles.summaryLabel}>Total Cleaners</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryVal, { color: '#6EE7B7' }]}>{formatCurrency(totalPaid)}</Text>
            <Text style={styles.summaryLabel}>Total Paid</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryVal, { color: '#FCD34D' }]}>{formatCurrency(totalPending)}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
        </View>
        {/* Search */}
        <View style={styles.searchBox}>
          <Icon name="magnify" size={18} color="rgba(255,255,255,0.6)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search cleaner..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {(['incentives', 'leaderboard'] as SalaryTab[]).map(t => (
          <TouchableOpacity key={t} style={[styles.tabItem, tab === t && styles.tabItemActive]} onPress={() => setTab(t)}>
            <Icon name={t === 'incentives' ? 'wallet-outline' : 'trophy-outline'} size={16} color={tab === t ? '#2563EB' : '#94A3B8'} />
            <Text style={[styles.tabTxt, tab === t && styles.tabTxtActive]}>{t === 'incentives' ? 'Incentives' : 'Leaderboard'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={tab === 'incentives' ? filteredIncentives : leaderboard}
        keyExtractor={(item) => item._id || item.cleanerId?._id || String(Math.random())}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor="#2563EB" />}
        renderItem={tab === 'incentives' ? renderIncentiveItem : renderLeaderboardItem}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            {loading ? <ActivityIndicator size="large" color="#2563EB" /> : (
              <>
                <Icon name="wallet-outline" size={52} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No data yet</Text>
                <Text style={styles.emptySub}>Tap "Calc All" to calculate incentives</Text>
              </>
            )}
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#1D4ED8', paddingHorizontal: 16, paddingBottom: 14, borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  backBtn: { padding: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 11, color: '#BFDBFE', marginTop: 1 },
  calcBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10 },
  calcBtnTxt: { fontSize: 11, fontWeight: '700', color: '#FFF' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 12, marginBottom: 10, alignItems: 'center' },
  summaryItem: { alignItems: 'center' },
  summaryVal: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  summaryLabel: { fontSize: 9, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  summaryDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingHorizontal: 12, height: 40, gap: 8 },
  searchInput: { flex: 1, fontSize: 13, color: '#FFF', padding: 0 },
  tabBar: { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#E2E8F0' },
  tabItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11 },
  tabItemActive: { borderBottomWidth: 2, borderBottomColor: '#2563EB' },
  tabTxt: { fontSize: 12, fontWeight: '600', color: '#94A3B8' },
  tabTxtActive: { color: '#2563EB', fontWeight: '800' },
  listContent: { padding: 14, paddingBottom: 32, gap: 10 },
  card: { backgroundColor: '#FFF', borderRadius: 14, padding: 13, borderWidth: 1, borderColor: '#F1F5F9' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  rankBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  rankTxt: { fontSize: 12, fontWeight: '800', color: '#2563EB' },
  cleanerName: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  cleanerId: { fontSize: 10, color: '#94A3B8', marginTop: 1 },
  tierBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tierTxt: { fontSize: 9, fontWeight: '800' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F8FAFC', borderRadius: 10, padding: 10, marginBottom: 10 },
  statCell: { alignItems: 'center' },
  statVal: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  statLabel: { fontSize: 9, color: '#64748B', marginTop: 2 },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  payBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  payBadgePaid: { backgroundColor: '#ECFDF5' },
  payBadgePending: { backgroundColor: '#FFF7ED' },
  payBadgeTxt: { fontSize: 10, fontWeight: '700' },
  markPaidBtn: { marginLeft: 'auto' as any, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#2563EB', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  markPaidTxt: { fontSize: 11, fontWeight: '700', color: '#2563EB' },
  lbCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#F1F5F9' },
  lbMedal: { fontSize: 22 },
  lbName: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  lbSub: { fontSize: 11, color: '#64748B', marginTop: 2 },
  lbAmount: { fontSize: 15, fontWeight: '800' },
  emptyWrap: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#475569' },
  emptySub: { fontSize: 13, color: '#94A3B8' },
});

export default SalaryIncentivesScreen;
