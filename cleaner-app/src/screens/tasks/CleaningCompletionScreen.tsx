import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Dimensions, ImageBackground } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { completeTask, fetchTaskById } from '../../redux/slices/taskSlice';
import { AppDispatch, RootState } from '../../redux/store';

const { width } = Dimensions.get('window');

interface Props { navigation: any; route: any }

const CleaningCompletionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { taskId } = route.params || {};
  const dispatch = useDispatch<AppDispatch>();
  const { selectedTask: task, loading } = useSelector((s: RootState) => s.tasks);

  const [isSuccess, setIsSuccess] = useState(false);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (taskId) dispatch(fetchTaskById(taskId));
  }, [taskId]);

  const handleSubmit = async () => {
    // Assuming API call is made here
    setIsSuccess(true);
  };

  const handleBackToDashboard = () => {
    navigation.navigate('Dashboard', { screen: 'DashboardMain' });
  };

  // Mock task variables (fallback)
  const cName = task?.apartmentName || 'Green Valley Apartments';
  const flatInfo = `Tower ${task?.apartmentId?.tower || 'A'} • Flat ${task?.apartmentId?.flatNumber || '101'}`;
  const vNum = task?.vehicleNumber || task?.vehicleId?.vehicleNumber || 'DL 01 AB 1234';
  const pkg = task?.packageName || task?.packageType || 'Premium Wash';
  const locStr = 'Green Valley, Sector 62, Noida, UP 201301';

  // State 2: Final Success Screen
  if (isSuccess) {
    return (
      <SafeAreaView style={styles.successContainer} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.successScroll} showsVerticalScrollIndicator={false}>
          
          <View style={styles.successTopArea}>
            {/* Mocking concentric circles */}
            <View style={styles.circleOuter}>
              <View style={styles.circleMiddle}>
                <View style={styles.circleInner}>
                  <Icon name="check" size={60} color="#FFF" />
                </View>
              </View>
            </View>

            <Text style={styles.successHeroTitle}>Task Completed Successfully!</Text>
            <Text style={styles.successHeroSub}>You've done a great job. The customer will be notified of your completion.</Text>

            <View style={styles.thankYouBanner}>
              <Icon name="star-outline" size={18} color="#16A34A" />
              <Text style={styles.thankYouBannerTxt}>Thank you for providing excellent service!</Text>
            </View>
          </View>

          {/* Job Summary */}
          <View style={styles.cardBlock}>
            <Text style={styles.cardSectionTitle}>Job Summary</Text>
            <View style={styles.tcHeader}>
              <View style={styles.tcIconBg}><Icon name="office-building" size={24} color="#0F172A" /></View>
              <View style={styles.tcInfo}>
                <Text style={styles.tcTitle}>{cName}</Text>
                <Text style={styles.tcFlat}>{flatInfo}</Text>
                <View style={styles.tcLocRow}>
                  <Icon name="map-marker-outline" size={12} color="#2563EB" />
                  <Text style={styles.tcLocTxt}>{locStr}</Text>
                </View>
              </View>
              <View style={styles.tcRightCol}>
                <View style={styles.tcTag}><Text style={styles.tcTagTxt}>{pkg}</Text></View>
                <Text style={styles.tcPlate}>{vNum}</Text>
              </View>
            </View>

            <View style={styles.dashedDivider} />

            <View style={styles.summaryGrid}>
              <View style={styles.summaryGridItem}>
                <View style={[styles.sgIconBg, { backgroundColor: '#F3E8FF' }]}><Icon name="calendar-blank-outline" size={18} color="#9333EA" /></View>
                <Text style={styles.sgVal}>15 May 2025</Text>
                <Text style={styles.sgLbl}>Date</Text>
              </View>
              <View style={styles.summaryGridItem}>
                <View style={[styles.sgIconBg, { backgroundColor: '#EFF6FF' }]}><Icon name="clock-outline" size={18} color="#3B82F6" /></View>
                <Text style={styles.sgVal}>09:00 AM</Text>
                <Text style={styles.sgLbl}>Start Time</Text>
              </View>
              <View style={styles.summaryGridItem}>
                <View style={[styles.sgIconBg, { backgroundColor: '#ECFDF5' }]}><Icon name="play-circle-outline" size={18} color="#10B981" /></View>
                <Text style={styles.sgVal}>10:05 AM</Text>
                <Text style={styles.sgLbl}>End Time</Text>
              </View>
              <View style={styles.summaryGridItem}>
                <View style={[styles.sgIconBg, { backgroundColor: '#FFF7ED' }]}><Icon name="timer-outline" size={18} color="#EA580C" /></View>
                <Text style={styles.sgVal}>65 mins</Text>
                <Text style={styles.sgLbl}>Duration</Text>
              </View>
            </View>
          </View>

          {/* Checklist Summary */}
          <View style={styles.cardBlock}>
            <Text style={styles.cardSectionTitle}>Checklist Summary</Text>
            <View style={styles.chkSumRow}>
              <View style={styles.circleProgress}>
                <Text style={styles.circleProgressTxt}>6/6</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={styles.chkSumTitle}>All Tasks Completed</Text>
                <Text style={styles.chkSumDesc}>Great work! You have completed all checklist items.</Text>
              </View>
              <Icon name="medal" size={40} color="#16A34A" />
            </View>
          </View>

          {/* Customer Experience */}
          <View style={[styles.cardBlock, { flexDirection: 'row', alignItems: 'center' }]}>
            <View style={[styles.tcIconBg, { backgroundColor: '#DCFCE7' }]}><Icon name="star" size={24} color="#16A34A" /></View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.ceTitle}>Customer Experience</Text>
              <Text style={styles.ceDesc}>Your service makes a difference!</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <View style={{ flexDirection: 'row' }}>
                {[1,2,3,4,5].map(i => <Icon key={i} name="star" size={18} color="#16A34A" />)}
              </View>
              <Text style={styles.ceThankYou}>Thank you!</Text>
            </View>
          </View>

          {/* Earnings */}
          <View style={[styles.cardBlock, { flexDirection: 'row', alignItems: 'center' }]}>
            <View style={[styles.tcIconBg, { backgroundColor: '#EFF6FF' }]}><Icon name="wallet-outline" size={24} color="#2563EB" /></View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.ceTitle}>Earnings</Text>
              <Text style={styles.ceDesc}>This task will reflect in your earnings.</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.earnAmount}>₹350.00</Text>
              <Text style={styles.earnDesc}>Estimated</Text>
            </View>
          </View>

        </ScrollView>

        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.btnSolidBlue} onPress={handleBackToDashboard}>
            <Icon name="home-outline" size={18} color="#FFF" />
            <Text style={styles.btnSolidBlueTxt}>Back to Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnOutlineBlue}>
            <Icon name="file-document-outline" size={18} color="#2563EB" />
            <Text style={styles.btnOutlineBlueTxt}>View Task History</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // State 1: Cleaning Completion Pre-submit
  return (
    <View style={styles.container}>
      <View style={styles.blueHeaderBg}>
        <View style={styles.topHeaderRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.mainTitle}>Cleaning Completion</Text>
            <Text style={styles.mainSubTitle}>Job completed successfully</Text>
          </View>
          <TouchableOpacity style={{ padding: 4 }}>
            <Icon name="download-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Floating Success Banner */}
        <View style={styles.floatingSuccessCard}>
          <View style={styles.fsIconBg}>
            <Icon name="check" size={24} color="#FFF" />
          </View>
          <View style={{ marginLeft: 16 }}>
            <Text style={styles.fsTitle}>Cleaning Completed!</Text>
            <Text style={styles.fsDesc}>Great job! You have successfully completed the task.</Text>
          </View>
        </View>

        {/* Huge Combined Summary Card */}
        <View style={styles.combinedCard}>
          {/* Location details */}
          <View style={styles.tcHeader}>
            <View style={styles.tcIconBg}><Icon name="office-building" size={24} color="#0F172A" /></View>
            <View style={styles.tcInfo}>
              <Text style={styles.tcTitle}>{cName}</Text>
              <Text style={styles.tcFlat}>{flatInfo}</Text>
              <View style={styles.tcLocRow}>
                <Icon name="map-marker-outline" size={12} color="#2563EB" />
                <Text style={styles.tcLocTxt}>{locStr}</Text>
              </View>
            </View>
            <View style={styles.tcRightCol}>
              <View style={styles.tcTag}><Text style={styles.tcTagTxt}>{pkg}</Text></View>
              <Text style={styles.tcPlate}>{vNum}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.cardSectionTitleInner}>Task Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryGridItem}>
              <View style={[styles.sgIconBg, { backgroundColor: '#F3E8FF' }]}><Icon name="calendar-blank-outline" size={18} color="#9333EA" /></View>
              <Text style={styles.sgVal}>15 May 2025</Text>
              <Text style={styles.sgLbl}>Date</Text>
            </View>
            <View style={styles.summaryGridItem}>
              <View style={[styles.sgIconBg, { backgroundColor: '#EFF6FF' }]}><Icon name="clock-outline" size={18} color="#3B82F6" /></View>
              <Text style={styles.sgVal}>09:00 AM</Text>
              <Text style={styles.sgLbl}>Start Time</Text>
            </View>
            <View style={styles.summaryGridItem}>
              <View style={[styles.sgIconBg, { backgroundColor: '#ECFDF5' }]}><Icon name="play-circle-outline" size={18} color="#10B981" /></View>
              <Text style={styles.sgVal}>10:05 AM</Text>
              <Text style={styles.sgLbl}>End Time</Text>
            </View>
            <View style={styles.summaryGridItem}>
              <View style={[styles.sgIconBg, { backgroundColor: '#FFF7ED' }]}><Icon name="timer-outline" size={18} color="#EA580C" /></View>
              <Text style={styles.sgVal}>65 mins</Text>
              <Text style={styles.sgLbl}>Duration</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.progressHeaderRow}>
            <Text style={styles.cardSectionTitleInner}>Checklist Progress</Text>
            <Text style={styles.progressCountTxt}>6 of 6 Completed</Text>
          </View>
          
          <View style={styles.progressBarRow}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '100%' }]} />
            </View>
            <Text style={styles.progressPercent}>100%</Text>
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <Icon name="check-circle" size={14} color="#16A34A" />
              <Text style={[styles.legendTxt, {color: '#16A34A'}]}>Completed (6)</Text>
            </View>
            <View style={styles.legendItem}>
              <Icon name="clock-outline" size={14} color="#F59E0B" />
              <Text style={[styles.legendTxt, {color: '#F59E0B'}]}>In Progress (0)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={styles.legendGreyCircle} />
              <Text style={[styles.legendTxt, {color: '#64748B'}]}>Pending (0)</Text>
            </View>
          </View>
        </View>

        {/* Photos Module */}
        <View style={styles.photosBlock}>
          <View style={styles.photosHeader}>
            <Text style={styles.cardSectionTitleInner}>Photos (Before & After)</Text>
            <Text style={styles.viewAllTxt}>View All</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
            {['Exterior', 'Interior', 'Wheels', 'Windows'].map((pt, i) => (
              <View key={i} style={styles.photoThumbWrapper}>
                <View style={styles.photoThumbImgMock}>
                  <View style={styles.splitLine} />
                  <View style={styles.splitIcon}><Icon name="code-tags" size={12} color="#0F172A" /></View>
                </View>
                <Text style={styles.photoThumbLbl}>{pt}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Rating */}
        <View style={styles.ratingCard}>
          <View style={[styles.tcIconBg, { backgroundColor: '#DCFCE7' }]}><Icon name="star" size={24} color="#16A34A" /></View>
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text style={styles.ratingTitle}>How was your experience?</Text>
            <Text style={styles.ratingSub}>Rate your experience for this task</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            {[1,2,3,4,5].map(i => (
              <TouchableOpacity key={i} onPress={() => setRating(i)}>
                <Icon name={i <= rating ? "star" : "star-outline"} size={22} color={i <= rating ? "#16A34A" : "#94A3B8"} style={{marginLeft: 2}} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.notesCard}>
          <View style={[styles.tcIconBg, { backgroundColor: '#EFF6FF' }]}><Icon name="file-document-edit-outline" size={24} color="#2563EB" /></View>
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text style={styles.ratingTitle}>Add Notes <Text style={{fontWeight: '400', color: '#64748B'}}>(Optional)</Text></Text>
            <Text style={styles.ratingSub}>Write any additional notes about this task...</Text>
          </View>
          <Icon name="chevron-right" size={20} color="#CBD5E1" />
        </View>

        {/* Great Work Banner */}
        <View style={styles.greatWorkBanner}>
          <View style={[styles.tcIconBg, { backgroundColor: '#F3E8FF' }]}><Icon name="trophy-outline" size={24} color="#9333EA" /></View>
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text style={styles.ratingTitle}>Great Work!</Text>
            <Text style={styles.ratingSub}>You're helping us deliver spotless experiences.</Text>
          </View>
          <Text style={{fontSize: 24}}>👍</Text>
        </View>

      </ScrollView>

      {/* Fixed Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.btnSolidBlue} onPress={handleSubmit}>
          <Icon name="file-document-outline" size={18} color="#FFF" />
          <Text style={styles.btnSolidBlueTxt}>Submit & Complete</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnOutlineBlue} onPress={handleBackToDashboard}>
          <Icon name="home-outline" size={18} color="#2563EB" />
          <Text style={styles.btnOutlineBlueTxt}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  blueHeaderBg: {
    backgroundColor: '#0D5BD7',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    zIndex: 1,
  },
  topHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitles: { flex: 1, paddingHorizontal: 12 },
  mainTitle: { fontSize: 20, fontWeight: '700', color: '#FFF', fontFamily: 'Inter-Bold' },
  mainSubTitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter-Medium', marginTop: 2 },
  
  scrollView: { flex: 1, marginTop: -40, zIndex: 2, elevation: 5 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

  floatingSuccessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 20,
  },
  fsIconBg: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center' },
  fsTitle: { fontSize: 16, fontWeight: '700', color: '#16A34A', fontFamily: 'Inter-Bold' },
  fsDesc: { fontSize: 11, color: '#0F172A', fontFamily: 'Inter-Medium', marginTop: 4 },

  combinedCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  tcHeader: { flexDirection: 'row' },
  tcIconBg: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  tcInfo: { flex: 1, marginLeft: 12 },
  tcTitle: { fontSize: 14, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  tcFlat: { fontSize: 12, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 4 },
  tcLocRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  tcLocTxt: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Regular', marginLeft: 4 },
  tcRightCol: { alignItems: 'flex-end' },
  tcTag: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  tcTagTxt: { fontSize: 9, color: '#2563EB', fontWeight: '700', fontFamily: 'Inter-Bold' },
  tcPlate: { fontSize: 13, fontWeight: '800', color: colors.darkNavy, fontFamily: 'Inter-Bold', marginTop: 8 },

  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },
  dashedDivider: { height: 1, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed', marginVertical: 16, width: '100%' },

  cardSectionTitleInner: { fontSize: 13, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold', marginBottom: 12 },
  summaryGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryGridItem: { alignItems: 'center', flex: 1 },
  sgIconBg: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  sgVal: { fontSize: 11, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold', textAlign: 'center' },
  sgLbl: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 2, textAlign: 'center' },

  progressHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressCountTxt: { fontSize: 11, color: '#64748B', fontFamily: 'Inter-Medium' },
  progressBarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  progressBarBg: { flex: 1, height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, marginRight: 12 },
  progressBarFill: { height: 8, backgroundColor: '#16A34A', borderRadius: 4 },
  progressPercent: { fontSize: 13, fontWeight: '800', color: '#16A34A', fontFamily: 'Inter-Bold' },
  legendRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendGreyCircle: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#CBD5E1' },
  legendTxt: { fontSize: 10, fontWeight: '600', fontFamily: 'Inter-SemiBold', marginLeft: 6 },

  photosBlock: { marginBottom: 20 },
  photosHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  viewAllTxt: { fontSize: 11, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold' },
  photoThumbWrapper: { marginRight: 12, alignItems: 'center' },
  photoThumbImgMock: { width: 80, height: 80, backgroundColor: '#334155', borderRadius: 12, overflow: 'hidden', position: 'relative' },
  splitLine: { position: 'absolute', top: 0, bottom: 0, left: 39, width: 2, backgroundColor: '#FFF' },
  splitIcon: { position: 'absolute', top: 32, left: 32, width: 16, height: 16, borderRadius: 8, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  photoThumbLbl: { fontSize: 10, fontWeight: '600', color: colors.darkNavy, fontFamily: 'Inter-SemiBold', marginTop: 8 },

  ratingCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  ratingTitle: { fontSize: 13, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  ratingSub: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 2 },
  notesCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  greatWorkBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },

  bottomActions: { padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  btnSolidBlue: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563EB', borderRadius: 12, paddingVertical: 14, marginBottom: 12 },
  btnSolidBlueTxt: { fontSize: 14, fontWeight: '700', color: '#FFF', fontFamily: 'Inter-Bold', marginLeft: 8 },
  btnOutlineBlue: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#2563EB', borderRadius: 12, paddingVertical: 14 },
  btnOutlineBlueTxt: { fontSize: 14, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold', marginLeft: 8 },

  // State 2: SUCCESS FULL SCREEN
  successContainer: { flex: 1, backgroundColor: '#FAFAFA' },
  successScroll: { paddingHorizontal: 16, paddingBottom: 40 },
  successTopArea: { alignItems: 'center', paddingTop: 60, paddingBottom: 32 },
  circleOuter: { width: 160, height: 160, borderRadius: 80, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  circleMiddle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#BBF7D0', alignItems: 'center', justifyContent: 'center' },
  circleInner: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center' },
  successHeroTitle: { fontSize: 20, fontWeight: '800', color: colors.darkNavy, fontFamily: 'Inter-Bold', textAlign: 'center', marginBottom: 8 },
  successHeroSub: { fontSize: 13, color: '#64748B', fontFamily: 'Inter-Medium', textAlign: 'center', paddingHorizontal: 20, lineHeight: 20, marginBottom: 24 },
  thankYouBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#BBF7D0' },
  thankYouBannerTxt: { fontSize: 12, fontWeight: '600', color: '#16A34A', fontFamily: 'Inter-SemiBold', marginLeft: 8 },

  cardBlock: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  cardSectionTitle: { fontSize: 14, fontWeight: '800', color: colors.darkNavy, fontFamily: 'Inter-Bold', marginBottom: 16 },

  chkSumRow: { flexDirection: 'row', alignItems: 'center' },
  circleProgress: { width: 64, height: 64, borderRadius: 32, borderWidth: 4, borderColor: '#16A34A', alignItems: 'center', justifyContent: 'center' },
  circleProgressTxt: { fontSize: 16, fontWeight: '800', color: '#16A34A', fontFamily: 'Inter-Bold' },
  chkSumTitle: { fontSize: 14, fontWeight: '700', color: '#16A34A', fontFamily: 'Inter-Bold' },
  chkSumDesc: { fontSize: 11, color: '#0F172A', fontFamily: 'Inter-Medium', marginTop: 4, lineHeight: 16 },

  ceTitle: { fontSize: 13, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  ceDesc: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 4 },
  ceThankYou: { fontSize: 10, fontWeight: '600', color: '#16A34A', fontFamily: 'Inter-SemiBold', marginTop: 4, textAlign: 'right' },

  earnAmount: { fontSize: 18, fontWeight: '800', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  earnDesc: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 2, textAlign: 'right' },
});

export default CleaningCompletionScreen;
