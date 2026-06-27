import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image, Platform, Dimensions, StatusBar } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchTaskStats, fetchTasks } from '../../redux/slices/taskSlice';
import { fetchCleanerStats } from '../../redux/slices/cleanerSlice';
import { fetchUnreadCount } from '../../redux/slices/notificationSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Props { navigation: any }

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();
  const { supervisor } = useSelector((s: RootState) => s.auth);
  const { stats: taskStats } = useSelector((s: RootState) => s.tasks);
  const { stats: cleanerStats } = useSelector((s: RootState) => s.cleaners);
  const { unreadCount } = useSelector((s: RootState) => s.notifications);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    dispatch(fetchTaskStats());
    dispatch(fetchCleanerStats());
    dispatch(fetchUnreadCount());
    dispatch(fetchTasks({ limit: 5 }));
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const unsub = navigation.addListener('focus', load); return unsub; }, [navigation, load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setTimeout(() => setRefreshing(false), 500); };

  const navigateTo = (target: string) => {
    const tabMap: Record<string, string> = {
      ApartmentList: 'ApartmentsTab',
      CustomerList: 'CustomersTab',
      CleanerList: 'CleanersTab',
      QRList: 'MoreTab',
      SalaryIncentives: 'CleanersTab',
      GrievanceList: 'MoreTab',
      InventoryList: 'MoreTab',
      Profile: 'MoreTab',
      NewOnboarding: 'CustomersTab',
      WorkApprovalList: 'WorkTab',
      QRAssignment: 'ApartmentsTab',
    };
    const tab = tabMap[target];
    if (tab) {
      navigation.navigate(tab as any, { screen: target });
    } else {
      navigation.navigate(target);
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
            <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Notifications')}>
              <Icon name="bell-outline" size={24} color="#1E293B" />
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadCount > 0 ? unreadCount : '12'}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.profileDropdown} onPress={() => navigateTo('Profile')}>
              <Image source={require('../../assets/cleaner_avatar.png')} style={styles.avatarMini} />
              <Text style={styles.profileDropdownRole}>Supervisor</Text>
              <Icon name="chevron-down" size={14} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryBlue} />}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeRow}>
          <View>
            <Text style={styles.welcomeTitle}>Good Morning, {supervisor?.firstName || 'Supervisor'} 👋</Text>
            <Text style={styles.welcomeSub}>Here's what's happening with your operations today.</Text>
          </View>
          <TouchableOpacity style={styles.datePickerBtn}>
            <Icon name="calendar-month-outline" size={16} color="#2563EB" />
            <Text style={styles.datePickerTxt}>May 25, 2025</Text>
            <Icon name="chevron-down" size={14} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Analytics Card Grid */}
        <View style={styles.analyticsGrid}>
          {/* Card 1 */}
          <Card variant="elevated" style={styles.analyticsCard}>
            <View style={[styles.cardIconBg, { backgroundColor: '#EFF6FF' }]}>
              <Icon name="office-building" size={20} color="#2563EB" />
            </View>
            <Text style={styles.cardValue}>125</Text>
            <Text style={styles.cardLabel}>Total Apartments</Text>
            <Text style={[styles.cardTrend, { color: '#16A34A' }]}>↑ 8 <Text style={styles.trendLabel}>from yesterday</Text></Text>
          </Card>

          {/* Card 2 */}
          <Card variant="elevated" style={styles.analyticsCard}>
            <View style={[styles.cardIconBg, { backgroundColor: '#ECFDF5' }]}>
              <Icon name="account-multiple" size={20} color="#10B981" />
            </View>
            <Text style={styles.cardValue}>{cleanerStats?.totalCleaners || 320}</Text>
            <Text style={styles.cardLabel}>Assigned Cleaners</Text>
            <Text style={[styles.cardTrend, { color: '#16A34A' }]}>↑ 12 <Text style={styles.trendLabel}>from yesterday</Text></Text>
          </Card>

          {/* Card 3 */}
          <Card variant="elevated" style={styles.analyticsCard}>
            <View style={[styles.cardIconBg, { backgroundColor: '#FAF5FF' }]}>
              <Icon name="calendar-check" size={20} color="#8B5CF6" />
            </View>
            <Text style={styles.cardValue}>298</Text>
            <Text style={styles.cardLabel}>Today's Attendance</Text>
            <Text style={[styles.cardTrend, { color: '#16A34A' }]}>93% <Text style={styles.trendLabel}>Present</Text></Text>
          </Card>

          {/* Card 4 */}
          <Card variant="elevated" style={styles.analyticsCard}>
            <View style={[styles.cardIconBg, { backgroundColor: '#FFF7ED' }]}>
              <Icon name="car" size={20} color="#F97316" />
            </View>
            <Text style={styles.cardValue}>540</Text>
            <Text style={styles.cardLabel}>Cars Assigned</Text>
            <Text style={[styles.cardTrend, { color: '#16A34A' }]}>↑ 15 <Text style={styles.trendLabel}>from yesterday</Text></Text>
          </Card>

          {/* Card 5 */}
          <Card variant="elevated" style={styles.analyticsCard}>
            <View style={[styles.cardIconBg, { backgroundColor: '#FFFBEB' }]}>
              <Icon name="clipboard-check-outline" size={20} color="#D97706" />
            </View>
            <Text style={styles.cardValue}>{taskStats?.pendingApproval || 18}</Text>
            <Text style={styles.cardLabel}>Pending Approvals</Text>
            <Text style={[styles.cardActionLabel, { color: '#EA580C' }]}>Needs your action</Text>
          </Card>

          {/* Card 6 */}
          <Card variant="elevated" style={styles.analyticsCard}>
            <View style={[styles.cardIconBg, { backgroundColor: '#F0FDF4' }]}>
              <Icon name="check-decagram" size={20} color="#16A34A" />
            </View>
            <Text style={styles.cardValue}>186</Text>
            <Text style={styles.cardLabel}>Today's Completed</Text>
            <Text style={[styles.cardTrend, { color: '#16A34A' }]}>↑ 20 <Text style={styles.trendLabel}>from yesterday</Text></Text>
          </Card>

          {/* Card 7 */}
          <Card variant="elevated" style={styles.analyticsCard}>
            <View style={[styles.cardIconBg, { backgroundColor: '#FEF2F2' }]}>
              <Icon name="message-alert-outline" size={20} color="#EF4444" />
            </View>
            <Text style={styles.cardValue}>{taskStats?.openComplaints || 7}</Text>
            <Text style={styles.cardLabel}>Open Complaints</Text>
            <Text style={[styles.cardActionLabel, { color: '#DC2626' }]}>Needs attention</Text>
          </Card>

          {/* Card 8 */}
          <Card variant="elevated" style={styles.analyticsCard}>
            <View style={[styles.cardIconBg, { backgroundColor: '#EFF6FF' }]}>
              <Icon name="package-variant-closed" size={20} color="#2563EB" />
            </View>
            <Text style={styles.cardValue}>₹48,650</Text>
            <Text style={styles.cardLabel}>Inventory Balance</Text>
            <Text style={[styles.cardTrend, { color: '#64748B' }]}>Updated just now</Text>
          </Card>
        </View>

        {/* Charts Row 1 */}
        <View style={styles.chartsRow}>
          {/* Chart 1: Weekly Cleaning Trend */}
          <Card variant="elevated" style={styles.chartCard}>
            <View style={styles.chartHeaderRow}>
              <Text style={styles.chartTitle}>Weekly Cleaning Trend</Text>
              <TouchableOpacity style={styles.chartFilterBtn}>
                <Text style={styles.chartFilterTxt}>This Week</Text>
                <Icon name="chevron-down" size={14} color="#64748B" />
              </TouchableOpacity>
            </View>
            {/* Mock Trend Chart */}
            <View style={styles.trendChartContainer}>
              <View style={styles.chartYGrid}>
                <Text style={styles.yAxisLabel}>300</Text>
                <Text style={styles.yAxisLabel}>200</Text>
                <Text style={styles.yAxisLabel}>100</Text>
                <Text style={styles.yAxisLabel}>0</Text>
              </View>
              <View style={styles.lineChartMock}>
                {/* Simulated area/line plot using vertical offset components */}
                <View style={styles.mockAreaFill} />
                <View style={styles.trendBarsRow}>
                  <View style={[styles.trendBar, { height: '30%' }]} />
                  <View style={[styles.trendBar, { height: '45%' }]} />
                  <View style={[styles.trendBar, { height: '38%' }]} />
                  <View style={[styles.trendBar, { height: '55%' }]} />
                  <View style={[styles.trendBar, { height: '42%' }]} />
                  <View style={[styles.trendBar, { height: '70%', backgroundColor: '#2563EB' }]}>
                    <View style={styles.trendTooltip}>
                      <Text style={styles.trendTooltipTxt}>186</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.xAxisRow}>
              <Text style={styles.xAxisLabel}>Mon</Text>
              <Text style={styles.xAxisLabel}>Tue</Text>
              <Text style={styles.xAxisLabel}>Wed</Text>
              <Text style={styles.xAxisLabel}>Thu</Text>
              <Text style={styles.xAxisLabel}>Fri</Text>
              <Text style={styles.xAxisLabel}>Sat</Text>
              <Text style={styles.xAxisLabel}>Sun</Text>
            </View>
          </Card>

          {/* Chart 2: Cleaner Performance */}
          <Card variant="elevated" style={styles.chartCard}>
            <View style={styles.chartHeaderRow}>
              <Text style={styles.chartTitle}>Cleaner Performance</Text>
              <TouchableOpacity style={styles.chartFilterBtn}>
                <Text style={styles.chartFilterTxt}>This Week</Text>
                <Icon name="chevron-down" size={14} color="#64748B" />
              </TouchableOpacity>
            </View>
            {/* Mock Cleaner Performance Bar Chart */}
            <View style={styles.perfChartContainer}>
              <View style={styles.barChartContent}>
                <View style={styles.barCol}>
                  <Text style={styles.barPctTxt}>98%</Text>
                  <View style={[styles.perfBar, { height: 100, backgroundColor: '#2563EB' }]} />
                  <Image source={require('../../assets/cleaner_avatar.png')} style={styles.barAvatar} />
                  <Text style={styles.barName}>Ramesh</Text>
                </View>

                <View style={styles.barCol}>
                  <Text style={styles.barPctTxt}>92%</Text>
                  <View style={[styles.perfBar, { height: 88, backgroundColor: '#3B82F6' }]} />
                  <Image source={require('../../assets/cleaner_avatar.png')} style={styles.barAvatar} />
                  <Text style={styles.barName}>Suresh</Text>
                </View>

                <View style={styles.barCol}>
                  <Text style={styles.barPctTxt}>90%</Text>
                  <View style={[styles.perfBar, { height: 85, backgroundColor: '#60A5FA' }]} />
                  <Image source={require('../../assets/cleaner_avatar.png')} style={styles.barAvatar} />
                  <Text style={styles.barName}>Vikram</Text>
                </View>

                <View style={styles.barCol}>
                  <Text style={styles.barPctTxt}>88%</Text>
                  <View style={[styles.perfBar, { height: 80, backgroundColor: '#93C5FD' }]} />
                  <Image source={require('../../assets/cleaner_avatar.png')} style={styles.barAvatar} />
                  <Text style={styles.barName}>Arjun</Text>
                </View>

                <View style={styles.barCol}>
                  <Text style={styles.barPctTxt}>85%</Text>
                  <View style={[styles.perfBar, { height: 75, backgroundColor: '#BFDBFE' }]} />
                  <Image source={require('../../assets/cleaner_avatar.png')} style={styles.barAvatar} />
                  <Text style={styles.barName}>Imran</Text>
                </View>
              </View>
            </View>
          </Card>
        </View>

        {/* Charts Row 2 */}
        <View style={styles.chartsRow}>
          {/* Chart 3: Apartment-wise Cleanings */}
          <Card variant="elevated" style={styles.chartCard}>
            <View style={styles.chartHeaderRow}>
              <Text style={styles.chartTitle}>Apartment-wise Cleanings</Text>
              <TouchableOpacity style={styles.chartFilterBtn}>
                <Text style={styles.chartFilterTxt}>This Week</Text>
                <Icon name="chevron-down" size={14} color="#64748B" />
              </TouchableOpacity>
            </View>
            <View style={styles.donutContainer}>
              {/* Left Circular Donut Diagram */}
              <View style={styles.donutGraphic}>
                <View style={[styles.donutSector, { borderColor: '#2563EB', transform: [{ rotate: '0deg' }] }]} />
                <View style={[styles.donutSector, { borderColor: '#10B981', transform: [{ rotate: '93.6deg' }] }]} />
                <View style={[styles.donutSector, { borderColor: '#F59E0B', transform: [{ rotate: '176.4deg' }] }]} />
                <View style={[styles.donutSector, { borderColor: '#8B5CF6', transform: [{ rotate: '244.8deg' }] }]} />
                <View style={[styles.donutSector, { borderColor: '#94A3B8', transform: [{ rotate: '302.4deg' }] }]} />
                <View style={styles.donutCenter}>
                  <Text style={styles.donutCenterLabel}>Total</Text>
                  <Text style={styles.donutCenterVal}>186</Text>
                </View>
              </View>
              
              {/* Legend Column */}
              <View style={styles.donutLegend}>
                <View style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: '#2563EB' }]} />
                  <Text style={styles.legendLabelText}>Green View</Text>
                  <Text style={styles.legendValueText}>48 (26%)</Text>
                </View>
                <View style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.legendLabelText}>Sunshine Heights</Text>
                  <Text style={styles.legendValueText}>42 (23%)</Text>
                </View>
                <View style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                  <Text style={styles.legendLabelText}>Maple Residency</Text>
                  <Text style={styles.legendValueText}>36 (19%)</Text>
                </View>
                <View style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
                  <Text style={styles.legendLabelText}>Skyline Towers</Text>
                  <Text style={styles.legendValueText}>30 (16%)</Text>
                </View>
                <View style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: '#94A3B8' }]} />
                  <Text style={styles.legendLabelText}>Others</Text>
                  <Text style={styles.legendValueText}>30 (16%)</Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Chart 4: Attendance Analytics */}
          <Card variant="elevated" style={styles.chartCard}>
            <View style={styles.chartHeaderRow}>
              <Text style={styles.chartTitle}>Attendance Analytics</Text>
              <TouchableOpacity style={styles.chartFilterBtn}>
                <Text style={styles.chartFilterTxt}>Today</Text>
                <Icon name="chevron-down" size={14} color="#64748B" />
              </TouchableOpacity>
            </View>
            <View style={styles.donutContainer}>
              {/* Left Circular Donut Diagram */}
              <View style={styles.donutGraphic}>
                <View style={[styles.donutSector, { borderColor: '#10B981', transform: [{ rotate: '0deg' }] }]} />
                <View style={[styles.donutSector, { borderColor: '#EF4444', transform: [{ rotate: '334.8deg' }] }]} />
                <View style={[styles.donutSector, { borderColor: '#F59E0B', transform: [{ rotate: '349.2deg' }] }]} />
                <View style={[styles.donutSector, { borderColor: '#3B82F6', transform: [{ rotate: '356.4deg' }] }]} />
                <View style={styles.donutCenter}>
                  <Text style={styles.donutCenterLabel}>Total</Text>
                  <Text style={styles.donutCenterVal}>320</Text>
                </View>
              </View>
              
              {/* Legend Column */}
              <View style={styles.donutLegend}>
                <View style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.legendLabelText}>Present</Text>
                  <Text style={styles.legendValueText}>298 (93%)</Text>
                </View>
                <View style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                  <Text style={styles.legendLabelText}>Absent</Text>
                  <Text style={styles.legendValueText}>14 (4%)</Text>
                </View>
                <View style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                  <Text style={styles.legendLabelText}>Late</Text>
                  <Text style={styles.legendValueText}>6 (2%)</Text>
                </View>
                <View style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                  <Text style={styles.legendLabelText}>On Leave</Text>
                  <Text style={styles.legendValueText}>2 (1%)</Text>
                </View>
              </View>
            </View>
          </Card>
        </View>

        {/* Section: Row 3 Lists */}
        <View style={styles.sectionRow}>
          {/* List 1: Recent Activities */}
          <Card variant="elevated" style={styles.listCard}>
            <View style={styles.listHeaderRow}>
              <Text style={styles.listSectionTitle}>Recent Activities</Text>
              <TouchableOpacity onPress={() => navigateTo('DailyWorkMonitoring')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.activityList}>
              <View style={styles.activityItem}>
                <View style={[styles.activityIconBg, { backgroundColor: '#DCFCE7' }]}>
                  <Icon name="check-bold" size={14} color="#16A34A" />
                </View>
                <View style={styles.activityTextCol}>
                  <Text style={styles.activityTitle}>Cleaning approved</Text>
                  <Text style={styles.activitySub}>Sunshine Heights • Car #KA01AB1234</Text>
                  <Text style={styles.activityTime}>10:30 AM</Text>
                </View>
              </View>

              <View style={styles.activityItem}>
                <View style={[styles.activityIconBg, { backgroundColor: '#EFF6FF' }]}>
                  <Icon name="account-plus-outline" size={14} color="#2563EB" />
                </View>
                <View style={styles.activityTextCol}>
                  <Text style={styles.activityTitle}>Cleaner assigned</Text>
                  <Text style={styles.activitySub}>Ramesh • Green View Apartment</Text>
                  <Text style={styles.activityTime}>09:45 AM</Text>
                </View>
              </View>

              <View style={styles.activityItem}>
                <View style={[styles.activityIconBg, { backgroundColor: '#FFF7ED' }]}>
                  <Icon name="package-variant" size={14} color="#F97316" />
                </View>
                <View style={styles.activityTextCol}>
                  <Text style={styles.activityTitle}>Inventory issued</Text>
                  <Text style={styles.activitySub}>Cleaning Kit • 2 Sets</Text>
                  <Text style={styles.activityTime}>09:15 AM</Text>
                </View>
              </View>

              <View style={styles.activityItem}>
                <View style={[styles.activityIconBg, { backgroundColor: '#FEF2F2' }]}>
                  <Icon name="message-alert-outline" size={14} color="#EF4444" />
                </View>
                <View style={styles.activityTextCol}>
                  <Text style={styles.activityTitle}>New complaint received</Text>
                  <Text style={styles.activitySub}>Skyline Towers • Parking Area</Text>
                  <Text style={styles.activityTime}>08:50 AM</Text>
                </View>
              </View>

              <View style={styles.activityItem}>
                <View style={[styles.activityIconBg, { backgroundColor: '#E0F2FE' }]}>
                  <Icon name="check-all" size={14} color="#0284C7" />
                </View>
                <View style={styles.activityTextCol}>
                  <Text style={styles.activityTitle}>Cleaning completed</Text>
                  <Text style={styles.activitySub}>Green View • Car #DL02CD5678</Text>
                  <Text style={styles.activityTime}>08:30 AM</Text>
                </View>
              </View>
            </View>
          </Card>

          {/* List 2: Pending Approvals */}
          <Card variant="elevated" style={styles.listCard}>
            <View style={styles.listHeaderRow}>
              <Text style={styles.listSectionTitle}>Pending Approvals</Text>
              <TouchableOpacity onPress={() => navigateTo('WorkApprovalList')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.approvalList}>
              <View style={styles.approvalItem}>
                <Image source={{ uri: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=200' }} style={styles.carThumb} />
                <View style={styles.approvalTextCol}>
                  <Text style={styles.carName}>Sunshine Heights</Text>
                  <Text style={styles.plateNumber}>KA01AB1234</Text>
                  <Text style={styles.cleanerName}>Ramesh • 10:20 AM</Text>
                </View>
                <TouchableOpacity style={styles.reviewBtn} onPress={() => navigateTo('WorkApprovalList')}>
                  <Text style={styles.reviewBtnTxt}>Review</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.approvalItem}>
                <Image source={{ uri: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=200' }} style={styles.carThumb} />
                <View style={styles.approvalTextCol}>
                  <Text style={styles.carName}>Maple Residency</Text>
                  <Text style={styles.plateNumber}>DL02CD5678</Text>
                  <Text style={styles.cleanerName}>Suresh • 09:55 AM</Text>
                </View>
                <TouchableOpacity style={styles.reviewBtn} onPress={() => navigateTo('WorkApprovalList')}>
                  <Text style={styles.reviewBtnTxt}>Review</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.approvalItem}>
                <Image source={{ uri: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=200' }} style={styles.carThumb} />
                <View style={styles.approvalTextCol}>
                  <Text style={styles.carName}>Green View</Text>
                  <Text style={styles.plateNumber}>UP16EF9012</Text>
                  <Text style={styles.cleanerName}>Arjun • 09:40 AM</Text>
                </View>
                <TouchableOpacity style={styles.reviewBtn} onPress={() => navigateTo('WorkApprovalList')}>
                  <Text style={styles.reviewBtnTxt}>Review</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.footerLinkBtn} onPress={() => navigateTo('WorkApprovalList')}>
              <Text style={styles.footerLinkBtnTxt}>See All Pending Approvals</Text>
              <Icon name="chevron-right" size={16} color="#2563EB" />
            </TouchableOpacity>
          </Card>

          {/* List 3: Low Inventory Alerts */}
          <Card variant="elevated" style={styles.listCard}>
            <View style={styles.listHeaderRow}>
              <Text style={styles.listSectionTitle}>Low Inventory Alert</Text>
              <TouchableOpacity onPress={() => navigateTo('InventoryList')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inventoryList}>
              <View style={styles.inventoryItem}>
                <View style={styles.inventoryIconWrapper}>
                  <Icon name="bottle-tonic-outline" size={24} color="#64748B" />
                </View>
                <View style={styles.inventoryTextCol}>
                  <Text style={styles.inventoryName}>Car Shampoo</Text>
                  <Text style={styles.inventoryStock}>Stock: <Text style={{fontWeight: '700', color: '#DC2626'}}>5</Text></Text>
                </View>
                <View style={styles.minStockBox}>
                  <Text style={styles.minStockTxt}>Min: 20</Text>
                </View>
              </View>

              <View style={styles.inventoryItem}>
                <View style={styles.inventoryIconWrapper}>
                  <Icon name="tshirt-crew-outline" size={24} color="#64748B" />
                </View>
                <View style={styles.inventoryTextCol}>
                  <Text style={styles.inventoryName}>Microfiber Cloth</Text>
                  <Text style={styles.inventoryStock}>Stock: <Text style={{fontWeight: '700', color: '#DC2626'}}>8</Text></Text>
                </View>
                <View style={styles.minStockBox}>
                  <Text style={styles.minStockTxt}>Min: 30</Text>
                </View>
              </View>

              <View style={styles.inventoryItem}>
                <View style={styles.inventoryIconWrapper}>
                  <Icon name="disc-alert" size={24} color="#64748B" />
                </View>
                <View style={styles.inventoryTextCol}>
                  <Text style={styles.inventoryName}>Tyre Shine</Text>
                  <Text style={styles.inventoryStock}>Stock: <Text style={{fontWeight: '700', color: '#DC2626'}}>6</Text></Text>
                </View>
                <View style={styles.minStockBox}>
                  <Text style={styles.minStockTxt}>Min: 20</Text>
                </View>
              </View>

              <View style={styles.inventoryItem}>
                <View style={styles.inventoryIconWrapper}>
                  <Icon name="spray-bottle" size={24} color="#64748B" />
                </View>
                <View style={styles.inventoryTextCol}>
                  <Text style={styles.inventoryName}>Glass Cleaner</Text>
                  <Text style={styles.inventoryStock}>Stock: <Text style={{fontWeight: '700', color: '#DC2626'}}>4</Text></Text>
                </View>
                <View style={styles.minStockBox}>
                  <Text style={styles.minStockTxt}>Min: 15</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.footerLinkBtn} onPress={() => navigateTo('InventoryList')}>
              <Text style={styles.footerLinkBtnTxt}>Manage Inventory</Text>
              <Icon name="chevron-right" size={16} color="#2563EB" />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Bottom Row Tasks & Quick Actions */}
        <View style={styles.bottomRowContainer}>
          {/* Today's Tasks */}
          <Card variant="elevated" style={styles.tasksCard}>
            <Text style={styles.tasksTitle}>Today's Tasks</Text>
            
            <View style={styles.taskList}>
              <TouchableOpacity style={styles.taskItem}>
                <View style={styles.checkboxCircle}>
                  <Icon name="circle-outline" size={20} color="#94A3B8" />
                </View>
                <View style={styles.taskTextCol}>
                  <View style={styles.taskHeaderLine}>
                    <Text style={styles.taskName}>Review 18 pending approvals</Text>
                    <View style={[styles.priorityBadge, { backgroundColor: '#FEE2E2' }]}>
                      <Text style={[styles.priorityBadgeTxt, { color: '#EF4444' }]}>High Priority</Text>
                    </View>
                  </View>
                  <Text style={styles.taskDue}><Icon name="clock-outline" size={12} /> Due Today, 12:00 PM</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.taskItem}>
                <View style={styles.checkboxCircle}>
                  <Icon name="circle-outline" size={20} color="#94A3B8" />
                </View>
                <View style={styles.taskTextCol}>
                  <View style={styles.taskHeaderLine}>
                    <Text style={styles.taskName}>Verify attendance & leaves</Text>
                    <View style={[styles.priorityBadge, { backgroundColor: '#FFF7ED' }]}>
                      <Text style={[styles.priorityBadgeTxt, { color: '#F97316' }]}>Medium Priority</Text>
                    </View>
                  </View>
                  <Text style={styles.taskDue}><Icon name="clock-outline" size={12} /> Due Today, 02:00 PM</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.taskItem}>
                <View style={styles.checkboxCircle}>
                  <Icon name="circle-outline" size={20} color="#94A3B8" />
                </View>
                <View style={styles.taskTextCol}>
                  <View style={styles.taskHeaderLine}>
                    <Text style={styles.taskName}>Inspect Sunshine Heights audit</Text>
                    <View style={[styles.priorityBadge, { backgroundColor: '#FFF7ED' }]}>
                      <Text style={[styles.priorityBadgeTxt, { color: '#F97316' }]}>Medium Priority</Text>
                    </View>
                  </View>
                  <Text style={styles.taskDue}><Icon name="clock-outline" size={12} /> Due Today, 04:00 PM</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.taskItem}>
                <View style={styles.checkboxCircle}>
                  <Icon name="circle-outline" size={20} color="#94A3B8" />
                </View>
                <View style={styles.taskTextCol}>
                  <View style={styles.taskHeaderLine}>
                    <Text style={styles.taskName}>Resolve open complaints (7)</Text>
                    <View style={[styles.priorityBadge, { backgroundColor: '#FEE2E2' }]}>
                      <Text style={[styles.priorityBadgeTxt, { color: '#EF4444' }]}>High Priority</Text>
                    </View>
                  </View>
                  <Text style={styles.taskDue}><Icon name="clock-outline" size={12} /> Due Today, 06:00 PM</Text>
                </View>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Quick Actions Grid */}
          <Card variant="elevated" style={styles.quickActionsCard}>
            <Text style={styles.tasksTitle}>Quick Actions</Text>
            
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity style={styles.qaGridItem} onPress={() => navigateTo('WorkApprovalList')}>
                <View style={[styles.qaGridIconWrapper, { backgroundColor: '#EFF6FF' }]}>
                  <Icon name="shield-check" size={26} color="#2563EB" />
                </View>
                <Text style={styles.qaGridLabel}>Approve Cleaning</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.qaGridItem} onPress={() => navigateTo('CleanerList')}>
                <View style={[styles.qaGridIconWrapper, { backgroundColor: '#E8F5E9' }]}>
                  <Icon name="account-plus" size={26} color="#388E3C" />
                </View>
                <Text style={styles.qaGridLabel}>Assign Cleaner</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.qaGridItem} onPress={() => navigateTo('GrievanceList')}>
                <View style={[styles.qaGridIconWrapper, { backgroundColor: '#FFEBEE' }]}>
                  <Icon name="comment-alert" size={26} color="#D32F2F" />
                </View>
                <Text style={styles.qaGridLabel}>Raise Complaint</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.qaGridItem} onPress={() => navigateTo('InventoryList')}>
                <View style={[styles.qaGridIconWrapper, { backgroundColor: '#F3E5F5' }]}>
                  <Icon name="package-variant-closed" size={26} color="#7B1FA2" />
                </View>
                <Text style={styles.qaGridLabel}>Issue Inventory</Text>
              </TouchableOpacity>
            </View>
          </Card>
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
    fontFamily: 'Inter-Regular',
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
    fontSize: 11,
    fontWeight: '600',
    color: '#1E293B',
    marginHorizontal: 6,
    fontFamily: 'Inter-Medium',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  welcomeSub: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    marginTop: 2,
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
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  analyticsCard: {
    width: (width - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
  },
  cardIconBg: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    fontFamily: 'Inter-Medium',
    marginTop: 2,
  },
  cardTrend: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 8,
    fontFamily: 'Inter-Bold',
  },
  trendLabel: {
    fontWeight: '500',
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  cardActionLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 8,
    fontFamily: 'Inter-Bold',
  },
  chartsRow: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 16,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  chartFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chartFilterTxt: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginRight: 4,
  },
  trendChartContainer: {
    height: 120,
    flexDirection: 'row',
  },
  chartYGrid: {
    justifyContent: 'space-between',
    paddingRight: 8,
    height: '100%',
  },
  yAxisLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontFamily: 'Inter-Medium',
    textAlign: 'right',
  },
  lineChartMock: {
    flex: 1,
    height: '100%',
    position: 'relative',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  mockAreaFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
  },
  trendBarsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '100%',
    paddingBottom: 2,
  },
  trendBar: {
    width: 6,
    backgroundColor: '#93C5FD',
    borderRadius: 3,
    position: 'relative',
  },
  trendTooltip: {
    position: 'absolute',
    top: -24,
    left: -12,
    backgroundColor: '#2563EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trendTooltipTxt: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  xAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingLeft: 24,
    marginTop: 8,
  },
  xAxisLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontFamily: 'Inter-Medium',
  },
  perfChartContainer: {
    height: 130,
    justifyContent: 'flex-end',
  },
  barChartContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '100%',
  },
  barCol: {
    alignItems: 'center',
  },
  barPctTxt: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  perfBar: {
    width: 14,
    borderRadius: 4,
  },
  barAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginTop: 6,
  },
  barName: {
    fontSize: 8,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  donutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  donutGraphic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 10,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  donutSector: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 10,
    top: -10,
    left: -10,
  },
  donutCenter: {
    alignItems: 'center',
  },
  donutCenterLabel: {
    fontSize: 9,
    color: '#64748B',
    fontFamily: 'Inter-Medium',
  },
  donutCenterVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
    marginTop: -2,
  },
  donutLegend: {
    flex: 1,
    paddingLeft: 16,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendLabelText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
    flex: 1,
  },
  legendValueText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1E293B',
  },
  sectionRow: {
    gap: 16,
    marginBottom: 16,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  listSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
  },
  activityList: {
    gap: 14,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  activityIconBg: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  activityTextCol: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'Inter-Bold',
  },
  activitySub: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  activityTime: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 2,
  },
  approvalList: {
    gap: 12,
  },
  approvalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  carThumb: {
    width: 50,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
  },
  approvalTextCol: {
    flex: 1,
    paddingLeft: 12,
  },
  carName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  plateNumber: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
    marginTop: 1,
  },
  cleanerName: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
  },
  reviewBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  reviewBtnTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EA580C',
  },
  footerLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    paddingTop: 12,
    marginTop: 12,
  },
  footerLinkBtnTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    marginRight: 4,
  },
  inventoryList: {
    gap: 12,
  },
  inventoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  inventoryIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inventoryTextCol: {
    flex: 1,
    paddingLeft: 12,
  },
  inventoryName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  inventoryStock: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  minStockBox: {
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  minStockTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444',
  },
  bottomRowContainer: {
    gap: 16,
  },
  tasksCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  tasksTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
  },
  taskList: {
    gap: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  checkboxCircle: {
    marginRight: 10,
    marginTop: 2,
  },
  taskTextCol: {
    flex: 1,
  },
  taskHeaderLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  priorityBadgeTxt: {
    fontSize: 8,
    fontWeight: '700',
  },
  taskDue: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 4,
  },
  quickActionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  qaGridItem: {
    width: (width - 44 - 12) / 2,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  qaGridIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  qaGridLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
});

export default DashboardScreen;
