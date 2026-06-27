import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, Image, Dimensions, Platform, StatusBar } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import { fetchTodayAttendance, checkIn, checkOut, fetchAttendanceMonthly } from '../../redux/slices/attendanceSlice';
import { AppDispatch, RootState } from '../../redux/store';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Props {
  navigation: any;
}

const AttendanceScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { cleaner } = useSelector((s: RootState) => s.auth);
  const { today, history, summary, loading } = useSelector((s: RootState) => s.attendance);
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const day = d.getDate();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const formatDay = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[d.getDay()];
    } catch {
      return '';
    }
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '—';
    try {
      const d = new Date(timeStr);
      let hours = d.getHours();
      const minutes = d.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0').padStart(2, '0')} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  const calculateHours = (checkInStr: string, checkOutStr?: string) => {
    if (!checkOutStr) return '—';
    try {
      const diffMs = new Date(checkOutStr).getTime() - new Date(checkInStr).getTime();
      const diffMins = Math.round(diffMs / 60000);
      const hrs = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hrs}h ${mins}m`;
    } catch {
      return '—';
    }
  };

  const load = useCallback(() => {
    if (cleaner?._id) {
      dispatch(fetchTodayAttendance(cleaner._id));
      const now = new Date();
      dispatch(fetchAttendanceMonthly({
        cleanerId: cleaner._id,
        month: now.getMonth() + 1,
        year: now.getFullYear()
      }));
    }
  }, [dispatch, cleaner?._id]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutesStr = minutes < 10 ? '0' + minutes : minutes;
      setCurrentTime(`${hours.toString().padStart(2, '0')}:${minutesStr} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

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

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const unsub = navigation.addListener('focus', load); return unsub; }, [navigation, load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleCheckIn = () => {
    Alert.alert('Start Duty', 'Confirm your check-in with location and selfie?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Start Duty', onPress: async () => {
        try {
          await dispatch(checkIn({ latitude: 28.6139, longitude: 77.2090 })).unwrap();
          Alert.alert('Success', 'Duty started successfully. Happy cleaning!');
        } catch (err: any) {
          Alert.alert('Error', 'Check-in failed');
        }
      }},
    ]);
  };

  const handleCheckOut = () => {
    Alert.alert('End Duty', 'Confirm check-out for the day?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'End Duty', onPress: async () => {
        try {
          await dispatch(checkOut()).unwrap();
          Alert.alert('Success', 'Check-out recorded. Have a good evening!');
        } catch {
          Alert.alert('Error', 'Check-out failed');
        }
      }},
    ]);
  };

  const isCheckedIn = !!today?.checkIn && !today?.checkOut;
  const isComplete = !!today?.checkIn && !!today?.checkOut;

  return (
    <View style={styles.container}>
      {/* Top Blue Header Area */}
      <View style={[styles.topBlueHeader, { paddingTop: insets.top > 0 ? insets.top + 10 : (Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 40)) }]}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <Icon name="arrow-left" size={24} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.headerTextCol}>
            <Text style={styles.headerTitleText}>{isCheckedIn ? 'Attendance Logs' : 'Start Day Attendance'}</Text>
            <Text style={styles.headerSubText}>{isCheckedIn ? 'View your daily records' : 'Mark your attendance to start your duty'}</Text>
          </View>
          <Icon name="shield-check-outline" size={28} color={colors.white} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryBlue} />}
      >
        {/* Cleaner Info Card */}
        <Card variant="elevated" style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <Image source={require('../../assets/cleaner_avatar.png')} style={styles.profileAvatar} />
            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text style={styles.profileName}>{cleaner?.firstName || cleaner?.name || 'Ramesh Kumar'}</Text>
              <Text style={styles.profileId}>Cleaner ID: {cleaner?.cleanerId || 'GMCR12456'}</Text>
            </View>
          </View>
          
          <View style={styles.profileDivider} />

          <View style={styles.profileBottomRow}>
            <View style={styles.profileInfoCol}>
              <Icon name="map-marker-outline" size={18} color="#2563EB" />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.profileInfoLabel}>Assigned Area</Text>
                <Text style={styles.profileInfoVal}>Green Valley Apartments</Text>
              </View>
            </View>
            
            <View style={styles.verticalDivider} />
            
            <View style={styles.profileInfoCol}>
              <Icon name="domain" size={18} color="#2563EB" />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.profileInfoLabel}>Zone / Sector</Text>
                <Text style={styles.profileInfoVal}>Sector 45</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* ================= START DAY ATTENDANCE FORM / ON DUTY STATS ================= */}
        <View>
          {/* 1. Location Verification */}
          <Card variant="outlined" style={styles.stepCard}>
            <View style={styles.stepHeaderRow}>
              <View style={styles.stepIconWrapper}>
                <Icon name="map-marker" size={18} color="#FFF" />
              </View>
              <View style={styles.stepTextCol}>
                <Text style={styles.stepTitle}>1. Location Verification</Text>
                <Text style={styles.stepSub}>
                  {isCheckedIn || isComplete ? 'Location verified successfully' : 'Please ensure you are at your assigned location'}
                </Text>
              </View>
              <View style={styles.badgeSuccess}>
                <Icon name="check-circle" size={12} color="#16A34A" />
                <Text style={styles.badgeSuccessText}>Within Range</Text>
              </View>
            </View>

            {/* Map Mock */}
            <View style={styles.mapMock}>
              <View style={styles.mapGridLines} />
              <View style={styles.mapPinContainer}>
                 <View style={styles.mapPulse} />
                 <Icon name="map-marker" size={42} color="#2563EB" />
              </View>
            </View>

            {/* Location footer */}
            <View style={styles.locFooter}>
              <View style={styles.radarIconWrapper}>
                <Icon name="radar" size={20} color="#16A34A" />
              </View>
              <View style={styles.locFooterTextCol}>
                <Text style={styles.locFooterTitle}>Current Location</Text>
                <Text style={styles.locFooterDesc}>
                  {isCheckedIn || isComplete 
                    ? (today?.checkIn?.address || 'Green Valley Apartments, Sector 45, Noida') 
                    : 'Green Valley Apartments, Sector 45, Noida, Uttar Pradesh 201301'}
                </Text>
              </View>
              <View style={styles.badgeInfo}>
                <Text style={styles.badgeInfoText}>Accuracy: 12 m</Text>
              </View>
            </View>
          </Card>

          {/* 2. Check-In Time & Continuous Timer */}
          <Card variant="outlined" style={styles.stepCard}>
            <View style={styles.stepHeaderRow}>
              <View style={styles.stepIconWrapper}>
                <Icon name="clock-outline" size={18} color="#FFF" />
              </View>
              <View style={styles.stepTextCol}>
                <Text style={styles.stepTitle}>2. Check-In / Duty Timer</Text>
                <Text style={styles.stepSub}>
                  {isCheckedIn ? 'Duty is in progress' : isComplete ? 'Duty completed for today' : 'Your check-in time will be recorded'}
                </Text>
              </View>
              
              <View style={styles.timeBox}>
                <View style={styles.timeBoxTop}>
                  <Icon name="calendar-month-outline" size={14} color="#2563EB" />
                  <Text style={styles.timeBoxLabel}>
                    {isCheckedIn ? 'Checked-In' : isComplete ? 'Shift time' : 'Check-In'}
                  </Text>
                </View>
                <Text style={styles.timeBoxVal}>
                  {isCheckedIn || isComplete ? formatTime(today?.checkIn?.time) : currentTime || '08:45 AM'}
                </Text>
              </View>
            </View>

            {isCheckedIn && (
              <View style={{ marginTop: 12, padding: 12, backgroundColor: '#FEF2F2', borderRadius: 8, alignItems: 'center' }}>
                <Text style={{ fontSize: 11, color: '#DC2626', fontWeight: '700', fontFamily: 'Inter-Bold', letterSpacing: 0.5 }}>ACTIVE DUTY TIMER</Text>
                <Text style={{ fontSize: 28, fontWeight: '900', color: '#1E293B', fontFamily: 'Inter-Bold', marginTop: 4 }}>{elapsedTime}</Text>
              </View>
            )}

            {isComplete && (
              <View style={{ marginTop: 12, padding: 12, backgroundColor: '#F0FDF4', borderRadius: 8, alignItems: 'center' }}>
                <Text style={{ fontSize: 11, color: '#16A34A', fontWeight: '700', fontFamily: 'Inter-Bold', letterSpacing: 0.5 }}>TOTAL WORKING TIME</Text>
                <Text style={{ fontSize: 24, fontWeight: '800', color: '#16A34A', fontFamily: 'Inter-Bold', marginTop: 4 }}>
                  {today?.checkIn?.time && today?.checkOut?.time ? calculateHours(today.checkIn.time, today.checkOut.time) : '00h 00m'}
                </Text>
              </View>
            )}
          </Card>

          {/* 3. Selfie Verification */}
          <Card variant="outlined" style={styles.stepCard}>
            <View style={styles.stepHeaderRow}>
              <View style={styles.stepIconWrapper}>
                <Icon name="camera-outline" size={18} color="#FFF" />
              </View>
              <View style={styles.stepTextCol}>
                <Text style={styles.stepTitle}>3. Selfie Verification</Text>
                <Text style={styles.stepSub}>Capture your selfie to verify attendance</Text>
              </View>
            </View>

            <View style={styles.selfieContainer}>
              <Image source={require('../../assets/cleaner_avatar.png')} style={styles.selfieImg} resizeMode="cover" />
              <View style={[styles.cornerBracket, styles.tl]} />
              <View style={[styles.cornerBracket, styles.tr]} />
              <View style={[styles.cornerBracket, styles.bl]} />
              <View style={[styles.cornerBracket, styles.br]} />
            </View>

            <View style={styles.selfieFooterRow}>
              <View style={styles.shieldCheckRow}>
                <Icon name="shield-check-outline" size={16} color="#2563EB" />
                <Text style={styles.selfieFooterTxt}>Ensure your face is clearly visible</Text>
              </View>
              {!isCheckedIn && !isComplete && (
                <TouchableOpacity style={styles.retakeRow}>
                  <Icon name="camera-retake-outline" size={16} color="#2563EB" />
                  <Text style={styles.retakeTxt}>Retake Photo</Text>
                </TouchableOpacity>
              )}
            </View>
          </Card>

          {/* Dynamic Start / End Duty Button */}
          {isComplete ? (
            <View style={[styles.bigStartBtn, { backgroundColor: '#64748B', shadowColor: '#64748B' }]}>
              <Icon name="check-circle" size={32} color="#FFF" />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.bigStartTitle}>Duty Completed</Text>
                <Text style={styles.bigStartSub}>Your logs are successfully saved for today</Text>
              </View>
            </View>
          ) : isCheckedIn ? (
            <TouchableOpacity 
              style={[styles.bigStartBtn, { backgroundColor: '#DC2626', shadowColor: '#DC2626' }]} 
              onPress={handleCheckOut} 
              activeOpacity={0.9}
            >
              <Icon name="stop-circle" size={32} color="#FFF" />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.bigStartTitle}>End Duty / Stop Day</Text>
                <Text style={styles.bigStartSub}>Mark Check-Out & Stop Duty Timer</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.bigStartBtn} 
              onPress={handleCheckIn} 
              activeOpacity={0.9}
            >
              <Icon name="fingerprint" size={32} color="#FFF" />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.bigStartTitle}>Start Duty / Start Day</Text>
                <Text style={styles.bigStartSub}>Mark Attendance & Start Duty Timer</Text>
              </View>
            </TouchableOpacity>
          )}

          <View style={styles.secureBottomRow}>
            <Icon name="lock-outline" size={14} color="#64748B" />
            <Text style={styles.secureBottomTxt}>Your location and selfie are securely recorded</Text>
          </View>
        </View>

        {/* History and Summary section */}
        <View style={{ marginTop: 20 }}>
          {/* Summary Card */}
          <View style={styles.summaryCard}>
              <View style={styles.summaryTopRow}>
                <Text style={styles.summaryTitle}>Summary</Text>
                <TouchableOpacity style={styles.summaryMonthBtn}>
                  <Text style={styles.summaryMonthTxt}>This Month</Text>
                  <Icon name="chevron-down" size={16} color="#2563EB" />
                </TouchableOpacity>
              </View>

              <View style={styles.summaryGrid}>
                <View style={styles.summaryCol}>
                  <View style={[styles.summaryIconBg, { backgroundColor: '#ECFDF5' }]}>
                    <Icon name="calendar-check" size={20} color="#10B981" />
                  </View>
                  <Text style={[styles.summaryNum, { color: '#10B981' }]}>{summary?.present || 0}</Text>
                  <Text style={styles.summaryLabel}>Days Present</Text>
                </View>

                <View style={styles.summaryCol}>
                  <View style={[styles.summaryIconBg, { backgroundColor: '#FFF7ED' }]}>
                    <Icon name="clock-outline" size={20} color="#EA580C" />
                  </View>
                  <Text style={[styles.summaryNum, { color: '#EA580C' }]}>{summary?.late || 0}</Text>
                  <Text style={styles.summaryLabel}>Late Mark</Text>
                </View>

                <View style={styles.summaryCol}>
                  <View style={[styles.summaryIconBg, { backgroundColor: '#FEF2F2' }]}>
                    <Icon name="calendar-remove" size={20} color="#DC2626" />
                  </View>
                  <Text style={[styles.summaryNum, { color: '#DC2626' }]}>{summary?.absent || 0}</Text>
                  <Text style={styles.summaryLabel}>Absent</Text>
                </View>

                <View style={styles.summaryCol}>
                  <View style={[styles.summaryIconBg, { backgroundColor: '#EFF6FF' }]}>
                    <Icon name="calendar-month" size={20} color="#2563EB" />
                  </View>
                  <Text style={[styles.summaryNum, { color: '#2563EB' }]}>
                    {(summary?.present || 0) + (summary?.late || 0) + (summary?.absent || 0) + (summary?.leave || 0)}
                  </Text>
                  <Text style={styles.summaryLabel}>Total Days</Text>
                </View>
              </View>
            </View>

            {/* Filter Row */}
            <View style={styles.dateFilterRow}>
              <View style={styles.searchBar}>
                <Icon name="magnify" size={18} color="#94A3B8" />
                <Text style={styles.searchTxt}>Search by date</Text>
              </View>
              <TouchableOpacity style={styles.filterBtn}>
                <Icon name="filter-outline" size={16} color="#2563EB" />
                <Text style={styles.filterBtnTxt}>Filter</Text>
              </TouchableOpacity>
            </View>

            {/* Recent Records List */}
            <Text style={styles.sectionTitle}>Recent Records</Text>
            {history.length > 0 ? (
              history.map((record: any) => {
                const isPresent = record.status === 'present';
                const isLate = record.status === 'late';
                const isAbsent = record.status === 'absent';
                const borderColor = isPresent ? '#16A34A' : isLate ? '#EA580C' : '#DC2626';
                const bgBadge = isPresent ? '#F0FDF4' : isLate ? '#FFF7ED' : '#FEF2F2';
                const txtBadge = isPresent ? '#16A34A' : isLate ? '#EA580C' : '#DC2626';
                const iconBadge = isPresent ? 'check-circle' : isLate ? 'clock' : 'close-circle';
                const labelBadge = isPresent ? 'Present' : isLate ? 'Late' : 'Absent';

                const recordDateStr = record.date ? formatDate(record.date) : '—';
                const recordDayStr = record.date ? formatDay(record.date) : '—';
                const checkInTime = record.checkIn?.time ? formatTime(record.checkIn.time) : '—';
                const checkOutTime = record.checkOut?.time ? formatTime(record.checkOut.time) : '—';
                const hoursVal = (record.checkIn?.time && record.checkOut?.time) 
                  ? calculateHours(record.checkIn.time, record.checkOut.time)
                  : '—';
                const recordAddress = record.checkIn?.address || 'Green Valley Apartments';

                return (
                  <View key={record._id} style={styles.historyItemCard}>
                    <View style={[styles.historyBorder, { backgroundColor: borderColor }]} />
                    <View style={styles.historyContent}>
                      
                      <View style={styles.historyDateCol}>
                        <Text style={styles.historyDateVal}>{recordDateStr}</Text>
                        <Text style={styles.historyDayVal}>{recordDayStr}</Text>
                      </View>

                      <View style={styles.historyMainCol}>
                        <View style={[styles.hBadge, { backgroundColor: bgBadge }]}>
                          <Icon name={iconBadge} size={10} color={txtBadge} />
                          <Text style={[styles.hBadgeTxt, { color: txtBadge }]}>{labelBadge}</Text>
                        </View>
                        
                        <View style={styles.hRow}>
                          <Icon name="clock-outline" size={12} color="#64748B" />
                          <Text style={styles.hTxt}>{checkInTime} — {checkOutTime}</Text>
                        </View>
                        
                        <View style={styles.hRow}>
                          <Icon name="map-marker-outline" size={12} color="#64748B" />
                          <Text style={styles.hTxt}>{recordAddress}</Text>
                        </View>
                      </View>

                      <View style={styles.historyEndCol}>
                        <Text style={styles.hHours}>{hoursVal}</Text>
                        <Icon name="chevron-right" size={20} color="#CBD5E1" />
                      </View>

                    </View>
                  </View>
                );
              })
            ) : (
              <Card variant="outlined" style={{ padding: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <Icon name="calendar-blank" size={32} color="#94A3B8" />
                <Text style={{ fontSize: 13, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 8 }}>No attendance records found for this month</Text>
              </Card>
            )}

            {/* Pagination */}
            {history.length > 0 && (
              <View style={styles.paginationRow}>
                <TouchableOpacity style={styles.pageArrow}><Icon name="chevron-left" size={18} color="#94A3B8" /></TouchableOpacity>
                <TouchableOpacity style={[styles.pageNum, styles.pageNumActive]}><Text style={styles.pageNumTxtActive}>1</Text></TouchableOpacity>
                <TouchableOpacity style={styles.pageNum}><Text style={styles.pageNumTxt}>2</Text></TouchableOpacity>
                <TouchableOpacity style={styles.pageNum}><Text style={styles.pageNumTxt}>3</Text></TouchableOpacity>
                <TouchableOpacity style={styles.pageNum}><Text style={styles.pageNumTxt}>4</Text></TouchableOpacity>
                <TouchableOpacity style={styles.pageNum}><Text style={styles.pageNumTxt}>5</Text></TouchableOpacity>
                <TouchableOpacity style={styles.pageArrow}><Icon name="chevron-right" size={18} color="#64748B" /></TouchableOpacity>
              </View>
            )}

        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  topBlueHeader: {
    backgroundColor: '#1D4ED8',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    position: 'relative',
    zIndex: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextCol: {
    flex: 1,
    paddingLeft: 12,
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    fontFamily: 'Inter-Bold',
  },
  headerSubText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
    marginTop: -15,
    position: 'relative',
    zIndex: 2,
    elevation: 5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Profile Card
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileTopRow: { flexDirection: 'row', alignItems: 'center' },
  profileAvatar: { width: 64, height: 64, borderRadius: 32 },
  profileName: { fontSize: 16, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  profileId: { fontSize: 12, color: colors.textSecondary, fontFamily: 'Inter-Regular', marginTop: 4 },
  profileDivider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },
  profileBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  profileInfoCol: { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  profileInfoLabel: { fontSize: 10, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  profileInfoVal: { fontSize: 11, fontWeight: '600', color: colors.darkNavy, fontFamily: 'Inter-SemiBold', marginTop: 2 },
  verticalDivider: { width: 1, height: 30, backgroundColor: colors.border, marginHorizontal: 16 },

  // Step Cards
  stepCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTextCol: { flex: 1, marginLeft: 12 },
  stepTitle: { fontSize: 14, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  stepSub: { fontSize: 11, color: colors.textSecondary, fontFamily: 'Inter-Regular', marginTop: 2 },
  
  // Location
  badgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeSuccessText: { fontSize: 10, fontWeight: '600', color: '#16A34A', marginLeft: 4, fontFamily: 'Inter-SemiBold' },
  mapMock: {
    height: 120,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    marginTop: 16,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mapGridLines: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.1)',
  },
  mapPinContainer: { alignItems: 'center', justifyContent: 'center' },
  mapPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
  },
  locFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  radarIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locFooterTextCol: { flex: 1, marginLeft: 12 },
  locFooterTitle: { fontSize: 12, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  locFooterDesc: { fontSize: 10, color: colors.textSecondary, fontFamily: 'Inter-Regular', marginTop: 2, lineHeight: 14 },
  badgeInfo: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  badgeInfoText: { fontSize: 10, fontWeight: '600', color: '#2563EB', fontFamily: 'Inter-SemiBold' },

  // Time
  timeBox: {
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  timeBoxTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  timeBoxLabel: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium', marginLeft: 4 },
  timeBoxVal: { fontSize: 14, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold' },

  // Selfie
  selfieContainer: {
    height: 200,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  selfieImg: { width: '100%', height: '100%' },
  cornerBracket: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#FFF',
  },
  tl: { top: 20, left: 40, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
  tr: { top: 20, right: 40, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
  bl: { bottom: 20, left: 40, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
  br: { bottom: 20, right: 40, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },
  selfieFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  shieldCheckRow: { flexDirection: 'row', alignItems: 'center' },
  selfieFooterTxt: { fontSize: 10, color: '#475569', marginLeft: 6, fontFamily: 'Inter-Medium' },
  retakeRow: { flexDirection: 'row', alignItems: 'center' },
  retakeTxt: { fontSize: 11, fontWeight: '600', color: '#2563EB', marginLeft: 4, fontFamily: 'Inter-SemiBold' },

  // Big Start Button
  bigStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D4ED8',
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: 8,
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  bigStartTitle: { fontSize: 16, fontWeight: '700', color: colors.white, fontFamily: 'Inter-Bold' },
  bigStartSub: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter-Regular', marginTop: 2 },
  
  secureBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  secureBottomTxt: { fontSize: 11, color: '#64748B', marginLeft: 6, fontFamily: 'Inter-Regular' },

  historyCardItem: { padding: 16 },

  // Summary Card
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  summaryMonthBtn: { flexDirection: 'row', alignItems: 'center' },
  summaryMonthTxt: { fontSize: 12, color: '#2563EB', fontWeight: '600', fontFamily: 'Inter-SemiBold', marginRight: 4 },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCol: {
    alignItems: 'center',
  },
  summaryIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryNum: { fontSize: 18, fontWeight: '800', fontFamily: 'Inter-Bold' },
  summaryLabel: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 2 },

  // Search & Filter Row
  dateFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 12,
  },
  searchTxt: { fontSize: 12, color: '#94A3B8', fontFamily: 'Inter-Regular', marginLeft: 8 },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  filterBtnTxt: { fontSize: 12, fontWeight: '600', color: '#2563EB', marginLeft: 6, fontFamily: 'Inter-SemiBold' },

  sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.darkNavy, fontFamily: 'Inter-Bold', marginBottom: 12 },
  
  // History Items
  historyItemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  historyBorder: { width: 3, height: '100%' },
  historyContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  historyDateCol: {
    width: 80,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  historyDateVal: { fontSize: 12, fontWeight: '800', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  historyDayVal: { fontSize: 11, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 2 },
  
  historyMainCol: {
    flex: 1,
    justifyContent: 'center',
  },
  hBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  hBadgeTxt: { fontSize: 9, fontWeight: '700', marginLeft: 4, fontFamily: 'Inter-Bold' },
  hRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  hTxt: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium', marginLeft: 6 },
  
  historyEndCol: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  hHours: { fontSize: 12, fontWeight: '800', color: colors.darkNavy, fontFamily: 'Inter-Bold', marginRight: 8 },

  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    gap: 8,
  },
  pageArrow: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageNum: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageNumActive: { backgroundColor: '#2563EB' },
  pageNumTxt: { fontSize: 12, fontWeight: '600', color: colors.darkNavy, fontFamily: 'Inter-SemiBold' },
  pageNumTxtActive: { fontSize: 12, fontWeight: '700', color: '#FFF', fontFamily: 'Inter-Bold' },

  checkoutFloatBtn: {
    backgroundColor: '#DC2626',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  checkoutFloatBtnTxt: { color: '#FFF', fontSize: 14, fontWeight: '700', fontFamily: 'Inter-Bold' },

  // Active Duty styles
  activeDutyCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    alignItems: 'center',
  },
  activeDutyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  activeDutyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
    marginRight: 6,
  },
  activeDutyStatusTxt: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
    fontFamily: 'Inter-Bold',
  },
  activeDutyTimeLabel: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Inter-Medium',
  },
  activeDutyTimer: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1E293B',
    fontFamily: 'Inter-Bold',
    marginVertical: 12,
    letterSpacing: 1,
  },
  activeDutyDetails: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 16,
  },
  activeDutyDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeDutyDetailTxt: {
    fontSize: 12,
    color: '#475569',
    fontFamily: 'Inter-Regular',
    marginLeft: 8,
  },
  activeDutyCheckoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  activeDutyCheckoutBtnTxt: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
});

export default AttendanceScreen;
