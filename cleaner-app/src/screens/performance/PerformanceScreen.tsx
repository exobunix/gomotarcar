import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Dimensions, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchPerformance } from '../../redux/slices/performanceSlice';
import { AppDispatch, RootState } from '../../redux/store';

interface Props { navigation: any }

const { width } = Dimensions.get('window');

const PerformanceScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { cleaner } = useSelector((s: RootState) => s.auth);
  const { data: perfData, loading } = useSelector((s: RootState) => s.performance);
  const [period, setPeriod] = useState<'month' | 'week' | 'all'>('month');

  useEffect(() => {
    if (cleaner?._id) {
      dispatch(fetchPerformance({ cleanerId: cleaner._id, period }));
    }
  }, [dispatch, cleaner?._id, period]);

  const kpaData = perfData?.kpa || [
    { id: 1, label: 'Quality of Work', score: 4.7, color: '#16A34A', icon: 'check-circle-outline', bg: '#F0FDF4' },
    { id: 2, label: 'Timeliness', score: 4.5, color: '#2563EB', icon: 'clock-outline', bg: '#EFF6FF' },
    { id: 3, label: 'Attendance', score: 4.8, color: '#EA580C', icon: 'account-outline', bg: '#FFF7ED' },
    { id: 4, label: 'Safety & Compliance', score: 4.6, color: '#9333EA', icon: 'shield-check-outline', bg: '#FAF5FF' },
    { id: 5, label: 'Teamwork & Behavior', score: 4.3, color: '#DB2777', icon: 'message-heart-outline', bg: '#FDF2F8' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.blueHeaderBg}>
        <View style={styles.topHeaderRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.mainTitle}>Performance Dashboard</Text>
            <Text style={styles.mainSubTitle}>Track your performance and growth</Text>
          </View>
          <View style={styles.headerRightIcons}>
            <TouchableOpacity style={{ padding: 4, marginRight: 16 }}>
              <Icon name="information-outline" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 4 }}>
              <Icon name="filter-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => dispatch(fetchPerformance(period))} />}>
        
        {/* Top Profile Card */}
        <View style={styles.topCard}>
          <View style={styles.tcHeader}>
            <Image source={{uri: cleaner?.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200'}} style={styles.avatarImg} />
            <View style={styles.tcHeaderText}>
              <Text style={styles.greetingTxt}>Hello, {cleaner?.name || 'Raj Kumar'} 👋</Text>
              <Text style={styles.greetingSub}>Here's how you're performing this month.</Text>
            </View>
            <TouchableOpacity style={styles.monthSelector}>
              <Icon name="calendar-month-outline" size={16} color="#0F172A" style={{marginRight: 6}} />
              <Text style={styles.monthSelectorTxt}>May 2025</Text>
              <Icon name="chevron-down" size={16} color="#0F172A" style={{marginLeft: 4}} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCol}>
              <View style={[styles.statIconBg, {backgroundColor: '#FAF5FF', borderColor: '#E9D5FF'}]}><Icon name="star-outline" size={20} color="#9333EA" /></View>
              <Text style={styles.statLbl}>Overall Rating</Text>
              <View style={styles.statValRow}>
                <Text style={styles.statVal}>{perfData?.overallRating || '4.6'}</Text>
                <Icon name="star-outline" size={14} color="#16A34A" style={{marginLeft: 4, marginTop: 2}} />
              </View>
              <Text style={[styles.statStatus, {color: '#16A34A'}]}>Excellent</Text>
              <Text style={[styles.statTrend, {color: '#16A34A'}]}>↑ 0.3 <Text style={styles.statTrendSub}>vs Apr 2025</Text></Text>
            </View>
            
            <View style={styles.gridDivider} />

            <View style={styles.statCol}>
              <View style={[styles.statIconBg, {backgroundColor: '#EFF6FF', borderColor: '#BFDBFE'}]}><Icon name="clipboard-text-outline" size={20} color="#2563EB" /></View>
              <Text style={styles.statLbl}>Tasks Completed</Text>
              <Text style={styles.statVal}>{perfData?.tasksCompleted || '48'}</Text>
              <Text style={[styles.statStatus, {color: '#64748B'}]}>This Month</Text>
              <Text style={[styles.statTrend, {color: '#2563EB'}]}>↑ 12 <Text style={styles.statTrendSub}>vs Apr 2025</Text></Text>
            </View>

            <View style={styles.gridDivider} />

            <View style={styles.statCol}>
              <View style={[styles.statIconBg, {backgroundColor: '#F0FDF4', borderColor: '#BBF7D0'}]}><Icon name="calendar-check-outline" size={20} color="#16A34A" /></View>
              <Text style={styles.statLbl}>Attendance</Text>
              <Text style={styles.statVal}>{perfData?.attendanceRate ? `${perfData.attendanceRate}%` : '98%'}</Text>
              <Text style={[styles.statStatus, {color: '#16A34A'}]}>Present Days</Text>
              <Text style={[styles.statTrend, {color: '#16A34A'}]}>↑ 2% <Text style={styles.statTrendSub}>vs Apr 2025</Text></Text>
            </View>
          </View>
        </View>

        {/* Performance Overview Chart */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Performance Overview</Text>
            <TouchableOpacity><Text style={styles.viewAllTxt}>View Details ›</Text></TouchableOpacity>
          </View>
          
          {/* Chart Mockup */}
          <View style={styles.chartWrapper}>
            <View style={styles.yAxis}>
              <Text style={styles.axisTxt}>5.0</Text>
              <Text style={styles.axisTxt}>4.0</Text>
              <Text style={styles.axisTxt}>3.0</Text>
              <Text style={styles.axisTxt}>2.0</Text>
              <Text style={styles.axisTxt}>1.0</Text>
            </View>
            <View style={styles.chartArea}>
              {/* Fake grid lines */}
              <View style={styles.gridLine} />
              <View style={styles.gridLine} />
              <View style={styles.gridLine} />
              <View style={styles.gridLine} />
              <View style={styles.gridLine} />
              
              {/* Fake Line & Dots */}
              <View style={styles.fakeLineCont}>
                <View style={styles.lineSeg1} />
                <View style={styles.lineSeg2} />
                <View style={styles.lineSeg3} />
                <View style={styles.lineSeg4} />
                <View style={styles.lineSeg5} />
              </View>

              {/* Data Points */}
              <View style={[styles.dataPoint, {left: '5%', bottom: '58%'}]}>
                <Text style={styles.dpLbl}>3.9</Text>
                <View style={styles.dpDot} />
              </View>
              <View style={[styles.dataPoint, {left: '23%', bottom: '62%'}]}>
                <Text style={styles.dpLbl}>4.1</Text>
                <View style={styles.dpDot} />
              </View>
              <View style={[styles.dataPoint, {left: '41%', bottom: '64%'}]}>
                <Text style={styles.dpLbl}>4.2</Text>
                <View style={styles.dpDot} />
              </View>
              <View style={[styles.dataPoint, {left: '59%', bottom: '66%'}]}>
                <Text style={styles.dpLbl}>4.3</Text>
                <View style={styles.dpDot} />
              </View>
              <View style={[styles.dataPoint, {left: '77%', bottom: '66%'}]}>
                <Text style={styles.dpLbl}>4.3</Text>
                <View style={styles.dpDot} />
              </View>
              <View style={[styles.dataPoint, {left: '95%', bottom: '72%'}]}>
                <Text style={styles.dpLbl}>4.6</Text>
                <View style={[styles.dpDot, {backgroundColor: '#2563EB', borderColor: '#BFDBFE', borderWidth: 3, width: 14, height: 14}]} />
              </View>

              {/* Gradient overlay mock */}
              <View style={styles.gradientMock} />
            </View>
          </View>
          <View style={styles.xAxis}>
            <Text style={styles.axisTxtB}>Dec</Text>
            <Text style={styles.axisTxtB}>Jan</Text>
            <Text style={styles.axisTxtB}>Feb</Text>
            <Text style={styles.axisTxtB}>Mar</Text>
            <Text style={styles.axisTxtB}>Apr</Text>
            <Text style={[styles.axisTxtB, {color: '#2563EB', fontWeight: '700'}]}>May</Text>
          </View>

          <View style={styles.chartInfoRow}>
            <Icon name="arrow-right-thin" size={16} color="#2563EB" />
            <Text style={styles.chartInfoTxt}>Ratings are based on tasks, quality, attendance and behavior.</Text>
          </View>
        </View>

        {/* Key Performance Areas */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Key Performance Areas</Text>
            <TouchableOpacity><Text style={styles.viewAllTxt}>View All ›</Text></TouchableOpacity>
          </View>
          
          {kpaData.map((item, index) => (
            <TouchableOpacity key={item.id} style={[styles.kpaRow, index !== kpaData.length - 1 && styles.kpaBorder]}>
              <View style={[styles.kpaIconBg, {backgroundColor: item.bg}]}><Icon name={item.icon} size={18} color={item.color} /></View>
              <Text style={styles.kpaLbl}>{item.label}</Text>
              
              <View style={styles.kpaBarCont}>
                <View style={[styles.kpaBarFill, {backgroundColor: item.color, width: `${(item.score / 5) * 100}%`}]} />
              </View>
              
              <Text style={[styles.kpaScore, {color: item.color}]}>{item.score}<Text style={styles.kpaScoreBase}>/5</Text></Text>
              <Icon name="chevron-right" size={16} color="#CBD5E1" style={{marginLeft: 8}} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Feedback */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Feedback</Text>
            <TouchableOpacity><Text style={styles.viewAllTxt}>View All ›</Text></TouchableOpacity>
          </View>

          {/* Feedback 1 */}
          <TouchableOpacity style={styles.feedbackCard}>
            <View style={[styles.fbIconBg, {backgroundColor: '#F0FDF4'}]}><Icon name="thumb-up-outline" size={20} color="#16A34A" /></View>
            <View style={styles.fbInfo}>
              <Text style={styles.fbDesc}>Great job on maintaining high quality and completing tasks on time.</Text>
              <Text style={styles.fbMeta}>Rahul Sharma • 12 May 2025</Text>
            </View>
            <View style={[styles.fbBadge, {backgroundColor: '#F0FDF4'}]}><Text style={[styles.fbBadgeTxt, {color: '#16A34A'}]}>Positive</Text></View>
          </TouchableOpacity>

          {/* Feedback 2 */}
          <TouchableOpacity style={styles.feedbackCard}>
            <View style={[styles.fbIconBg, {backgroundColor: '#EFF6FF'}]}><Icon name="information-variant" size={20} color="#2563EB" /></View>
            <View style={styles.fbInfo}>
              <Text style={styles.fbDesc}>Try to communicate more proactively during shift handovers.</Text>
              <Text style={styles.fbMeta}>Rahul Sharma • 30 Apr 2025</Text>
            </View>
            <View style={[styles.fbBadge, {backgroundColor: '#EFF6FF'}]}><Text style={[styles.fbBadgeTxt, {color: '#2563EB'}]}>Improvement</Text></View>
          </TouchableOpacity>
        </View>

        {/* Bottom Banner */}
        <View style={styles.goalsBanner}>
          <View style={styles.gbLeft}>
            <Text style={{fontSize: 32, marginRight: 12}}>🏆</Text>
            <View style={styles.gbTextCont}>
              <Text style={styles.gbTitle}>Keep it up! You're doing great.</Text>
              <Text style={styles.gbSub}>Stay consistent to reach the next level.</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.gbBtn}>
            <Text style={styles.gbBtnTxt}>View Goals</Text>
            <Icon name="target" size={16} color="#FFF" style={{marginLeft: 4}} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  blueHeaderBg: {
    backgroundColor: '#0A2540',
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
    paddingHorizontal: 20,
    paddingBottom: 25,
    position: 'relative',
    zIndex: 1,
  },
  topHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerTitles: { flex: 1, paddingHorizontal: 12 },
  mainTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', fontFamily: 'Inter-Bold' },
  mainSubTitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter-Medium', marginTop: 4 },
  headerRightIcons: { flexDirection: 'row', alignItems: 'center' },

  scrollView: { flex: 1, marginTop: -15, position: 'relative', zIndex: 2, elevation: 5 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

  topCard: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4, marginBottom: 16 },
  tcHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatarImg: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  tcHeaderText: { flex: 1 },
  greetingTxt: { fontSize: 16, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold', marginBottom: 2 },
  greetingSub: { fontSize: 11, color: '#64748B', fontFamily: 'Inter-Medium' },
  monthSelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  monthSelectorTxt: { fontSize: 11, fontWeight: '700', color: '#0F172A', fontFamily: 'Inter-Bold' },

  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 16 },

  statsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  statCol: { flex: 1, alignItems: 'center' },
  statIconBg: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statLbl: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium', textAlign: 'center' },
  statValRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 2 },
  statVal: { fontSize: 18, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold', marginTop: 4, marginBottom: 2, textAlign: 'center' },
  statStatus: { fontSize: 9, fontWeight: '700', fontFamily: 'Inter-Bold', marginBottom: 6, textAlign: 'center' },
  statTrend: { fontSize: 9, fontWeight: '700', fontFamily: 'Inter-Bold', textAlign: 'center' },
  statTrendSub: { color: '#94A3B8', fontWeight: '500' },
  gridDivider: { width: 1, height: '70%', backgroundColor: '#F1F5F9', marginHorizontal: 4, alignSelf: 'center' },

  sectionBlock: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, marginBottom: 16 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  viewAllTxt: { fontSize: 12, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold' },

  // Chart Mock
  chartWrapper: { flexDirection: 'row', height: 150, marginBottom: 8 },
  yAxis: { justifyContent: 'space-between', paddingRight: 8, paddingVertical: 4 },
  axisTxt: { fontSize: 9, color: '#94A3B8', fontFamily: 'Inter-Medium' },
  chartArea: { flex: 1, position: 'relative', justifyContent: 'space-between', paddingVertical: 4 },
  gridLine: { height: 1, backgroundColor: '#F1F5F9', width: '100%', borderStyle: 'dashed' },
  
  fakeLineCont: { position: 'absolute', top: 0, left: '5%', right: '5%', bottom: 0 },
  lineSeg1: { position: 'absolute', width: '20%', height: 2, backgroundColor: '#2563EB', bottom: '60%', transform: [{rotate: '-5deg'}], left: 0 },
  lineSeg2: { position: 'absolute', width: '20%', height: 2, backgroundColor: '#2563EB', bottom: '63%', transform: [{rotate: '-4deg'}], left: '19%' },
  lineSeg3: { position: 'absolute', width: '20%', height: 2, backgroundColor: '#2563EB', bottom: '65%', transform: [{rotate: '-2deg'}], left: '38%' },
  lineSeg4: { position: 'absolute', width: '20%', height: 2, backgroundColor: '#2563EB', bottom: '66%', transform: [{rotate: '0deg'}], left: '57%' },
  lineSeg5: { position: 'absolute', width: '20%', height: 2, backgroundColor: '#2563EB', bottom: '69%', transform: [{rotate: '-10deg'}], left: '76%' },

  dataPoint: { position: 'absolute', alignItems: 'center' },
  dpLbl: { fontSize: 9, fontWeight: '700', color: '#0F172A', fontFamily: 'Inter-Bold', marginBottom: 4 },
  dpDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#2563EB' },
  
  gradientMock: { position: 'absolute', bottom: 0, left: '5%', right: '5%', height: '60%', backgroundColor: 'rgba(37, 99, 235, 0.05)' },

  xAxis: { flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 24, paddingRight: 8, marginBottom: 16 },
  axisTxtB: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium' },

  chartInfoRow: { flexDirection: 'row', alignItems: 'center' },
  chartInfoTxt: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium', marginLeft: 6 },

  // KPAs
  kpaRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  kpaBorder: { borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  kpaIconBg: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  kpaLbl: { width: 120, fontSize: 11, fontWeight: '700', color: '#0F172A', fontFamily: 'Inter-Bold' },
  kpaBarCont: { flex: 1, height: 4, backgroundColor: '#F1F5F9', borderRadius: 2, marginHorizontal: 8 },
  kpaBarFill: { height: 4, borderRadius: 2 },
  kpaScore: { fontSize: 12, fontWeight: '800', fontFamily: 'Inter-Bold' },
  kpaScoreBase: { fontSize: 10, color: '#94A3B8', fontWeight: '500' },

  // Feedback
  feedbackCard: { flexDirection: 'row', backgroundColor: '#FAFAFA', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  fbIconBg: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  fbInfo: { flex: 1, paddingRight: 8 },
  fbDesc: { fontSize: 11, fontWeight: '600', color: '#0F172A', fontFamily: 'Inter-SemiBold', lineHeight: 16, marginBottom: 4 },
  fbMeta: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium' },
  fbBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  fbBadgeTxt: { fontSize: 9, fontWeight: '700', fontFamily: 'Inter-Bold' },

  // Goals
  goalsBanner: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'space-between' },
  gbLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  gbTextCont: { flex: 1, paddingRight: 8 },
  gbTitle: { fontSize: 12, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold', marginBottom: 2 },
  gbSub: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium' },
  gbBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0D5BD7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  gbBtnTxt: { fontSize: 11, fontWeight: '700', color: '#FFF', fontFamily: 'Inter-Bold' },
});

export default PerformanceScreen;
