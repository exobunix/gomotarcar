import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, RefreshControl, Dimensions, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookings } from '../../redux/slices/bookingsSlice';

const { width } = Dimensions.get('window');

const StatusTab = ({ label, count, active, onPress }: any) => (
  <TouchableOpacity onPress={onPress} style={[styles.tabBtn, active ? styles.tabBtnActive : null]}>
    <Text style={[styles.tabLabel, active ? styles.tabLabelActive : null]}>{label}</Text>
    <View style={[styles.tabBadge, active ? styles.tabBadgeActive : null]}>
      <Text style={[styles.tabBadgeText, active ? styles.tabBadgeActiveText : null]}>{count}</Text>
    </View>
  </TouchableOpacity>
);

const BookingCard = ({ item, onStart, onComplete, onPress }: any) => {
  const isPending = !['completed', 'cancelled', 'in_progress'].includes(item.status);
  const isOngoing = item.status === 'in_progress';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
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
    </TouchableOpacity>
  );
};

const BookingsScreen = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state: any) => state.bookings);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'ongoing' | 'completed' | 'cancelled'>('upcoming');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const loadBookings = () => {
    dispatch(fetchBookings({}) as any);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const { bookingService } = require('../../services/booking.service');
      await bookingService.updateStatus(id, newStatus);
      loadBookings();
    } catch (e) {
      console.error('Error updating booking status:', e);
    }
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

  // If a booking is selected, render the details screen layout
  if (selectedBookingId) {
    const b = items?.find((item: any) => item._id === selectedBookingId) || items?.[0] || {
      _id: selectedBookingId,
      bookingId: 'GMF12580',
      status: 'Confirmed',
      slotDate: new Date('2025-05-26T10:00:00Z'),
      slotTime: '10:00 AM',
      customerName: 'Rahul Sharma',
      vehicleNumber: 'UP 16 AB 1234',
      serviceName: 'Premium Steam Wash',
      totalAmount: 1250,
      paymentStatus: 'paid'
    };

    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedBookingId(null)} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back to Bookings</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Details</Text>
          <Text style={styles.headerSub}>ID: {b.bookingId || `GMF-${String(b._id).slice(-5).toUpperCase()}`}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.detailsScroll}>
          {/* Status info */}
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={[styles.detailVal, { color: '#0D5BD7', fontWeight: '800' }]}>{(b.status || 'Upcoming').toUpperCase()}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailVal}>{b.slotDate ? new Date(b.slotDate).toLocaleDateString() : '26 May 2025'} • {b.slotTime || '10:00 AM'}</Text>
            </View>
          </View>

          {/* Customer Details */}
          <View style={styles.card}>
            <Text style={styles.cardSecTitle}>👤 1. Customer Details</Text>
            <Text style={styles.infoText}>{b.customerName || 'Rahul Sharma'}</Text>
            <Text style={styles.infoSubText}>📞 +91 98765 43210</Text>
            <Text style={styles.infoSubText}>📍 Sector 62, Noida, UP - 201301</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Title block */}
      <View style={styles.titleHeader}>
        <Text style={styles.mainTitle}>Bookings</Text>
        <Text style={styles.mainSub}>Manage and track franchise jobs</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <StatusTab label="Upcoming" count={String((items || []).filter((b: any) => !['completed', 'cancelled', 'in_progress'].includes(b.status)).length)} active={activeTab === 'upcoming'} onPress={() => setActiveTab('upcoming')} />
        <StatusTab label="Ongoing" count={String((items || []).filter((b: any) => b.status === 'in_progress').length)} active={activeTab === 'ongoing'} onPress={() => setActiveTab('ongoing')} />
        <StatusTab label="Completed" count={String((items || []).filter((b: any) => b.status === 'completed').length)} active={activeTab === 'completed'} onPress={() => setActiveTab('completed')} />
      </View>

      {/* List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <BookingCard 
            item={item} 
            onPress={() => setSelectedBookingId(item._id)}
            onStart={() => handleUpdateStatus(item._id, 'in_progress')} 
            onComplete={() => handleUpdateStatus(item._id, 'completed')} 
          />
        )}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D5BD7" />}
        ListEmptyComponent={
          <View style={styles.emptyView}>
            <Text style={styles.emptyText}>No bookings found in this category.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  titleHeader: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  mainTitle: { fontSize: 24, fontWeight: '900', color: '#0F172A' },
  mainSub: { fontSize: 12, color: '#64748B', fontWeight: '600', marginTop: 2 },
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  tabBtnActive: { backgroundColor: '#E0F2FE', borderColor: '#BAE6FD' },
  tabLabel: { fontSize: 11, color: '#64748B', fontWeight: '700' },
  tabLabelActive: { color: '#0D5BD7' },
  tabBadge: { paddingHorizontal: 6, paddingVertical: 2, backgroundColor: '#F1F5F9', borderRadius: 6 },
  tabBadgeActive: { backgroundColor: '#0D5BD7' },
  tabBadgeText: { fontSize: 8.5, color: '#64748B', fontWeight: '800' },
  tabBadgeActiveText: { color: '#fff' },
  listContainer: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 10, marginBottom: 12 },
  cardIdLabel: { fontSize: 8.5, fontWeight: '700', color: '#94A3B8' },
  cardId: { fontSize: 13, fontWeight: '900', color: '#0F172A' },
  badgeRow: { flexDirection: 'row', gap: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusUpcoming: { backgroundColor: '#EFF6FF' },
  statusOngoing: { backgroundColor: '#EEF2F6' },
  statusCompleted: { backgroundColor: '#ECFDF5' },
  statusCancelled: { backgroundColor: '#FEF2F2' },
  statusText: { fontSize: 8.5, fontWeight: '800' },
  textUpcoming: { color: '#3B82F6' },
  textOngoing: { color: '#475569' },
  textCompleted: { color: '#10B981' },
  textCancelled: { color: '#EF4444' },
  payBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  payPaid: { backgroundColor: '#ECFDF5' },
  payPending: { backgroundColor: '#FEF3C7' },
  payText: { fontSize: 8.5, fontWeight: '800' },
  textPending: { color: '#D97706' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  icon: { fontSize: 16 },
  infoText: { fontSize: 12, fontWeight: '800', color: '#0F172A' },
  infoSubText: { fontSize: 10, color: '#64748B', fontWeight: '600' },
  serviceBox: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 12, marginTop: 6, borderWidth: 1, borderColor: '#F1F5F9' },
  serviceLabel: { fontSize: 8.5, fontWeight: '700', color: '#94A3B8' },
  serviceName: { fontSize: 11.5, fontWeight: '800', color: '#0F172A', marginTop: 2 },
  priceBox: { alignItems: 'flex-end' },
  price: { fontSize: 11.5, fontWeight: '900', color: '#0D5BD7', marginTop: 2 },
  actions: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12, marginTop: 12 },
  startBtn: { backgroundColor: '#0D5BD7', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  completeBtn: { backgroundColor: '#10B981', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 11.5, fontWeight: '800' },
  emptyView: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  header: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backBtn: { marginBottom: 10 },
  backBtnText: { fontSize: 12, color: '#0D5BD7', fontWeight: '800' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  headerSub: { fontSize: 11, color: '#64748B', fontWeight: '600', marginTop: 2 },
  detailsScroll: { padding: 16, paddingBottom: 40 },
  detailsSection: { backgroundColor: '#fff', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  detailLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  detailVal: { fontSize: 12, color: '#0F172A', fontWeight: '800' },
  cardSecTitle: { fontSize: 11, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 10 },
});

export default BookingsScreen;
