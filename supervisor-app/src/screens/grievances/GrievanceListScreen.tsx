import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Dimensions,
  StatusBar, RefreshControl, ActivityIndicator, Alert, TextInput, Linking,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchComplaints } from '../../redux/slices/complaintSlice';
import complaintService from '../../services/complaint.service';

const { width } = Dimensions.get('window');
interface Props { navigation: any }

type GrievanceTab = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

const PRIORITY_META: Record<string, { bg: string; color: string }> = {
  high: { bg: '#FEF2F2', color: '#EF4444' },
  medium: { bg: '#FFF7ED', color: '#F97316' },
  low: { bg: '#ECFDF5', color: '#16A34A' },
};

const STATUS_META: Record<string, { bg: string; color: string }> = {
  open: { bg: '#FEF2F2', color: '#EF4444' },
  in_progress: { bg: '#FFF7ED', color: '#F97316' },
  resolved: { bg: '#ECFDF5', color: '#16A34A' },
  closed: { bg: '#F1F5F9', color: '#64748B' },
};

const formatDate = (d: string | Date | undefined) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const getCustomerName = (c: any) =>
  c.customerId?.firstName ? `${c.customerId.firstName} ${c.customerId.lastName || ''}`.trim() : 'Customer';

const GrievanceListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();
  const { complaints, loading } = useSelector((s: RootState) => s.complaints);
  const [tab, setTab] = useState<GrievanceTab>('Open');
  const [search, setSearch] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(() => {
    dispatch(fetchComplaints({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const unsub = navigation.addListener('focus', load); return unsub; }, [navigation, load]);

  // Stats
  const openCount = complaints.filter(c => c.status === 'open').length;
  const inProgressCount = complaints.filter(c => c.status === 'in_progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;
  const closedCount = complaints.filter(c => c.status === 'closed').length;

  const TABS: { key: GrievanceTab; label: string; count: number }[] = [
    { key: 'Open', label: 'Open', count: openCount },
    { key: 'In Progress', label: 'In Progress', count: inProgressCount },
    { key: 'Resolved', label: 'Resolved', count: resolvedCount },
    { key: 'Closed', label: 'Closed', count: closedCount },
  ];

  const filtered = complaints.filter(c => {
    const tabStatus = tab.toLowerCase().replace(' ', '_');
    const matchTab = c.status?.toLowerCase().replace(' ', '_') === tabStatus || c.status === tab.toLowerCase();
    const matchSearch = !search.trim() ||
      getCustomerName(c).toLowerCase().includes(search.toLowerCase()) ||
      (c.subject || c.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.ticketNumber || '').toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const handleResolve = (c: any) => {
    Alert.alert('Resolve Complaint', `Mark "${c.subject || 'this complaint'}" as resolved?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Resolve',
        onPress: async () => {
          setActionId(c._id);
          try {
            await complaintService.resolve(c._id, { resolution: 'Resolved by supervisor' });
            load();
            Alert.alert('✓ Resolved', 'Complaint marked as resolved.');
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'Failed to resolve.');
          }
          setActionId(null);
        },
      },
    ]);
  };

  const handleClose = (c: any) => {
    Alert.alert('Close Complaint', `Close ticket ${c.ticketNumber || '#' + c._id?.slice(-5)}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Close',
        style: 'destructive',
        onPress: async () => {
          setActionId(c._id);
          try {
            await complaintService.close(c._id);
            load();
            Alert.alert('Closed', 'Complaint closed.');
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'Failed to close.');
          }
          setActionId(null);
        },
      },
    ]);
  };

  const renderItem = ({ item: c }: { item: any }) => {
    const priorityMeta = PRIORITY_META[c.priority?.toLowerCase()] || PRIORITY_META.low;
    const statusMeta = STATUS_META[c.status?.toLowerCase()?.replace(' ', '_')] || STATUS_META.open;
    const isActioning = actionId === c._id;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('GrievanceDetail', { complaintId: c._id })}
        activeOpacity={0.88}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.ticketRow}>
            <Icon name="ticket-outline" size={13} color="#94A3B8" />
            <Text style={styles.ticketNum}>{c.ticketNumber || `CMP-${c._id?.slice(-6).toUpperCase()}`}</Text>
          </View>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: priorityMeta.bg }]}>
              <Text style={[styles.badgeTxt, { color: priorityMeta.color }]}>{c.priority?.toUpperCase() || 'MED'}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: statusMeta.bg }]}>
              <Text style={[styles.badgeTxt, { color: statusMeta.color }]}>{c.status?.toUpperCase().replace('_', ' ')}</Text>
            </View>
          </View>
        </View>

        {/* Subject */}
        <Text style={styles.subject} numberOfLines={2}>{c.subject || c.title || 'Complaint'}</Text>

        {/* Customer & contact */}
        <View style={styles.infoRow}>
          <Icon name="account-outline" size={13} color="#64748B" />
          <Text style={styles.infoTxt} numberOfLines={1}>{getCustomerName(c)}</Text>
          {c.customerId?.phone && (
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${c.customerId.phone}`)}>
              <Icon name="phone-outline" size={13} color="#2563EB" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.infoRow}>
          <Icon name="clock-outline" size={13} color="#64748B" />
          <Text style={styles.infoTxt}>{formatDate(c.createdAt)}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {(tab === 'Open' || tab === 'In Progress') && (
            <TouchableOpacity
              style={[styles.resolveBtn, isActioning && { opacity: 0.6 }]}
              onPress={() => handleResolve(c)}
              disabled={isActioning}
            >
              {isActioning ? <ActivityIndicator size="small" color="#16A34A" /> : <Icon name="check-circle-outline" size={13} color="#16A34A" />}
              <Text style={styles.resolveTxt}>Resolve</Text>
            </TouchableOpacity>
          )}
          {tab === 'Resolved' && (
            <TouchableOpacity
              style={[styles.closeBtn, isActioning && { opacity: 0.6 }]}
              onPress={() => handleClose(c)}
              disabled={isActioning}
            >
              {isActioning ? <ActivityIndicator size="small" color="#64748B" /> : <Icon name="close-circle-outline" size={13} color="#64748B" />}
              <Text style={styles.closeTxt}>Close</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => navigation.navigate('GrievanceDetail', { complaintId: c._id })}
          >
            <Icon name="eye-outline" size={13} color="#2563EB" />
            <Text style={styles.viewBtnTxt}>View</Text>
          </TouchableOpacity>
          {c.customerId?.phone && (
            <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${c.customerId.phone}`)}>
              <Icon name="phone-outline" size={13} color="#8B5CF6" />
              <Text style={styles.callBtnTxt}>Call</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
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
            <Text style={styles.headerTitle}>Grievance Management</Text>
            <Text style={styles.headerSub}>{openCount} open complaints</Text>
          </View>
        </View>

        {/* Summary chips */}
        <View style={styles.summaryRow}>
          {[{ label: 'Open', val: openCount, color: '#FCA5A5' }, { label: 'In Progress', val: inProgressCount, color: '#FCD34D' }, { label: 'Resolved', val: resolvedCount, color: '#6EE7B7' }].map((s, i) => (
            <View key={i} style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: s.color }]}>{loading ? '—' : s.val}</Text>
              <Text style={styles.summaryLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Icon name="magnify" size={18} color="rgba(255,255,255,0.6)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by customer, subject or ticket..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map(t => (
          <TouchableOpacity key={t.key} style={[styles.tabItem, tab === t.key && styles.tabItemActive]} onPress={() => setTab(t.key)}>
            <Text style={[styles.tabTxt, tab === t.key && styles.tabTxtActive]}>{t.label}{t.count > 0 ? ` (${t.count})` : ''}</Text>
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
            {loading ? <ActivityIndicator size="large" color="#2563EB" /> : (
              <>
                <Icon name="message-text-outline" size={52} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No complaints in this tab</Text>
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
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 10, marginBottom: 10 },
  summaryItem: { alignItems: 'center' },
  summaryVal: { fontSize: 20, fontWeight: '800' },
  summaryLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingHorizontal: 12, height: 40, gap: 8 },
  searchInput: { flex: 1, fontSize: 13, color: '#FFF', padding: 0 },
  tabBar: { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#E2E8F0' },
  tabItem: { flex: 1, paddingVertical: 11, alignItems: 'center' },
  tabItemActive: { borderBottomWidth: 2, borderBottomColor: '#EF4444' },
  tabTxt: { fontSize: 10, fontWeight: '600', color: '#94A3B8' },
  tabTxtActive: { color: '#EF4444', fontWeight: '800' },
  listContent: { padding: 14, paddingBottom: 32, gap: 10 },
  card: { backgroundColor: '#FFF', borderRadius: 14, padding: 13, borderWidth: 1, borderColor: '#F1F5F9' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  ticketRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ticketNum: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  badgeRow: { flexDirection: 'row', gap: 6 },
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  badgeTxt: { fontSize: 8, fontWeight: '800' },
  subject: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  infoTxt: { fontSize: 11, color: '#64748B', flex: 1 },
  actions: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderColor: '#F1F5F9', paddingTop: 10, marginTop: 6 },
  resolveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 7, borderRadius: 8, backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#16A34A' },
  resolveTxt: { fontSize: 11, fontWeight: '700', color: '#16A34A' },
  closeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 7, borderRadius: 8, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#94A3B8' },
  closeTxt: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  viewBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 7, borderRadius: 8, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#2563EB' },
  viewBtnTxt: { fontSize: 11, fontWeight: '700', color: '#2563EB' },
  callBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 7, borderRadius: 8, backgroundColor: '#FAF5FF', borderWidth: 1, borderColor: '#8B5CF6' },
  callBtnTxt: { fontSize: 11, fontWeight: '700', color: '#8B5CF6' },
  emptyWrap: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#475569' },
  emptySub: { fontSize: 13, color: '#94A3B8' },
});

export default GrievanceListScreen;
