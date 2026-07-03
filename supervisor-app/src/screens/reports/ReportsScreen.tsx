import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Dimensions,
  StatusBar, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootState } from '../../redux/store';
import api from '../../services/api';

const { width } = Dimensions.get('window');
interface Props { navigation: any }

type ReportTab = 'Attendance' | 'Cleaning' | 'Performance' | 'Complaint';

const TABS: { key: ReportTab; label: string; icon: string }[] = [
  { key: 'Attendance', label: 'Attendance', icon: 'calendar-check' },
  { key: 'Cleaning', label: 'Cleaning', icon: 'broom' },
  { key: 'Performance', label: 'Performance', icon: 'account-badge-outline' },
  { key: 'Complaint', label: 'Complaints', icon: 'message-alert-outline' },
];

const StatCard = ({ label, val, sub, color, bg, icon }: any) => (
  <View style={[rcStyles.statCard, { backgroundColor: bg }]}>
    <View style={[rcStyles.statIconBg, { backgroundColor: color + '22' }]}>
      <Icon name={icon} size={18} color={color} />
    </View>
    <Text style={[rcStyles.statVal, { color }]}>{val}</Text>
    <Text style={rcStyles.statLabel}>{label}</Text>
    {sub ? <Text style={[rcStyles.statSub, { color }]}>{sub}</Text> : null}
  </View>
);

