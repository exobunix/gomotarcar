import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image, Dimensions, Platform, StatusBar } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import { fetchTodayTasks } from '../../redux/slices/taskSlice';
import { AppDispatch, RootState } from '../../redux/store';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props { navigation: any }

const TaskListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { todayTasks, loading } = useSelector((s: RootState) => s.tasks);
  const { cleaner } = useSelector((s: RootState) => s.auth);
  const [filter, setFilter] = useState('all');
  const insets = useSafeAreaInsets();

  const load = useCallback(() => {
    if (cleaner?._id) {
      dispatch(fetchTodayTasks(cleaner._id));
    }
  }, [dispatch, cleaner?._id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const unsub = navigation.addListener('focus', load); return unsub; }, [navigation, load]);

  const filtered = todayTasks.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'assigned') return t.status === 'assigned' || t.status === 'pending';
    if (filter === 'in_progress') return t.status === 'in_progress';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  const totalTasks = todayTasks.length;
  const pendingTasks = todayTasks.filter(t => t.status === 'assigned' || t.status === 'pending').length;
  const inProgressTasks = todayTasks.filter(t => t.status === 'in_progress').length;
  const completedTasks = todayTasks.filter(t => t.status === 'completed').length;

  const filters = [
    { key: 'all', label: `All (${totalTasks})` },
    { key: 'assigned', label: `Pending (${pendingTasks})` },
    { key: 'in_progress', label: `In Progress (${inProgressTasks})` },
    { key: 'completed', label: `Completed (${completedTasks})` },
  ];

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Blue Header Background */}
      <View style={[styles.blueHeaderBg, { paddingTop: insets.top > 0 ? insets.top + 10 : (Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 40)) }]}>
        <View style={styles.topHeaderRow}>
          <View style={styles.headerTitles}>
            <Text style={styles.mainTitle}>Today's Tasks</Text>
            <Text style={styles.mainSubTitle}>Your assigned cleaning jobs for today</Text>
          </View>
          <View style={styles.headerIconsRow}>
            <TouchableOpacity style={{ padding: 4, marginRight: 8 }}>
              <Icon name="magnify" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 4 }}>
              <Icon name="bell-outline" size={24} color="#FFF" />
              <View style={styles.bellBadge}><Text style={styles.bellBadgeTxt}>3</Text></View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Floating Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryCol}>
          <View style={[styles.summaryIconBg, { backgroundColor: '#EFF6FF' }]}>
            <Icon name="clipboard-text-outline" size={20} color="#2563EB" />
          </View>
          <Text style={[styles.summaryNum, { color: '#2563EB' }]}>{totalTasks.toString().padStart(2, '0')}</Text>
          <Text style={styles.summaryLabel}>Total Tasks</Text>
        </View>
        
        <View style={styles.summaryDivider} />
        
        <View style={styles.summaryCol}>
          <View style={[styles.summaryIconBg, { backgroundColor: '#FFF7ED' }]}>
            <Icon name="clock-outline" size={20} color="#EA580C" />
          </View>
          <Text style={[styles.summaryNum, { color: '#EA580C' }]}>{pendingTasks.toString().padStart(2, '0')}</Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryCol}>
          <View style={[styles.summaryIconBg, { backgroundColor: '#ECFDF5' }]}>
            <Icon name="play-circle-outline" size={20} color="#10B981" />
          </View>
          <Text style={[styles.summaryNum, { color: '#10B981' }]}>{inProgressTasks.toString().padStart(2, '0')}</Text>
          <Text style={styles.summaryLabel}>In Progress</Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryCol}>
          <View style={[styles.summaryIconBg, { backgroundColor: '#F0FDF4' }]}>
            <Icon name="check-circle-outline" size={20} color="#16A34A" />
          </View>
          <Text style={[styles.summaryNum, { color: '#16A34A' }]}>{completedTasks.toString().padStart(2, '0')}</Text>
          <Text style={styles.summaryLabel}>Completed</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsScrollContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={f => f.key}
          renderItem={({ item: f }) => (
            <TouchableOpacity 
              style={[styles.filterChip, filter === f.key && styles.filterActive]} 
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Date & Filter Row */}
      <View style={styles.dateFilterRow}>
        <TouchableOpacity style={styles.dateSelector}>
          <Icon name="calendar-month-outline" size={18} color="#2563EB" />
          <Text style={styles.dateSelectorTxt}>15 May 2025</Text>
          <Icon name="chevron-down" size={18} color="#2563EB" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn}>
          <Icon name="filter-outline" size={16} color="#2563EB" />
          <Text style={styles.filterBtnTxt}>Filter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'completed': return { color: '#16A34A', bg: '#F0FDF4', icon: 'check-circle-outline', label: 'Completed' };
      case 'in_progress': return { color: '#16A34A', bg: '#F0FDF4', icon: 'play-circle-outline', label: 'In Progress' };
      default: return { color: '#EA580C', bg: '#FFF7ED', icon: 'clock-outline', label: 'Pending' };
    }
  };

  const getCardBorderColor = (status: string) => {
    switch (status) {
      case 'completed': return '#16A34A';
      case 'in_progress': return '#22C55E';
      default: return '#EA580C';
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const cleanTime = item.scheduledTime ? item.scheduledTime.replace(/^0([1-9][0-9]:)/, '$1') : '09:00 AM';
    const timeParts = cleanTime.split(' ');
    const timeVal = timeParts[0];
    const amPm = timeParts[1] || 'AM';
    const sStyle = getStatusStyles(item.status);
    const borderColor = getCardBorderColor(item.status);

    const cName = item.customerName || `${item.customerId?.firstName || ''} ${item.customerId?.lastName || ''}`.trim() || 'Unknown Client';
    const flatInfo = `Tower ${item.apartmentId?.tower || 'A'} • Flat ${item.apartmentId?.flatNumber || '101'}`;
    const vModel = item.vehicleModel || item.vehicleId?.model || 'Sedan';
    const vNum = item.vehicleNumber || item.vehicleId?.vehicleNumber || 'DL 01 AB 1234';
    const vType = item.vehicleType || 'Sedan';
    const pkg = item.packageName || item.packageType || 'Premium Wash';

    return (
      <TouchableOpacity onPress={() => navigation.navigate('TaskDetail', { taskId: item._id })} activeOpacity={0.8} style={styles.cardContainer}>
        <View style={styles.cardContent}>
          
          <View style={styles.timeCol}>
            <Text style={[styles.timeVal, { color: '#2563EB' }]}>{timeVal}</Text>
            <Text style={styles.timeAm}>{amPm}</Text>
          </View>

          {/* Vertical Border between Time and Data */}
          <View style={[styles.cardVerticalBorder, { backgroundColor: borderColor }]} />

          <View style={styles.midColsWrapper}>
            <Image source={require('../../assets/cleaner_avatar.png')} style={styles.avatar} />

            <View style={styles.mainInfoCol}>
              <Text style={styles.customerName} numberOfLines={1}>{cName}</Text>
              <View style={styles.locRow}>
                <Icon name="office-building" size={12} color="#64748B" />
                <Text style={styles.locText} numberOfLines={1}>{item.apartmentName || 'Green Valley Apartments'}</Text>
              </View>
              <View style={styles.locRow}>
                <Icon name="map-marker-outline" size={12} color="#2563EB" />
                <Text style={styles.locText} numberOfLines={1}>{flatInfo}</Text>
              </View>
            </View>

            <View style={styles.vehicleCol}>
              <View style={styles.vehicleTag}><Text style={styles.vehicleTagText}>{vType}</Text></View>
              <Text style={styles.vehicleNum} numberOfLines={1}>{vNum}</Text>
              <Text style={styles.packageText} numberOfLines={1}>{pkg}</Text>
            </View>
          </View>

          <View style={styles.statusCol}>
            <View style={[styles.statusBadge, { backgroundColor: sStyle.bg }]}>
               <Icon name={sStyle.icon} size={12} color={sStyle.color} />
               <Text style={[styles.statusBadgeText, { color: sStyle.color }]}>{sStyle.label}</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#CBD5E1" style={{marginLeft: 4}}/>
          </View>

        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={renderHeader}
        data={filtered}
        keyExtractor={(item, index) => item._id || index.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primaryBlue} />}
        ListEmptyComponent={<EmptyState icon="📋" title="No Jobs" description="No jobs scheduled for today matching this status." />}
        renderItem={renderItem}
        ListFooterComponent={
          <View style={styles.bottomBanner}>
            <View style={styles.bannerIconBg}>
               <Icon name="clipboard-check-multiple-outline" size={24} color="#2563EB" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.bannerTitle}>Keep it up!</Text>
              <Text style={styles.bannerDesc}>Complete more tasks to earn higher incentives.</Text>
            </View>
            <TouchableOpacity style={styles.incentiveBtn}>
               <Icon name="gift-outline" size={14} color="#2563EB" />
               <Text style={styles.incentiveBtnText}>View Incentives</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  headerContainer: {
    paddingBottom: 4,
  },
  blueHeaderBg: {
    backgroundColor: '#0D5BD7',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitles: {
    flex: 1,
  },
  mainTitle: { fontSize: 20, fontWeight: '700', color: '#FFF', fontFamily: 'Inter-Bold' },
  mainSubTitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter-Medium', marginTop: 2 },
  headerIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: 2,
    right: 4,
    backgroundColor: '#EF4444',
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#0D5BD7',
  },
  bellBadgeTxt: { color: '#FFF', fontSize: 8, fontWeight: '700' },
  
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 8,
    marginHorizontal: 16,
    marginTop: -40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 20,
  },
  summaryCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryNum: { fontSize: 22, fontWeight: '800', fontFamily: 'Inter-Bold' },
  summaryLabel: { fontSize: 10, color: colors.textSecondary, fontFamily: 'Inter-Medium', marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: '#E2E8F0', height: '80%', alignSelf: 'center' },

  tabsScrollContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  filterChip: { 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 24, 
    backgroundColor: '#F1F5F9',
    marginRight: 10,
  },
  filterActive: { backgroundColor: '#1D4ED8' },
  filterText: { fontSize: 13, color: '#475569', fontFamily: 'Inter-SemiBold', fontWeight: '600' },
  filterTextActive: { color: colors.white },
  
  dateFilterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateSelectorTxt: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
    marginHorizontal: 8,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  filterBtnTxt: { fontSize: 12, fontWeight: '600', color: '#2563EB', marginLeft: 6, fontFamily: 'Inter-SemiBold' },

  listContent: { paddingBottom: 40 },

  cardContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingRight: 12,
  },
  timeCol: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeVal: { fontSize: 14, fontWeight: '800', fontFamily: 'Inter-Bold' },
  timeAm: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 2 },
  cardVerticalBorder: {
    width: 2,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  midColsWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  mainInfoCol: {
    flex: 1.2,
    paddingRight: 4,
  },
  customerName: { fontSize: 13, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold', marginBottom: 4 },
  locRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  locText: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Regular', marginLeft: 4, flex: 1 },
  
  vehicleCol: {
    flex: 1,
    justifyContent: 'center',
  },
  vehicleTag: { alignSelf: 'flex-start', backgroundColor: '#EFF6FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginBottom: 4 },
  vehicleTagText: { fontSize: 9, color: '#2563EB', fontWeight: '600', fontFamily: 'Inter-SemiBold' },
  vehicleNum: { fontSize: 11, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold', marginBottom: 2 },
  packageText: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Regular' },

  statusCol: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: { fontSize: 10, fontWeight: '600', marginLeft: 4, fontFamily: 'Inter-SemiBold' },

  bottomBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bannerIconBg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: { fontSize: 13, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  bannerDesc: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Regular', marginTop: 2 },
  incentiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  incentiveBtnText: { fontSize: 10, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold', marginLeft: 4 },
});

export default TaskListScreen;
