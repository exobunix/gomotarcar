import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookings } from '../../redux/slices/bookingsSlice';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const StatusTab = ({ label, count, active, onPress }: any) => (
  <TouchableOpacity onPress={onPress} style={[styles.tabBtn, active ? styles.tabBtnActive : null]}>
    <Text style={[styles.tabLabel, active ? styles.tabLabelActive : null]}>{label}</Text>
    <View style={[styles.tabBadge, active ? styles.tabBadgeActive : null]}>
      <Text style={[styles.tabBadgeText, active ? styles.tabBadgeActiveText : null]}>{count}</Text>
    </View>
  </TouchableOpacity>
);

const BookingCard = ({ item, onStart, onComplete }: any) => {
  const isPending = !['completed', 'cancelled', 'in_progress'].includes(item.status);
  const isOngoing = item.status === 'in_progress';

  return (
    <View style={styles.card}>
      {/* Header ID & Status */}
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardIdLabel}>BOOKING ID</Text>
          <Text style={styles.cardId}>{item.bookingId || `GMF-${String(item._id).slice(-5).toUpperCase()}`}</Text>
        </View>
        <View style={styles.badgeRow}>
          <View style={[styles.statusBadge, item.status === 'completed' ? styles.statusCompleted : item.status === 'cancelled' ? styles.statusCancelled : item.status === 'in_progress' ? styles.statusOngoing : styles.statusUpcoming]}>
            <Text style={[styles.statusText, item.status === 'completed' ? styles.textCompleted : item.status === 'cancelled' ? styles.textCancelled : item.status === 'in_progress' ? styles.textOngoing : styles.textUpcoming]}>
              {(item.status || 'upcoming').toUpperCase()}
            </Text>
          </View>
          <View style={[styles.payBadge, item.paymentStatus === 'paid' ? styles.payPaid : styles.payPending]}>
            <Text style={[styles.payText, item.paymentStatus === 'paid' ? styles.textCompleted : styles.textPending]}>
              {item.paymentStatus === 'paid' ? 'PAID' : 'PENDING'}
            </Text>
          </View>
        </View>
      </View>

      {/* Date & Time */}
      <View style={styles.infoRow}>
        <Text style={styles.icon}>📅</Text>
        <View>
          <Text style={styles.infoText}>{item.slotDate ? new Date(item.slotDate).toLocaleDateString() : '26 May 2025'}</Text>
          <Text style={styles.infoSubText}>{item.slotTime || '10:00 AM'}</Text>
        </View>
      </View>

      {/* Customer Info */}
      <View style={styles.infoRow}>
        <Text style={styles.icon}>👤</Text>
        <View>
          <Text style={styles.infoText}>{item.customerName || 'Ravi Sharma'}</Text>
          <Text style={styles.infoSubText}>+91 98765 43210 • Noida</Text>
        </View>
      </View>

      {/* Vehicle details */}
      <View style={styles.infoRow}>
        <Text style={styles.icon}>🚗</Text>
        <View>
          <Text style={styles.infoText}>{item.vehicleNumber || 'Toyota Fortuner'}</Text>
          <Text style={styles.infoSubText}>UP 16 AB 1234 • White</Text>
        </View>
      </View>

      {/* Service description & pricing */}
      <View style={styles.serviceBox}>
        <View>
          <Text style={styles.serviceLabel}>SERVICE</Text>
          <Text style={styles.serviceName}>{item.serviceName || 'Steam Car Wash'}</Text>
        </View>
        <View style={styles.priceBox}>
          <Text style={styles.serviceLabel}>AMOUNT</Text>
          <Text style={styles.price}>₹{item.totalAmount || '1,250'}</Text>
        </View>
      </View>

      {/* Actions */}
      {item.status !== 'completed' && item.status !== 'cancelled' && (
        <View style={styles.actions}>
          {isPending ? (
            <TouchableOpacity style={styles.startBtn} onPress={onStart}>
              <Text style={styles.btnText}>Start Ongoing</Text>
            </TouchableOpacity>
          ) : isOngoing ? (
            <TouchableOpacity style={styles.completeBtn} onPress={onComplete}>
              <Text style={styles.btnText}>Complete Service</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </View>
  );
};

const BookingsScreen = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state: any) => state.bookings);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'ongoing' | 'completed' | 'cancelled'>('upcoming');

  const loadBookings = () => {
    dispatch(fetchBookings({}) as any);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const getFilteredBookings = () => {
    const list = items || [];
    if (activeTab === 'upcoming') {
      return list.filter((b: any) => !['completed', 'cancelled', 'in_progress'].includes(b.status));
    }
    if (activeTab === 'ongoing') {
      return list.filter((b: any) => b.status === 'in_progress');
    }
    return list.filter((b: any) => b.status === activeTab);
  };

  const filteredData = getFilteredBookings();

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#090D1A', '#02040A']} style={styles.header}>
        <Text style={styles.headerTitle}>Booking Dashboard</Text>
        <Text style={styles.headerSub}>Manage and track all your bookings in one place.</Text>
      </LinearGradient>

      {/* Status tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          <StatusTab label="Upcoming" count={items?.filter((b: any) => !['completed', 'cancelled', 'in_progress'].includes(b.status)).length || 0} active={activeTab === 'upcoming'} onPress={() => setActiveTab('upcoming')} />
          <StatusTab label="Ongoing" count={items?.filter((b: any) => b.status === 'in_progress').length || 0} active={activeTab === 'ongoing'} onPress={() => setActiveTab('ongoing')} />
          <StatusTab label="Completed" count={items?.filter((b: any) => b.status === 'completed').length || 0} active={activeTab === 'completed'} onPress={() => setActiveTab('completed')} />
          <StatusTab label="Cancelled" count={items?.filter((b: any) => b.status === 'cancelled').length || 0} active={activeTab === 'cancelled'} onPress={() => setActiveTab('cancelled')} />
        </ScrollView>
      </View>

      {/* Filters bar */}
      <View style={styles.searchBar}>
        <TextInput 
          placeholder="Search Booking ID, Customer or Mobile..." 
          placeholderTextColor="#475569" 
          style={styles.input} 
        />
      </View>

      {/* List content */}
      <FlatList
        data={filteredData}
        keyExtractor={(item: any) => item._id}
        renderItem={({ item }: any) => <BookingCard item={item} onStart={() => {}} onComplete={() => {}} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.empty}>No bookings found matching selected category.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090D1A' },
  header: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: '#64748B', marginTop: 4 },
  tabsContainer: { backgroundColor: '#0F172A', borderBottomWidth: 1, borderBottomColor: '#1E293B', paddingVertical: 10 },
  tabsScroll: { paddingHorizontal: 16, gap: 8 },
  tabBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12, backgroundColor: '#1E293B/30', borderHorizontal: 1, borderColor: '#1E293B' },
  tabBtnActive: { backgroundColor: '#3B82F6' },
  tabLabel: { fontSize: 11, fontWeight: '600', color: '#94A3B8' },
  tabLabelActive: { color: '#fff' },
  tabBadge: { paddingHorizontal: 6, paddingVertical: 1.5, backgroundColor: '#334155', borderRadius: 6 },
  tabBadgeActive: { backgroundColor: '#ffffff25' },
  tabBadgeText: { fontSize: 9, fontWeight: '800', color: '#94A3B8' },
  tabBadgeActiveText: { color: '#fff' },
  searchBar: { paddingHorizontal: 16, paddingTop: 14 },
  input: { backgroundColor: '#0F172A', borderRadius: 12, borderWidth: 1, borderColor: '#1E293B', paddingHorizontal: 16, paddingVertical: 10, fontSize: 12, color: '#fff' },
  list: { padding: 16, paddingBottom: 30 },
  card: { backgroundColor: '#0F172A', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#1E293B' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#1E293B', paddingBottom: 12, marginBottom: 12 },
  cardIdLabel: { fontSize: 8, fontWeight: '750', color: '#64748B' },
  cardId: { fontSize: 13, fontWeight: '900', color: '#3B82F6', marginTop: 2 },
  badgeRow: { flexDirection: 'row', gap: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusUpcoming: { backgroundColor: '#3B82F615' },
  statusOngoing: { backgroundColor: '#6366F115' },
  statusCompleted: { backgroundColor: '#10B98115' },
  statusCancelled: { backgroundColor: '#EF444415' },
  statusText: { fontSize: 8, fontWeight: '800' },
  textUpcoming: { color: '#3B82F6' },
  textOngoing: { color: '#6366F1' },
  textCompleted: { color: '#10B981' },
  textCancelled: { color: '#EF4444' },
  payBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  payPaid: { backgroundColor: '#10B98110' },
  payPending: { backgroundColor: '#F59E0B10' },
  payText: { fontSize: 8, fontWeight: '800' },
  textPending: { color: '#F59E0B' },
  infoRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 10 },
  icon: { fontSize: 14 },
  infoText: { fontSize: 11, fontWeight: '750', color: '#fff' },
  infoSubText: { fontSize: 9.5, color: '#64748B', marginTop: 1 },
  serviceBox: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#090D1A', borderRadius: 12, padding: 12, marginTop: 4, borderWidth: 0.5, borderColor: '#1E293B' },
  serviceLabel: { fontSize: 7.5, fontWeight: '750', color: '#64748B', textTransform: 'uppercase' },
  serviceName: { fontSize: 11, fontWeight: '750', color: '#fff', marginTop: 2 },
  priceBox: { alignItems: 'flex-end' },
  price: { fontSize: 12, fontWeight: '900', color: '#10B981', marginTop: 2 },
  actions: { marginTop: 14, borderTopWidth: 1, borderTopColor: '#1E293B', paddingTop: 12 },
  startBtn: { backgroundColor: '#3B82F6', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  completeBtn: { backgroundColor: '#10B981', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  btnText: { fontSize: 11, fontWeight: '750', color: '#fff' },
  emptyContainer: { paddingVertical: 40, alignItems: 'center' },
  empty: { fontSize: 11, color: '#475569', textAlign: 'center' }
});

export default BookingsScreen;
