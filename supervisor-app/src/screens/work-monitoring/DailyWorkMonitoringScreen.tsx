import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Platform, Dimensions, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../../components/common/Card';

const { width } = Dimensions.get('window');

interface Props { navigation: any }

const DailyWorkMonitoringScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  // High fidelity mock data matching the screenshot exactly
  const cleaningTasks = [
    {
      customerName: 'Rahul Sharma',
      customerPhone: '98765 43210',
      vehicleNo: 'DL 01 AB 1234',
      vehicleModel: 'Honda City',
      cleanerName: 'Ramesh Kumar',
      apartmentName: 'Sunshine Heights',
      flatNo: 'A-1203',
      timeSlot: '07:00 AM - 08:00 AM',
      status: 'Completed'
    },
    {
      customerName: 'Priya Singh',
      customerPhone: '98123 45678',
      vehicleNo: 'DL 01 CD 5678',
      vehicleModel: 'Hyundai i20',
      cleanerName: 'Suresh Yadav',
      apartmentName: 'Green View Apts',
      flatNo: 'B-904',
      timeSlot: '08:00 AM - 09:00 AM',
      status: 'In Progress'
    },
    {
      customerName: 'Amit Verma',
      customerPhone: '96543 21098',
      vehicleNo: 'DL 01 EF 9012',
      vehicleModel: 'Maruti Swift',
      cleanerName: 'Vikram Singh',
      apartmentName: 'Maple Residency',
      flatNo: 'C-1102',
      timeSlot: '09:00 AM - 10:00 AM',
      status: 'Pending'
    },
    {
      customerName: 'Neha Gupta',
      customerPhone: '97123 45609',
      vehicleNo: 'DL 01 GH 3456',
      vehicleModel: 'Tata Nexon',
      cleanerName: 'Arjun Patel',
      apartmentName: 'Skyline Towers',
      flatNo: 'D-1504',
      timeSlot: '10:00 AM - 11:00 AM',
      status: 'Missed'
    },
    {
      customerName: 'Vikas Yadav',
      customerPhone: '98111 22334',
      vehicleNo: 'DL 01 IJ 7890',
      vehicleModel: 'Kia Seltos',
      cleanerName: 'Imran Khan',
      apartmentName: 'Palm Paradise',
      flatNo: 'E-502',
      timeSlot: '11:00 AM - 12:00 PM',
      status: 'Pending'
    },
    {
      customerName: 'Deepak Sharma',
      customerPhone: '95822 11009',
      vehicleNo: 'DL 01 KL 4567',
      vehicleModel: 'Toyota Fortuner',
      cleanerName: 'Mahesh Verma',
      apartmentName: 'Oasis Apartments',
      flatNo: 'F-703',
      timeSlot: '12:00 PM - 01:00 PM',
      status: 'In Progress'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return '#16A34A';
      case 'In Progress':
        return '#2563EB';
      case 'Pending':
        return '#F97316';
      case 'Missed':
        return '#EF4444';
      default:
        return '#64748B';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return '#ECFDF5';
      case 'In Progress':
        return '#EFF6FF';
      case 'Pending':
        return '#FFF7ED';
      case 'Missed':
        return '#FEF2F2';
      default:
        return '#F1F5F9';
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
        {/* Main Title Section */}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.mainTitle}>Today's Cleaning</Text>
            <Text style={styles.subTitle}>Track and manage today's cleaning tasks</Text>
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
            <View style={[styles.cardIconBg, { backgroundColor: '#EFF6FF' }]}>
              <Icon name="car-outline" size={16} color="#2563EB" />
            </View>
            <Text style={styles.cardVal}>124</Text>
            <Text style={[styles.cardLabel, { color: '#1E293B' }]}>Total Cars</Text>
            <View style={[styles.pctCapsule, { backgroundColor: '#EFF6FF' }]}>
              <Text style={[styles.pctCapsuleTxt, { color: '#2563EB' }]}>100%</Text>
            </View>
          </Card>

          <Card variant="elevated" style={styles.analyticsCard}>
            <View style={[styles.cardIconBg, { backgroundColor: '#ECFDF5' }]}>
              <Icon name="check-bold" size={16} color="#16A34A" />
            </View>
            <Text style={styles.cardVal}>68</Text>
            <Text style={[styles.cardLabel, { color: '#16A34A' }]}>Completed</Text>
            <View style={[styles.pctCapsule, { backgroundColor: '#E8F5E9' }]}>
              <Text style={[styles.pctCapsuleTxt, { color: '#16A34A' }]}>54.8%</Text>
            </View>
          </Card>

          <Card variant="elevated" style={styles.analyticsCard}>
            <View style={[styles.cardIconBg, { backgroundColor: '#FFF7ED' }]}>
              <Icon name="clock-outline" size={16} color="#F97316" />
            </View>
            <Text style={styles.cardVal}>42</Text>
            <Text style={[styles.cardLabel, { color: '#F97316' }]}>Pending</Text>
            <View style={[styles.pctCapsule, { backgroundColor: '#FFF3E0' }]}>
              <Text style={[styles.pctCapsuleTxt, { color: '#F97316' }]}>33.9%</Text>
            </View>
          </Card>

          <Card variant="elevated" style={styles.analyticsCard}>
            <View style={[styles.cardIconBg, { backgroundColor: '#FEF2F2' }]}>
              <Icon name="close-thick" size={16} color="#EF4444" />
            </View>
            <Text style={styles.cardVal}>14</Text>
            <Text style={[styles.cardLabel, { color: '#EF4444' }]}>Missed</Text>
            <View style={[styles.pctCapsule, { backgroundColor: '#FFEBEE' }]}>
              <Text style={[styles.pctCapsuleTxt, { color: '#EF4444' }]}>11.3%</Text>
            </View>
          </Card>
        </View>

        {/* Search Row */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Icon name="magnify" size={20} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search customer, vehicle or cleaner..."
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

        {/* Column Labels Header */}
        <View style={styles.columnLabelsRow}>
          <Text style={[styles.colLabelText, { width: '30%' }]}>Customer / Vehicle</Text>
          <Text style={[styles.colLabelText, { width: '32%' }]}>Cleaner / Apartment</Text>
          <Text style={[styles.colLabelText, { width: '22%' }]}>Scheduled Time</Text>
          <Text style={[styles.colLabelText, { width: '16%' }]}>Status</Text>
        </View>

        {/* Task Cards List */}
        <View style={styles.tasksListContainer}>
          {cleaningTasks.map((task, idx) => {
            const isActionable = task.status === 'Completed' || task.status === 'In Progress';
            
            return (
              <Card key={idx} variant="elevated" style={styles.taskRecordCard}>
                {/* Details layout row */}
                <View style={styles.taskRecordRow}>
                  {/* Customer / Vehicle */}
                  <View style={[styles.taskColCell, { width: '30%', gap: 4 }]}>
                    <View style={styles.avatarTextRow}>
                      <Image source={require('../../assets/cleaner_avatar.png')} style={styles.avatarRound} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cellTextBold} numberOfLines={1}>{task.customerName}</Text>
                        <Text style={styles.cellTextSub}>{task.customerPhone}</Text>
                      </View>
                    </View>
                    <View style={styles.vehicleRow}>
                      <Icon name="car" size={12} color="#64748B" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.vehicleNoTxt} numberOfLines={1}>{task.vehicleNo}</Text>
                        <Text style={styles.vehicleModelTxt} numberOfLines={1}>{task.vehicleModel}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Cleaner / Apartment */}
                  <View style={[styles.taskColCell, { width: '32%', gap: 4 }]}>
                    <View style={styles.avatarTextRow}>
                      <Image source={require('../../assets/cleaner_avatar.png')} style={styles.avatarRound} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cellTextBold} numberOfLines={1}>{task.cleanerName}</Text>
                        <Text style={styles.cellTextSub} numberOfLines={1}>{task.apartmentName}</Text>
                        <Text style={styles.flatNoTxt} numberOfLines={1}>{task.flatNo}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Scheduled Time */}
                  <View style={[styles.taskColCell, { width: '22%', flexDirection: 'row', alignItems: 'flex-start', gap: 4 }]}>
                    <Icon name="clock-outline" size={12} color="#64748B" style={{ marginTop: 2 }} />
                    <Text style={styles.timeSlotTxt}>{task.timeSlot.replace(' - ', '\n')}</Text>
                  </View>

                  {/* Status */}
                  <View style={[styles.taskColCell, { width: '16%' }]}>
                    <View style={[styles.statusCapsule, { backgroundColor: getStatusBgColor(task.status) }]}>
                      <Icon 
                        name={task.status === 'Completed' ? 'check-circle' : (task.status === 'In Progress' ? 'progress-clock' : (task.status === 'Pending' ? 'clock-outline' : 'close-circle'))} 
                        size={10} 
                        color={getStatusColor(task.status)} 
                      />
                      <Text style={[styles.statusCapsuleTxt, { color: getStatusColor(task.status) }]}>{task.status}</Text>
                    </View>
                  </View>
                </View>

                {/* Bottom action buttons tray */}
                <View style={styles.cardActionsTray}>
                  <TouchableOpacity style={styles.actionBtnItem}>
                    <Icon name="image-outline" size={15} color="#2563EB" />
                    <Text style={styles.actionBtnTxt}>View Images</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionBtnItem, !isActionable && styles.disabledActionItem]} 
                    disabled={!isActionable}
                  >
                    <Icon name="check-circle-outline" size={15} color={isActionable ? '#16A34A' : '#94A3B8'} />
                    <Text style={[styles.actionBtnTxt, { color: isActionable ? '#16A34A' : '#94A3B8' }]}>Approve</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionBtnItem, !isActionable && styles.disabledActionItem]} 
                    disabled={!isActionable}
                  >
                    <Icon name="close-circle-outline" size={15} color={isActionable ? '#EF4444' : '#94A3B8'} />
                    <Text style={[styles.actionBtnTxt, { color: isActionable ? '#EF4444' : '#94A3B8' }]}>Reject</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionBtnItem}>
                    <Icon name="calendar-month-outline" size={15} color="#2563EB" />
                    <Text style={styles.actionBtnTxt}>Reschedule</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })}
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
  columnLabelsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  colLabelText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  tasksListContainer: {
    gap: 12,
  },
  taskRecordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  taskRecordRow: {
    flexDirection: 'row',
  },
  taskColCell: {
    justifyContent: 'flex-start',
  },
  avatarTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatarRound: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  cellTextBold: {
    fontSize: 11,
    fontWeight: '750',
    color: '#1E293B',
  },
  cellTextSub: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 1,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  vehicleNoTxt: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1E293B',
  },
  vehicleModelTxt: {
    fontSize: 8,
    color: '#64748B',
  },
  flatNoTxt: {
    fontSize: 9,
    fontWeight: '600',
    color: '#2563EB',
    marginTop: 2,
  },
  timeSlotTxt: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 14,
  },
  statusCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  statusCapsuleTxt: {
    fontSize: 9,
    fontWeight: '700',
  },
  cardActionsTray: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    marginTop: 14,
    paddingTop: 10,
    gap: 8,
  },
  actionBtnItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingVertical: 8,
    gap: 4,
  },
  disabledActionItem: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  actionBtnTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
});

export default DailyWorkMonitoringScreen;
