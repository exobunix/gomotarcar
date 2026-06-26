import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchTaskStats, fetchTasks } from '../../redux/slices/taskSlice';
import { fetchCleanerStats } from '../../redux/slices/cleanerSlice';
import { fetchUnreadCount } from '../../redux/slices/notificationSlice';

interface Props { navigation: any }

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { supervisor } = useSelector((s: RootState) => s.auth);
  const { stats: taskStats } = useSelector((s: RootState) => s.tasks);
  const { stats: cleanerStats } = useSelector((s: RootState) => s.cleaners);
  const { unreadCount } = useSelector((s: RootState) => s.notifications);
  const [refreshing, setRefreshing] = React.useState(false);

  const load = useCallback(() => {
    dispatch(fetchTaskStats());
    dispatch(fetchCleanerStats());
    dispatch(fetchUnreadCount());
    dispatch(fetchTasks({ limit: 5 }));
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const unsub = navigation.addListener('focus', load); return unsub; }, [navigation, load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setTimeout(() => setRefreshing(false), 500); };

  const navigateTo = (target: string) => {
    const tabMap: Record<string, string> = {
      ApartmentList: 'ApartmentsTab',
      CustomerList: 'CustomersTab',
      CleanerList: 'CleanersTab',
      QRList: 'MoreTab',
      SalaryIncentives: 'CleanersTab',
      GrievanceList: 'MoreTab',
      InventoryList: 'MoreTab',
      Profile: 'MoreTab',
      NewOnboarding: 'CustomersTab',
      WorkApprovalList: 'WorkTab',
      QRAssignment: 'ApartmentsTab',
    };
    const tab = tabMap[target];
    if (tab) {
      navigation.navigate(tab as any, { screen: target });
    } else {
      navigation.navigate(target);
    }
  };

  const quickActions = [
    { icon: '👥', label: 'New Customer', screen: 'NewOnboarding', color: colors.primaryBlue },
    { icon: '📋', label: 'Daily Work', screen: 'DailyWorkMonitoring', color: colors.success },
    { icon: '✅', label: 'Approvals', screen: 'WorkApprovalList', color: colors.warning },
    { icon: '📱', label: 'QR Assign', screen: 'QRAssignment', color: '#7C3AED' },
  ];

  const statCards = [
    { label: 'Cleaners', value: cleanerStats?.totalCleaners || 0, icon: '👤', color: colors.lightBlue },
    { label: 'Today\'s Tasks', value: taskStats?.todayTasks || 0, icon: '📋', color: colors.success + '20' },
    { label: 'Pending Approval', value: taskStats?.pendingApproval || 0, icon: '⏳', color: colors.warning + '20' },
    { label: 'Open Complaints', value: taskStats?.openComplaints || 0, icon: '⚠️', color: colors.error + '20' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {supervisor?.firstName || 'Supervisor'} 👋</Text>
          <Text style={styles.sub}>Zone: {supervisor?.assignedZone?.name || 'All'}</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Notifications')}>
          <Text style={styles.notifIcon}>🔔</Text>
          {unreadCount > 0 && (
            <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text></View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryBlue} />}>
        {/* Stats */}
        <View style={styles.statsGrid}>
          {statCards.map((s, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: s.color }]}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          {quickActions.map((qa, i) => (
            <TouchableOpacity key={i} style={styles.quickItem} onPress={() => navigateTo(qa.screen)}>
              <View style={[styles.quickIcon, { backgroundColor: qa.color + '20' }]}>
                <Text style={styles.quickIconText}>{qa.icon}</Text>
              </View>
              <Text style={styles.quickLabel}>{qa.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Other Modules */}
        <Text style={styles.sectionTitle}>Modules</Text>
        <View style={styles.moduleGrid}>
          {[
            { icon: '🏢', label: 'Apartments', screen: 'ApartmentList' },
            { icon: '👤', label: 'Customers', screen: 'CustomerList' },
            { icon: '🧹', label: 'Cleaners', screen: 'CleanerList' },
            { icon: '📱', label: 'QR Codes', screen: 'QRList' },
            { icon: '📊', label: 'Salary & Incentives', screen: 'SalaryIncentives' },
            { icon: '⚠️', label: 'Grievances', screen: 'GrievanceList' },
            { icon: '📦', label: 'Inventory', screen: 'InventoryList' },
            { icon: '👤', label: 'Profile', screen: 'Profile' },
          ].map((mod, i) => (
            <TouchableOpacity key={i} style={styles.moduleItem} onPress={() => navigateTo(mod.screen)}>
              <Text style={styles.moduleIcon}>{mod.icon}</Text>
              <Text style={styles.moduleLabel}>{mod.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: colors.white, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  greeting: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  sub: { fontSize: 13, color: colors.textSecondary, marginTop: 2, fontFamily: 'Inter-Regular' },
  notifBtn: { position: 'relative', width: 44, height: 44, borderRadius: 14, backgroundColor: colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  notifIcon: { fontSize: 20 },
  notifBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: colors.error, minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  notifBadgeText: { fontSize: 10, fontWeight: '700', color: colors.white, fontFamily: 'Inter-Bold' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: { width: '48%', borderRadius: 16, padding: 16 },
  statIcon: { fontSize: 22, marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2, fontFamily: 'Inter-Regular' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold', marginBottom: 12, marginTop: 8 },
  quickGrid: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  quickItem: { flex: 1, alignItems: 'center', backgroundColor: colors.white, borderRadius: 16, padding: 16 },
  quickIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  quickIconText: { fontSize: 24 },
  quickLabel: { fontSize: 11, color: colors.textSecondary, fontFamily: 'Inter-Medium', textAlign: 'center' },
  moduleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  moduleItem: { width: '23%', backgroundColor: colors.white, borderRadius: 14, padding: 12, alignItems: 'center' },
  moduleIcon: { fontSize: 24, marginBottom: 6 },
  moduleLabel: { fontSize: 10, color: colors.textSecondary, fontFamily: 'Inter-Medium', textAlign: 'center' },
});

export default DashboardScreen;
