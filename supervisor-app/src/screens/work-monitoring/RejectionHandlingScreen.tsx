import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import Header from '../../components/common/Header';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { fetchTasks } from '../../redux/slices/taskSlice';
import { AppDispatch, RootState } from '../../redux/store';

interface Props { navigation: any }

const RejectionHandlingScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, loading } = useSelector((s: RootState) => s.tasks);

  const load = useCallback(() => { dispatch(fetchTasks()); }, [dispatch]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { const unsub = navigation.addListener('focus', load); return unsub; }, [navigation, load]);

  const rejectedTasks = tasks.filter((t) => t.status === 'rejected' || t.redoRequired);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => navigation.navigate('WorkApprovalDetail', { taskId: item._id })}>
      <Card variant="outlined" padding={14} style={styles.itemCard}>
        <View style={styles.topRow}>
          <Text style={styles.vehicle}>{item.vehicleNumber}</Text>
          <StatusBadge status={item.status === 'rejected' ? 'rejected' : 'pending'} />
        </View>
        <Text style={styles.info}>{item.packageName} • {item.apartmentName}</Text>
        {item.rejectionReason && <Text style={styles.reason}>Reason: {item.rejectionReason}</Text>}
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Rejections & Redo" onBack={() => navigation.goBack()} />
      <FlatList data={rejectedTasks} keyExtractor={(item) => item._id} contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={<EmptyState icon="✅" title="All Clear" description="No rejected tasks or redo requests" />}
        renderItem={renderItem} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: 20, paddingBottom: 40 },
  itemCard: { marginBottom: 8 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  vehicle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  info: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  reason: { fontSize: 12, color: colors.error, marginTop: 6, fontFamily: 'Inter-Regular' },
});

export default RejectionHandlingScreen;
