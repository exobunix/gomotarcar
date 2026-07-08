import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, TouchableOpacity, Image } from 'react-native';

const { width } = Dimensions.get('window');

const StatCard = ({ title, value, subtitle, icon, colors }: any) => (
  <View style={styles.statCard}>
    <View style={styles.statHeader}>
      <Text style={styles.statTitle}>{title}</Text>
      <View style={[styles.iconBox, { backgroundColor: colors[0] + '15' }]}>
        <Text style={[styles.iconText, { color: colors[0] }]}>{icon}</Text>
      </View>
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={[styles.statSub, { color: colors[1] || '#10B981' }]}>{subtitle}</Text>
  </View>
);

const DashboardScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    todayBookings: 24,
    activeBookings: 18,
    monthlyRevenue: 245680,
    pendingPayments: 48320,
  });

  const fetchStats = async () => {
    try {
      const franchiseService = require('../../services/franchise.service').franchiseService;
      const response = await franchiseService.getDashboard();
      if (response?.data) {
        setStats(prev => ({
          ...prev,
          todayBookings: response.data.bookings?.today || 24,
          activeBookings: response.data.bookings?.active || 18,
          monthlyRevenue: response.data.revenue?.total || 245680,
          pendingPayments: Math.round((response.data.revenue?.total || 245680) * 0.19),
        }));
      }
    } catch (err) {
      // Use defaults
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D5BD7" />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.logoRow}>
            <Image source={{ uri: 'https://franchise-website-lovat.vercel.app/logo.png' }} style={styles.logoImg} resizeMode="contain" />
            <View>
              <Text style={styles.greetingSub}>Good Morning, 👋</Text>
              <Text style={styles.greeting}>Welcome back, Roy Motors</Text>
            </View>
          </View>
          <View style={styles.profileBadge}>
            <Text style={styles.profileText}>RM</Text>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard title="Today's Bookings" value={String(stats.todayBookings)} subtitle="↑ 20% vs yesterday" icon="📅" colors={['#8B5CF6', '#16A34A']} />
        <StatCard title="Active Services" value={String(stats.activeBookings)} subtitle="↑ 12% vs yesterday" icon="🚗" colors={['#3B82F6', '#16A34A']} />
        <StatCard title="Monthly Revenue" value={`₹${stats.monthlyRevenue.toLocaleString()}`} subtitle="↑ 18% vs last month" icon="₹" colors={['#10B981', '#16A34A']} />
        <StatCard title="Pending Payments" value={`₹${stats.pendingPayments.toLocaleString()}`} subtitle="↓ 8% vs last month" icon="💳" colors={['#F59E0B', '#EF4444']} />
      </View>

      {/* Row 2: Staff, Ratings & Complaints */}
      <View style={styles.secondaryStats}>
        <View style={styles.secondaryCard}>
          <Text style={styles.secondaryTitle}>Staff Present</Text>
          <Text style={styles.secondaryVal}>12 / 15</Text>
          <Text style={styles.secondarySub}>80% Present</Text>
        </View>
        <View style={styles.secondaryCard}>
          <Text style={styles.secondaryTitle}>Ratings</Text>
          <Text style={styles.secondaryVal}>4.7 / 5</Text>
          <Text style={styles.secondarySub}>↑ 0.3 vs last month</Text>
        </View>
        <View style={styles.secondaryCard}>
          <Text style={styles.secondaryTitle}>Complaints</Text>
          <Text style={styles.secondaryVal}>5</Text>
          <Text style={[styles.secondarySub, { color: '#EF4444' }]}>↓ 10% vs last month</Text>
        </View>
      </View>

      {/* Row 3: Appointments */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
          <TouchableOpacity><Text style={styles.seeAll}>View All</Text></TouchableOpacity>
        </View>
        <View style={styles.appointmentList}>
          {[
            { time: '10:00 AM', name: 'Ravi Sharma', service: 'Steam Wash', plate: 'DL 10 AB 1234' },
            { time: '11:30 AM', name: 'Neha Gupta', service: 'Interior Cleaning', plate: 'HR 26 CD 5678' },
            { time: '01:00 PM', name: 'Amit Verma', service: 'Foam Wash', plate: 'UP 16 EF 9012' },
          ].map((item, idx) => (
            <View key={idx} style={styles.appCard}>
              <View>
                <Text style={styles.appTime}>{item.time}</Text>
                <Text style={styles.appName}>{item.name}</Text>
                <Text style={styles.appDetails}>{item.plate} • {item.service}</Text>
              </View>
              <View style={styles.badge}><Text style={styles.badgeText}>Upcoming</Text></View>
            </View>
          ))}
        </View>
      </View>

      {/* Row 4: Recent Activities */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          <TouchableOpacity><Text style={styles.seeAll}>View All</Text></TouchableOpacity>
        </View>
        <View style={styles.activityList}>
          {[
            { title: 'New booking created', desc: 'Ravi Sharma - Steam Wash', time: '10:15 AM' },
            { title: 'Payment received', desc: '₹1,250 from Neha Gupta', time: '09:45 AM' },
            { title: 'Service completed', desc: 'Foam Wash - UP 14 GH 3456', time: '09:10 AM' },
          ].map((act, idx) => (
            <View key={idx} style={styles.actCard}>
              <View style={styles.actDot} />
              <View style={styles.actInfo}>
                <Text style={styles.actTitle}>{act.title}</Text>
                <Text style={styles.actDesc}>{act.desc}</Text>
              </View>
              <Text style={styles.actTime}>{act.time}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Row 5: Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#E0F2FE', borderColor: '#BAE6FD' }]}>
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={[styles.actionText, { color: '#0D5BD7' }]}>New Booking</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' }]}>
            <Text style={styles.actionIcon}>👤</Text>
            <Text style={[styles.actionText, { color: '#16A34A' }]}>Add Customer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F3E8FF', borderColor: '#E9D5FF' }]}>
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={[styles.actionText, { color: '#7C3AED' }]}>Add Staff</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingBottom: 40 },
  header: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoImg: { width: 32, height: 32 },
  greetingSub: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  greeting: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginTop: 1 },
  profileBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E0F2FE', borderWidth: 1, borderColor: '#BAE6FD', alignItems: 'center', justifyContent: 'center' },
  profileText: { fontSize: 12, fontWeight: '900', color: '#0D5BD7' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, paddingTop: 16, justifyContent: 'space-between' },
  statCard: { width: '47.5%', backgroundColor: '#fff', borderRadius: 24, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 6 },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statTitle: { fontSize: 10, fontWeight: '700', color: '#64748B', textTransform: 'uppercase' },
  iconBox: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 14, fontWeight: 'bold' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#0F172A', marginTop: 10 },
  statSub: { fontSize: 9, fontWeight: '700', marginTop: 4 },
  secondaryStats: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
  secondaryCard: { flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 12, marginHorizontal: 4, borderWidth: 1, borderColor: '#E2E8F0' },
  secondaryTitle: { fontSize: 8.5, fontWeight: '800', color: '#64748B', textTransform: 'uppercase' },
  secondaryVal: { fontSize: 14, fontWeight: '900', color: '#0F172A', marginTop: 6 },
  secondarySub: { fontSize: 8.5, color: '#16A34A', fontWeight: '700', marginTop: 2 },
  section: { paddingHorizontal: 20, marginTop: 18 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  seeAll: { fontSize: 11, color: '#0D5BD7', fontWeight: '700' },
  appointmentList: { gap: 10 },
  appCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  appTime: { fontSize: 10, fontWeight: '900', color: '#0D5BD7' },
  appName: { fontSize: 12, fontWeight: '800', color: '#0F172A', marginTop: 2 },
  appDetails: { fontSize: 9.5, color: '#64748B', marginTop: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: '#E0F2FE', borderRadius: 6, borderWidth: 0.5, borderColor: '#BAE6FD' },
  badgeText: { fontSize: 8.5, color: '#0D5BD7', fontWeight: '800', textTransform: 'uppercase' },
  activityList: { backgroundColor: '#fff', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#E2E8F0', gap: 12 },
  actCard: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  actDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#0D5BD7' },
  actInfo: { flex: 1 },
  actTitle: { fontSize: 11.5, fontWeight: '800', color: '#0F172A' },
  actDesc: { fontSize: 9.5, color: '#64748B', marginTop: 1 },
  actTime: { fontSize: 9.5, color: '#94A3B8', fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  actionBtn: { flex: 1, borderRadius: 20, paddingVertical: 14, alignItems: 'center', borderWidth: 1 },
  actionIcon: { fontSize: 18 },
  actionText: { fontSize: 10, fontWeight: '800', marginTop: 5 },
});

export default DashboardScreen;
