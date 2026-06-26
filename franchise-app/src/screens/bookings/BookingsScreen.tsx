import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookings } from '../../redux/slices/bookingsSlice';
import { colors } from '../../theme/colors';

const StatusBadge = ({ status }: { status: string }) => {
  const statusColors: any = { pending: colors.warning, confirmed: colors.info, in_progress: colors.primaryBlue, completed: colors.success, cancelled: colors.error };
  return (
    <View style={[styles.badge, { backgroundColor: (statusColors[status] || '#999') + '20' }]}>
      <Text style={[styles.badgeText, { color: statusColors[status] || '#999' }]}>{status.replace('_', ' ').toUpperCase()}</Text>
    </View>
  );
};

const BookingCard = ({ item, onPress }: { item: any; onPress: () => void }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{item.serviceName || 'Service Booking'}</Text>
      <StatusBadge status={item.status} />
    </View>
    <Text style={styles.cardDetail}>📅 {item.slotDate ? new Date(item.slotDate).toLocaleDateString() : 'N/A'} | ⏰ {item.slotTime || 'N/A'}</Text>
    <Text style={styles.cardDetail}>🚗 {item.vehicleNumber || 'N/A'} | 👤 {item.customerName || 'N/A'}</Text>
    <Text style={styles.cardAmount}>₹{item.totalAmount || 0}</Text>
  </TouchableOpacity>
);

const BookingsScreen = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state: any) => state.bookings);
  const [refreshing, setRefreshing] = useState(false);

  const loadBookings = () => { dispatch(fetchBookings({}) as any); };
  useEffect(() => { loadBookings(); }, []);

  const onRefresh = async () => { setRefreshing(true); await loadBookings(); setRefreshing(false); };

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Bookings</Text></View>
      <FlatList
        data={items}
        keyExtractor={(item: any) => item._id}
        renderItem={({ item }: any) => <BookingCard item={item} onPress={() => {}} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No bookings found</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 20, paddingTop: 60, backgroundColor: colors.primaryBlue },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', fontFamily: 'Inter-Bold' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827', fontFamily: 'Inter-SemiBold', flex: 1 },
  cardDetail: { fontSize: 13, color: '#6B7280', marginTop: 4, fontFamily: 'Inter-Regular' },
  cardAmount: { fontSize: 18, fontWeight: 'bold', color: colors.success, marginTop: 8, fontFamily: 'Inter-Bold' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '600', fontFamily: 'Inter-SemiBold' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 16 },
});

export default BookingsScreen;
