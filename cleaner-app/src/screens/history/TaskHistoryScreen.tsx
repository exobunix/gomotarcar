import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import { fetchTodayTasks } from '../../redux/slices/taskSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { formatDate, statusColorMap, statusLabel } from '../../utils/helpers';

interface Props { navigation: any }

const periods = ['All', 'Today', 'Week', 'Month'];

const TaskHistoryScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, loading } = useSelector((s: RootState) => s.tasks);
  const [period, setPeriod] = useState('All');
  const [search, setSearch] = useState('');

  const load = useCallback(() => { dispatch(fetchTodayTasks()); }, [dispatch]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { const unsub = navigation.addListener('focus', load); return unsub; }, [navigation, load]);

  const filtered = (tasks || []).filter((t: any) => {
    const matchPeriod = period === 'All' || true;
    const matchSearch = !search.trim() || (t.vehicle?.name || '').toLowerCase().includes(search.toLowerCase()) || (t.customer?.name || '').toLowerCase().includes(search.toLowerCase());
    return matchPeriod && matchSearch;
  });

  const stats = {
    total: filtered.length,
    completed: filtered.filter((t: any) => t.status === 'completed').length,
    cancelled: filtered.filter((t: any) => t.status === 'cancelled').length,
    earnings: filtered.reduce((s: number, t: any) => s + (t.amount || 0), 0),
  };

  const renderTask = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => navigation.navigate('TaskDetail', { taskId: item._id })}>
      <Card variant="outlined" padding={14} style={styles.taskCard}>
        <View style={styles.taskTop}>
          <Text style={styles.taskVehicle}>{item.vehicle?.name || item.vehicle || 'Vehicle'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: (statusColorMap[item.status] || colors.textSecondary) + '20' }]}>
            <Text style={[styles.statusText, { color: statusColorMap[item.status] || colors.textSecondary }]}>
              {statusLabel[item.status] || item.status}
            </Text>
          </View>
        </View>
        <Text style={styles.taskCustomer}>{item.customer?.name || item.customer || 'Customer'}</Text>
        <View style={styles.taskFooter}>
          <Text style={styles.taskDate}>{item.date ? formatDate(item.date, 'short') : ''}</Text>
          {item.amount ? <Text style={styles.taskAmount}>₹{item.amount}</Text> : null}
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task History</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by vehicle or customer..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primaryBlue} />}
        ListHeaderComponent={
          <View>
            {/* Stats row */}
            <Card variant="elevated" padding={16} style={styles.statsCard}>
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{stats.total}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statDiv} />
                <View style={styles.stat}>
                  <Text style={[styles.statValue, { color: colors.success }]}>{stats.completed}</Text>
                  <Text style={styles.statLabel}>Done</Text>
                </View>
                <View style={styles.statDiv} />
                <View style={styles.stat}>
                  <Text style={[styles.statValue, { color: colors.error }]}>{stats.cancelled}</Text>
                  <Text style={styles.statLabel}>Cancelled</Text>
                </View>
                <View style={styles.statDiv} />
                <View style={styles.stat}>
                  <Text style={[styles.statValue, { color: colors.primaryBlue }]}>₹{stats.earnings}</Text>
                  <Text style={styles.statLabel}>Earned</Text>
                </View>
              </View>
            </Card>

            {/* Period chips */}
            <View style={styles.chipRow}>
              {periods.map((p) => (
                <TouchableOpacity key={p} style={[styles.chip, period === p && styles.chipActive]} onPress={() => setPeriod(p)}>
                  <Text style={[styles.chipText, period === p && styles.chipTextActive]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={<EmptyState icon="📋" title="No Tasks Found" description="Your completed tasks will appear here" />}
        renderItem={renderTask}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: colors.white },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 22, color: colors.primaryBlue, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', margin: 20, marginBottom: 0, backgroundColor: colors.white, borderRadius: 14, paddingHorizontal: 16, height: 48, borderWidth: 1, borderColor: colors.border },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 14, color: colors.textPrimary, fontFamily: 'Inter-Regular', padding: 0 },
  listContent: { padding: 20, paddingBottom: 40 },
  statsCard: { marginBottom: 16 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2, fontFamily: 'Inter-Regular' },
  statDiv: { width: 1, height: 36, backgroundColor: colors.border },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.lightBlue, borderColor: colors.primaryBlue },
  chipText: { fontSize: 12, color: colors.textSecondary, fontFamily: 'Inter-Medium' },
  chipTextActive: { color: colors.primaryBlue, fontWeight: '600' },
  taskCard: { marginBottom: 8 },
  taskTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  taskVehicle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '600', fontFamily: 'Inter-SemiBold' },
  taskCustomer: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  taskFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  taskDate: { fontSize: 12, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  taskAmount: { fontSize: 14, fontWeight: '700', color: colors.success, fontFamily: 'Inter-Bold' },
});

export default TaskHistoryScreen;
