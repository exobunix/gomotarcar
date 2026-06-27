import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Platform, Dimensions, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../../components/common/Card';

const { width } = Dimensions.get('window');

interface Props { navigation: any }

const InventoryListScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  // High fidelity mock data matching the screenshot exactly
  const inventoryItems = [
    {
      name: 'Microfiber Cloth',
      code: 'CL-001',
      category: 'Cloth',
      categoryColor: '#FFF7ED',
      categoryTxtColor: '#C2410C',
      qty: '250 pcs',
      issuedTo: 'Ramesh Kumar\nSunshine Heights',
      balance: '180 pcs',
      balanceColor: '#16A34A',
      status: 'In Stock',
      statusColor: '#16A34A',
      statusBg: '#ECFDF5'
    },
    {
      name: 'Car Shampoo',
      code: 'SH-002',
      category: 'Shampoo',
      categoryColor: '#EFF6FF',
      categoryTxtColor: '#2563EB',
      qty: '120 pcs',
      issuedTo: 'Suresh Yadav\nGreen View Apts',
      balance: '60 pcs',
      balanceColor: '#16A34A',
      status: 'In Stock',
      statusColor: '#16A34A',
      statusBg: '#ECFDF5'
    },
    {
      name: 'Dashboard Spray',
      code: 'SP-003',
      category: 'Spray',
      categoryColor: '#FAF5FF',
      categoryTxtColor: '#8B5CF6',
      qty: '200 pcs',
      issuedTo: 'Vikram Singh\nMaple Residency',
      balance: '75 pcs',
      balanceColor: '#16A34A',
      status: 'In Stock',
      statusColor: '#16A34A',
      statusBg: '#ECFDF5'
    },
    {
      name: 'Cleaner Uniform',
      code: 'UN-004',
      category: 'Uniform',
      categoryColor: '#FFF7ED',
      categoryTxtColor: '#B45309',
      qty: '80 sets',
      issuedTo: 'Arjun Patel\nSkyline Towers',
      balance: '28 sets',
      balanceColor: '#EA580C',
      status: 'Low Stock',
      statusColor: '#EA580C',
      statusBg: '#FFF7ED'
    },
    {
      name: 'QR Stickers',
      code: 'QR-005',
      category: 'QR Stickers',
      categoryColor: '#F0FDF4',
      categoryTxtColor: '#16A34A',
      qty: '1000 pcs',
      issuedTo: 'Priya Singh\nGreen View Apts',
      balance: '120 pcs',
      balanceColor: '#16A34A',
      status: 'In Stock',
      statusColor: '#16A34A',
      statusBg: '#ECFDF5'
    }
  ];

  const lowStockAlerts = [
    {
      name: 'Cleaner Uniform',
      remaining: 'Only 28 sets remaining',
      minStock: 'Min. Stock: 30 sets'
    },
    {
      name: 'Dashboard Spray',
      remaining: 'Only 75 pcs remaining',
      minStock: 'Min. Stock: 100 pcs'
    },
    {
      name: 'Car Shampoo',
      remaining: 'Only 60 pcs remaining',
      minStock: 'Min. Stock: 80 pcs'
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
            <Text style={styles.mainTitle}>Inventory Management</Text>
            <Text style={styles.subTitle}>Track, issue and manage inventory</Text>
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
              <Icon name="cube-outline" size={16} color="#2563EB" />
            </View>
            <Text style={styles.cardVal}>₹48,650</Text>
            <Text style={styles.cardLabel}>Total Stock Value</Text>
          </Card>

          <Card variant="elevated" style={styles.analyticsCard}>
            <View style={[styles.cardIconBg, { backgroundColor: '#ECFDF5' }]}>
              <Icon name="upload-outline" size={16} color="#16A34A" />
            </View>
            <Text style={styles.cardVal}>₹8,750</Text>
            <Text style={styles.cardLabel}>Issued Today</Text>
          </Card>

          <Card variant="elevated" style={styles.analyticsCard}>
            <View style={[styles.cardIconBg, { backgroundColor: '#FFF7ED' }]}>
              <Icon name="keyboard-backspace" size={16} color="#F97316" style={{ transform: [{ scaleX: -1 }] }} />
            </View>
            <Text style={styles.cardVal}>₹3,240</Text>
            <Text style={styles.cardLabel}>Pending Returns</Text>
          </Card>

          <Card variant="elevated" style={styles.analyticsCard}>
            <View style={[styles.cardIconBg, { backgroundColor: '#FEF2F2' }]}>
              <Icon name="alert-circle-outline" size={16} color="#EF4444" />
            </View>
            <Text style={styles.cardVal}>12</Text>
            <Text style={styles.cardLabel}>Low Stock Items</Text>
          </Card>
        </View>

        {/* Quick Actions Row */}
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionItem}>
            <View style={[styles.qaIconBg, { backgroundColor: '#EFF6FF' }]}>
              <Icon name="export" size={22} color="#2563EB" />
            </View>
            <Text style={styles.qaLabel}>Issue Inventory</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionItem}>
            <View style={[styles.qaIconBg, { backgroundColor: '#ECFDF5' }]}>
              <Icon name="import" size={22} color="#10B981" />
            </View>
            <Text style={styles.qaLabel}>Receive Inventory</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionItem}>
            <View style={[styles.qaIconBg, { backgroundColor: '#FAF5FF' }]}>
              <Icon name="history" size={22} color="#8B5CF6" />
            </View>
            <Text style={styles.qaLabel}>Inventory History</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionItem}>
            <View style={[styles.qaIconBg, { backgroundColor: '#FEF2F2' }]}>
              <Icon name="bell-ring-outline" size={22} color="#EF4444" />
            </View>
            <Text style={[styles.qaLabel, { color: '#EF4444' }]}>Stock Alerts</Text>
          </TouchableOpacity>
        </View>

        {/* Search Row */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Icon name="magnify" size={20} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search item or category..."
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

        {/* Inventory Logs Table */}
        <Card variant="elevated" style={styles.tableCard}>
          <View style={styles.tableWrapper}>
            {/* Headers */}
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCol, { width: '25%' }]}>Item</Text>
              <Text style={[styles.headerCol, { width: '15%' }]}>Category</Text>
              <Text style={[styles.headerCol, { width: '12%', textAlign: 'center' }]}>Quantity</Text>
              <Text style={[styles.headerCol, { width: '22%' }]}>Issued To</Text>
              <Text style={[styles.headerCol, { width: '12%', textAlign: 'center' }]}>Balance</Text>
              <Text style={[styles.headerCol, { width: '14%' }]}>Status</Text>
            </View>

            {/* Rows */}
            {inventoryItems.map((item, idx) => (
              <View key={idx} style={styles.tableRow}>
                {/* Item */}
                <View style={[styles.rowCell, { width: '25%', flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                  <Image source={require('../../assets/cleaner_avatar.png')} style={styles.tableAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tableTextBold} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.tableTextSub}>{item.code}</Text>
                  </View>
                </View>

                {/* Category */}
                <View style={[styles.rowCell, { width: '15%' }]}>
                  <View style={[styles.categoryTag, { backgroundColor: item.categoryColor }]}>
                    <Text style={[styles.categoryTagTxt, { color: item.categoryTxtColor }]}>{item.category}</Text>
                  </View>
                </View>

                {/* Quantity */}
                <View style={[styles.rowCell, { width: '12%', alignItems: 'center' }]}>
                  <Text style={styles.tableQtyTxt}>{item.qty}</Text>
                </View>

                {/* Issued To */}
                <View style={[styles.rowCell, { width: '22%' }]}>
                  <Text style={styles.tableIssuedTxt}>{item.issuedTo}</Text>
                </View>

                {/* Balance */}
                <View style={[styles.rowCell, { width: '12%', alignItems: 'center' }]}>
                  <Text style={[styles.tableBalanceTxt, { color: item.balanceColor }]}>{item.balance}</Text>
                </View>

                {/* Status */}
                <View style={[styles.rowCell, { width: '14%' }]}>
                  <View style={[styles.statusTag, { backgroundColor: item.statusBg }]}>
                    <Text style={[styles.statusTagTxt, { color: item.statusColor }]}>{item.status}</Text>
                  </View>
                </View>

                {/* ActionDots */}
                <TouchableOpacity style={styles.rowDotBtn}>
                  <Icon name="dots-vertical" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </Card>

        {/* Low Stock Alerts Section */}
        <View style={styles.lowStockSectionHeader}>
          <Text style={styles.lowStockSectionTitle}>Low Stock Alerts</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllAlertsTxt}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.lowStockAlertsList}>
          {lowStockAlerts.map((alert, idx) => (
            <Card key={idx} variant="elevated" style={styles.lowStockAlertCard}>
              <View style={styles.alertCardContent}>
                <Image source={require('../../assets/cleaner_avatar.png')} style={styles.alertAvatar} />
                <View style={styles.alertDetailsCol}>
                  <Text style={styles.alertItemName}>{alert.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
                    <Text style={styles.alertRemainingTxt}>{alert.remaining}</Text>
                    <View style={styles.miniDivider} />
                    <Text style={styles.alertMinStockTxt}>{alert.minStock}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.restockBtn}>
                  <Text style={styles.restockBtnTxt}>Restock Now</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
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
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  cardLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
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
    marginBottom: 20,
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
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  categoryTagTxt: {
    fontSize: 9,
    fontWeight: '700',
  },
  tableQtyTxt: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E293B',
  },
  tableIssuedTxt: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
    lineHeight: 14,
  },
  tableBalanceTxt: {
    fontSize: 11,
    fontWeight: '750',
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
  rowDotBtn: {
    position: 'absolute',
    right: 4,
    top: '35%',
  },
  lowStockSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  lowStockSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  viewAllAlertsTxt: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  lowStockAlertsList: {
    gap: 10,
  },
  lowStockAlertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  alertCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  alertDetailsCol: {
    flex: 1,
    paddingLeft: 12,
  },
  alertItemName: {
    fontSize: 12,
    fontWeight: '750',
    color: '#1E293B',
  },
  alertRemainingTxt: {
    fontSize: 10,
    fontWeight: '600',
    color: '#EF4444',
  },
  miniDivider: {
    width: 1,
    height: 10,
    backgroundColor: '#CBD5E1',
  },
  alertMinStockTxt: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  restockBtn: {
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  restockBtnTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
});

export default InventoryListScreen;
