import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Platform, Dimensions, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../../components/common/Card';

const { width } = Dimensions.get('window');

interface Props { navigation: any }

const LeaveManagementScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [selectedMonth, setSelectedMonth] = useState('May 2025');
  const [search, setSearch] = useState('');

  // High-fidelity Mock data matching the table exactly
  const leaveRequests = [
    {
      name: 'Ramesh Kumar',
      code: 'CLN001',
      type: 'Casual Leave',
      typeBg: '#EFF6FF',
      typeColor: '#2563EB',
      dates: '20 May 2025\n22 May 2025\n(3 Days)',
      reason: 'Family function',
      status: 'Pending',
      statusColor: '#D97706',
      statusBg: '#FFF7ED',
      hasActions: true
    },
    {
      name: 'Suresh Yadav',
      code: 'CLN002',
      type: 'Sick Leave',
      typeBg: '#FEF2F2',
      typeColor: '#DC2626',
      dates: '18 May 2025\n18 May 2025\n(1 Day)',
      reason: 'Fever and cold',
      status: 'Pending',
      statusColor: '#D97706',
      statusBg: '#FFF7ED',
      hasActions: true
    },
    {
      name: 'Vikram Singh',
      code: 'CLN003',
      type: 'Casual Leave',
      typeBg: '#EFF6FF',
      typeColor: '#2563EB',
      dates: '15 May 2025\n17 May 2025\n(3 Days)',
      reason: 'Personal work',
      status: 'Approved',
      statusColor: '#16A34A',
      statusBg: '#ECFDF5',
      hasActions: false
    },
    {
      name: 'Amit Verma',
      code: 'CLN004',
      type: 'Earned Leave',
      typeBg: '#FAF5FF',
      typeColor: '#8B5CF6',
      dates: '10 May 2025\n14 May 2025\n(5 Days)',
      reason: 'Going out of station',
      status: 'Approved',
      statusColor: '#16A34A',
      statusBg: '#ECFDF5',
      hasActions: false
    },
    {
      name: 'Priya Singh',
      code: 'CLN006',
      type: 'Sick Leave',
      typeBg: '#FEF2F2',
      typeColor: '#DC2626',
      dates: '09 May 2025\n09 May 2025\n(1 Day)',
      reason: 'Migraine',
      status: 'Rejected',
      statusColor: '#DC2626',
      statusBg: '#FEF2F2',
      hasActions: false
    },
    {
      name: 'Deepak Sharma',
      code: 'CLN007',
      type: 'Casual Leave',
      typeBg: '#EFF6FF',
      typeColor: '#2563EB',
      dates: '05 May 2025\n06 May 2025\n(2 Days)',
      reason: 'Personal reason',
      status: 'Pending',
      statusColor: '#D97706',
      statusBg: '#FFF7ED',
      hasActions: true
    },
    {
      name: 'Neha Gupta',
      code: 'CLN008',
      type: 'Earned Leave',
      typeBg: '#FAF5FF',
      typeColor: '#8B5CF6',
      dates: '01 May 2025\n07 May 2025\n(7 Days)',
      reason: 'Vacation',
      status: 'Approved',
      statusColor: '#16A34A',
      statusBg: '#ECFDF5',
      hasActions: false
    },
    {
      name: 'Pankaj Mehta',
      code: 'CLN009',
      type: 'Casual Leave',
      typeBg: '#EFF6FF',
      typeColor: '#2563EB',
      dates: '30 Apr 2025\n30 Apr 2025\n(1 Day)',
      reason: 'Personal work',
      status: 'Rejected',
      statusColor: '#DC2626',
      statusBg: '#FEF2F2',
      hasActions: false
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Brand Header Bar */}
      <View style={[styles.headerContainer, { paddingTop: insets.top > 0 ? insets.top + 4 : (Platform.OS === 'ios' ? 44 : 12) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.headerMenuBtn}>
            <Icon name="menu" size={26} color="#1E293B" />
          </TouchableOpacity>

          <View style={styles.brandContainer}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={styles.brandLogo} 
              resizeMode="contain" 
            />
            <Text style={styles.brandSub}>Anything & Everything for your Car</Text>
          </View>

          <View style={styles.headerRightActions}>
            <TouchableOpacity style={styles.notifBtn}>
              <Icon name="bell-outline" size={24} color="#1E293B" />
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>12</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.profileDropdown}>
              <Image source={require('../../assets/cleaner_avatar.png')} style={styles.avatarMini} />
              <View style={{ marginLeft: 6, marginRight: 4 }}>
                <Text style={styles.profileDropdownRole}>Supervisor</Text>
                <Text style={styles.profileDropdownCode}>SUP001</Text>
              </View>
              <Icon name="chevron-down" size={14} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Title Section */}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.mainTitle}>Leave Management</Text>
            <Text style={styles.subTitle}>Manage cleaner leaves and absenteeism</Text>
          </View>
          <TouchableOpacity style={styles.datePickerBtn}>
            <Icon name="calendar-month-outline" size={16} color="#2563EB" />
            <Text style={styles.datePickerTxt}>{selectedMonth}</Text>
            <Icon name="chevron-down" size={14} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Analytics Grid */}
        <View style={styles.analyticsGrid}>
          <Card variant="elevated" style={styles.analyticsCard}>
            <View style={[styles.cardIconBg, { backgroundColor: '#FFF7ED' }]}>
              <Icon name="clock-outline" size={18} color="#EA580C" />
            </View>
            <Text style={styles.cardVal}>8</Text>
            <Text style={styles.cardLabel}>Pending Leave</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllTxt}>View All</Text>
            </TouchableOpacity>
          </Card>

          <Card variant="elevated" style={styles.analyticsCard}>
            <View style={[styles.cardIconBg, { backgroundColor: '#ECFDF5' }]}>
              <Icon name="check-circle-outline" size={18} color="#16A34A" />
            </View>
            <Text style={styles.cardVal}>24</Text>
            <Text style={styles.cardLabel}>Approved</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllTxt}>View All</Text>
            </TouchableOpacity>
          </Card>

          <Card variant="elevated" style={styles.analyticsCard}>
            <View style={[styles.cardIconBg, { backgroundColor: '#FEF2F2' }]}>
              <Icon name="close-circle-outline" size={18} color="#DC2626" />
            </View>
            <Text style={styles.cardVal}>5</Text>
            <Text style={styles.cardLabel}>Rejected</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllTxt}>View All</Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Search Row */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Icon name="magnify" size={20} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search cleaner name..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Icon name="filter-outline" size={18} color="#64748B" />
            <Text style={styles.filterBtnTxt}>Filter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn}>
            <Icon name="sort" size={18} color="#64748B" />
            <Text style={styles.filterBtnTxt}>Sort</Text>
          </TouchableOpacity>
        </View>

        {/* Table Title Row */}
        <View style={styles.tableTitleRow}>
          <Text style={styles.tableSectionTitle}>Leave Requests</Text>
          <Text style={styles.totalRequestsTxt}>Total 37 Requests</Text>
        </View>

        {/* Leave Requests Table Card */}
        <Card variant="elevated" style={styles.tableCard}>
          <View style={styles.tableWrapper}>
            {/* Headers */}
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCol, { width: '24%' }]}>Cleaner</Text>
              <Text style={[styles.headerCol, { width: '16%' }]}>Leave Type</Text>
              <Text style={[styles.headerCol, { width: '22%' }]}>Dates</Text>
              <Text style={[styles.headerCol, { width: '16%' }]}>Reason</Text>
              <Text style={[styles.headerCol, { width: '10%' }]}>Status</Text>
              <Text style={[styles.headerCol, { width: '12%', textAlign: 'center' }]}>Actions</Text>
            </View>

            {/* Rows */}
            {leaveRequests.map((req, idx) => (
              <View key={idx} style={styles.tableRow}>
                {/* Cleaner */}
                <View style={[styles.rowCell, { width: '24%', flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                  <Image source={require('../../assets/cleaner_avatar.png')} style={styles.tableAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tableTextBold} numberOfLines={1}>{req.name}</Text>
                    <Text style={styles.tableTextSub}>{req.code}</Text>
                  </View>
                </View>

                {/* Leave Type */}
                <View style={[styles.rowCell, { width: '16%' }]}>
                  <View style={[styles.typeTag, { backgroundColor: req.typeBg }]}>
                    <Text style={[styles.typeTagTxt, { color: req.typeColor }]}>{req.type}</Text>
                  </View>
                </View>

                {/* Dates */}
                <View style={[styles.rowCell, { width: '22%' }]}>
                  <Text style={styles.tableDatesTxt}>{req.dates}</Text>
                </View>

                {/* Reason */}
                <View style={[styles.rowCell, { width: '16%' }]}>
                  <Text style={styles.tableReasonTxt} numberOfLines={2}>{req.reason}</Text>
                </View>

                {/* Status */}
                <View style={[styles.rowCell, { width: '10%' }]}>
                  <View style={[styles.statusTag, { backgroundColor: req.statusBg }]}>
                    <Text style={[styles.statusTagTxt, { color: req.statusColor }]}>{req.status}</Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={[styles.rowCell, { width: '12%', alignItems: 'center', justifyContent: 'center', gap: 6 }]}>
                  {req.hasActions ? (
                    <>
                      <TouchableOpacity style={styles.actionApproveBtn}>
                        <Icon name="check-circle-outline" size={12} color="#16A34A" />
                        <Text style={styles.actionApproveTxt}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionRejectBtn}>
                        <Icon name="close-circle-outline" size={12} color="#DC2626" />
                        <Text style={styles.actionRejectTxt}>Reject</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <Text style={styles.tableDashTxt}>—</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Bottom Banner Info */}
        <View style={styles.bottomInfoBanner}>
          <Icon name="information-outline" size={16} color="#2563EB" />
          <Text style={styles.bottomInfoBannerTxt}>Leave requests are processed as per company policy.</Text>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerMenuBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  brandContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogo: {
    width: 150,
    height: 36,
  },
  brandSub: {
    fontSize: 8,
    fontWeight: '500',
    color: '#64748B',
    marginTop: -2,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notifBtn: {
    position: 'relative',
    padding: 6,
    marginRight: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  notifBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  avatarMini: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  profileDropdownRole: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E293B',
  },
  profileDropdownCode: {
    fontSize: 8,
    color: '#64748B',
    marginTop: -1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  subTitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  datePickerTxt: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    marginHorizontal: 6,
    fontFamily: 'Inter-Medium',
  },
  analyticsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardVal: {
    fontSize: 18,
    fontWeight: '850',
    color: '#1E293B',
    fontFamily: 'Inter-Bold',
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 4,
  },
  viewAllTxt: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#F97316',
    marginTop: 8,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#1E293B',
    marginLeft: 8,
    padding: 0,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 44,
    gap: 6,
  },
  filterBtnTxt: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  tableTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tableSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  totalRequestsTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  tableWrapper: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  headerCol: {
    fontSize: 9,
    fontWeight: '750',
    color: '#64748B',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  rowCell: {
    justifyContent: 'center',
  },
  tableAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  tableTextBold: {
    fontSize: 10.5,
    fontWeight: '750',
    color: '#1E293B',
  },
  tableTextSub: {
    fontSize: 8.5,
    color: '#64748B',
    marginTop: 1,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  typeTagTxt: {
    fontSize: 8.5,
    fontWeight: '700',
  },
  tableDatesTxt: {
    fontSize: 9.5,
    color: '#1E293B',
    fontWeight: '600',
    lineHeight: 14,
  },
  tableReasonTxt: {
    fontSize: 9.5,
    color: '#475569',
    lineHeight: 13,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusTagTxt: {
    fontSize: 8.5,
    fontWeight: '700',
  },
  tableDashTxt: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  actionApproveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#16A34A',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 3,
    width: 68,
    justifyContent: 'center',
  },
  actionApproveTxt: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#16A34A',
  },
  actionRejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 3,
    width: 68,
    justifyContent: 'center',
  },
  actionRejectTxt: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  bottomInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginTop: 8,
  },
  bottomInfoBannerTxt: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: '600',
  },
});

export default LeaveManagementScreen;
