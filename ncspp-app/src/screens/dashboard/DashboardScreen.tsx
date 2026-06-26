import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { colors } from '../../theme/colors';
import { fetchDashboard } from '../../redux/slices/franchiseSlice';
import { fetchLeads } from '../../redux/slices/leadSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus';

const quickActions = [
  { id: 'services', label: 'Services', icon: '🛠', screen: 'Services' },
  { id: 'offers', label: 'Offers', icon: '🏷', screen: 'Offers' },
  { id: 'leads', label: 'Leads', icon: '📋', screen: 'LeadManagement' },
  { id: 'analytics', label: 'Analytics', icon: '📊', screen: 'LeadAnalytics' },
  { id: 'wallet', label: 'Wallet', icon: '💳', screen: 'Wallet' },
  { id: 'reviews', label: 'Reviews', icon: '⭐', screen: 'Reviews' },
  { id: 'pricing', label: 'Pricing', icon: '💰', screen: 'Pricing' },
  { id: 'profile', label: 'Profile', icon: '👤', screen: 'Profile' },
];

const moduleGrid = [
  { id: 'services', label: 'Services', icon: '🛠', color: '#2196F3', screen: 'Services' },
  { id: 'offers', label: 'Offers', icon: '🏷', color: '#FF9800', screen: 'Offers' },
  { id: 'leads', label: 'Leads', icon: '📋', color: '#4CAF50', screen: 'LeadManagement' },
  { id: 'analytics', label: 'Analytics', icon: '📊', color: '#9C27B0', screen: 'LeadAnalytics' },
  { id: 'wallet', label: 'Wallet', icon: '💳', color: '#F44336', screen: 'Wallet' },
  { id: 'reviews', label: 'Reviews', icon: '⭐', color: '#FFEB3B', screen: 'Reviews' },
  { id: 'pricing', label: 'Pricing', icon: '💰', color: '#795548', screen: 'Pricing' },
  { id: 'notifications', label: 'Alerts', icon: '🔔', color: '#607D8B', screen: 'Notifications' },
];

const navigateTo = (navigation: any, screen: string) => {
  const screenTabMap: Record<string, string> = {
    Services: 'ServicesTab',
    Offers: 'ServicesTab',
    LeadManagement: 'LeadsTab',
    LeadAnalytics: 'LeadsTab',
    Wallet: 'WalletTab',
    Reviews: 'MoreTab',
    Pricing: 'ServicesTab',
    Profile: 'MoreTab',
    Notifications: 'MoreTab',
  };

  const tabName = screenTabMap[screen] || 'DashboardTab';
  navigation.navigate(tabName, { screen });
};

const DashboardScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { dashboardStats, loading } = useSelector(
    (state: RootState) => state.franchise,
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = () => {
    dispatch(fetchDashboard());
    dispatch(fetchLeads({ limit: 5 }));
  };

  useRefreshOnFocus(loadData);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([dispatch(fetchDashboard()), dispatch(fetchLeads({ limit: 5 }))]);
    setRefreshing(false);
  };

  const stats = dashboardStats || {
    totalLeads: 0,
    activeServices: 0,
    pendingApprovals: 0,
    monthlyEarnings: 0,
    rating: 0,
    totalReviews: 0,
  };

  const statCards = [
    { label: 'Total Leads', value: stats.totalLeads?.toString() || '0', icon: '📋', color: '#2196F3' },
    { label: 'Active Services', value: stats.activeServices?.toString() || '0', icon: '🛠', color: '#4CAF50' },
    { label: 'Pending', value: stats.pendingApprovals?.toString() || '0', icon: '⏳', color: '#FF9800' },
    { label: 'Earnings', value: `₹${(stats.monthlyEarnings || 0).toLocaleString()}`, icon: '💰', color: '#9C27B0' },
  ];

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading && !refreshing} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.welcomeSection}>
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.name || 'Partner'} 👋
            </Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => navigateTo(navigation, 'Profile')}
          >
            <Text style={styles.profileBtnText}>Profile</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          {statCards.map((stat) => (
            <Card key={stat.label} style={[styles.statCard, { borderTopColor: stat.color }]}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Card>
          ))}
        </View>

        {stats.rating > 0 && (
          <Card style={styles.ratingCard}>
            <Text style={styles.ratingLabel}>Your Rating</Text>
            <View style={styles.ratingRow}>
              <Text style={styles.ratingValue}>
                {stats.rating?.toFixed(1)}
              </Text>
              <Text style={styles.starIcon}>⭐</Text>
              <Text style={styles.ratingCount}>
                ({stats.totalReviews || 0} reviews)
              </Text>
            </View>
          </Card>
        )}

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionItem}
              onPress={() => navigateTo(navigation, action.screen)}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>All Modules</Text>
        <View style={styles.moduleGrid}>
          {moduleGrid.map((module) => (
            <TouchableOpacity
              key={module.id}
              style={[styles.moduleItem, { backgroundColor: module.color + '15' }]}
              onPress={() => navigateTo(navigation, module.screen)}
            >
              <Text style={styles.moduleIcon}>{module.icon}</Text>
              <Text style={[styles.moduleLabel, { color: module.color }]}>
                {module.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  date: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  profileBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  profileBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    borderTopWidth: 3,
    alignItems: 'center',
    padding: 14,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ratingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF9800',
  },
  starIcon: {
    fontSize: 18,
  },
  ratingCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  actionItem: {
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    fontSize: 18,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  moduleItem: {
    width: '48%',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  moduleIcon: {
    fontSize: 32,
  },
  moduleLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DashboardScreen;
