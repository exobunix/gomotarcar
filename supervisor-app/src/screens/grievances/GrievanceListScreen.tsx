import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import Header from '../../components/common/Header';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { fetchComplaints } from '../../redux/slices/complaintSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { formatDate } from '../../utils/helpers';

interface Props { navigation: any }

const statusFilters = ['all', 'open', 'in_progress', 'resolved', 'closed'];

const GrievanceListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { complaints, loading } = useSelector((s: RootState) => s.complaints);
  const [filter, setFilter] = useState('all');

  const load = useCallback(() => { dispatch(fetchComplaints()); }, [dispatch]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { const unsub = navigation.addListener('focus', load); return unsub; }, [navigation, load]);

  const filtered = filter === 'all' ? complaints : complaints.filter((c) => c.status === filter);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => navigation.navigate('GrievanceDetail', { grievanceId: item._id })}>
      <Card variant="outlined" padding={14} style={styles.itemCard}>
        <View style={styles.topRow}>
          <Text style={styles.ticket}>{item.ticketNumber}</Text>
          <StatusBadge status={item.status} />
        </View>
        <Text style={styles.subject} numberOfLines={1}>{item.subject}</Text>
        <View style={styles.bottomRow}>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.date}>{formatDate(item.createdAt, 'short')}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Grievances" onBack={() => navigation.goBack()} />
      <FlatList
        data={filtered} keyExtractor={(item) => item._id} contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primaryBlue} />}
        ListHeaderComponent={
          <View style={styles.chipRow}>
            {statusFilters.map((f) => (
              <TouchableOpacity key={f} style={[styles.chip, filter === f && styles.chipActive]} onPress={() => setFilter(f)}>
                <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        }
        ListEmptyComponent={<EmptyState icon="⚠️" title="No Grievances" description="All complaints have been resolved" />}
        renderItem={renderItem} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: 20, paddingBottom: 40 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.lightBlue, borderColor: colors.primaryBlue },
  chipText: { fontSize: 12, color: colors.textSecondary, fontFamily: 'Inter-Medium' },
  chipTextActive: { color: colors.primaryBlue, fontWeight: '600' },
  itemCard: { marginBottom: 8 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  ticket: { fontSize: 13, fontWeight: '700', color: colors.primaryBlue, fontFamily: 'monospace' },
  subject: { fontSize: 14, fontWeight: '500', color: colors.textPrimary, fontFamily: 'Inter-Medium' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  category: { fontSize: 12, color: colors.textSecondary, fontFamily: 'Inter-Regular', textTransform: 'capitalize' },
  date: { fontSize: 12, color: colors.textLight, fontFamily: 'Inter-Regular' },
});

export default GrievanceListScreen;
