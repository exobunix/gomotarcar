import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Props { navigation: any; route: any }

const IssueTrackingScreen: React.FC<Props> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('details');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.blueHeaderBg}>
        <View style={styles.topHeaderRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.mainTitle}>Issue Tracking</Text>
            <Text style={styles.mainSubTitle}>Track the status of your reported issue</Text>
          </View>
          <TouchableOpacity style={{ padding: 4 }} onPress={() => navigation.navigate('Notifications')}>
            <Icon name="bell-outline" size={24} color="#FFF" />
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeTxt}>2</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top Summary Card */}
        <View style={styles.topCard}>
          <View style={styles.tcHeaderRow}>
            <View style={styles.issueIdBadge}>
              <Text style={styles.issueIdBadgeTxt}>ISSUE ID</Text>
              <Text style={styles.issueIdVal}>ISS-2025-0515-0012</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeTxt}>In Progress</Text>
            </View>
          </View>

          <View style={styles.tcMainContent}>
            <View style={styles.tcIconBg}>
              <Icon name="water-outline" size={32} color="#DC2626" />
            </View>
            <View style={styles.tcInfo}>
              <Text style={styles.tcTitle}>Cleaning Quality</Text>
              <Text style={styles.tcDesc}>Bathroom sink and glass not cleaned properly. Water marks and stains are still visible.</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.tcFooterGrid}>
            <View style={styles.tcFooterCol}>
              <View style={styles.ftLblRow}>
                <Icon name="calendar-month-outline" size={12} color="#2563EB" />
                <Text style={styles.ftLbl}>Reported On</Text>
              </View>
              <Text style={styles.ftVal}>15 May 2025, 10:30 AM</Text>
            </View>
            <View style={styles.gridDivider} />
            <View style={styles.tcFooterCol}>
              <View style={styles.ftLblRow}>
                <Icon name="map-marker-outline" size={12} color="#2563EB" />
                <Text style={styles.ftLbl}>Property</Text>
              </View>
              <Text style={styles.ftVal}>Green Valley Apartments</Text>
              <Text style={styles.ftSub}>Tower A • Flat 101</Text>
            </View>
            <View style={styles.gridDivider} />
            <View style={styles.tcFooterCol}>
              <View style={styles.ftLblRow}>
                <Icon name="account-outline" size={12} color="#2563EB" />
                <Text style={styles.ftLbl}>Reported By</Text>
              </View>
              <Text style={styles.ftVal}>Rohit Sharma</Text>
              <Text style={styles.ftSubBlue}>+91 98765 43210</Text>
            </View>
          </View>
        </View>

        {/* Issue Progress Tracker */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Issue Progress</Text>
          
          <View style={styles.stepperContainer}>
            {/* Step 1 */}
            <View style={styles.stepItem}>
              <View style={styles.stepIconCompleted}>
                <Icon name="check" size={14} color="#FFF" />
              </View>
              <Text style={styles.stepTitleCompleted}>Reported</Text>
              <Text style={styles.stepTime}>15 May, 10:30 AM</Text>
            </View>
            
            <View style={[styles.stepLine, styles.stepLineCompleted]} />

            {/* Step 2 */}
            <View style={styles.stepItem}>
              <View style={styles.stepIconActive}>
                <View style={styles.stepIconActiveInner} />
              </View>
              <Text style={styles.stepTitleActive}>In Progress</Text>
              <Text style={styles.stepTime}>15 May, 11:15 AM</Text>
            </View>

            <View style={[styles.stepLine, styles.stepLinePending]} />

            {/* Step 3 */}
            <View style={styles.stepItem}>
              <View style={styles.stepIconPending} />
              <Text style={styles.stepTitlePending}>Assigned</Text>
              <Text style={styles.stepTime}>Pending</Text>
            </View>

            <View style={[styles.stepLine, styles.stepLinePending]} />

            {/* Step 4 */}
            <View style={styles.stepItem}>
              <View style={styles.stepIconPending} />
              <Text style={styles.stepTitlePending}>Resolved</Text>
              <Text style={styles.stepTime}>Pending</Text>
            </View>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <View style={styles.infoIconBg}><Icon name="information-variant" size={18} color="#FFF" /></View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Our team is working on your issue.</Text>
              <Text style={styles.infoSub}>We will notify you once it is resolved.</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity style={[styles.tabItem, activeTab === 'details' && styles.tabActive]} onPress={() => setActiveTab('details')}>
            <Text style={[styles.tabTxt, activeTab === 'details' && styles.tabTxtActive]}>Issue Details</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabItem, activeTab === 'photos' && styles.tabActive]} onPress={() => setActiveTab('photos')}>
            <Text style={[styles.tabTxt, activeTab === 'photos' && styles.tabTxtActive]}>Photos (3)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabItem, activeTab === 'comments' && styles.tabActive]} onPress={() => setActiveTab('comments')}>
            <Text style={[styles.tabTxt, activeTab === 'comments' && styles.tabTxtActive]}>Comments (1)</Text>
          </TouchableOpacity>
        </View>

        {/* Details Content */}
        {activeTab === 'details' && (
          <View style={styles.detailsBlock}>
            <View style={styles.detailRow}>
              <View style={styles.dtLblCol}>
                <View style={[styles.dtIconBg, { backgroundColor: '#EFF6FF' }]}><Icon name="tag-outline" size={16} color="#2563EB" /></View>
                <Text style={styles.dtLblTxt}>Issue Type</Text>
              </View>
              <Text style={styles.dtValTxt}>Cleaning Quality</Text>
            </View>
            <View style={styles.itemDivider} />

            <View style={styles.detailRow}>
              <View style={styles.dtLblCol}>
                <View style={[styles.dtIconBg, { backgroundColor: '#FFF7ED' }]}><Icon name="alert-outline" size={16} color="#EA580C" /></View>
                <Text style={styles.dtLblTxt}>Priority</Text>
              </View>
              <View style={styles.highBadge}><Text style={styles.highBadgeTxt}>High</Text></View>
            </View>
            <View style={styles.itemDivider} />

            <View style={styles.detailRow}>
              <View style={styles.dtLblCol}>
                <View style={[styles.dtIconBg, { backgroundColor: '#ECFDF5' }]}><Icon name="calendar-month-outline" size={16} color="#16A34A" /></View>
                <Text style={styles.dtLblTxt}>Reported On</Text>
              </View>
              <Text style={styles.dtValTxt}>15 May 2025, 10:30 AM</Text>
            </View>
            <View style={styles.itemDivider} />

            <View style={[styles.detailRow, { alignItems: 'flex-start' }]}>
              <View style={styles.dtLblCol}>
                <View style={[styles.dtIconBg, { backgroundColor: '#F3E8FF' }]}><Icon name="file-document-outline" size={16} color="#9333EA" /></View>
                <Text style={styles.dtLblTxt}>Description</Text>
              </View>
              <View style={{ flex: 1, paddingLeft: 16 }}>
                <Text style={[styles.dtValTxt, { textAlign: 'right', lineHeight: 20 }]}>Bathroom sink and glass not cleaned properly. Water marks and stains are still visible.</Text>
                <TouchableOpacity style={{ alignSelf: 'flex-end', marginTop: 4 }}>
                  <Text style={{ color: '#2563EB', fontSize: 12, fontWeight: '600' }}>View More <Icon name="chevron-down" size={12}/></Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Assigned To Card */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Assigned To</Text>
          <View style={styles.assignedCard}>
            <View style={styles.acAvatarBg}><Icon name="account" size={32} color="#2563EB" /></View>
            <View style={styles.acInfo}>
              <Text style={styles.acName}>Sunil Kumar</Text>
              <Text style={styles.acRole}>Field Supervisor</Text>
              <View style={styles.acPhoneRow}>
                <Icon name="phone-outline" size={12} color="#2563EB" />
                <Text style={styles.acPhoneTxt}>+91 98765 67890</Text>
              </View>
            </View>
            <View style={styles.acDateCol}>
              <Text style={styles.acDateLbl}>Assigned On</Text>
              <Text style={styles.acDateVal}>15 May 2025, 11:15 AM</Text>
            </View>
          </View>
        </View>

        {/* Activity Timeline */}
        <View style={[styles.sectionBlock, { marginBottom: 40 }]}>
          <Text style={styles.sectionTitle}>Activity Timeline</Text>
          
          <View style={styles.timelineContainer}>
            {/* Item 1 */}
            <View style={styles.tlRow}>
              <View style={styles.tlDotCol}>
                <View style={[styles.tlDot, { backgroundColor: '#2563EB' }]} />
                <View style={[styles.tlLine, { backgroundColor: '#E2E8F0' }]} />
              </View>
              <View style={styles.tlContentCard}>
                <View style={[styles.tlIconBg, { backgroundColor: '#EFF6FF' }]}><Icon name="account-group-outline" size={18} color="#2563EB" /></View>
                <View style={styles.tlTextCol}>
                  <Text style={styles.tlTitle}>Issue reported</Text>
                  <Text style={styles.tlSub}>Rohit Sharma • 15 May 2025, 10:30 AM</Text>
                </View>
                <Icon name="chevron-down" size={20} color="#94A3B8" />
              </View>
            </View>

            {/* Item 2 */}
            <View style={styles.tlRow}>
              <View style={styles.tlDotCol}>
                <View style={[styles.tlDot, { backgroundColor: '#EA580C' }]} />
                <View style={[styles.tlLine, { backgroundColor: '#E2E8F0' }]} />
              </View>
              <View style={styles.tlContentCard}>
                <View style={[styles.tlIconBg, { backgroundColor: '#EFF6FF' }]}><Icon name="account-outline" size={18} color="#2563EB" /></View>
                <View style={styles.tlTextCol}>
                  <Text style={styles.tlTitle}>Issue assigned to Sunil Kumar</Text>
                  <Text style={styles.tlSub}>System • 15 May 2025, 11:15 AM</Text>
                </View>
                <Icon name="chevron-down" size={20} color="#94A3B8" />
              </View>
            </View>

            {/* Item 3 */}
            <View style={[styles.tlRow, { paddingBottom: 0 }]}>
              <View style={styles.tlDotCol}>
                <View style={[styles.tlDot, { backgroundColor: '#CBD5E1' }]} />
              </View>
              <View style={[styles.tlContentCard, { backgroundColor: '#FAFAFA' }]}>
                <View style={[styles.tlIconBg, { backgroundColor: '#E2E8F0' }]}><Icon name="dots-horizontal" size={18} color="#475569" /></View>
                <View style={styles.tlTextCol}>
                  <Text style={styles.tlTitle}>Work in progress</Text>
                  <Text style={styles.tlSub}>Sunil Kumar • 15 May 2025, 11:30 AM</Text>
                  <Text style={styles.tlComment}>We have started investigating the issue.</Text>
                </View>
              </View>
            </View>

          </View>
        </View>

      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.btnOutlineBlue}>
          <Icon name="message-outline" size={18} color="#2563EB" />
          <Text style={styles.btnOutlineBlueTxt}>Add Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSolidBlue}>
          <Icon name="headset" size={18} color="#FFF" />
          <Text style={styles.btnSolidBlueTxt}>Contact Support</Text>
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
    zIndex: 1,
  },
  topHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitles: { flex: 1, paddingHorizontal: 12 },
  mainTitle: { fontSize: 20, fontWeight: '700', color: '#FFF', fontFamily: 'Inter-Bold' },
  mainSubTitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter-Medium', marginTop: 2 },
  bellBadge: { position: 'absolute', top: 2, right: 2, backgroundColor: '#EF4444', width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#0D5BD7' },
  bellBadgeTxt: { color: '#FFF', fontSize: 8, fontWeight: '700' },

  scrollView: { flex: 1, marginTop: -40, zIndex: 2, elevation: 5 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

  topCard: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4, marginBottom: 20 },
  tcHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  issueIdBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  issueIdBadgeTxt: { fontSize: 9, fontWeight: '800', color: '#DC2626', fontFamily: 'Inter-Bold', backgroundColor: '#FEE2E2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
  issueIdVal: { fontSize: 11, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  statusBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusBadgeTxt: { fontSize: 10, fontWeight: '700', color: '#DC2626', fontFamily: 'Inter-Bold' },

  tcMainContent: { flexDirection: 'row', alignItems: 'flex-start' },
  tcIconBg: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  tcInfo: { flex: 1 },
  tcTitle: { fontSize: 16, fontWeight: '800', color: colors.darkNavy, fontFamily: 'Inter-Bold', marginBottom: 6 },
  tcDesc: { fontSize: 12, color: '#475569', fontFamily: 'Inter-Medium', lineHeight: 18 },

  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },

  tcFooterGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  tcFooterCol: { flex: 1 },
  ftLblRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  ftLbl: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium', marginLeft: 4 },
  ftVal: { fontSize: 10, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold', marginBottom: 2 },
  ftSub: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Regular' },
  ftSubBlue: { fontSize: 9, color: '#2563EB', fontFamily: 'Inter-SemiBold' },
  gridDivider: { width: 1, height: '100%', backgroundColor: '#F1F5F9', marginHorizontal: 8 },

  sectionBlock: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.darkNavy, fontFamily: 'Inter-Bold', marginBottom: 16 },

  stepperContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, position: 'relative' },
  stepItem: { alignItems: 'center', width: 64, zIndex: 2 },
  stepIconCompleted: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  stepIconActive: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#EFF6FF', borderWidth: 1.5, borderColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  stepIconActiveInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#2563EB' },
  stepIconPending: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#E2E8F0', marginBottom: 8 },
  stepTitleCompleted: { fontSize: 10, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold', textAlign: 'center' },
  stepTitleActive: { fontSize: 10, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold', textAlign: 'center' },
  stepTitlePending: { fontSize: 10, fontWeight: '600', color: '#64748B', fontFamily: 'Inter-SemiBold', textAlign: 'center' },
  stepTime: { fontSize: 8, color: '#94A3B8', fontFamily: 'Inter-Medium', textAlign: 'center', marginTop: 4 },
  
  stepLine: { position: 'absolute', top: 11, height: 2, width: '25%', zIndex: 1 },
  stepLineCompleted: { backgroundColor: '#16A34A', left: '12%' },
  stepLinePending: { backgroundColor: '#E2E8F0', left: '44%' }, // Abstracted for simplicity, in a real dynamic map this is calculated

  infoBox: { flexDirection: 'row', backgroundColor: '#EFF6FF', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#BFDBFE' },
  infoIconBg: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: 12, fontWeight: '700', color: '#1E3A8A', fontFamily: 'Inter-Bold' },
  infoSub: { fontSize: 11, color: '#475569', fontFamily: 'Inter-Medium', marginTop: 2 },

  tabsRow: { flexDirection: 'row', paddingHorizontal: 4, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tabItem: { paddingBottom: 12, marginRight: 24, paddingHorizontal: 4 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#2563EB' },
  tabTxt: { fontSize: 13, fontWeight: '600', color: '#64748B', fontFamily: 'Inter-SemiBold' },
  tabTxtActive: { color: '#2563EB', fontWeight: '700' },

  detailsBlock: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  detailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  dtLblCol: { flexDirection: 'row', alignItems: 'center' },
  dtIconBg: { width: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  dtLblTxt: { fontSize: 13, color: '#475569', fontFamily: 'Inter-Medium' },
  dtValTxt: { fontSize: 13, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  itemDivider: { height: 1, backgroundColor: '#F1F5F9' },
  highBadge: { backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  highBadgeTxt: { fontSize: 11, fontWeight: '700', color: '#DC2626', fontFamily: 'Inter-Bold' },

  assignedCard: { flexDirection: 'row', alignItems: 'center' },
  acAvatarBg: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  acInfo: { flex: 1 },
  acName: { fontSize: 13, fontWeight: '800', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  acRole: { fontSize: 11, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 2 },
  acPhoneRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  acPhoneTxt: { fontSize: 11, fontWeight: '600', color: '#2563EB', fontFamily: 'Inter-SemiBold', marginLeft: 4 },
  acDateCol: { alignItems: 'flex-end', borderLeftWidth: 1, borderLeftColor: '#E2E8F0', paddingLeft: 16 },
  acDateLbl: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium' },
  acDateVal: { fontSize: 10, color: colors.darkNavy, fontFamily: 'Inter-Medium', marginTop: 4 },

  timelineContainer: { paddingLeft: 8 },
  tlRow: { flexDirection: 'row', paddingBottom: 20 },
  tlDotCol: { width: 24, alignItems: 'center' },
  tlDot: { width: 10, height: 10, borderRadius: 5, marginTop: 18 },
  tlLine: { width: 1, flex: 1, marginTop: 4 },
  tlContentCard: { flex: 1, flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 12, padding: 12 },
  tlIconBg: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  tlTextCol: { flex: 1 },
  tlTitle: { fontSize: 13, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  tlSub: { fontSize: 11, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 4 },
  tlComment: { fontSize: 11, fontWeight: '600', color: colors.darkNavy, fontFamily: 'Inter-SemiBold', marginTop: 8 },

  bottomActions: { flexDirection: 'row', padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', justifyContent: 'space-between' },
  btnOutlineBlue: { width: '48%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#2563EB', borderRadius: 12, paddingVertical: 14 },
  btnOutlineBlueTxt: { fontSize: 14, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold', marginLeft: 8 },
  btnSolidBlue: { width: '48%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563EB', borderRadius: 12, paddingVertical: 14 },
  btnSolidBlueTxt: { fontSize: 14, fontWeight: '700', color: '#FFF', fontFamily: 'Inter-Bold', marginLeft: 8 },
});

export default IssueTrackingScreen;
