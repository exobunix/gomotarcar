import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPendingApprovals } from '../../redux/slices/approvalsSlice';
import { colors } from '../../theme/colors';

const StatCard = ({ title, value, color, onPress }: { title: string; value: string; color: string; onPress?: () => void }) => (
  <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </TouchableOpacity>
);

const DashboardScreen = () => {
  const dispatch = useDispatch();
  const { pendingCleaners, pendingSupervisors, pendingFranchises, loading } = useSelector((state: any) => state.approvals);

  useEffect(() => { dispatch(fetchPendingApprovals() as any); }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Operations Dashboard</Text>
        <Text style={styles.subText}>GoMotarCar Operations Team</Text>
      </View>
      <View style={styles.statsGrid}>
        <StatCard title="Pending Cleaners" value={String(pendingCleaners?.length || 0)} color={colors.warning} />
        <StatCard title="Pending Supervisors" value={String(pendingSupervisors?.length || 0)} color={colors.info} />
        <StatCard title="Pending Franchises" value={String(pendingFranchises?.length || 0)} color={colors.primaryBlue} />
        <StatCard title="Total Approvals" value={String((pendingCleaners?.length || 0) + (pendingSupervisors?.length || 0) + (pendingFranchises?.length || 0))} color={colors.success} />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.grid}>
          {[
            { icon: '👥', label: 'Partner Onboarding' },
            { icon: '✅', label: 'Cleaner Approval' },
            { icon: '🎫', label: 'Escalation Center' },
            { icon: '📋', label: 'Reports' },
          ].map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.gridItem}>
              <Text style={styles.gridIcon}>{item.icon}</Text>
              <Text style={styles.gridLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 20, paddingTop: 60, backgroundColor: colors.primaryBlue },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#fff', fontFamily: 'Inter-Bold' },
  subText: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12 },
  statCard: { width: '46%', backgroundColor: '#fff', borderRadius: 16, padding: 16, margin: 6, borderLeftWidth: 4, elevation: 2 },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#111827', fontFamily: 'Inter-Bold' },
  statTitle: { fontSize: 13, color: '#6B7280', marginTop: 4, fontFamily: 'Inter-Regular' },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16, fontFamily: 'Inter-SemiBold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: { width: '46%', backgroundColor: '#fff', borderRadius: 16, padding: 20, margin: 6, alignItems: 'center', elevation: 2 },
  gridIcon: { fontSize: 32, marginBottom: 8 },
  gridLabel: { fontSize: 13, color: '#111827', textAlign: 'center', fontFamily: 'Inter-Medium' },
});

export default DashboardScreen;
