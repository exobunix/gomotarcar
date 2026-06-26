import React, { useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import { Card } from '../../components/common';
import QuickActionCard from '../../components/home/QuickActionCard';
import SubscriptionPreview from '../../components/home/SubscriptionPreview';
import UpcomingService from '../../components/home/UpcomingService';
import { fetchVehicles } from '../../redux/slices/vehicleSlice';
import { fetchApartments } from '../../redux/slices/apartmentSlice';
import { fetchMySubscriptions } from '../../redux/slices/subscriptionSlice';
import { fetchBookings } from '../../redux/slices/bookingSlice';
import { fetchUnreadCount } from '../../redux/slices/notificationSlice';
import { fetchWallet } from '../../redux/slices/walletSlice';
import { AppDispatch, RootState } from '../../redux/store';

interface HomeScreenProps {
  navigation: any;
}

const quickActions = [
  { id: '1', icon: '🧹', title: 'Hire Cleaner', subtitle: 'Book a pro', color: colors.primaryBlue },
  { id: '2', icon: '📋', title: 'Subscriptions', subtitle: 'Save up to 40%', color: '#7C3AED' },
  { id: '3', icon: '💳', title: 'Wallet', subtitle: 'Balance & top-up', color: '#059669' },
  { id: '4', icon: '📱', title: 'QR Codes', subtitle: 'Manage stickers', color: '#D97706' },
];

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((s: RootState) => s.auth);
  const { mySubscriptions } = useSelector((s: RootState) => s.subscription);
  const { bookings } = useSelector((s: RootState) => s.booking);
  const { unreadCount } = useSelector((s: RootState) => s.notifications);
  const { wallet } = useSelector((s: RootState) => s.wallet);
  const { vehicles } = useSelector((s: RootState) => s.vehicles);
  const [refreshing, setRefreshing] = React.useState(false);

  const loadData = useCallback(() => {
    if (user?._id) {
      dispatch(fetchVehicles(user._id));
      dispatch(fetchApartments(user._id));
    }
    dispatch(fetchMySubscriptions());
    dispatch(fetchBookings({ limit: 5 }));
    dispatch(fetchUnreadCount());
    dispatch(fetchWallet());
  }, [dispatch, user?._id]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    const unsub = navigation.addListener('focus', loadData);
    return unsub;
  }, [navigation, loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleQuickAction = (title: string) => {
    switch (title) {
      case 'Hire Cleaner': navigation.navigate('HireCleaner'); break;
      case 'Subscriptions': navigation.navigate('Subscriptions'); break;
      case 'Wallet': navigation.navigate('Wallet'); break;
      case 'QR Codes': navigation.navigate('QRList'); break;
      default: break;
    }
  };

  const activeSub = mySubscriptions.find((s) => s.status === 'active');
  const upcomingBookings = bookings.filter(
    (b) => b.status === 'pending' || b.status === 'confirmed' || b.status === 'assigned' || b.status === 'in_progress'
  );
  const nextBooking = upcomingBookings[0];
  const completedCount = bookings.filter((b) => b.status === 'completed').length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name || 'User'} 👋</Text>
          <Text style={styles.headerSubtitle}>What would you like to do today?</Text>
        </View>
        <TouchableOpacity style={styles.headerRight} onPress={() => navigation.navigate('Profile', { screen: 'ProfileMain' })}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.name || 'U').charAt(0).toUpperCase()}</Text>
          </View>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryBlue} />}
      >
        {/* Wallet Balance Bar */}
        <TouchableOpacity style={styles.walletBar} onPress={() => navigation.navigate('Wallet')}>
          <Text style={styles.walletIcon}>💰</Text>
          <View>
            <Text style={styles.walletLabel}>Wallet Balance</Text>
            <Text style={styles.walletAmount}>₹{(wallet?.balance || 0).toLocaleString('en-IN')}</Text>
          </View>
          <Text style={styles.walletArrow}>→</Text>
        </TouchableOpacity>

        {/* Quick Actions Grid */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <QuickActionCard
              key={action.id}
              icon={action.icon}
              title={action.title}
              subtitle={action.subtitle}
              color={action.color}
              onPress={() => handleQuickAction(action.title)}
            />
          ))}
        </View>

        {/* Active Subscription */}
        <Text style={styles.sectionTitle}>My Plan</Text>
        <SubscriptionPreview
          hasActiveSubscription={!!activeSub}
          planName={activeSub && typeof activeSub.planId === 'object' ? activeSub.planId.name : undefined}
          remainingCleanings={activeSub ? activeSub.cleaningsTotal - activeSub.cleaningsUsed : undefined}
          expiryDate={activeSub ? new Date(activeSub.endDate).toLocaleDateString('en', { day: 'numeric', month: 'short' }) : undefined}
          onViewSubscriptions={() => navigation.navigate('Subscriptions')}
        />

        {/* Upcoming Booking */}
        <Text style={styles.sectionTitle}>Schedule</Text>
        <UpcomingService
          hasService={!!nextBooking}
          serviceType={nextBooking?.packageName || nextBooking?.serviceType}
          vehicleNumber={nextBooking && typeof nextBooking.vehicleId === 'object' ? nextBooking.vehicleId.vehicleNumber : undefined}
          date={nextBooking?.scheduledDate}
          time={nextBooking?.scheduledTime}
          cleanerName={nextBooking?.cleanerName}
          status={nextBooking?.status}
          onViewBooking={() => nextBooking && navigation.navigate('BookingsTab', {
            screen: 'BookingDetail',
            params: { bookingId: nextBooking._id },
          })}
        />

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <Card padding={16} style={styles.statCard}>
            <Text style={styles.statEmoji}>🚗</Text>
            <Text style={styles.statValue}>{vehicles.length}</Text>
            <Text style={styles.statLabel}>Vehicles</Text>
          </Card>
          <Card padding={16} style={styles.statCard}>
            <Text style={styles.statEmoji}>🧹</Text>
            <Text style={styles.statValue}>{completedCount}</Text>
            <Text style={styles.statLabel}>Cleanings</Text>
          </Card>
          <Card padding={16} style={styles.statCard}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statValue}>{upcomingBookings.length}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </Card>
        </View>

        {/* View All Services Link */}
        <TouchableOpacity style={styles.viewAllLink} onPress={() => navigation.navigate('ServiceHistory')}>
          <Text style={styles.viewAllText}>View Service History →</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: colors.white,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  greeting: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  headerSubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4, fontFamily: 'Inter-Regular' },
  headerRight: { position: 'relative' },
  avatar: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700', color: colors.primaryBlue, fontFamily: 'Inter-Bold' },
  badge: {
    position: 'absolute', top: -4, right: -4, backgroundColor: colors.error,
    minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: colors.white, fontFamily: 'Inter-Bold' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },
  walletBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primaryBlue,
    borderRadius: 16, padding: 16, marginBottom: 20,
  },
  walletIcon: { fontSize: 24, marginRight: 12 },
  walletLabel: { fontSize: 12, color: colors.lightBlue, fontFamily: 'Inter-Regular' },
  walletAmount: { fontSize: 20, fontWeight: '700', color: colors.white, fontFamily: 'Inter-Bold' },
  walletArrow: { marginLeft: 'auto', fontSize: 20, color: colors.lightBlue },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold', marginBottom: 12, marginTop: 8 },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  statCard: { width: '31%', alignItems: 'center', borderRadius: 20 },
  statEmoji: { fontSize: 24, marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2, fontFamily: 'Inter-Regular' },
  viewAllLink: { alignItems: 'center', paddingVertical: 16, marginTop: 8 },
  viewAllText: { fontSize: 14, fontWeight: '600', color: colors.primaryBlue, fontFamily: 'Inter-SemiBold' },
});

export default HomeScreen;
