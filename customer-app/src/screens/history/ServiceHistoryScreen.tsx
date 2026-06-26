import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import AmountDisplay from '../../components/common/AmountDisplay';
import EmptyState from '../../components/common/EmptyState';
import { fetchBookingHistory } from '../../redux/slices/bookingSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { formatDate } from '../../utils/helpers';

interface Props {
  navigation: any;
}

const ServiceHistoryScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { history, loading } = useSelector((s: RootState) => s.booking);

  const load = useCallback(() => { dispatch(fetchBookingHistory()); }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const unsub = navigation.addListener('focus', load); return unsub; }, [navigation, load]);

  const completed = history.filter((b) => b.status === 'completed');

  const getVehicleNumber = (v: any) => {
    if (!v) return '';
    return typeof v === 'object' ? v.vehicleNumber : v;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service History</Text>
        <Text style={styles.count}>{completed.length}</Text>
      </View>

      <FlatList
        data={completed}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primaryBlue} />}
        ListEmptyComponent={
          <EmptyState icon="🧹" title="No Service History" description="Your completed services will appear here" />
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('BookingsTab', { screen: 'BookingDetail', params: { bookingId: item._id } })}>
            <Card variant="elevated" padding={14} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <View style={styles.historyLeft}>
                  <Text style={styles.historyService}>{item.packageName || item.serviceType}</Text>
                  <Text style={styles.historyVehicle}>{getVehicleNumber(item.vehicleId)}</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>
              <View style={styles.historyFooter}>
                <Text style={styles.historyDate}>{formatDate(item.scheduledDate, 'long')}</Text>
                <AmountDisplay amount={item.amount} size="sm" color={colors.textPrimary} />
              </View>
              {item.cleanerName && (
                <View style={styles.cleanerRow}>
                  <Text style={styles.cleanerIcon}>👤</Text>
                  <Text style={styles.cleanerName}>{item.cleanerName}</Text>
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: colors.white,
  },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 22, color: colors.primaryBlue, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  count: { fontSize: 14, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  listContent: { padding: 20, paddingBottom: 40 },
  historyCard: { marginBottom: 10 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  historyLeft: { flex: 1 },
  historyService: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  historyVehicle: { fontSize: 13, color: colors.textSecondary, marginTop: 2, fontFamily: 'Inter-Regular' },
  historyFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  historyDate: { fontSize: 12, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  cleanerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: colors.border },
  cleanerIcon: { fontSize: 14, marginRight: 6 },
  cleanerName: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
});

export default ServiceHistoryScreen;
