import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSupportTickets } from '../../redux/slices/supportSlice';
import { colors } from '../../theme/colors';

const PriorityBadge = ({ priority }: { priority: string }) => {
  const colors_map: any = { low: '#22C55E', medium: '#F59E0B', high: '#EF4444', critical: '#DC2626' };
  return (
    <View style={[styles.badge, { backgroundColor: (colors_map[priority] || '#999') + '20' }]}>
      <Text style={[styles.badgeText, { color: colors_map[priority] || '#999' }]}>{priority.toUpperCase()}</Text>
    </View>
  );
};

const SupportScreen = () => {
  const dispatch = useDispatch();
  const { tickets, loading } = useSelector((state: any) => state.support);

  useEffect(() => { dispatch(fetchSupportTickets() as any); }, []);

  const renderTicket = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.ticketTitle}>{item.title || item.ticketNumber || 'Support Ticket'}</Text>
        <PriorityBadge priority={item.priority || 'medium'} />
      </View>
      <Text style={styles.ticketDesc} numberOfLines={2}>{item.description || 'No description'}</Text>
      <Text style={styles.ticketMeta}>Status: {item.status} | {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Support Center</Text></View>
      <FlatList data={tickets} keyExtractor={(_, idx) => String(idx)} renderItem={renderTicket} contentContainerStyle={styles.list} ListEmptyComponent={<Text style={styles.empty}>No open tickets</Text>} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 20, paddingTop: 60, backgroundColor: colors.primaryBlue },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', fontFamily: 'Inter-Bold' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ticketTitle: { fontSize: 16, fontWeight: '600', color: '#111827', fontFamily: 'Inter-SemiBold', flex: 1 },
  ticketDesc: { fontSize: 14, color: '#6B7280', marginBottom: 8, fontFamily: 'Inter-Regular' },
  ticketMeta: { fontSize: 12, color: '#999', fontFamily: 'Inter-Regular' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '600', fontFamily: 'Inter-SemiBold' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 16 },
});

export default SupportScreen;
