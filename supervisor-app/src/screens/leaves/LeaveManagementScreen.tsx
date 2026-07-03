import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Dimensions,
  StatusBar, RefreshControl, ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchLeaves, fetchLeaveStats, approveLeave, rejectLeave } from '../../redux/slices/leaveSlice';

const { width } = Dimensions.get('window');
interface Props { navigation: any }

type LeaveTab = 'all' | 'pending' | 'approved' | 'rejected';

const LEAVE_TYPE_META: Record<string, { bg: string; color: string }> = {
  sick: { bg: '#FEF2F2', color: '#DC2626' },
  casual: { bg: '#EFF6FF', color: '#2563EB' },
  earned: { bg: '#ECFDF5', color: '#16A34A' },
  emergency: { bg: '#FFF7ED', color: '#F97316' },
};

const STATUS_META: Record<string, { bg: string; color: string }> = {
  pending: { bg: '#FFF7ED', color: '#D97706' },
  approved: { bg: '#ECFDF5', color: '#16A34A' },
  rejected: { bg: '#FEF2F2', color: '#EF4444' },
  cancelled: { bg: '#F1F5F9', color: '#64748B' },
};

const formatDate = (d: string | Date | undefined) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getCleanerName = (leave: any) =>
  leave.cleanerId?.firstName
    ? `${leave.cleanerId.firstName} ${leave.cleanerId.lastName || ''}`.trim()
    : 'Cleaner';

const LeaveManagementScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();
  const { leaves, stats, loading, actionLoading } = useSelector((s: RootState) => s.leaves);
  const [tab, setTab] = useState<LeaveTab>('all');
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    dispatch(fetchLeaves());
    dispatch(fetchLeaveStats());
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const unsub = navigation.addListener('focus', load); return unsub; }, [navigation, load]);

  const filtered = leaves.filter(l => {
    const matchTab = tab === 'all' ? true : l.status === tab;
    const matchSearch = !search.trim() ||
      getCleanerName(l).toLowerCase().includes(search.toLowerCase()) ||
      (l.leaveType || '').toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const handleApprove = (leave: any) => {
    Alert.alert('Approve Leave', `Approve ${leave.totalDays} day(s) leave for ${getCleanerName(leave)}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: () => {
          dispatch(approveLeave({ id: leave._id }))
            .unwrap()
            .then(() => { load(); Alert.alert('✓ Approved', 'Leave approved successfully.'); })
            .catch(err => Alert.alert('Error', err?.message || 'Failed to approve.'));
        },
      },
    ]);
  };

  const handleReject = (leave: any) => {
    Alert.alert('Reject Leave', `Reject leave request for ${getCleanerName(leave)}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => {
          dispatch(rejectLeave({ id: leave._id, data: { reason: 'Rejected by supervisor' } }))
            .unwrap()
            .then(() => { load(); Alert.alert('✗ Rejected', 'Leave rejected.'); })
            .catch(err => Alert.alert('Error', err?.message || 'Failed to reject.'));
        },
      },
    ]);
  };

  const pendingCount = leaves.filter(l => l.status === 'pending').length;
  const approvedCount = leaves.filter(l => l.status === 'approved').length;
  const rejectedCount = leaves.filter(l => l.status === 'rejected').length;

  const TABS: { key: LeaveTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: leaves.length },
    { key: 'pending', label: 'Pending', count: pendingCount },
    { key: 'approved', label: 'Approved', count: approvedCount },
    { key: 'rejected', label: 'Rejected', count: rejectedCount },
  ];

  const renderItem = ({ item: leave }: { item: any }) => {
    const typeMeta = LEAVE_TYPE_META[leave.leaveType] || { bg: '#F1F5F9', color: '#64748B' };
    const statusMeta = STATUS_META[leave.status] || STATUS_META.pending;
    const isActioning = actionLoading === leave._id;
    const isPending = leave.status === 'pending';

    return (
      <View style={styles.card}>
        {/* Row 1: Name + Status */}
        <View style={styles.cardHeader}>
          <View style={styles.cleanerInfo}>
            <View style={styles.initials}>
              <Text style={styles.initialsTxt}>{getCleanerName(leave).charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.cleanerName}>{getCleanerName(leave)}</Text>
              <Text style={styles.cleanerId}>{leave.cleanerId?.cleanerId || '—'}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}>
            <Text style={[styles.statusTxt, { color: statusMeta.color }]}>{leave.status?.toUpperCase()}</Text>
          </View>
        </View>

        {/* Row 2: Details */}
        <View style={styles.detailsRow}>
          <View style={[styles.typeTag, { backgroundColor: typeMeta.bg }]}>
            <Text style={[styles.typeTxt, { color: typeMeta.color }]}>
              {leave.leaveType?.replace('_', ' ').toUpperCase() || 'LEAVE'}
            </Text>
          </View>
          <Text style={styles.daysCount}>{leave.totalDays} day{leave.totalDays !== 1 ? 's' : ''}</Text>
          <View style={styles.dateRange}>
            <Icon name="calendar-range" size={12} color="#64748B" />
            <Text style={styles.dateRangeTxt}>
              {formatDate(leave.fromDate)} — {formatDate(leave.toDate)}
            </Text>
          </View>
        </View>

        {/* Reason */}
        {leave.reason ? (
          <Text style={styles.reason} numberOfLines={2}>📝 {leave.reason}</Text>
        ) : null}

        {/* Actions for pending */}
        {isPending && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.approveBtn, isActioning && { opacity: 0.6 }]}
              onPress={() => handleApprove(leave)}
              disabled={isActioning}
            >
              {isActioning ? (
                <ActivityIndicator size="small" color="#16A34A" />
              ) : (
                <Icon name="check-circle-outline" size={14} color="#16A34A" />
              )}
              <Text style={styles.approveTxt}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rejectBtn, isActioning && { opacity: 0.6 }]}
              onPress={() => handleReject(leave)}
              disabled={isActioning}
            >
              {isActioning ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Icon name="close-circle-outline" size={14} color="#EF4444" />
              )}
              <Text style={styles.rejectTxt}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

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
            <Text style={styles.headerTitle}>Leave Management</Text>
            <Text style={styles.headerSub}>{pendingCount} pending approval</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Total', val: leaves.length, color: '#93C5FD' },
            { label: 'Pending', val: pendingCount, color: '#FCD34D' },
            { label: 'Approved', val: approvedCount, color: '#6EE7B7' },
            { label: 'Rejected', val: rejectedCount, color: '#FCA5A5' },
          ].map((s, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={[styles.statVal, { color: s.color }]}>{loading ? '—' : s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Icon name="magnify" size={18} color="rgba(255,255,255,0.6)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search cleaner or leave type..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabItem, tab === t.key && styles.tabItemActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabTxt, tab === t.key && styles.tabTxtActive]}>
              {t.label} ({t.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor="#2563EB" />}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            {loading ? (
              <ActivityIndicator size="large" color="#2563EB" />
            ) : (
              <>
                <Icon name="calendar-multiselect" size={52} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No leave requests</Text>
                <Text style={styles.emptySub}>Pull down to refresh</Text>
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
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 10, marginBottom: 10 },
  statItem: { alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingHorizontal: 12, height: 40, gap: 8 },
  searchInput: { flex: 1, fontSize: 13, color: '#FFF', padding: 0 },
  tabBar: { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#E2E8F0' },
  tabItem: { flex: 1, paddingVertical: 11, alignItems: 'center' },
  tabItemActive: { borderBottomWidth: 2, borderBottomColor: '#2563EB' },
  tabTxt: { fontSize: 11, fontWeight: '600', color: '#94A3B8' },
  tabTxtActive: { color: '#2563EB', fontWeight: '800' },
  listContent: { padding: 16, paddingBottom: 32, gap: 10 },
  card: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#F1F5F9' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cleanerInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  initials: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  initialsTxt: { fontSize: 14, fontWeight: '800', color: '#2563EB' },
  cleanerName: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  cleanerId: { fontSize: 10, color: '#94A3B8', marginTop: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusTxt: { fontSize: 9, fontWeight: '800' },
  detailsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  typeTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeTxt: { fontSize: 9, fontWeight: '700' },
  daysCount: { fontSize: 12, fontWeight: '700', color: '#1E293B' },
  dateRange: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  dateRangeTxt: { fontSize: 11, color: '#64748B' },
  reason: { fontSize: 12, color: '#64748B', marginBottom: 10, lineHeight: 17 },
  actions: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderColor: '#F1F5F9', paddingTop: 10 },
  approveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 8, backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#16A34A' },
  approveTxt: { fontSize: 12, fontWeight: '700', color: '#16A34A' },
  rejectBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 8, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#EF4444' },
  rejectTxt: { fontSize: 12, fontWeight: '700', color: '#EF4444' },
  emptyWrap: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#475569' },
  emptySub: { fontSize: 13, color: '#94A3B8' },
});

export default LeaveManagementScreen;
