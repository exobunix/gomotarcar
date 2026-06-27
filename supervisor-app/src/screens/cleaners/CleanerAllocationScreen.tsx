import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Platform, Dimensions, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../../components/common/Card';

const { width } = Dimensions.get('window');

interface Props { navigation: any }

const CleanerAllocationScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [cleanerSearch, setCleanerSearch] = useState('');
  const [apartmentSearch, setApartmentSearch] = useState('');
  const [showBanner, setShowBanner] = useState(true);

  // High-fidelity mock data matching the wireframe screenshot exactly
  const availableCleaners = [
    { id: 'CLN0087', name: 'Ramesh Kumar', status: 'Available' },
    { id: 'CLN0065', name: 'Suresh Yadav', status: 'Available' },
    { id: 'CLN0099', name: 'Vikram Singh', status: 'Available' },
    { id: 'CLN0071', name: 'Arjun Patel', status: 'Available' },
    { id: 'CLN0102', name: 'Imran Khan', status: 'Available' },
    { id: 'CLN0061', name: 'Mahesh Verma', status: 'Available' },
  ];

  const availableApartments = [
    { name: 'Sunshine Heights', sector: 'Sector 45, Noida', cars: 12 },
    { name: 'Green View Apartments', sector: 'Sector 78, Noida', cars: 8 },
    { name: 'Maple Residency', sector: 'Sector 50, Noida', cars: 6 },
    { name: 'Skyline Towers', sector: 'Greater Noida West', cars: 15 },
    { name: 'Palm Paradise', sector: 'Sector 10, Noida', cars: 7 },
    { name: 'Oasis Apartments', sector: 'Sector 120, Noida', cars: 9 },
  ];

  const allocations = [
    { id: 'CLN0087', name: 'Ramesh Kumar', apartment: 'Sunshine Heights', sector: 'Sector 45, Noida', cars: 12, shift: '07:00 AM - 03:00 PM' },
    { id: 'CLN0065', name: 'Suresh Yadav', apartment: 'Green View Apartments', sector: 'Sector 78, Noida', cars: 8, shift: '03:00 PM - 11:00 PM' },
    { id: 'CLN0099', name: 'Vikram Singh', apartment: 'Maple Residency', sector: 'Sector 50, Noida', cars: 6, shift: '07:00 AM - 03:00 PM' },
    { id: 'CLN0071', name: 'Arjun Patel', apartment: 'Skyline Towers', sector: 'Greater Noida West', cars: 15, shift: '11:00 AM - 07:00 PM' },
    { id: 'CLN0102', name: 'Imran Khan', apartment: 'Palm Paradise', sector: 'Sector 10, Noida', cars: 7, shift: '03:00 PM - 11:00 PM' },
    { id: 'CLN0061', name: 'Mahesh Verma', apartment: 'Oasis Apartments', sector: 'Sector 120, Noida', cars: 9, shift: '07:00 AM - 03:00 PM' },
    { id: 'CLN0108', name: 'Deepak Sharma', apartment: 'Silver Springs', sector: 'Greater Noida', cars: 10, shift: '11:00 AM - 07:00 PM' },
    { id: 'CLN0092', name: 'Pankaj Mehta', apartment: 'Blue Bell Homes', sector: 'Sector 119, Noida', cars: 5, shift: '03:00 PM - 11:00 PM' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563EB" />
      {/* Title Header Bar */}
      <View style={[styles.headerContainer, { paddingTop: insets.top > 0 ? insets.top + 8 : (Platform.OS === 'ios' ? 48 : 16) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn}>
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Cleaner Allocation</Text>
            <Text style={styles.headerSubtitle}>Assign cleaners to apartments</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Icon name="bell-outline" size={24} color="#FFFFFF" />
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>12</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Info Drag Drop Banner */}
        {showBanner && (
          <View style={styles.infoBanner}>
            <View style={styles.infoBannerLeft}>
              <Icon name="information" size={20} color="#2563EB" />
              <Text style={styles.infoBannerTxt}>Drag & drop cleaners to assign them to apartments</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity>
                <Text style={styles.learnMoreTxt}>Learn More</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowBanner(false)}>
                <Icon name="close" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Side-by-Side Available Cleaners & Apartments Grid */}
        <View style={styles.allocationWorkspace}>
          {/* Column 1: Available Cleaners */}
          <View style={styles.workspaceCol}>
            <View style={styles.workspaceColHeader}>
              <Text style={styles.workspaceColTitle}>Available Cleaners</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeTxt}>18</Text>
              </View>
            </View>

            <View style={styles.searchRow}>
              <View style={styles.searchBox}>
                <Icon name="magnify" size={16} color="#94A3B8" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search cleaner..."
                  placeholderTextColor="#94A3B8"
                  value={cleanerSearch}
                  onChangeText={setCleanerSearch}
                />
              </View>
              <TouchableOpacity style={styles.filterSubBtn}>
                <Icon name="filter-variant" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.subListScroll} showsVerticalScrollIndicator={false}>
              {availableCleaners.map((cleaner, idx) => (
                <View key={cleaner.id} style={styles.smallCleanerCard}>
                  <Icon name="drag-vertical" size={18} color="#94A3B8" style={{ marginRight: 2 }} />
                  <Image source={require('../../assets/cleaner_avatar.png')} style={styles.avatarSmall} />
                  <View style={styles.cleanerDetailsSmall}>
                    <Text style={styles.cleanerNameSmall}>{cleaner.name}</Text>
                    <Text style={styles.cleanerIdSmall}>{cleaner.id}</Text>
                  </View>
                  <View style={styles.statusPillSmall}>
                    <Text style={styles.statusPillSmallTxt}>{cleaner.status}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.refreshListBtn}>
              <Icon name="refresh" size={16} color="#2563EB" />
              <Text style={styles.refreshListBtnTxt}>Refresh List</Text>
            </TouchableOpacity>
          </View>

          {/* Center Drag indicator */}
          <View style={styles.dragIndicatorCenter}>
            <Icon name="swap-horizontal" size={20} color="#64748B" />
            <Text style={styles.dragIndicatorTxt}>Drag & Drop</Text>
          </View>

          {/* Column 2: Available Apartments */}
          <View style={styles.workspaceCol}>
            <View style={styles.workspaceColHeader}>
              <Text style={styles.workspaceColTitle}>Available Apartments</Text>
              <View style={[styles.countBadge, { backgroundColor: '#EFF6FF' }]}>
                <Text style={[styles.countBadgeTxt, { color: '#2563EB' }]}>24</Text>
              </View>
            </View>

            <View style={styles.searchRow}>
              <View style={styles.searchBox}>
                <Icon name="magnify" size={16} color="#94A3B8" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search apartment..."
                  placeholderTextColor="#94A3B8"
                  value={apartmentSearch}
                  onChangeText={setApartmentSearch}
                />
              </View>
              <TouchableOpacity style={styles.filterSubBtn}>
                <Icon name="filter-variant" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.subListScroll} showsVerticalScrollIndicator={false}>
              {availableApartments.map((apt, idx) => (
                <View key={idx} style={styles.smallApartmentCard}>
                  <View style={styles.aptIconSmallBg}>
                    <Icon name="office-building" size={14} color="#2563EB" />
                  </View>
                  <View style={styles.aptDetailsSmall}>
                    <Text style={styles.aptNameSmall} numberOfLines={1}>{apt.name}</Text>
                    <Text style={styles.aptSectorSmall} numberOfLines={1}>{apt.sector}</Text>
                  </View>
                  <Text style={styles.carsCountSmallTxt}>{apt.cars} Cars</Text>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.refreshListBtn}>
              <Icon name="refresh" size={16} color="#2563EB" />
              <Text style={styles.refreshListBtnTxt}>Refresh List</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Current Allocations Table */}
        <Card variant="elevated" style={styles.allocationsTableCard}>
          <View style={styles.tableHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.tableTitle}>Current Allocations</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeTxt}>8</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={styles.tableFilterBtn}>
                <Icon name="filter-outline" size={16} color="#64748B" />
                <Text style={styles.tableFilterBtnTxt}>Filters</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tableAddBtn}>
                <Icon name="plus" size={14} color="#FFFFFF" />
                <Text style={styles.tableAddBtnTxt}>Add Allocation</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Custom Grid / Table */}
          <View style={styles.tableWrapper}>
            {/* Column Titles */}
            <View style={styles.tableHeaderLabels}>
              <Text style={[styles.columnLabel, { width: '25%' }]}>Cleaner</Text>
              <Text style={[styles.columnLabel, { width: '25%' }]}>Apartment</Text>
              <Text style={[styles.columnLabel, { width: '18%', textAlign: 'center' }]}>Cars Count</Text>
              <Text style={[styles.columnLabel, { width: '20%' }]}>Shift Timing</Text>
              <Text style={[styles.columnLabel, { width: '12%', textAlign: 'center' }]}>Actions</Text>
            </View>

            {/* Table Rows */}
            {allocations.map((alloc, idx) => (
              <View key={idx} style={styles.tableRow}>
                {/* Cleaner */}
                <View style={[styles.rowCell, { width: '25%', flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                  <Image source={require('../../assets/cleaner_avatar.png')} style={styles.tableAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tableTextBold} numberOfLines={1}>{alloc.name}</Text>
                    <Text style={styles.tableTextSub}>{alloc.id}</Text>
                  </View>
                </View>

                {/* Apartment */}
                <View style={[styles.rowCell, { width: '25%' }]}>
                  <Text style={styles.tableTextBold} numberOfLines={1}>{alloc.apartment}</Text>
                  <Text style={styles.tableTextSub} numberOfLines={1}>{alloc.sector}</Text>
                </View>

                {/* Cars count */}
                <View style={[styles.rowCell, { width: '18%', alignItems: 'center' }]}>
                  <View style={styles.tableCarsTag}>
                    <Icon name="car" size={12} color="#475569" />
                    <Text style={styles.tableCarsTagTxt}>{alloc.cars} Cars</Text>
                  </View>
                </View>

                {/* Shift timing */}
                <View style={[styles.rowCell, { width: '20%', flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                  <Icon name="clock-outline" size={12} color="#64748B" />
                  <Text style={styles.tableShiftTxt}>{alloc.shift}</Text>
                </View>

                {/* Actions */}
                <View style={[styles.rowCell, { width: '12%', flexDirection: 'row', justifyContent: 'center', gap: 8 }]}>
                  <TouchableOpacity>
                    <Icon name="square-edit-outline" size={16} color="#2563EB" />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Icon name="trash-can-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Table Footer */}
          <View style={styles.tableFooterRow}>
            <View style={{ flexDirection: 'row', gap: 14 }}>
              <TouchableOpacity style={styles.footerActionTxtBtn}>
                <Icon name="square-edit-outline" size={14} color="#2563EB" />
                <Text style={styles.footerActionTxtBtnTxt}>Reassign</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.footerActionTxtBtn}>
                <Icon name="trash-can-outline" size={14} color="#EF4444" />
                <Text style={[styles.footerActionTxtBtnTxt, { color: '#EF4444' }]}>Remove Allocation</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.totalAllocTxt}>Total Allocations: <Text style={{ fontWeight: '850' }}>8</Text></Text>
          </View>
        </Card>
      </ScrollView>

      {/* Sticky Action Buttons bar */}
      <View style={[styles.bottomButtonsBar, { paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16 }]}>
        <TouchableOpacity style={styles.btnAssign}>
          <Icon name="check-circle-outline" size={18} color="#FFFFFF" />
          <Text style={styles.btnAssignTxt}>Assign</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.btnReassign}>
          <Icon name="swap-horizontal" size={18} color="#2563EB" />
          <Text style={styles.btnReassignTxt}>Reassign</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnRemove}>
          <Icon name="trash-can-outline" size={18} color="#EF4444" />
          <Text style={styles.btnRemoveTxt}>Remove Allocation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerContainer: {
    backgroundColor: '#2563EB',
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBackBtn: {
    padding: 6,
  },
  headerTitleContainer: {
    flex: 1,
    paddingLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#E0F2FE',
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  notifBtn: {
    position: 'relative',
    padding: 6,
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
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    padding: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
    gap: 8,
  },
  infoBannerTxt: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E40AF',
    fontFamily: 'Inter-Medium',
  },
  learnMoreTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  allocationWorkspace: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    height: 380,
  },
  workspaceCol: {
    flex: 1,
  },
  workspaceColHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  workspaceColTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  countBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeTxt: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 32,
  },
  searchInput: {
    flex: 1,
    fontSize: 11,
    color: '#1E293B',
    padding: 0,
    marginLeft: 4,
  },
  filterSubBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subListScroll: {
    flex: 1,
    marginBottom: 10,
  },
  smallCleanerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
  },
  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 6,
  },
  cleanerDetailsSmall: {
    flex: 1,
  },
  cleanerNameSmall: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  cleanerIdSmall: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 1,
  },
  statusPillSmall: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusPillSmallTxt: {
    fontSize: 8,
    fontWeight: '700',
    color: '#16A34A',
  },
  dragIndicatorCenter: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#F1F5F9',
    borderStyle: 'dashed',
    marginHorizontal: 8,
  },
  dragIndicatorTxt: {
    fontSize: 8,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  smallApartmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
  },
  aptIconSmallBg: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  aptDetailsSmall: {
    flex: 1,
  },
  aptNameSmall: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  aptSectorSmall: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 1,
  },
  carsCountSmallTxt: {
    fontSize: 9,
    fontWeight: '700',
    color: '#2563EB',
  },
  refreshListBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    paddingTop: 8,
  },
  refreshListBtnTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  allocationsTableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tableTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  tableFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  tableFilterBtnTxt: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  tableAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  tableAddBtnTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tableWrapper: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeaderLabels: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  columnLabel: {
    fontSize: 10,
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
    backgroundColor: '#FFFFFF',
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
  tableCarsTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  tableCarsTagTxt: {
    fontSize: 9,
    fontWeight: '600',
    color: '#475569',
  },
  tableShiftTxt: {
    fontSize: 10,
    color: '#1E293B',
    fontWeight: '600',
  },
  tableFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  footerActionTxtBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerActionTxtBtnTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  totalAllocTxt: {
    fontSize: 11,
    color: '#64748B',
  },
  bottomButtonsBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  btnAssign: {
    flex: 1.1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  btnAssignTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  btnReassign: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  btnReassignTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  btnRemove: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  btnRemoveTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EF4444',
  },
});

export default CleanerAllocationScreen;
