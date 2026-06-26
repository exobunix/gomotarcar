import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { colors } from '../../theme/colors';

const StatCard = ({ title, value, color }: { title: string; value: string; color: string }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
);

const DashboardScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalBookings: 0, pendingBookings: 0, completedBookings: 0, todayBookings: 0
  });

  const fetchStats = async () => {
    try {
      const franchiseService = require('../../services/franchise.service').franchiseService;
      const response = await franchiseService.getDashboard();
      if (response?.data) setStats(response.data);
    } catch (err) {
      // Use defaults on failure
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome, Partner!</Text>
        <Text style={styles.subText}>GoMotarCar Franchise Dashboard</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard title="Today's Bookings" value={String(stats.todayBookings)} color={colors.primaryBlue} />
        <StatCard title="Total Bookings" value={String(stats.totalBookings)} color={colors.success} />
        <StatCard title="Pending" value={String(stats.pendingBookings)} color={colors.warning} />
        <StatCard title="Completed" value={String(stats.completedBookings)} color={colors.info} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <ActionButton icon="📋" label="New Booking" />
          <ActionButton icon="✅" label="Job Cards" />
          <ActionButton icon="💰" label="Payments" />
          <ActionButton icon="⭐" label="Reviews" />
        </View>
      </View>
    </ScrollView>
  );
};

const ActionButton = ({ icon, label }: { icon: string; label: string }) => (
  <View style={styles.actionButton}>
    <Text style={styles.actionIcon}>{icon}</Text>
    <Text style={styles.actionLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 20, paddingTop: 60, backgroundColor: colors.primaryBlue },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#fff', fontFamily: 'Inter-Bold' },
  subText: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12 },
  statCard: { width: '46%', backgroundColor: '#fff', borderRadius: 16, padding: 16, margin: 6, borderLeftWidth: 4, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#111827', fontFamily: 'Inter-Bold' },
  statTitle: { fontSize: 13, color: '#6B7280', marginTop: 4, fontFamily: 'Inter-Regular' },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12, fontFamily: 'Inter-SemiBold' },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap' },
  actionButton: { width: '46%', backgroundColor: '#fff', borderRadius: 16, padding: 20, margin: 6, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  actionIcon: { fontSize: 32, marginBottom: 8 },
  actionLabel: { fontSize: 14, color: '#111827', fontFamily: 'Inter-Medium', textAlign: 'center' },
});

export default DashboardScreen;