const SimpleBar = ({ label, val, max, color }: any) => {
  const pct = max > 0 ? Math.min((val / max) * 100, 100) : 0;
  return (
    <View style={rcStyles.barRow}>
      <Text style={rcStyles.barLabel} numberOfLines={1}>{label}</Text>
      <View style={rcStyles.barOuter}>
        <View style={[rcStyles.barInner, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={[rcStyles.barVal, { color }]}>{val}</Text>
    </View>
  );
};

const ReportsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<ReportTab>('Attendance');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const { stats: cleanerStats } = useSelector((s: RootState) => s.cleaners);
  const { stats: taskStats } = useSelector((s: RootState) => s.tasks);
  const { complaints } = useSelector((s: RootState) => s.complaints);

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      const [attendanceRes, reportRes] = await Promise.allSettled([
        api.get('/attendance/summary'),
        api.get('/report/summary'),
      ]);
      const attendanceData = attendanceRes.status === 'fulfilled' ? attendanceRes.value.data.data : null;
      const reportData = reportRes.status === 'fulfilled' ? reportRes.value.data.data : null;
      setData({ attendance: attendanceData, report: reportData });
    } catch (_) {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchReportData(); }, [fetchReportData]);

  // Build attendance stats from data or fall back to cleaner stats
  const totalStaff = cleanerStats?.total ?? data?.attendance?.total ?? 0;
  const present = data?.attendance?.present ?? cleanerStats?.active ?? 0;
  const late = data?.attendance?.late ?? 0;
  const absent = data?.attendance?.absent ?? 0;
  const onLeave = data?.attendance?.onLeave ?? cleanerStats?.onLeave ?? 0;
  const presentPct = totalStaff > 0 ? ((present / totalStaff) * 100).toFixed(1) : '0';
  const latePct = totalStaff > 0 ? ((late / totalStaff) * 100).toFixed(1) : '0';
  const absentPct = totalStaff > 0 ? ((absent / totalStaff) * 100).toFixed(1) : '0';

  // Cleaning stats
  const totalTasks = taskStats?.totalTasks ?? 0;
  const completed = taskStats?.completed ?? 0;
  const inProgress = taskStats?.inProgress ?? 0;
  const missed = taskStats?.missed ?? 0;
  const completionRate = totalTasks > 0 ? ((completed / totalTasks) * 100).toFixed(1) : '0';

  // Complaint stats
  const openComplaints = complaints.filter(c => c.status === 'open').length;
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;
  const totalComplaints = complaints.length;
  const resolutionRate = totalComplaints > 0 ? ((resolvedComplaints / totalComplaints) * 100).toFixed(1) : '0';

  const renderAttendance = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={rcStyles.statsGrid}>
        <StatCard label="Total Staff" val={totalStaff} icon="account-group" color="#2563EB" bg="#EFF6FF" sub={null} />
        <StatCard label="Present" val={present} sub={`${presentPct}%`} icon="check-circle-outline" color="#16A34A" bg="#ECFDF5" />
        <StatCard label="Late" val={late} sub={`${latePct}%`} icon="clock-outline" color="#D97706" bg="#FFF7ED" />
        <StatCard label="Absent" val={absent} sub={`${absentPct}%`} icon="close-circle-outline" color="#DC2626" bg="#FEF2F2" />
        <StatCard label="On Leave" val={onLeave} icon="airplane-takeoff" color="#8B5CF6" bg="#FAF5FF" sub={null} />
      </View>

      <View style={rcStyles.section}>
        <Text style={rcStyles.sectionTitle}>Today's Attendance Breakdown</Text>
        <SimpleBar label="Present" val={present} max={totalStaff} color="#16A34A" />
        <SimpleBar label="Late" val={late} max={totalStaff} color="#D97706" />
        <SimpleBar label="Absent" val={absent} max={totalStaff} color="#DC2626" />
        <SimpleBar label="On Leave" val={onLeave} max={totalStaff} color="#8B5CF6" />
      </View>
    </ScrollView>
  );

  const renderCleaning = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={rcStyles.statsGrid}>
        <StatCard label="Total Tasks" val={totalTasks} icon="clipboard-list-outline" color="#2563EB" bg="#EFF6FF" sub={null} />
        <StatCard label="Completed" val={completed} sub={`${completionRate}%`} icon="check-circle-outline" color="#16A34A" bg="#ECFDF5" />
        <StatCard label="In Progress" val={inProgress} icon="progress-clock" color="#F97316" bg="#FFF7ED" sub={null} />
        <StatCard label="Missed" val={missed} icon="close-circle-outline" color="#EF4444" bg="#FEF2F2" sub={null} />
      </View>

      <View style={rcStyles.section}>
        <Text style={rcStyles.sectionTitle}>Cleaning Status Breakdown</Text>
        <SimpleBar label="Completed" val={completed} max={totalTasks} color="#16A34A" />
        <SimpleBar label="In Progress" val={inProgress} max={totalTasks} color="#F97316" />
        <SimpleBar label="Missed" val={missed} max={totalTasks} color="#EF4444" />
      </View>
    </ScrollView>
  );

  const renderPerformance = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={rcStyles.section}>
        <Text style={rcStyles.sectionTitle}>Cleaner Performance Summary</Text>
        <View style={rcStyles.perfRow}>
          <View style={rcStyles.perfCard}>
            <Icon name="star-circle" size={28} color="#D97706" />
            <Text style={rcStyles.perfVal}>{cleanerStats?.active ?? 0}</Text>
            <Text style={rcStyles.perfLabel}>Active Cleaners</Text>
          </View>
          <View style={rcStyles.perfCard}>
            <Icon name="alert-circle-outline" size={28} color="#EF4444" />
            <Text style={rcStyles.perfVal}>{cleanerStats?.pendingApproval ?? 0}</Text>
            <Text style={rcStyles.perfLabel}>Pending Approval</Text>
          </View>
          <View style={rcStyles.perfCard}>
            <Icon name="airplane-takeoff" size={28} color="#8B5CF6" />
            <Text style={rcStyles.perfVal}>{cleanerStats?.onLeave ?? 0}</Text>
            <Text style={rcStyles.perfLabel}>On Leave</Text>
          </View>
        </View>
      </View>

      <View style={rcStyles.section}>
        <Text style={rcStyles.sectionTitle}>Overall Task Completion Rate</Text>
        <View style={rcStyles.bigRate}>
          <Text style={rcStyles.bigRateVal}>{completionRate}%</Text>
          <Text style={rcStyles.bigRateLabel}>Completion Rate</Text>
          <View style={rcStyles.rateBarOuter}>
            <View style={[rcStyles.rateBarInner, { width: `${completionRate}%` as any }]} />
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderComplaints = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={rcStyles.statsGrid}>
        <StatCard label="Total" val={totalComplaints} icon="message-text-outline" color="#2563EB" bg="#EFF6FF" sub={null} />
        <StatCard label="Open" val={openComplaints} icon="alert-circle-outline" color="#EF4444" bg="#FEF2F2" sub={null} />
        <StatCard label="Resolved" val={resolvedComplaints} sub={`${resolutionRate}%`} icon="check-circle-outline" color="#16A34A" bg="#ECFDF5" />
      </View>

      <View style={rcStyles.section}>
        <Text style={rcStyles.sectionTitle}>Complaint Resolution Rate</Text>
        <View style={rcStyles.bigRate}>
          <Text style={[rcStyles.bigRateVal, { color: '#16A34A' }]}>{resolutionRate}%</Text>
          <Text style={rcStyles.bigRateLabel}>Resolved</Text>
          <View style={rcStyles.rateBarOuter}>
            <View style={[rcStyles.rateBarInner, { width: `${resolutionRate}%` as any, backgroundColor: '#16A34A' }]} />
          </View>
        </View>
      </View>

      <View style={rcStyles.section}>
        <Text style={rcStyles.sectionTitle}>Status Breakdown</Text>
        <SimpleBar label="Open" val={openComplaints} max={totalComplaints} color="#EF4444" />
        <SimpleBar label="In Progress" val={complaints.filter(c => c.status === 'in_progress').length} max={totalComplaints} color="#F97316" />
        <SimpleBar label="Resolved" val={resolvedComplaints} max={totalComplaints} color="#16A34A" />
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    if (loading) return <View style={rcStyles.loadingWrap}><ActivityIndicator size="large" color="#2563EB" /></View>;
    switch (activeTab) {
      case 'Attendance': return renderAttendance();
      case 'Cleaning': return renderCleaning();
      case 'Performance': return renderPerformance();
      case 'Complaint': return renderComplaints();
    }
  };

  return (
    <View style={rcStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1D4ED8" />
      {/* Header */}
      <View style={[rcStyles.header, { paddingTop: insets.top > 0 ? insets.top + 8 : (Platform.OS === 'ios' ? 52 : 16) }]}>
        <View style={rcStyles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={rcStyles.backBtn}>
            <Icon name="arrow-left" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={rcStyles.headerTitle}>Reports & Analytics</Text>
            <Text style={rcStyles.headerSub}>Real-time operational data</Text>
          </View>
          <TouchableOpacity style={rcStyles.refreshBtn} onPress={fetchReportData}>
            <Icon name="refresh" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={rcStyles.tabBar} contentContainerStyle={rcStyles.tabBarContent}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[rcStyles.tab, activeTab === t.key && rcStyles.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Icon name={t.icon} size={14} color={activeTab === t.key ? '#2563EB' : '#94A3B8'} />
            <Text style={[rcStyles.tabTxt, activeTab === t.key && rcStyles.tabTxtActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ flex: 1, paddingHorizontal: 14 }}>
        {renderContent()}
      </View>
    </View>
  );
};

const rcStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#1D4ED8', paddingHorizontal: 16, paddingBottom: 14, borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: { padding: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 11, color: '#BFDBFE', marginTop: 1 },
  refreshBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8 },
  tabBar: { backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#E2E8F0', maxHeight: 52 },
  tabBarContent: { paddingHorizontal: 10, gap: 4, alignItems: 'center' },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#2563EB' },
  tabTxt: { fontSize: 12, fontWeight: '600', color: '#94A3B8' },
  tabTxtActive: { color: '#2563EB', fontWeight: '800' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14, marginBottom: 4 },
  statCard: { flex: 1, minWidth: (width - 56) / 2, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#F1F5F9' },
  statIconBg: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  statVal: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 10, color: '#64748B', textAlign: 'center' },
  statSub: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  section: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginTop: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  barLabel: { width: 80, fontSize: 11, color: '#64748B' },
  barOuter: { flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  barInner: { height: '100%' as any, borderRadius: 4 },
  barVal: { width: 30, fontSize: 12, fontWeight: '700', textAlign: 'right' },
  perfRow: { flexDirection: 'row', justifyContent: 'space-around' },
  perfCard: { alignItems: 'center', gap: 6 },
  perfVal: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  perfLabel: { fontSize: 10, color: '#64748B', textAlign: 'center' },
  bigRate: { alignItems: 'center', gap: 8 },
  bigRateVal: { fontSize: 44, fontWeight: '800', color: '#2563EB' },
  bigRateLabel: { fontSize: 13, color: '#64748B' },
  rateBarOuter: { width: '100%', height: 10, backgroundColor: '#F1F5F9', borderRadius: 6, overflow: 'hidden' },
  rateBarInner: { height: '100%' as any, borderRadius: 6, backgroundColor: '#2563EB' },
});

export default ReportsScreen;
