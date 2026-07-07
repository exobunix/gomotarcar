import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import { Card } from '../../components/common';
import { fetchVehicles } from '../../redux/slices/vehicleSlice';
import { fetchApartments } from '../../redux/slices/apartmentSlice';
import { fetchMySubscriptions } from '../../redux/slices/subscriptionSlice';
import { fetchBookings } from '../../redux/slices/bookingSlice';
import { fetchUnreadCount } from '../../redux/slices/notificationSlice';
import { fetchWallet } from '../../redux/slices/walletSlice';
import { AppDispatch, RootState } from '../../redux/store';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((s: RootState) => s.auth);
  const { mySubscriptions } = useSelector((s: RootState) => s.subscription);
  const { bookings } = useSelector((s: RootState) => s.booking);
  const { unreadCount } = useSelector((s: RootState) => s.notifications);
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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const activeSub = mySubscriptions.find((s) => s.status === 'active');
  const upcomingBookings = bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed');
  const nextBooking = upcomingBookings[0];

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning, {user?.name || 'Rahul'}! 👋</Text>
          <Text style={styles.locationSelector}>📍 Green View Heights, Pune  ▼</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.goPointsBadge}>
            <Text style={styles.goPointsStar}>⭐</Text>
            <Text style={styles.goPointsValue}>1,250\nGoPoints</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate('Notifications')}>
            <Text style={styles.bellIcon}>🔔</Text>
            {unreadCount > 0 && <View style={styles.badge} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.avatarText}>{(user?.name || 'R').charAt(0)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryBlue} />}
      >
        {/* Quick Action Cards (4 horizontal) */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('HireCleaner')}>
            <View style={[styles.actionIconBox, { backgroundColor: '#EAF3FF' }]}>
              <Text style={styles.actionIcon}>🧹</Text>
            </View>
            <Text style={styles.actionTitle}>Hire\nCleaner</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Services')}>
            <View style={[styles.actionIconBox, { backgroundColor: '#F5F3FF' }]}>
              <Text style={styles.actionIcon}>🔍</Text>
            </View>
            <Text style={styles.actionTitle}>Search\nServices</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Services')}>
            <View style={[styles.actionIconBox, { backgroundColor: '#ECFDF5' }]}>
              <Text style={styles.actionIcon}>📅</Text>
            </View>
            <Text style={styles.actionTitle}>Book\nService</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('FastTag')}>
            <View style={[styles.actionIconBox, { backgroundColor: '#FFFBEB' }]}>
              <Text style={styles.actionIcon}>💳</Text>
            </View>
            <Text style={styles.actionTitle}>FastTag\nRecharge</Text>
          </TouchableOpacity>
        </View>

        {/* Active Subscription Info card */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Subscription</Text>
          <Text style={styles.activeStatusText}>Active</Text>
        </View>
        <Card style={styles.subscriptionCard}>
          <View style={styles.subCardTop}>
            <View style={styles.subIconContainer}>
              <Text style={styles.subIcon}>🚗</Text>
            </View>
            <View>
              <Text style={styles.subTitle}>{activeSub?.packageName || 'Premium Plan'}</Text>
              <Text style={styles.subType}>Exterior + Interior Cleaning</Text>
            </View>
            <TouchableOpacity style={styles.viewDetailsBtn} onPress={() => navigation.navigate('Subscriptions')}>
              <Text style={styles.viewDetailsText}>View Details ›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.subCardStatsRow}>
            <View style={styles.subStatCol}>
              <Text style={styles.subStatLabel}>Total Cleanings</Text>
              <Text style={styles.subStatValue}>{activeSub?.cleaningsTotal || 12}</Text>
            </View>
            <View style={styles.subStatCol}>
              <Text style={styles.subStatLabel}>Completed</Text>
              <Text style={styles.subStatValue}>{activeSub?.cleaningsUsed || 7}</Text>
            </View>
            <View style={styles.subStatCol}>
              <Text style={styles.subStatLabel}>Remaining</Text>
              <Text style={styles.subStatValue}>{(activeSub?.cleaningsTotal || 12) - (activeSub?.cleaningsUsed || 7)}</Text>
            </View>
          </View>
        </Card>

        {/* Upcoming Booking card */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Bookings</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Bookings')}>
            <Text style={styles.viewAllText}>View All ›</Text>
          </TouchableOpacity>
        </View>
        <Card style={styles.bookingCard}>
          <View style={styles.bookingRow}>
            <View style={styles.bookingDateBox}>
              <Text style={styles.bookingMonth}>May</Text>
              <Text style={styles.bookingDay}>{nextBooking ? new Date(nextBooking.slotDate).getDate() : '26'}</Text>
              <Text style={styles.bookingWeekday}>Mon</Text>
            </View>
            <View style={styles.bookingDetails}>
              <Text style={styles.bookingServiceTitle}>{nextBooking?.serviceName || 'AC Service'}</Text>
              <Text style={styles.bookingSubInfo}>📍 GoMotorCar Service Center</Text>
              <Text style={styles.bookingTime}>🕒 {nextBooking?.slotTime || '10:30 AM - 12:30 PM'}</Text>
            </View>
            <View style={styles.bookingStatusBox}>
              <Text style={styles.bookingStatusText}>Confirmed</Text>
            </View>
          </View>
        </Card>

        {/* Exclusive Offers Carousel */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Exclusive Offers</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Offers')}>
            <Text style={styles.viewAllText}>View All ›</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.offersRow}>
          <Card style={styles.offerCard}>
            <Text style={styles.offerTag}>Get 20% OFF</Text>
            <Text style={styles.offerDesc}>On Your First Steam Wash</Text>
            <Text style={styles.offerCode}>Use Code: GOMOTOR20</Text>
          </Card>
          <Card style={[styles.offerCard, { backgroundColor: '#F5F3FF' }]}>
            <Text style={[styles.offerTag, { color: '#7C3AED' }]}>Free AC Checkup</Text>
            <Text style={styles.offerDesc}>With Periodic Service</Text>
            <Text style={styles.offerCode}>Use Code: FREEAC</Text>
          </Card>
        </ScrollView>

        {/* Recent Activities */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={styles.viewAllText}>View All ›</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.activityList}>
          <View style={styles.activityRow}>
            <View style={styles.activityIconCircle}>
              <Text style={styles.activityIcon}>✓</Text>
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Car Cleaning Completed</Text>
              <Text style={styles.activityDesc}>Swift Dzire • MH12AB1234</Text>
            </View>
            <Text style={styles.activityStatus}>Completed</Text>
          </View>

          <View style={styles.activityRow}>
            <View style={[styles.activityIconCircle, { backgroundColor: '#EAF3FF' }]}>
              <Text style={styles.activityIcon}>📅</Text>
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Service Booking Confirmed</Text>
              <Text style={styles.activityDesc}>AC Service • 26 May 2025</Text>
            </View>
            <Text style={styles.activityStatus}>Confirmed</Text>
          </View>

          <View style={styles.activityRow}>
            <View style={[styles.activityIconCircle, { backgroundColor: '#FFFBEB' }]}>
              <Text style={styles.activityIcon}>⚡</Text>
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>FastTag Recharge</Text>
              <Text style={styles.activityDesc}>MH12AB1234 • ₹500.00</Text>
            </View>
            <Text style={styles.activityStatus}>₹500.00</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  greeting: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  locationSelector: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'Inter-Medium',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  goPointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  goPointsStar: {
    fontSize: 12,
  },
  goPointsValue: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#D97706',
    fontFamily: 'Inter-Bold',
    lineHeight: 9,
  },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bellIcon: {
    fontSize: 18,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1E8FF',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primaryBlue,
    fontFamily: 'Inter-Bold',
  },
  scrollView: {
    flex: 1,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 20,
  },
  actionCard: {
    alignItems: 'center',
    width: (width - 40 - 24) / 4,
  },
  actionIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 26,
  },
  actionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
    lineHeight: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  activeStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#22C55E',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    fontFamily: 'Inter-SemiBold',
  },
  subscriptionCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 4,
  },
  subCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
    marginBottom: 12,
  },
  subIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  subIcon: {
    fontSize: 22,
  },
  subTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  subType: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    marginTop: 1,
  },
  viewDetailsBtn: {
    marginLeft: 'auto',
    backgroundColor: '#EAF3FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  viewDetailsText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryBlue,
    fontFamily: 'Inter-SemiBold',
  },
  subCardStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subStatCol: {
    alignItems: 'center',
    flex: 1,
  },
  subStatLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  subStatValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryBlue,
    fontFamily: 'Inter-SemiBold',
  },
  bookingCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingDateBox: {
    width: 52,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  bookingMonth: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    fontFamily: 'Inter-SemiBold',
  },
  bookingDay: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
    lineHeight: 22,
  },
  bookingWeekday: {
    fontSize: 8.5,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  bookingDetails: {
    flex: 1,
  },
  bookingServiceTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  bookingSubInfo: {
    fontSize: 9.5,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  bookingTime: {
    fontSize: 9.5,
    color: '#64748B',
    fontFamily: 'Inter-Medium',
    marginTop: 2,
  },
  bookingStatusBox: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bookingStatusText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#16A34A',
    fontFamily: 'Inter-SemiBold',
  },
  offersRow: {
    paddingLeft: 20,
    paddingRight: 8,
    marginBottom: 20,
    gap: 12,
  },
  offerCard: {
    width: width * 0.65,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    backgroundColor: '#EAF3FF',
  },
  offerTag: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.primaryBlue,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  offerDesc: {
    fontSize: 11,
    color: '#0F172A',
    fontFamily: 'Inter-Regular',
    marginBottom: 10,
  },
  offerCode: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#64748B',
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontFamily: 'Inter-SemiBold',
  },
  activityList: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    padding: 12,
    gap: 12,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  activityIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityIcon: {
    fontSize: 14,
    color: '#16A34A',
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'Inter-SemiBold',
  },
  activityDesc: {
    fontSize: 9,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    marginTop: 1,
  },
  activityStatus: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    fontFamily: 'Inter-SemiBold',
  },
});

export default HomeScreen;
