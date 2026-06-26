import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import Header from '../../components/common/Header';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { fetchQRs } from '../../redux/slices/qrSlice';
import { AppDispatch, RootState } from '../../redux/store';

interface Props { navigation: any }

const QRListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { qrs, loading } = useSelector((s: RootState) => s.qr);

  const load = useCallback(() => { dispatch(fetchQRs()); }, [dispatch]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { const unsub = navigation.addListener('focus', load); return unsub; }, [navigation, load]);

  const renderItem = ({ item }: { item: any }) => (
    <Card variant="outlined" padding={14} style={styles.itemCard}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.codeText}>{item.code}</Text>
            <StatusBadge status={item.status} />
          </View>
          <Text style={styles.aptText}>{item.apartmentId?.name || 'Unassigned'}</Text>
        </View>
        <View style={styles.actionBtns}>
          {item.status === 'pending_activation' && (
            <Button title="Assign" size="sm" onPress={() => navigation.navigate('QRAssignment', { qrId: item._id })} />
          )}
          {item.status === 'active' && (
            <Button title="Replace" variant="outline" size="sm" onPress={() => navigation.navigate('QRReassignment', { qrId: item._id, apartmentId: item.apartmentId?._id })} />
          )}
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Header title="QR Codes" onBack={() => navigation.goBack()} />
      <FlatList data={qrs} keyExtractor={(item) => item._id} contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primaryBlue} />}
        ListEmptyComponent={<EmptyState icon="📱" title="No QR Codes" description="Generate QR codes for apartments" />}
        renderItem={renderItem} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: 20, paddingBottom: 40 },
  itemCard: { marginBottom: 8 },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  codeText: { fontSize: 15, fontWeight: '700', color: colors.primaryBlue, fontFamily: 'Inter-Bold', fontFamily: 'monospace' },
  aptText: { fontSize: 12, color: colors.textSecondary, marginTop: 2, fontFamily: 'Inter-Regular' },
  actionBtns: { gap: 6 },
});

export default QRListScreen;
