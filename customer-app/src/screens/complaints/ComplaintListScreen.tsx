import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { fetchComplaints } from '../../redux/slices/complaintSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { formatDate } from '../../utils/helpers';

interface Props {
  navigation: any;
}

const ComplaintListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { complaints, loading } = useSelector((s: RootState) => s.complaints);
  const [filter, setFilter] = useState('all');

  const load = useCallback(() => { dispatch(fetchComplaints()); }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const unsub = navigation.addListener('focus', load); return unsub; }, [navigation, load]);

  const filtered = filter === 'all' ? complaints : complaints.filter((c) => c.status === filter);

  const priorityColor: Record<string, string> = {
    low: colors.textSecondary,
    medium: colors.warning,
    high: colors.error,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complaints</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('CreateComplaint')}>
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {['all', 'open', 'resolved', 'closed'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
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
          filter === 'all' ? (
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <EmptyState icon="📝" title="No Complaints" description="You haven't raised any complaints yet" />
              <Button title="Raise a Complaint" onPress={() => navigation.navigate('CreateComplaint')} style={{ marginTop: 8 }} />
            </View>
          ) : (
            <EmptyState icon="✅" title={`No ${filter} complaints`} description="" />
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('ComplaintDetail', { complaintId: item._id })}>
            <Card variant="elevated" padding={16} style={styles.complaintCard}>
              <View style={styles.compHeader}>
                <View style={styles.compTop}>
                  <Text style={styles.compTicket}>#{item.ticketNumber}</Text>
                  <StatusBadge status={item.status} />
                </View>
                <View style={styles.compPriority}>
                  <View style={[styles.priorityDot, { backgroundColor: priorityColor[item.priority] }]} />
                  <Text style={[styles.priorityText, { color: priorityColor[item.priority] }]}>
                    {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                  </Text>
                </View>
              </View>
              <Text style={styles.compSubject} numberOfLines={1}>{item.subject}</Text>
              <View style={styles.compFooter}>
                <Text style={styles.compCat}>{item.category}</Text>
                <Text style={styles.compDate}>{formatDate(item.createdAt, 'short')}</Text>
              </View>
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: colors.white,
  },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 22, color: colors.primaryBlue, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  addBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primaryBlue, alignItems: 'center', justifyContent: 'center' },
  addIcon: { fontSize: 24, color: colors.white, fontWeight: '300' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 12, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.primaryBlue, borderColor: colors.primaryBlue },
  filterText: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Inter-Medium' },
  filterTextActive: { color: colors.white, fontWeight: '600' },
  listContent: { padding: 20, paddingBottom: 40 },
  complaintCard: { marginBottom: 10 },
  compHeader: { marginBottom: 8 },
  compTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  compTicket: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  compPriority: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  priorityDot: { width: 6, height: 6, borderRadius: 3 },
  priorityText: { fontSize: 11, fontWeight: '600', fontFamily: 'Inter-SemiBold' },
  compSubject: { fontSize: 14, color: colors.textPrimary, fontFamily: 'Inter-Medium', marginBottom: 8 },
  compFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  compCat: { fontSize: 12, color: colors.textSecondary, fontFamily: 'Inter-Regular', textTransform: 'capitalize' },
  compDate: { fontSize: 12, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
});

export default ComplaintListScreen;
