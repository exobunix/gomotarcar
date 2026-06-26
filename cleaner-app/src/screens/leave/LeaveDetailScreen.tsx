import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import { leaveService } from '../../services/leave.service';
import { LeaveRequest } from '../../types/navigation';
import { formatDate } from '../../utils/helpers';

interface Props { navigation: any; route: any }

const LeaveDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { leaveId } = route.params;
  const [item, setItem] = React.useState<LeaveRequest | null>(null);

  useEffect(() => { leaveService.getById(leaveId).then((r) => setItem(r.data)); }, [leaveId]);

  if (!item) return null;

  const statusColor: Record<string, string> = { pending: colors.warning, approved: colors.success, rejected: colors.error };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leave Detail</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card variant="elevated" padding={20} style={styles.statusCard}>
          <Text style={styles.statusEmoji}>
            {item.status === 'approved' ? '✅' : item.status === 'rejected' ? '❌' : '⏳'}
          </Text>
          <Text style={[styles.statusTitle, { color: statusColor[item.status] || colors.textPrimary }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
          <Text style={styles.statusType}>{item.type} Leave</Text>
        </Card>

        <View style={styles.detailGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>From</Text>
            <Text style={styles.detailValue}>{formatDate(item.fromDate, 'long')}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>To</Text>
            <Text style={styles.detailValue}>{formatDate(item.toDate, 'long')}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>{Math.ceil((new Date(item.toDate).getTime() - new Date(item.fromDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} day(s)</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Applied</Text>
            <Text style={styles.detailValue}>{formatDate(item.appliedAt, 'time')}</Text>
          </View>
        </View>

        <Card variant="outlined" padding={16} style={styles.reasonCard}>
          <Text style={styles.reasonLabel}>Reason</Text>
          <Text style={styles.reasonText}>{item.reason}</Text>
        </Card>

        {item.reviewNotes && (
          <Card variant="outlined" padding={16} style={styles.reasonCard}>
            <Text style={styles.reasonLabel}>Review Notes</Text>
            <Text style={styles.reasonText}>{item.reviewNotes}</Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: colors.white },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 22, color: colors.primaryBlue, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  statusCard: { alignItems: 'center', marginBottom: 20 },
  statusEmoji: { fontSize: 48, marginBottom: 12 },
  statusTitle: { fontSize: 20, fontWeight: '700', fontFamily: 'Inter-Bold' },
  statusType: { fontSize: 14, color: colors.textSecondary, marginTop: 4, fontFamily: 'Inter-Regular', textTransform: 'capitalize' },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  detailItem: { width: '50%', marginBottom: 12 },
  detailLabel: { fontSize: 12, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  detailValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold', marginTop: 2 },
  reasonCard: { marginBottom: 12 },
  reasonLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold', marginBottom: 8 },
  reasonText: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, fontFamily: 'Inter-Regular' },
});

export default LeaveDetailScreen;
