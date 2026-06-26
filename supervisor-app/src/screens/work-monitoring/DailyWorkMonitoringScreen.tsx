import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import Header from '../../components/common/Header';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { fetchTasks, fetchTaskStats } from '../../redux/slices/taskSlice';
import { AppDispatch, RootState } from '../../redux/store';

interface Props { navigation: any }

const DailyWorkMonitoringScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, loading, stats } = useSelector((s: RootState) => s.tasks);
  const today = new Date().toISOString().split('T')[0];

  const load = useCallback(() => {
    dispatch(fetchTaskStats());
    dispatch(fetchTasks({ date: today }));
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const unsub = navigation.addListener('focus', load); return unsub; }, [navigation, load]);

  return (
    <View style={styles.container}>
      <Header title="Daily Work" onBack={() => navigation.goBack()} />
      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primaryBlue} />}
        ListHeaderComponent={
          <View>
            <Card variant="elevated" padding={16} style={styles.statsCard}>
              <Text style={styles.statsTitle}>Today's Overview</Text>
              <View style={styles.statsRow}>
                <View style={styles.stat}><Text style={styles.statValue}>{stats?.todayTasks || 0}</Text><Text style={styles.statLabel}>Total</Text></View>
                <View style={styles.statDiv} />
                <View style={styles.stat}><Text style={[styles.statValue, { color: colors.success }]}>{tasks.filter((t: any) => t.status === 'completed').length}</Text><Text style={styles.statLabel}>Completed</Text></View>
                <View style={styles.statDiv} />
                <View style={styles.stat}><Text style={[styles.statValue, { color: colors.warning }]}>{tasks.filter((t: any) => t.status === 'in_progress').length}</Text><Text style={styles.statLabel}>In Progress</Text></View>
                <View style={styles.statDiv} />
                <View style={styles.stat}><Text style={[styles.statValue, { color: colors.error }]}>{tasks.filter((t: any) => t.status === 'pending').length}</Text><Text style={styles.statLabel}>Pending</Text></View>
              </View>
            </Card>
            <Text style={styles.sectionTitle}>Today's Tasks ({today})</Text>
          </View>
        }
        ListEmptyComponent={<EmptyState icon="📋" title="No Tasks Today" description="All tasks completed or none scheduled" />}
        renderItem={({ item }: { item: any }) => (
          <TouchableOpacity onPress={() => navigation.navigate('WorkApprovalDetail', { taskId: item._id })}>
            <Card variant="outlined" padding={14} style={styles.taskCard}>
              <View style={styles.taskTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.taskVehicle}>{item.vehicleNumber}</Text>
                  <Text style={styles.taskInfo}>{item.apartmentName} • {item.packageName}</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>
              <View style={styles.taskBottom}>
                <Text style={styles.taskTime}>{item.scheduledTime}</Text>
                <Text style={styles.taskCleaner}>{item.cleanerId?.name || 'Unassigned'}</Text>
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
  listContent: { padding: 20, paddingBottom: 40 },
  statsCard: { marginBottom: 16 },
  statsTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, textAlign: 'center', marginBottom: 12, fontFamily: 'Inter-SemiBold' },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2, fontFamily: 'Inter-Regular' },
  statDiv: { width: 1, height: 36, backgroundColor: colors.border },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold', marginBottom: 12 },
  taskCard: { marginBottom: 8 },
  taskTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  taskVehicle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  taskInfo: { fontSize: 12, color: colors.textSecondary, marginTop: 2, fontFamily: 'Inter-Regular' },
  taskBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  taskTime: { fontSize: 12, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  taskCleaner: { fontSize: 12, color: colors.primaryBlue, fontWeight: '500', fontFamily: 'Inter-Medium' },
});

export default DailyWorkMonitoringScreen;
