import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import AmountDisplay from '../../components/common/AmountDisplay';
import EmptyState from '../../components/common/EmptyState';
import { fetchBookings } from '../../redux/slices/bookingSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { formatDate } from '../../utils/helpers';

interface Props {
  navigation: any;
}

const statusTabs = ['all', 'upcoming', 'completed', 'cancelled'];

const BookingListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { bookings, loading } = useSelector((s: RootState) => s.booking);
  const [activeTab, setActiveTab] = useState('all');

  const load = useCallback(() => {
    dispatch(fetchBookings(activeTab !== 'all' ? { status: activeTab } : undefined));
  }, [activeTab]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  const filtered = activeTab === 'all' ? bookings : bookings.filter((b) => {
    if (activeTab === 'upcoming') return b.status === 'pending' || b.status === 'confirmed' || b.status === 'assigned' || b.status === 'in_progress';
    if (activeTab === 'completed') return b.status === 'completed';
    if (activeTab === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  const getVehicleNumber = (v: any) => {
    if (!v) return '';
    return typeof v === 'object' ? v.vehicleNumber || `${v.make} ${v.model}` : v;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Text style={styles.headerCount}>{bookings.length} total</Text>
      </View>

      <View style={styles.tabRow}>
        {statusTabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primaryBlue} />}
        ListEmptyComponent={
          <EmptyState icon="📋" title="No Bookings" description="Book your first cleaning service to see it here" />
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('BookingDetail', { bookingId: item._id })}>
            <Card variant="elevated" padding={16} style={styles.bookingCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.bookingNum}>#{item.bookingNumber || item._id.slice(-6).toUpperCase()}</Text>
                  <Text style={styles.bookingService}>{item.packageName || item.serviceType}</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>
              <View style={styles.cardDetail}>
                <Text style={styles.detailIcon}>🚗 {getVehicleNumber(item.vehicleId)}</Text>
                <AmountDisplay amount={item.amount} size="sm" color={colors.textPrimary} />
              </View>
              <View style={styles.cardDetail}>
                <Text style={styles.detailIcon}>📅 {formatDate(item.scheduledDate, 'short')} at {item.scheduledTime}</Text>
              </View>
              {item.cleanerName && (
                <View style={styles.cardFooter}>
                  <Text style={styles.cleanerLabel}>Assigned: {item.cleanerName}</Text>
                </View>
              )}
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12, backgroundColor: colors.white,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  headerCount: { fontSize: 14, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  tabRow: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 12, backgroundColor: colors.white, gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.background },
  tabActive: { backgroundColor: colors.primaryBlue },
  tabText: { fontSize: 13, fontWeight: '500', color: colors.textSecondary, fontFamily: 'Inter-Medium' },
  tabTextActive: { color: colors.white, fontWeight: '600' },
  listContent: { padding: 20, paddingBottom: 40 },
  bookingCard: { marginBottom: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  bookingNum: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  bookingService: { fontSize: 13, color: colors.textSecondary, marginTop: 2, fontFamily: 'Inter-Regular' },
  cardDetail: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  detailIcon: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  cardFooter: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border },
  cleanerLabel: { fontSize: 12, color: colors.primaryBlue, fontFamily: 'Inter-Medium' },
});

export default BookingListScreen;
