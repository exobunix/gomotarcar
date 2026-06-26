import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Platform, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { fetchLeaves, fetchLeaveBalance } from '../../redux/slices/leaveSlice';
import { AppDispatch, RootState } from '../../redux/store';

interface Props { navigation: any }

const LeaveManagementScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { leaves, loading } = useSelector((s: RootState) => s.leave);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const load = useCallback(() => {
    dispatch(fetchLeaves());
    dispatch(fetchLeaveBalance());
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const unsub = navigation.addListener('focus', load); return unsub; }, [navigation, load]);

  const sampleLeaves = [
    {
      _id: 'sample-1',
      type: 'vacation',
      fromDate: '2025-05-20',
      toDate: '2025-05-21',
      reason: 'Personal work at home.',
      status: 'pending',
      appliedAt: '2025-05-15',
    },
    {
      _id: 'sample-2',
      type: 'personal',
      fromDate: '2025-05-10',
      toDate: '2025-05-10',
      reason: 'Family function.',
      status: 'approved',
      appliedAt: '2025-05-08',
      reviewedBy: 'Rahul Sharma',
    },
    {
      _id: 'sample-3',
      type: 'sick',
      fromDate: '2025-05-02',
      toDate: '2025-05-04',
      reason: 'Fever and rest.',
      status: 'approved',
      appliedAt: '2025-05-01',
      reviewedBy: 'Rahul Sharma',
    },
  ];

  // Merge dummy data with API data if empty, else just use API data.
  const displayLeaves = leaves.length > 0 ? leaves : (sampleLeaves as any[]);

  const filteredLeaves = displayLeaves.filter(
    (item) => activeTab === 'all' || item.status === activeTab
  );

  const stats = {
    pending: displayLeaves.filter(l => l.status === 'pending').length,
    approved: displayLeaves.filter(l => l.status === 'approved').length,
    rejected: displayLeaves.filter(l => l.status === 'rejected').length,
    total: displayLeaves.length,
  };

  const formatDate = (d: string) => {
    if (!d) return '';
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return d;
    }
  };

  const renderLeaveItem = ({ item }: { item: any }) => {
    const fromStr = formatDate(item.fromDate);
    const toStr = formatDate(item.toDate);
    const appliedOn = formatDate(item.appliedAt);

    return (
      <Card variant="outlined" padding={16} style={styles.leaveCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.dateRangeText}>{fromStr} - {toStr}</Text>
          <View style={[styles.statusBadge, 
            item.status === 'approved' ? styles.statusApproved : 
            item.status === 'pending' ? styles.statusPending : styles.statusRejected
          ]}>
            <Text style={[styles.statusText,
              item.status === 'approved' ? styles.statusApprovedText : 
              item.status === 'pending' ? styles.statusPendingText : styles.statusRejectedText
            ]}>
              ● {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : ''}
            </Text>
          </View>
        </View>

        <Text style={styles.leaveTypeLabel}>{item.type ? item.type.toUpperCase() : 'Leave'}</Text>
        <Text style={styles.reasonText}>{item.reason}</Text>

        <View style={styles.cardFooter}>
          <Text style={styles.appliedOnText}>Applied on {appliedOn}</Text>
          {item.status === 'approved' && item.reviewedBy && (
            <Text style={styles.approverText}>Approved by {item.reviewedBy}</Text>
          )}
          {item.status === 'rejected' && item.reviewedBy && (
            <Text style={styles.approverText}>Rejected by {item.reviewedBy}</Text>
          )}
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Leave Status</Text>
          <Text style={styles.headerSub}>Track your leave requests</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('ApplyLeave')}>
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredLeaves}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primaryBlue} />}
        ListHeaderComponent={
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              {/* Pending */}
              <View style={[styles.summaryCard, { backgroundColor: '#FFF7ED' }]}>
                <Text style={styles.summaryVal}>{stats.pending}</Text>
                <Text style={styles.summaryLabel}>Pending</Text>
                <Text style={styles.summaryType}>Requests</Text>
              </View>
              {/* Approved */}
              <View style={[styles.summaryCard, { backgroundColor: '#F0FDF4' }]}>
                <Text style={[styles.summaryVal, { color: colors.success }]}>{stats.approved}</Text>
                <Text style={styles.summaryLabel}>Approved</Text>
                <Text style={styles.summaryType}>Requests</Text>
              </View>
              {/* Rejected */}
              <View style={[styles.summaryCard, { backgroundColor: '#FEF2F2' }]}>
                <Text style={[styles.summaryVal, { color: colors.error }]}>{stats.rejected}</Text>
                <Text style={styles.summaryLabel}>Rejected</Text>
                <Text style={styles.summaryType}>Requests</Text>
              </View>
              {/* Total */}
              <View style={[styles.summaryCard, { backgroundColor: '#EAF3FF' }]}>
                <Text style={[styles.summaryVal, { color: colors.primaryBlue }]}>{stats.total}</Text>
                <Text style={styles.summaryLabel}>Total Requests</Text>
                <Text style={styles.summaryType}>This Year</Text>
              </View>
            </View>
            <Text style={styles.listTitle}>Leave Requests ({filteredLeaves.length})</Text>
          </View>
        }
        renderItem={renderLeaveItem}
        ListFooterComponent={
          <View style={styles.policyAlert}>
            <View style={styles.alertIconBg}>
              <Text style={{ fontSize: 16 }}>ℹ️</Text>
            </View>
            <Text style={styles.policyAlertText}>
              Approved leaves will be adjusted in your leave balance. For any queries, contact your supervisor.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'ios' ? 60 : 20, 
    paddingBottom: 16, 
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 22, color: colors.primaryBlue, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  headerSub: { fontSize: 11, color: colors.textSecondary, fontFamily: 'Inter-Regular', marginTop: 2 },
  addBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primaryBlue, alignItems: 'center', justifyContent: 'center' },
  addIcon: { fontSize: 24, color: colors.white, fontWeight: '300' },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.white,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabButtonActive: {
    backgroundColor: colors.primaryBlue,
  },
  tabText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'Inter-Medium',
  },
  tabTextActive: {
    color: colors.white,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  listContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  summaryContainer: { marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  summaryCard: {
    width: (width - 40 - 24) / 4,
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
  },
  summaryVal: { fontSize: 20, fontWeight: '700', color: colors.warning, fontFamily: 'Inter-Bold' },
  summaryLabel: { fontSize: 9, color: colors.textSecondary, marginTop: 4, fontFamily: 'Inter-Medium', textAlign: 'center' },
  summaryType: { fontSize: 8, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  listTitle: { fontSize: 14, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  leaveCard: { marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateRangeText: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusApproved: { backgroundColor: '#DCFCE7' },
  statusPending: { backgroundColor: '#FEF3C7' },
  statusRejected: { backgroundColor: '#FEE2E2' },
  statusApprovedText: { color: colors.success, fontSize: 10, fontWeight: '600', fontFamily: 'Inter-SemiBold' },
  statusPendingText: { color: colors.warning, fontSize: 10, fontWeight: '600', fontFamily: 'Inter-SemiBold' },
  statusRejectedText: { color: colors.error, fontSize: 10, fontWeight: '600', fontFamily: 'Inter-SemiBold' },
  leaveTypeLabel: { fontSize: 12, fontWeight: '600', color: colors.primaryBlue, fontFamily: 'Inter-SemiBold', marginTop: 6 },
  reasonText: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Inter-Regular', marginTop: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  appliedOnText: { fontSize: 10, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  approverText: { fontSize: 10, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  policyAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  alertIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  policyAlertText: { flex: 1, fontSize: 11, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
});

export default LeaveManagementScreen;
