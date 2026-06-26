import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { fetchQRCodes, activateQR, reportDamagedQR, replaceQR } from '../../redux/slices/qrSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { formatDate } from '../../utils/helpers';

interface Props {
  navigation: any;
}

const QRListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { qrCodes, loading } = useSelector((s: RootState) => s.qr);

  const load = useCallback(() => { dispatch(fetchQRCodes()); }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const unsub = navigation.addListener('focus', load); return unsub; }, [navigation, load]);

  const getVehicleNumber = (v: any) => {
    if (!v) return '';
    return typeof v === 'object' ? v.vehicleNumber || `${v.make} ${v.model}` : v;
  };

  const handleAction = (item: any, action: string) => {
    if (action === 'activate') {
      Alert.alert('Activate QR', 'Activate this QR sticker for scanning?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Activate', onPress: () => dispatch(activateQR(item._id)) },
      ]);
    } else if (action === 'damaged') {
      Alert.alert('Report Damaged', 'Report this QR sticker as damaged?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Report', style: 'destructive', onPress: () => dispatch(reportDamagedQR(item._id)) },
      ]);
    } else if (action === 'replace') {
      Alert.alert('Request Replacement', 'Request a replacement QR sticker?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Request', onPress: () => dispatch(replaceQR(item._id)) },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>QR Codes</Text>
        <Text style={styles.count}>{qrCodes.length}</Text>
      </View>

      <FlatList
        data={qrCodes}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primaryBlue} />}
        ListEmptyComponent={
          <EmptyState icon="📱" title="No QR Codes" description="Generate QR codes for your vehicles to enable quick scanning" />
        }
        renderItem={({ item }) => (
          <Card variant="elevated" padding={16} style={styles.qrCard}>
            <View style={styles.qrHeader}>
              <View style={styles.qrIconContainer}>
                <Text style={styles.qrIcon}>📱</Text>
              </View>
              <View style={styles.qrInfo}>
                <Text style={styles.qrCode}>{item.code}</Text>
                <Text style={styles.qrVehicle}>{getVehicleNumber(item.vehicleId)}</Text>
              </View>
              <StatusBadge status={item.status} />
            </View>
            <View style={styles.qrDate}>
              <Text style={styles.qrDateText}>Generated: {formatDate(item.generatedAt, 'short')}</Text>
            </View>
            <View style={styles.qrActions}>
              {item.status === 'inactive' && (
                <TouchableOpacity style={styles.qrActionBtn} onPress={() => handleAction(item, 'activate')}>
                  <Text style={styles.qrActionText}>Activate</Text>
                </TouchableOpacity>
              )}
              {item.status === 'active' && (
                <TouchableOpacity style={[styles.qrActionBtn, styles.warnBtn]} onPress={() => handleAction(item, 'damaged')}>
                  <Text style={[styles.qrActionText, styles.warnText]}>Report Damaged</Text>
                </TouchableOpacity>
              )}
              {item.status !== 'replaced' && (
                <TouchableOpacity style={styles.qrActionBtn} onPress={() => handleAction(item, 'replace')}>
                  <Text style={styles.qrActionText}>Replace</Text>
                </TouchableOpacity>
              )}
            </View>
          </Card>
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
  qrCard: { marginBottom: 12 },
  qrHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  qrIconContainer: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.lightBlue, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  qrIcon: { fontSize: 20 },
  qrInfo: { flex: 1 },
  qrCode: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  qrVehicle: { fontSize: 13, color: colors.textSecondary, marginTop: 2, fontFamily: 'Inter-Regular' },
  qrDate: { marginBottom: 8 },
  qrDateText: { fontSize: 12, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  qrActions: { flexDirection: 'row', gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
  qrActionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.lightBlue },
  qrActionText: { fontSize: 13, fontWeight: '600', color: colors.primaryBlue, fontFamily: 'Inter-SemiBold' },
  warnBtn: { backgroundColor: colors.error + '10' },
  warnText: { color: colors.error },
});

export default QRListScreen;
