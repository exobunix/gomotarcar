import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Dimensions, StatusBar } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import { fetchCleanerById } from '../../redux/slices/cleanerSlice';
import { AppDispatch, RootState } from '../../redux/store';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Props { navigation: any; route: any }

const CleanerDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { cleanerId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();
  const { selectedCleaner: cleaner } = useSelector((s: RootState) => s.cleaners);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    dispatch(fetchCleanerById(cleanerId));
  }, [dispatch, cleanerId]);

  if (!cleaner) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={[styles.simpleHeader, { paddingTop: insets.top > 0 ? insets.top : 20 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.simpleHeaderTitle}>Cleaner Profile</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>
    );
  }

  // Fallback / mock details matching high-fidelity wireframe exactly
  const cleanerIdDisplay = cleaner.cleanerId || 'CLN0087';
  const ratingDisplay = cleaner.rating?.toFixed(1) || '4.8';
  const phoneDisplay = cleaner.phone || '98765 43210';
  const nameDisplay = cleaner.name || 'Ramesh Kumar';

  const tabs = ['Overview', 'Apartments', 'Attendance', 'Ratings', 'Earnings', 'Documents'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {/* Header bar */}
      <View style={[styles.headerContainer, { paddingTop: insets.top > 0 ? insets.top + 4 : (Platform.OS === 'ios' ? 44 : 12) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerActionBtn}>
            <Icon name="arrow-left" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cleaner Profile</Text>
          <TouchableOpacity style={styles.headerActionBtn}>
            <Icon name="dots-horizontal" size={24} color="#1E293B" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Profile Summary Card */}
        <Card variant="elevated" style={styles.profileSummaryCard}>
          <View style={styles.profileSummaryRow}>
            {/* Avatar image wrapper with status indicator dot */}
            <View style={styles.avatarWrapper}>
              <Image source={require('../../assets/cleaner_avatar.png')} style={styles.avatarImg} />
              <View style={[styles.avatarStatusDot, { backgroundColor: '#16A34A' }]} />
            </View>

            {/* Profile details column */}
            <View style={styles.profileDetailsCol}>
              <View style={styles.nameBadgeRow}>
                <Text style={styles.profileName}>{nameDisplay}</Text>
                <View style={styles.activeCapsule}>
                  <Text style={styles.activeCapsuleTxt}>Active</Text>
                </View>
              </View>
              <Text style={styles.profileId}>{cleanerIdDisplay}</Text>
              <View style={styles.phoneRow}>
                <Icon name="phone" size={13} color="#64748B" />
                <Text style={styles.profilePhone}>{phoneDisplay}</Text>
              </View>
              <View style={styles.summaryRatingRow}>
                <Icon name="star" size={14} color="#F59E0B" />
                <Text style={styles.summaryRatingTxt}>{ratingDisplay} <Text style={{ color: '#64748B', fontWeight: '500' }}>(126 Reviews)</Text></Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Scrollable Tabs Nav Bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer} style={styles.tabsScrollWrapper}>
          {tabs.map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}>
              <Text style={[styles.tabItemTxt, activeTab === tab && styles.activeTabItemTxt]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tab Contents: Overview */}
        {activeTab === 'Overview' && (
          <View style={styles.tabContentContainer}>
            {/* 1. Personal Details Card */}
            <Card variant="elevated" style={styles.contentCard}>
              <View style={styles.contentCardHeader}>
                <Icon name="account-card-details-outline" size={18} color="#2563EB" />
                <Text style={styles.contentCardTitle}>Personal Details</Text>
              </View>
              <View style={styles.detailsGrid}>
                <View style={styles.detailsGridCol}>
                  <View style={styles.detailItem}>
                    <Icon name="calendar-range" size={16} color="#64748B" />
                    <View style={styles.detailTextCol}>
                      <Text style={styles.detailLabel}>Date of Birth</Text>
                      <Text style={styles.detailVal}>12 May 1992</Text>
                    </View>
                  </View>
                  <View style={styles.detailItem}>
                    <Icon name="map-marker-outline" size={16} color="#64748B" />
                    <View style={styles.detailTextCol}>
                      <Text style={styles.detailLabel}>Address</Text>
                      <Text style={styles.detailVal} numberOfLines={2}>D-103, Sector 45, Noida, UP</Text>
                    </View>
                  </View>
                  <View style={styles.detailItem}>
                    <Icon name="briefcase-outline" size={16} color="#64748B" />
                    <View style={styles.detailTextCol}>
                      <Text style={styles.detailLabel}>Experience</Text>
                      <Text style={styles.detailVal}>2 Years</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailsGridCol}>
                  <View style={styles.detailItem}>
                    <Icon name="gender-male" size={16} color="#64748B" />
                    <View style={styles.detailTextCol}>
                      <Text style={styles.detailLabel}>Gender</Text>
                      <Text style={styles.detailVal}>Male</Text>
                    </View>
                  </View>
                  <View style={styles.detailItem}>
                    <Icon name="calendar-check-outline" size={16} color="#64748B" />
                    <View style={styles.detailTextCol}>
                      <Text style={styles.detailLabel}>Joining Date</Text>
                      <Text style={styles.detailVal}>15 Jan 2024</Text>
                    </View>
                  </View>
                </View>
              </View>
            </Card>

            {/* 2. Assigned Apartments Card */}
            <Card variant="elevated" style={styles.contentCard}>
              <View style={styles.contentCardHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Icon name="office-building" size={18} color="#2563EB" />
                  <Text style={styles.contentCardTitle}>Assigned Apartments</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('ApartmentsTab')}>
                  <Text style={styles.viewAllTxt}>View All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.aptList}>
                <View style={styles.aptItem}>
                  <View style={styles.aptIconBg}>
                    <Icon name="office-building" size={18} color="#2563EB" />
                  </View>
                  <View style={styles.aptTextCol}>
                    <Text style={styles.aptName}>Sunshine Heights</Text>
                    <Text style={styles.aptLocation}>Sector 45, Noida</Text>
                  </View>
                  <View style={styles.carCountBadge}>
                    <Text style={styles.carCountBadgeTxt}>12 Cars</Text>
                  </View>
                </View>

                <View style={styles.aptItem}>
                  <View style={styles.aptIconBg}>
                    <Icon name="office-building" size={18} color="#2563EB" />
                  </View>
                  <View style={styles.aptTextCol}>
                    <Text style={styles.aptName}>Green View Apartments</Text>
                    <Text style={styles.aptLocation}>Sector 78, Noida</Text>
                  </View>
                  <View style={styles.carCountBadge}>
                    <Text style={styles.carCountBadgeTxt}>8 Cars</Text>
                  </View>
                </View>

                <View style={styles.aptItem}>
                  <View style={styles.aptIconBg}>
                    <Icon name="office-building" size={18} color="#2563EB" />
                  </View>
                  <View style={styles.aptTextCol}>
                    <Text style={styles.aptName}>Maple Residency</Text>
                    <Text style={styles.aptLocation}>Sector 50, Noida</Text>
                  </View>
                  <View style={styles.carCountBadge}>
                    <Text style={styles.carCountBadgeTxt}>6 Cars</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.assignAptBtn} onPress={() => navigation.navigate('ApartmentsTab')}>
                <Icon name="plus" size={16} color="#2563EB" />
                <Text style={styles.assignAptBtnTxt}>Assign Apartment</Text>
              </TouchableOpacity>
            </Card>

            {/* 3. Attendance Analytics Card */}
            <Card variant="elevated" style={styles.contentCard}>
              <Text style={styles.attendanceTitle}>Attendance <Text style={styles.subText}>(This Month)</Text></Text>
              <View style={styles.donutContainer}>
                {/* Donut graphic */}
                <View style={styles.donutGraphic}>
                  <View style={[styles.donutSector, { borderColor: '#10B981', transform: [{ rotate: '0deg' }] }]} />
                  <View style={[styles.donutSector, { borderColor: '#EF4444', transform: [{ rotate: '345.6deg' }] }]} />
                  <View style={[styles.donutSector, { borderColor: '#F59E0B', transform: [{ rotate: '356.4deg' }] }]} />
                  <View style={styles.donutCenter}>
                    <Text style={styles.donutCenterLabel}>Present</Text>
                    <Text style={styles.donutCenterVal}>96%</Text>
                  </View>
                </View>

                {/* Donut stats list */}
                <View style={styles.donutLegend}>
                  <View style={styles.legendRow}>
                    <Text style={styles.legendLabel}>Present Days</Text>
                    <Text style={styles.legendValue}>26</Text>
                  </View>
                  <View style={styles.legendRow}>
                    <Text style={styles.legendLabel}>Absent Days</Text>
                    <Text style={styles.legendValue}>1</Text>
                  </View>
                  <View style={styles.legendRow}>
                    <Text style={styles.legendLabel}>On Leave</Text>
                    <Text style={styles.legendValue}>1</Text>
                  </View>
                  <View style={styles.legendDivider} />
                  <View style={styles.legendRow}>
                    <Text style={[styles.legendLabel, { fontWeight: '700', color: '#1E293B' }]}>Total Days</Text>
                    <Text style={[styles.legendValue, { fontWeight: '700', color: '#1E293B' }]}>28</Text>
                  </View>
                </View>
              </View>
            </Card>

            {/* 4. Average Rating Card */}
            <Card variant="elevated" style={styles.contentCard}>
              <Text style={styles.attendanceTitle}>Average Rating</Text>
              <View style={styles.ratingSectionRow}>
                {/* Rating score column */}
                <View style={styles.ratingScoreCol}>
                  <Text style={styles.largeRatingNum}>4.8</Text>
                  <View style={styles.starsRow}>
                    <Icon name="star" size={14} color="#F59E0B" />
                    <Icon name="star" size={14} color="#F59E0B" />
                    <Icon name="star" size={14} color="#F59E0B" />
                    <Icon name="star" size={14} color="#F59E0B" />
                    <Icon name="star" size={14} color="#F59E0B" />
                  </View>
                  <Text style={styles.reviewsCountTxt}>(126 Reviews)</Text>
                </View>

                {/* Rating distribution column */}
                <View style={styles.ratingDistCol}>
                  <View style={styles.distRow}>
                    <Text style={styles.distLabel}>5 Star</Text>
                    <View style={styles.distTrack}>
                      <View style={[styles.distFill, { width: '68%', backgroundColor: '#2563EB' }]} />
                    </View>
                    <Text style={styles.distVal}>86</Text>
                  </View>

                  <View style={styles.distRow}>
                    <Text style={styles.distLabel}>4 Star</Text>
                    <View style={styles.distTrack}>
                      <View style={[styles.distFill, { width: '22%', backgroundColor: '#2563EB' }]} />
                    </View>
                    <Text style={styles.distVal}>28</Text>
                  </View>

                  <View style={styles.distRow}>
                    <Text style={styles.distLabel}>3 Star</Text>
                    <View style={styles.distTrack}>
                      <View style={[styles.distFill, { width: '6%', backgroundColor: '#2563EB' }]} />
                    </View>
                    <Text style={styles.distVal}>8</Text>
                  </View>

                  <View style={styles.distRow}>
                    <Text style={styles.distLabel}>2 Star</Text>
                    <View style={styles.distTrack}>
                      <View style={[styles.distFill, { width: '2%', backgroundColor: '#2563EB' }]} />
                    </View>
                    <Text style={styles.distVal}>2</Text>
                  </View>

                  <View style={styles.distRow}>
                    <Text style={styles.distLabel}>1 Star</Text>
                    <View style={styles.distTrack}>
                      <View style={[styles.distFill, { width: '2%', backgroundColor: '#EF4444' }]} />
                    </View>
                    <Text style={styles.distVal}>2</Text>
                  </View>
                </View>
              </View>
            </Card>

            {/* 5. Earnings Card */}
            <Card variant="elevated" style={styles.contentCard}>
              <View style={styles.contentCardHeaderRow}>
                <Text style={styles.contentCardTitle}>Earnings <Text style={styles.subText}>(This Month)</Text></Text>
                <TouchableOpacity onPress={() => navigation.navigate('SalaryDetail', { cleanerId })}>
                  <Text style={styles.viewAllTxt}>View All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.earningsGrid}>
                <View style={styles.earningsGridCol}>
                  <Text style={styles.earningsGridLabel}>Total Earnings</Text>
                  <Text style={styles.earningsGridVal}>₹12,450</Text>
                </View>
                <View style={styles.earningsGridCol}>
                  <Text style={styles.earningsGridLabel}>Incentives</Text>
                  <Text style={styles.earningsGridVal}>₹1,850</Text>
                </View>
              </View>
              <View style={styles.netEarningsCard}>
                <Icon name="wallet-outline" size={16} color="#16A34A" />
                <Text style={styles.netEarningsLabel}>Net Earnings</Text>
                <Text style={styles.netEarningsVal}>₹14,300</Text>
              </View>
            </Card>

            {/* 6. Documents Card */}
            <Card variant="elevated" style={styles.contentCard}>
              <View style={styles.contentCardHeaderRow}>
                <Text style={styles.contentCardTitle}>Documents</Text>
                <TouchableOpacity>
                  <Text style={styles.viewAllTxt}>View All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.documentsList}>
                <View style={styles.docItem}>
                  <Icon name="file-document-outline" size={18} color="#64748B" />
                  <Text style={styles.docName}>Aadhaar Card</Text>
                  <View style={styles.verifiedTag}>
                    <Icon name="check-circle" size={12} color="#16A34A" />
                    <Text style={styles.verifiedTagTxt}>Verified</Text>
                  </View>
                </View>

                <View style={styles.docItem}>
                  <Icon name="file-document-outline" size={18} color="#64748B" />
                  <Text style={styles.docName}>PAN Card</Text>
                  <View style={styles.verifiedTag}>
                    <Icon name="check-circle" size={12} color="#16A34A" />
                    <Text style={styles.verifiedTagTxt}>Verified</Text>
                  </View>
                </View>

                <View style={styles.docItem}>
                  <Icon name="bank-outline" size={18} color="#64748B" />
                  <Text style={styles.docName}>Bank Details</Text>
                  <View style={styles.verifiedTag}>
                    <Icon name="check-circle" size={12} color="#16A34A" />
                    <Text style={styles.verifiedTagTxt}>Verified</Text>
                  </View>
                </View>

                <View style={styles.docItem}>
                  <Icon name="shield-check-outline" size={18} color="#64748B" />
                  <Text style={styles.docName}>Police Verification</Text>
                  <View style={styles.verifiedTag}>
                    <Icon name="check-circle" size={12} color="#16A34A" />
                    <Text style={styles.verifiedTagTxt}>Verified</Text>
                  </View>
                </View>
              </View>
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Edit Profile bottom bar button */}
      <View style={[styles.bottomBarButtonContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16 }]}>
        <TouchableOpacity style={styles.editProfileBtn}>
          <Icon name="pencil" size={18} color="#FFFFFF" />
          <Text style={styles.editProfileBtnTxt}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  simpleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  simpleHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
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
  headerActionBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  profileSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  profileSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarStatusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  profileDetailsCol: {
    flex: 1,
    paddingLeft: 16,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  activeCapsule: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  activeCapsuleTxt: {
    fontSize: 9,
    fontWeight: '700',
    color: '#16A34A',
  },
  profileId: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  profilePhone: {
    fontSize: 12,
    color: '#64748B',
  },
  summaryRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  summaryRatingTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  tabsScrollWrapper: {
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 16,
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeTabItem: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  tabItemTxt: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabItemTxt: {
    color: '#2563EB',
    fontWeight: '700',
  },
  tabContentContainer: {
    gap: 16,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  contentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingBottom: 12,
    marginBottom: 14,
  },
  contentCardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingBottom: 12,
    marginBottom: 14,
  },
  contentCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  viewAllTxt: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  detailsGridCol: {
    flex: 1,
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  detailTextCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  detailVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 1,
  },
  aptList: {
    gap: 12,
    marginBottom: 12,
  },
  aptItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 8,
    padding: 10,
  },
  aptIconBg: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aptTextCol: {
    flex: 1,
    paddingLeft: 12,
  },
  aptName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  aptLocation: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  carCountBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  carCountBadgeTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  assignAptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  assignAptBtnTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  attendanceTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
    marginBottom: 14,
  },
  subText: {
    fontWeight: '500',
    color: '#64748B',
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
    color: '#10B981',
    fontFamily: 'Inter-Bold',
    marginTop: -2,
  },
  donutLegend: {
    flex: 1,
    paddingLeft: 16,
    gap: 6,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
  },
  legendValue: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E293B',
  },
  legendDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 2,
  },
  ratingSectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ratingScoreCol: {
    alignItems: 'center',
    paddingRight: 16,
    borderRightWidth: 1,
    borderColor: '#F1F5F9',
  },
  largeRatingNum: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  reviewsCountTxt: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 6,
    fontWeight: '500',
  },
  ratingDistCol: {
    flex: 1,
    gap: 6,
  },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
    width: 32,
  },
  distTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  distFill: {
    height: '100%',
    borderRadius: 3,
  },
  distVal: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1E293B',
    width: 16,
    textAlign: 'right',
  },
  earningsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  earningsGridCol: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 8,
    padding: 10,
  },
  earningsGridLabel: {
    fontSize: 9,
    fontWeight: '500',
    color: '#64748B',
  },
  earningsGridVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 2,
  },
  netEarningsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  netEarningsLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16A34A',
    flex: 1,
  },
  netEarningsVal: {
    fontSize: 14,
    fontWeight: '850',
    color: '#16A34A',
  },
  documentsList: {
    gap: 10,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 8,
    padding: 10,
    gap: 10,
  },
  docName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedTagTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
  },
  bottomBarButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 12,
    gap: 8,
  },
  editProfileBtnTxt: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
});

export default CleanerDetailScreen;
