import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Platform, Dimensions, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../../components/common/Card';

const { width } = Dimensions.get('window');

interface Props { navigation: any }

const DailyAttendanceScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  
  // High fidelity mock data matching the screenshot exactly
  const attendanceRecords = [
    { name: 'Ramesh Kumar', id: 'CLN0087', checkin: '07:02 AM', checkout: '03:05 PM', hours: '8h 03m', status: 'Present', verified: true, selfieCode: 'check' },
    { name: 'Suresh Yadav', id: 'CLN0065', checkin: '07:10 AM', checkout: '03:12 PM', hours: '8h 02m', status: 'Present', verified: true, selfieCode: 'check' },
    { name: 'Vikram Singh', id: 'CLN0099', checkin: '07:18 AM', checkout: '03:01 PM', hours: '7h 43m', status: 'Late', verified: true, selfieCode: 'alert-download' },
    { name: 'Arjun Patel', id: 'CLN0071', checkin: '07:05 AM', checkout: '03:00 PM', hours: '7h 55m', status: 'Present', verified: true, selfieCode: 'check' },
    { name: 'Imran Khan', id: 'CLN0102', checkin: '—', checkout: '—', hours: '—', status: 'Absent', verified: false, selfieCode: 'error' },
    { name: 'Mahesh Verma', id: 'CLN0061', checkin: '07:25 AM', checkout: '03:15 PM', hours: '7h 50m', status: 'Late', verified: true, selfieCode: 'alert-warning' },
    { name: 'Deepak Sharma', id: 'CLN0108', checkin: '—', checkout: '—', hours: '—', status: 'On Leave', verified: false, selfieCode: 'leave' },
    { name: 'Pankaj Mehta', id: 'CLN0092', checkin: '07:08 AM', checkout: '03:04 PM', hours: '7h 56m', status: 'Present', verified: true, selfieCode: 'check' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present':
        return '#16A34A';
      case 'Late':
        return '#F97316';
      case 'Absent':
        return '#EF4444';
      default:
        return '#2563EB'; // On Leave
    }
  };

  const getSelfieIcon = (code: string) => {
    switch (code) {
      case 'check':
        return <Icon name="check-circle" size={14} color="#16A34A" />;
      case 'alert-download':
        return <Icon name="arrow-down-bold-circle" size={14} color="#F97316" />;
      case 'alert-warning':
        return <Icon name="alert-circle" size={14} color="#F97316" />;
      case 'error':
        return <Icon name="close-circle" size={14} color="#EF4444" />;
      default:
        return null;
    }
  };

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
        {/* Main Title section */}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.mainTitle}>Daily Attendance</Text>
            <Text style={styles.subTitle}>Track and manage cleaner attendance</Text>
          </View>
          <TouchableOpacity style={styles.datePickerBtn}>
            <Icon name="calendar-month-outline" size={16} color="#2563EB" />
            <Text style={styles.datePickerTxt}>20 May 2025</Text>
            <Icon name="chevron-down" size={14} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Analytics Grid */}
        <View style={styles.analyticsGrid}>
          <Card variant="elevated" style={styles.analyticsCard}>
            <View style={[styles.cardIconBg, { backgroundColor: '#ECFDF5' }]}>
              <Icon name="check-bold" size={16} color="#16A34A" />
            </View>
            <Text style={styles.cardVal}>156</Text>
            <Text style={[styles.cardLabel, { color: '#16A34A' }]}>Present</Text>
            <View style={[styles.pctCapsule, { backgroundColor: '#E8F5E9' }]}>
              <Text style={[styles.pctCapsuleTxt, { color: '#16A34A' }]}>78.0%</Text>
            </View>
          </Card>

          <Card variant="elevated" style={styles.analyticsCard}>
            <View style={[styles.cardIconBg, { backgroundColor: '#FEF2F2' }]}>
              <Icon name="close-thick" size={16} color="#EF4444" />
            </View>
            <Text style={styles.cardVal}>28</Text>
            <Text style={[styles.cardLabel, { color: '#EF4444' }]}>Absent</Text>
            <View style={[styles.pctCapsule, { backgroundColor: '#FFEBEE' }]}>
              <Text style={[styles.pctCapsuleTxt, { color: '#EF4444' }]}>14.0%</Text>
            </View>
          </Card>

          <Card variant="elevated" style={styles.analyticsCard}>
            <View style={[styles.cardIconBg, { backgroundColor: '#FFF7ED' }]}>
              <Icon name="clock-outline" size={16} color="#F97316" />
            </View>
            <Text style={styles.cardVal}>12</Text>
            <Text style={[styles.cardLabel, { color: '#F97316' }]}>Late</Text>
            <View style={[styles.pctCapsule, { backgroundColor: '#FFF3E0' }]}>
              <Text style={[styles.pctCapsuleTxt, { color: '#F97316' }]}>6.0%</Text>
            </View>
          </Card>

          <Card variant="elevated" style={styles.analyticsCard}>
            <View style={[styles.cardIconBg, { backgroundColor: '#EFF6FF' }]}>
              <Icon name="account-clock" size={16} color="#2563EB" />
            </View>
            <Text style={styles.cardVal}>4</Text>
            <Text style={[styles.cardLabel, { color: '#2563EB' }]}>On Leave</Text>
            <View style={[styles.pctCapsule, { backgroundColor: '#E3F2FD' }]}>
              <Text style={[styles.pctCapsuleTxt, { color: '#2563EB' }]}>2.0%</Text>
            </View>
          </Card>
        </View>

        {/* Quick Actions Row */}
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionItem}>
            <View style={[styles.qaIconBg, { backgroundColor: '#EFF6FF' }]}>
              <Icon name="crop-free" size={22} color="#2563EB" />
            </View>
            <Text style={styles.qaLabel}>Mark Attendance</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionItem}>
            <View style={[styles.qaIconBg, { backgroundColor: '#ECFDF5' }]}>
              <Icon name="clipboard-edit-outline" size={22} color="#10B981" />
            </View>
            <Text style={styles.qaLabel}>Manual Attendance</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionItem}>
            <View style={[styles.qaIconBg, { backgroundColor: '#FAF5FF' }]}>
              <Icon name="map-marker-radius-outline" size={22} color="#8B5CF6" />
            </View>
            <Text style={styles.qaLabel}>Geo Verification</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionItem}>
            <View style={[styles.qaIconBg, { backgroundColor: '#F0FDF4' }]}>
              <Icon name="download" size={22} color="#16A34A" />
            </View>
            <Text style={styles.qaLabel}>Export</Text>
          </TouchableOpacity>
        </View>

        {/* Search & Filter Row */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Icon name="magnify" size={20} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search cleaner by name or ID..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Icon name="filter-outline" size={18} color="#64748B" />
            <Text style={styles.filterBtnTxt}>Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Attendance List Table */}
        <Card variant="elevated" style={styles.tableCard}>
          <View style={styles.tableWrapper}>
            {/* Headers */}
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCol, { width: '25%' }]}>Cleaner</Text>
              <Text style={[styles.headerCol, { width: '18%' }]}>Check-In</Text>
              <Text style={[styles.headerCol, { width: '18%' }]}>Check-Out</Text>
              <Text style={[styles.headerCol, { width: '15%' }]}>Working Hours</Text>
              <Text style={[styles.headerCol, { width: '14%' }]}>Status</Text>
              <Text style={[styles.headerCol, { width: '10%', textAlign: 'center' }]}>Selfie</Text>
            </View>

            {/* Rows */}
            {attendanceRecords.map((record, idx) => (
              <View key={idx} style={styles.tableRow}>
                {/* Cleaner */}
                <View style={[styles.rowCell, { width: '25%', flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                  <Image source={require('../../assets/cleaner_avatar.png')} style={styles.tableAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tableTextBold} numberOfLines={1}>{record.name}</Text>
                    <Text style={styles.tableTextSub}>{record.id}</Text>
                  </View>
                </View>

                {/* Check-In */}
                <View style={[styles.rowCell, { width: '18%' }]}>
                  <Text style={styles.tableTextTime}>{record.checkin}</Text>
                  {record.verified ? (
                    <View style={styles.verifiedRow}>
                      <Icon name="map-marker" size={10} color="#16A34A" />
                      <Text style={styles.verifiedTxt}>Verified</Text>
                    </View>
                  ) : (
                    <Text style={[styles.unverifiedTxt, { color: record.status === 'On Leave' ? '#2563EB' : '#EF4444' }]}>
                      {record.status === 'On Leave' ? 'On Leave' : 'Not Marked'}
                    </Text>
                  )}
                </View>

                {/* Check-Out */}
                <View style={[styles.rowCell, { width: '18%' }]}>
                  <Text style={styles.tableTextTime}>{record.checkout}</Text>
                  {record.verified && record.checkout !== '—' ? (
                    <View style={styles.verifiedRow}>
                      <Icon name="map-marker" size={10} color="#16A34A" />
                      <Text style={styles.verifiedTxt}>Verified</Text>
                    </View>
                  ) : (
                    <Text style={[styles.unverifiedTxt, { color: record.status === 'On Leave' ? '#2563EB' : '#EF4444' }]}>
                      {record.status === 'On Leave' ? 'On Leave' : 'Not Marked'}
                    </Text>
                  )}
                </View>

                {/* Working Hours */}
                <View style={[styles.rowCell, { width: '15%' }]}>
                  <Text style={styles.tableHoursTxt}>{record.hours}</Text>
                </View>

                {/* Status */}
                <View style={[styles.rowCell, { width: '14%' }]}>
                  <View style={[styles.statusTag, { backgroundColor: record.status === 'Present' ? '#ECFDF5' : (record.status === 'Late' ? '#FFF7ED' : (record.status === 'Absent' ? '#FEF2F2' : '#EFF6FF')) }]}>
                    <Text style={[styles.statusTagTxt, { color: getStatusColor(record.status) }]}>{record.status}</Text>
                  </View>
                </View>

                {/* Selfie */}
                <View style={[styles.rowCell, { width: '10%', alignItems: 'center', justifyContent: 'center', position: 'relative' }]}>
                  {record.status !== 'Absent' && record.status !== 'On Leave' ? (
                    <View style={styles.selfieWrapper}>
                      <Image source={require('../../assets/cleaner_avatar.png')} style={styles.selfieThumb} />
                      <View style={styles.selfieBadge}>
                        {getSelfieIcon(record.selfieCode)}
                      </View>
                    </View>
                  ) : (
                    <View style={styles.selfiePlaceholder}>
                      <Icon name="account" size={16} color="#CBD5E1" />
                      {getSelfieIcon(record.selfieCode) && (
                        <View style={styles.selfieBadge}>
                          {getSelfieIcon(record.selfieCode)}
                        </View>
                      )}
                    </View>
                  )}
                </View>

                {/* Action button */}
                <TouchableOpacity style={styles.rowDotBtn}>
                  <Icon name="dots-vertical" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Pagination Footer */}
          <View style={styles.paginationRow}>
            <Text style={styles.showingText}>Showing 1 to 8 of 200 cleaners</Text>
            <View style={styles.pageBtnRow}>
              <TouchableOpacity style={styles.pageArrowBtn}>
                <Icon name="chevron-left" size={16} color="#64748B" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pageBtn, styles.activePageBtn]}>
                <Text style={[styles.pageBtnTxt, styles.activePageBtnTxt]}>1</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pageBtn}>
                <Text style={styles.pageBtnTxt}>2</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pageBtn}>
                <Text style={styles.pageBtnTxt}>3</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pageArrowBtn}>
                <Icon name="chevron-right" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>
        </Card>
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
    gap: 10,
    marginBottom: 16,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardIconBg: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  pctCapsule: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 8,
  },
  pctCapsuleTxt: {
    fontSize: 8,
    fontWeight: '700',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  quickActionItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  qaIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  qaLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
    paddingHorizontal: 4,
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
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    fontWeight: '700',
    color: '#64748B',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: 10,
    paddingHorizontal: 8,
    position: 'relative',
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
    fontSize: 11,
    fontWeight: '750',
    color: '#1E293B',
  },
  tableTextSub: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 1,
  },
  tableTextTime: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  verifiedTxt: {
    fontSize: 8,
    fontWeight: '600',
    color: '#16A34A',
  },
  unverifiedTxt: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },
  tableHoursTxt: {
    fontSize: 11,
    color: '#1E293B',
    fontWeight: '600',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusTagTxt: {
    fontSize: 9,
    fontWeight: '700',
  },
  selfieWrapper: {
    position: 'relative',
    width: 28,
    height: 28,
  },
  selfieThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selfieBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  selfiePlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  rowDotBtn: {
    position: 'absolute',
    right: 4,
    top: '40%',
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  showingText: {
    fontSize: 10,
    color: '#64748B',
  },
  pageBtnRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  pageArrowBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePageBtn: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  pageBtnTxt: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  activePageBtnTxt: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default DailyAttendanceScreen;
