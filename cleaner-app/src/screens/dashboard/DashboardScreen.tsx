import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Image, Platform, Dimensions, StatusBar } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import { fetchTodayTasks } from '../../redux/slices/taskSlice';
import { fetchTodayAttendance } from '../../redux/slices/attendanceSlice';
import { fetchEarnings } from '../../redux/slices/earningsSlice';
import { fetchUnreadCount } from '../../redux/slices/notificationSlice';
import { fetchPerformance } from '../../redux/slices/performanceSlice';
import { AppDispatch, RootState } from '../../redux/store';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Props { navigation: any }

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();
  const { cleaner } = useSelector((s: RootState) => s.auth);
  const { todayTasks } = useSelector((s: RootState) => s.tasks);
  const { summary } = useSelector((s: RootState) => s.earnings);
  const { unreadCount } = useSelector((s: RootState) => s.notifications);
  const { today } = useSelector((s: RootState) => s.attendance);
  
  const isCheckedIn = !!today?.checkIn && !today?.checkOut;
  const isComplete = !!today?.checkIn && !!today?.checkOut;
  const [refreshing, setRefreshing] = React.useState(false);
  const [elapsedTime, setElapsedTime] = React.useState('00:00:00');

  useEffect(() => {
    let timerInterval: any;
    if (isCheckedIn && today?.checkIn?.time) {
      const checkInTime = new Date(today.checkIn.time).getTime();
      
      const updateTimer = () => {
        const now = new Date().getTime();
        const diffMs = now - checkInTime;
        if (diffMs < 0) {
          setElapsedTime('00:00:00');
          return;
        }
        const diffSecs = Math.floor(diffMs / 1000);
        const hrs = Math.floor(diffSecs / 3600);
        const mins = Math.floor((diffSecs % 3600) / 60);
        const secs = diffSecs % 60;
        
        const hrsStr = hrs.toString().padStart(2, '0');
        const minsStr = mins.toString().padStart(2, '0');
        const secsStr = secs.toString().padStart(2, '0');
        setElapsedTime(`${hrsStr}:${minsStr}:${secsStr}`);
      };
      
      updateTimer();
      timerInterval = setInterval(updateTimer, 1000);
    } else {
      setElapsedTime('00:00:00');
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [isCheckedIn, today?.checkIn?.time]);

  const loadData = useCallback(() => {
    if (cleaner?._id) {
      dispatch(fetchTodayTasks(cleaner._id));
      dispatch(fetchTodayAttendance(cleaner._id));
      dispatch(fetchEarnings({ cleanerId: cleaner._id, period: 'today' }));
      dispatch(fetchUnreadCount(cleaner._id));
      dispatch(fetchPerformance({ cleanerId: cleaner._id }));
    }
  }, [dispatch, cleaner?._id]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { const unsub = navigation.addListener('focus', loadData); return unsub; }, [navigation, loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setTimeout(() => setRefreshing(false), 500);
  };

  const totalJobs = todayTasks.length;
  const completedJobs = todayTasks.filter(t => t.status === 'completed').length;
  const pendingJobs = todayTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
  const todaysEarnings = todayTasks.reduce((sum, t) => sum + (t.status === 'completed' ? (t.cleanerEarnings || 150) : 0), 0);
  const attendanceRate = cleaner?.attendanceRate || 96;

  return (
    <View style={styles.container}>
      <View style={[styles.headerBg, { paddingTop: insets.top > 0 ? insets.top + 4 : (Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight ? StatusBar.currentHeight + 4 : 30)) }]}>
        <View style={styles.topHeaderRow}>
          {/* Brand Logo Row */}
          <View style={styles.brandRow}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={{ width: 175, height: 44, maxWidth: '58%' }} 
              resizeMode="contain" 
            />
          </View>
          
          {/* Right Section Actions */}
          <View style={styles.headerRightActions}>
            {isComplete ? (
              <TouchableOpacity 
                style={[styles.headerStartDayBtn, { backgroundColor: '#64748B', shadowColor: '#64748B' }]}
                onPress={() => navigation.navigate('Attendance')}
              >
                <Icon name="check-circle" size={12} color="#FFF" />
                <Text style={styles.headerStartDayText}>Day End</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.headerStartDayBtn, isCheckedIn && { backgroundColor: '#DC2626', shadowColor: '#DC2626' }]} 
                onPress={() => navigation.navigate('Attendance')}
              >
                <Icon name={isCheckedIn ? "stop" : "play"} size={12} color="#FFF" />
                <Text style={styles.headerStartDayText}>{isCheckedIn ? `End (${elapsedTime})` : 'Start Day'}</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={{ padding: 4, marginLeft: 8 }} onPress={() => navigation.navigate('Notifications')}>
              <Icon name="bell-outline" size={24} color="#1E293B" />
              {unreadCount > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeTxt}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryBlue} />}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <Image source={require('../../assets/cleaner_avatar.png')} style={styles.avatarImg} />
            <View style={styles.onlineDot} />
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.cleanerName}>{cleaner?.name || 'Ramesh Kumar'}</Text>
            <View style={styles.idRow}>
              <Icon name="shield-check" size={14} color="#2563EB" />
              <Text style={styles.cleanerId}>Cleaner ID: {cleaner?.cleanerId || 'GMCR12456'}</Text>
            </View>
            <View style={styles.areaRow}>
              <Icon name="map-marker-outline" size={14} color="#2563EB" />
              <Text style={styles.areaTitle}>Assigned Area</Text>
            </View>
            <View style={styles.areaLocRow}>
              <Icon name="chevron-down" size={16} color="#64748B" />
              <Text style={styles.areaLocTxt}>{cleaner?.assignedArea || 'Green Valley Apartments, Sector 45'}</Text>
            </View>
            {isCheckedIn && (
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 6, alignSelf: 'flex-start' }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#DC2626', marginRight: 6 }} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#DC2626', fontFamily: 'Inter-Bold' }}>ON DUTY: {elapsedTime}</Text>
              </View>
            )}
          </View>

          <View style={styles.ratingCol}>
            <View style={styles.ratingBadge}>
              <Icon name="star" size={14} color="#2563EB" />
              <Text style={styles.ratingTxt}>4.8</Text>
            </View>
            <Text style={styles.ratingSub}>Good Performer</Text>
          </View>
        </View>

        {/* Performance Overview */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>PERFORMANCE OVERVIEW</Text>
          <TouchableOpacity style={styles.viewAllBtn} onPress={() => navigation.navigate('Performance')}>
            <Text style={styles.viewAllTxt}>View Details</Text>
            <Icon name="chevron-right" size={16} color="#2563EB" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.perfScroll}>
          <View style={styles.perfItem}>
            <View style={[styles.perfIconRing, { borderColor: '#DBEAFE' }]}>
              <View style={[styles.perfIconInner, { backgroundColor: '#EFF6FF' }]}><Icon name="clipboard-text-outline" size={24} color="#2563EB" /></View>
            </View>
            <Text style={styles.perfVal}>{totalJobs.toString().padStart(2, '0')}</Text>
            <Text style={styles.perfLbl}>Today's Jobs</Text>
          </View>

          <View style={styles.perfItem}>
            <View style={[styles.perfIconRing, { borderColor: '#FFEDD5' }]}>
              <View style={[styles.perfIconInner, { backgroundColor: '#FFF7ED' }]}><Icon name="clock-outline" size={24} color="#EA580C" /></View>
            </View>
            <Text style={styles.perfVal}>{completedJobs.toString().padStart(2, '0')}</Text>
            <Text style={styles.perfLbl}>Completed</Text>
          </View>

          <View style={styles.perfItem}>
            <View style={[styles.perfIconRing, { borderColor: '#F3E8FF' }]}>
              <View style={[styles.perfIconInner, { backgroundColor: '#FAF5FF' }]}><Icon name="hourglass" size={24} color="#9333EA" /></View>
            </View>
            <Text style={styles.perfVal}>{pendingJobs.toString().padStart(2, '0')}</Text>
            <Text style={styles.perfLbl}>Pending</Text>
          </View>

          <View style={styles.perfItem}>
            <View style={[styles.perfIconRing, { borderColor: '#DCFCE7' }]}>
              <View style={[styles.perfIconInner, { backgroundColor: '#F0FDF4' }]}><Icon name="wallet-outline" size={24} color="#16A34A" /></View>
            </View>
            <Text style={styles.perfVal}>₹{todaysEarnings}</Text>
            <Text style={styles.perfLbl}>Today's Earnings</Text>
          </View>

          <View style={styles.perfItem}>
            <View style={[styles.perfIconRing, { borderColor: '#FEE2E2' }]}>
              <View style={[styles.perfIconInner, { backgroundColor: '#FEF2F2' }]}><Icon name="trending-up" size={24} color="#DC2626" /></View>
            </View>
            <Text style={styles.perfVal}>{attendanceRate}%</Text>
            <Text style={styles.perfLbl}>Attendance</Text>
          </View>
        </ScrollView>

        {/* Quick Actions */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>QUICK ACTIONS</Text>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.qaScroll}>
          {isComplete ? (
            <TouchableOpacity style={styles.qaCard} onPress={() => navigation.navigate('Attendance')}>
              <View style={[styles.qaIconBg, { backgroundColor: '#F1F5F9' }]}><Icon name="check-circle" size={28} color="#64748B" /></View>
              <Text style={styles.qaTitle}>Day End</Text>
              <Text style={styles.qaDesc}>Day Completed</Text>
            </TouchableOpacity>
          ) : isCheckedIn ? (
            <TouchableOpacity style={styles.qaCard} onPress={() => navigation.navigate('Attendance')}>
              <View style={[styles.qaIconBg, { backgroundColor: '#FEF2F2' }]}><Icon name="stop-circle" size={28} color="#DC2626" /></View>
              <Text style={styles.qaTitle}>End Day</Text>
              <Text style={styles.qaDesc}>On Duty: {elapsedTime}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.qaCard} onPress={() => navigation.navigate('Attendance')}>
              <View style={[styles.qaIconBg, { backgroundColor: '#EFF6FF' }]}><Icon name="play-circle" size={28} color="#2563EB" /></View>
              <Text style={styles.qaTitle}>Start Day</Text>
              <Text style={styles.qaDesc}>Mark Attendance</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.qaCard} onPress={() => navigation.getParent()?.navigate('Scan')}>
            <View style={[styles.qaIconBg, { backgroundColor: '#DCFCE7' }]}><Icon name="qrcode-scan" size={28} color="#16A34A" /></View>
            <Text style={styles.qaTitle}>Scan QR</Text>
            <Text style={styles.qaDesc}>Scan Customer QR</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.qaCard} onPress={() => navigation.getParent()?.navigate('Tasks')}>
            <View style={[styles.qaIconBg, { backgroundColor: '#FFF7ED' }]}><Icon name="broom" size={28} color="#EA580C" /></View>
            <Text style={styles.qaTitle}>Mark Cleaning</Text>
            <Text style={styles.qaDesc}>Start Cleaning</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.qaCard} onPress={() => navigation.navigate('Support')}>
            <View style={[styles.qaIconBg, { backgroundColor: '#FEF2F2' }]}><Icon name="alert-circle" size={28} color="#DC2626" /></View>
            <Text style={styles.qaTitle}>Report Issue</Text>
            <Text style={styles.qaDesc}>Raise an Issue</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Today's Schedule */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>TODAY'S SCHEDULE</Text>
          <TouchableOpacity style={styles.viewAllBtn} onPress={() => navigation.getParent()?.navigate('Tasks')}>
            <Text style={styles.viewAllTxt}>View All</Text>
            <Icon name="chevron-right" size={16} color="#2563EB" />
          </TouchableOpacity>
        </View>

        <View style={styles.scheduleList}>
          {todayTasks.slice(0, 5).map((item, idx, arr) => {
            const customerName = item.customerId ? `${item.customerId.firstName || ''} ${item.customerId.lastName || ''}`.trim() : (item.customerName || 'Customer');
            const carModel = item.vehicleId?.model || item.vehicleModel || 'Car';
            const plateNumber = item.vehicleId?.vehicleNumber || item.vehicleNumber || 'DL 01 AB 1234';
            const pkgName = item.packageName || (item.packageType ? (item.packageType.charAt(0).toUpperCase() + item.packageType.slice(1) + ' Wash') : 'Premium Wash');
            const aptName = item.apartmentName || 'Green Valley Apt.';
            const aptAddress = item.apartmentAddress || 'Tower A • Flat 101';

            return (
              <TouchableOpacity key={item._id} style={[styles.scheduleItem, idx === arr.length - 1 && { borderBottomWidth: 0 }]} onPress={() => navigation.getParent()?.navigate('Tasks', { screen: 'TaskDetail', params: { taskId: item._id } })}>
                
                <View style={styles.siTimeCol}>
                  <Text style={[styles.siIndex, item.status === 'in_progress' ? {color: '#2563EB'} : {}]}>{(idx + 1).toString().padStart(2, '0')}</Text>
                  <Text style={styles.siTime}>{item.scheduledTime ? item.scheduledTime.replace(/^0([1-9][0-9]:)/, '$1') : ''}</Text>
                </View>

                <Image source={{uri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200'}} style={styles.siAvatar} />
                
                <View style={styles.siInfoCol}>
                  <Text style={styles.siName}>{customerName}</Text>
                  <Text style={styles.siApt}>{aptName}</Text>
                  <Text style={styles.siFlat}>{aptAddress}</Text>
                </View>

                <View style={styles.siCarCol}>
                  <View style={[styles.siCarTag, {backgroundColor: '#EEF2FF'}]}>
                    <Text style={styles.siCarTagTxt}>{carModel}</Text>
                  </View>
                  <Text style={styles.siPlate}>{plateNumber}</Text>
                  <Text style={styles.siService}>{pkgName}</Text>
                </View>

                <View style={styles.siStatusCol}>
                  {item.status === 'completed' && (
                    <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
                      <Icon name="check-circle-outline" size={12} color="#16A34A" />
                      <Text style={[styles.statusTxt, { color: '#16A34A' }]}>Completed</Text>
                    </View>
                  )}
                  {item.status === 'in_progress' && (
                    <View style={[styles.statusBadge, { backgroundColor: '#FFF7ED' }]}>
                      <Icon name="clock-outline" size={12} color="#EA580C" />
                      <Text style={[styles.statusTxt, { color: '#EA580C' }]}>In Progress</Text>
                    </View>
                  )}
                  {(item.status === 'pending' || item.status === 'assigned') && (
                    <View style={[styles.statusBadge, { backgroundColor: '#FEF9C3' }]}>
                      <Icon name="hourglass" size={12} color="#CA8A04" />
                      <Text style={[styles.statusTxt, { color: '#CA8A04' }]}>Pending</Text>
                    </View>
                  )}
                  <Icon name="chevron-right" size={20} color="#CBD5E1" style={{marginTop: 8}} />
                </View>

              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  headerBg: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 44 : 30,
    paddingHorizontal: 12,
    paddingBottom: 10,
    zIndex: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  topHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 4 },
  headerRightActions: { flexDirection: 'row', alignItems: 'center' },
  headerStartDayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerStartDayText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    marginLeft: 4,
  },
  brandIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#1877F2',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 10,
  },
  brandIconLetter: { fontSize: 20, fontWeight: '900', color: '#FFFFFF', fontFamily: 'Inter-Bold' },
  brandTextCol: { flex: 1, justifyContent: 'center' },
  brandName: { fontSize: 18, fontWeight: '800', color: '#1877F2', fontFamily: 'Inter-Bold', letterSpacing: 0.5 },
  brandTagline: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: -2 },
  bellBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EF4444',
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  bellBadgeTxt: { color: '#FFF', fontSize: 8, fontWeight: '700' },

  scrollContent: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 16 },
  scrollView: { flex: 1, zIndex: 20, elevation: 5 },

  profileCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 24,
    zIndex: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarWrapper: { position: 'relative' },
  avatarImg: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: '#FFF' },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#16A34A',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  profileInfo: { flex: 1, marginLeft: 16 },
  cleanerName: { fontSize: 16, fontWeight: '800', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  idRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  cleanerId: { fontSize: 11, color: '#475569', fontFamily: 'Inter-Medium', marginLeft: 4 },
  areaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  areaTitle: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium', marginLeft: 4 },
  areaLocRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, marginLeft: 16 },
  areaLocTxt: { fontSize: 10, fontWeight: '600', color: colors.darkNavy, fontFamily: 'Inter-SemiBold', marginLeft: 2 },
  
  ratingCol: { alignItems: 'flex-end', marginLeft: 8 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  ratingTxt: { fontSize: 14, fontWeight: '800', color: '#2563EB', fontFamily: 'Inter-Bold', marginLeft: 4 },
  ratingSub: { fontSize: 9, color: '#0F172A', fontFamily: 'Inter-Medium', marginTop: 6 },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  sectionHeader: { fontSize: 13, fontWeight: '800', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center' },
  viewAllTxt: { fontSize: 12, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold', marginRight: 2 },

  perfScroll: { paddingBottom: 24, paddingHorizontal: 4 },
  perfItem: { alignItems: 'center', marginRight: 24 },
  perfIconRing: { width: 56, height: 56, borderRadius: 28, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  perfIconInner: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  perfVal: { fontSize: 18, fontWeight: '800', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  perfLbl: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 2 },

  qaScroll: { paddingBottom: 24, paddingHorizontal: 4 },
  qaCard: { backgroundColor: '#FFF', width: 120, borderRadius: 16, padding: 16, alignItems: 'center', marginRight: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 2 },
  qaIconBg: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  qaTitle: { fontSize: 12, fontWeight: '800', color: colors.darkNavy, fontFamily: 'Inter-Bold', textAlign: 'center' },
  qaDesc: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 4, textAlign: 'center' },

  scheduleList: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  scheduleItem: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  siTimeCol: { width: 48, alignItems: 'center', marginRight: 8 },
  siIndex: { fontSize: 18, fontWeight: '800', color: '#2563EB', fontFamily: 'Inter-Bold' },
  siTime: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 2 },
  siAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 12 },
  siInfoCol: { flex: 1.5, justifyContent: 'center' },
  siName: { fontSize: 11, fontWeight: '800', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  siApt: { fontSize: 10, color: '#475569', fontFamily: 'Inter-Medium', marginTop: 2 },
  siFlat: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Regular', marginTop: 2 },
  siCarCol: { flex: 1.5, justifyContent: 'center' },
  siCarTag: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginBottom: 4 },
  siCarTagTxt: { fontSize: 8, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold' },
  siPlate: { fontSize: 10, fontWeight: '800', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  siService: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 2 },
  siStatusCol: { alignItems: 'flex-end', justifyContent: 'center', minWidth: 76 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 4 },
  statusTxt: { fontSize: 9, fontWeight: '700', fontFamily: 'Inter-Bold', marginLeft: 4 },
});

export default DashboardScreen;
