import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Platform, Dimensions, StatusBar, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../../components/common/Card';

const { width, height } = Dimensions.get('window');

interface Props { navigation: any }

const WorkApprovalCenterScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeSegment, setActiveSegment] = useState('Pending');
  const [showDetailPanel, setShowDetailPanel] = useState(true); // default open side details panel as shown in wireframe
  const [searchQuery, setSearchQuery] = useState('');
  const [remarks, setRemarks] = useState('');
  const [showStatsCard, setShowStatsCard] = useState(true);

  // High fidelity mock data matching the screenshot exactly
  const pendingRequests = [
    {
      cleanerName: 'Ramesh Kumar',
      apartment: 'Sunshine Heights',
      customerName: 'Rahul Sharma',
      vehicleNo: 'DL 01 AB 1234',
      vehicleModel: 'Honda City',
      submittedTime: '20 May 2025, 09:15 AM'
    },
    {
      cleanerName: 'Suresh Yadav',
      apartment: 'Green View Apartments',
      customerName: 'Priya Singh',
      vehicleNo: 'DL 01 CD 5678',
      vehicleModel: 'Hyundai i20',
      submittedTime: '20 May 2025, 09:05 AM'
    },
    {
      cleanerName: 'Vikram Singh',
      apartment: 'Maple Residency',
      customerName: 'Amit Verma',
      vehicleNo: 'DL 01 EF 9012',
      vehicleModel: 'Maruti Swift',
      submittedTime: '20 May 2025, 08:50 AM'
    },
    {
      cleanerName: 'Arjun Patel',
      apartment: 'Skyline Towers',
      customerName: 'Neha Gupta',
      vehicleNo: 'DL 01 GH 3456',
      vehicleModel: 'Tata Nexon',
      submittedTime: '20 May 2025, 08:35 AM'
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563EB" />

      {/* Header Bar */}
      <View style={[styles.headerContainer, { paddingTop: insets.top > 0 ? insets.top + 8 : (Platform.OS === 'ios' ? 48 : 16) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn}>
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Work Approval Center</Text>
            <Text style={styles.headerSubtitle}>Review and approve cleaner work</Text>
          </View>
          
          <View style={styles.headerRightActions}>
            <TouchableOpacity style={styles.notifBtn}>
              <Icon name="bell-outline" size={24} color="#FFFFFF" />
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
              <Icon name="chevron-down" size={14} color="#E0F2FE" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main split content */}
      <View style={styles.mainSplitBody}>
        {/* Left List Pane */}
        <ScrollView style={styles.leftListPane} contentContainerStyle={styles.leftScrollContent} showsVerticalScrollIndicator={false}>
          {/* Top Metrics Cards Grid */}
          {showStatsCard && (
            <Card variant="elevated" style={styles.metricsCard}>
              <TouchableOpacity style={styles.closeStatsBtn} onPress={() => setShowStatsCard(false)}>
                <Icon name="close" size={16} color="#94A3B8" />
              </TouchableOpacity>
              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <View style={[styles.metricIconBg, { backgroundColor: '#FFF7ED' }]}>
                    <Icon name="clock-outline" size={16} color="#F97316" />
                  </View>
                  <Text style={styles.metricVal}>28</Text>
                  <Text style={styles.metricLabel}>Pending Approval</Text>
                  <TouchableOpacity>
                    <Text style={styles.viewAllTxt}>View All</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.metricItem}>
                  <View style={[styles.metricIconBg, { backgroundColor: '#ECFDF5' }]}>
                    <Icon name="check-bold" size={16} color="#16A34A" />
                  </View>
                  <Text style={styles.metricVal}>56</Text>
                  <Text style={styles.metricLabel}>Approved Today</Text>
                  <TouchableOpacity>
                    <Text style={[styles.viewAllTxt, { color: '#16A34A' }]}>View All</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.metricItem}>
                  <View style={[styles.metricIconBg, { backgroundColor: '#FEF2F2' }]}>
                    <Icon name="close-thick" size={16} color="#EF4444" />
                  </View>
                  <Text style={styles.metricVal}>6</Text>
                  <Text style={styles.metricLabel}>Rejected</Text>
                  <TouchableOpacity>
                    <Text style={[styles.viewAllTxt, { color: '#EF4444' }]}>View All</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          )}

          {/* Search and Filters */}
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Icon name="magnify" size={20} color="#94A3B8" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search cleaner, customer or vehicle..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity style={styles.filterBtn}>
              <Icon name="filter-outline" size={18} color="#64748B" />
              <Text style={styles.filterBtnTxt}>Filter</Text>
            </TouchableOpacity>
          </View>

          {/* Tabs Segmented Control */}
          <View style={styles.segmentedControl}>
            <TouchableOpacity 
              style={[styles.segmentBtn, activeSegment === 'Pending' && styles.segmentActiveBtn]}
              onPress={() => setActiveSegment('Pending')}
            >
              <Text style={[styles.segmentBtnTxt, activeSegment === 'Pending' && styles.segmentActiveBtnTxt]}>Pending (28)</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.segmentBtn, activeSegment === 'Approved' && styles.segmentActiveBtn]}
              onPress={() => setActiveSegment('Approved')}
            >
              <Text style={[styles.segmentBtnTxt, activeSegment === 'Approved' && styles.segmentActiveBtnTxt]}>Approved (56)</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.segmentBtn, activeSegment === 'Rejected' && styles.segmentActiveBtn]}
              onPress={() => setActiveSegment('Rejected')}
            >
              <Text style={[styles.segmentBtnTxt, activeSegment === 'Rejected' && styles.segmentActiveBtnTxt]}>Rejected (6)</Text>
            </TouchableOpacity>
          </View>

          {/* Pending Requests List */}
          <View style={styles.requestsList}>
            {pendingRequests.map((req, idx) => (
              <Card key={idx} variant="elevated" style={styles.requestCard}>
                {/* Header */}
                <View style={styles.reqHeaderRow}>
                  <View style={styles.cleanerDetails}>
                    <Image source={require('../../assets/cleaner_avatar.png')} style={styles.reqAvatar} />
                    <View>
                      <Text style={styles.reqCleanerName}>{req.cleanerName}</Text>
                      <Text style={styles.reqApartmentName}>{req.apartment}</Text>
                    </View>
                  </View>
                  <View style={styles.pendingBadgeCapsule}>
                    <Text style={styles.pendingBadgeTxt}>PENDING</Text>
                  </View>
                </View>

                {/* Split Details & Images content */}
                <View style={styles.reqBodyRow}>
                  {/* Left Column: text details */}
                  <View style={styles.reqTextCol}>
                    <View style={styles.reqDetailItem}>
                      <Icon name="account-outline" size={16} color="#64748B" />
                      <Text style={styles.reqDetailTextBold}>{req.customerName}</Text>
                    </View>
                    <View style={styles.reqDetailItem}>
                      <Icon name="car-outline" size={16} color="#64748B" />
                      <View>
                        <Text style={styles.reqDetailTextBold}>{req.vehicleNo}</Text>
                        <Text style={styles.reqDetailTextSub}>{req.vehicleModel}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Right Column: Before & After comparison */}
                  <View style={styles.reqImagesCol}>
                    <View style={styles.comparisonImagesContainer}>
                      <View style={styles.comparisonHalfImage}>
                        <Image source={require('../../assets/cleaner_avatar.png')} style={styles.comparisonImg} />
                        <View style={styles.imageTagLabelBg}><Text style={styles.imageTagLabelTxt}>Before</Text></View>
                      </View>
                      <View style={styles.comparisonHalfImage}>
                        <Image source={require('../../assets/cleaner_avatar.png')} style={styles.comparisonImg} />
                        <View style={styles.imageTagLabelBg}><Text style={styles.imageTagLabelTxt}>After</Text></View>
                      </View>
                      {/* Slider handle <> overlay */}
                      <View style={styles.sliderControlOverlay}>
                        <Icon name="chevron-left" size={10} color="#64748B" />
                        <Icon name="chevron-right" size={10} color="#64748B" style={{ marginLeft: -4 }} />
                      </View>
                    </View>
                    <View style={styles.submittedTimeRow}>
                      <Icon name="clock-outline" size={12} color="#64748B" />
                      <Text style={styles.submittedTimeTxt}>Submitted: {req.submittedTime}</Text>
                    </View>
                  </View>
                </View>

                {/* Bottom Action buttons */}
                <View style={styles.reqActionsRow}>
                  <TouchableOpacity style={[styles.reqActionBtn, styles.btnApproveOutline]}>
                    <Icon name="check-circle-outline" size={15} color="#16A34A" />
                    <Text style={[styles.reqActionBtnTxt, { color: '#16A34A' }]}>Approve</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.reqActionBtn, styles.btnRejectOutline]}>
                    <Icon name="close-circle-outline" size={15} color="#EF4444" />
                    <Text style={[styles.reqActionBtnTxt, { color: '#EF4444' }]}>Reject</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.reqActionBtn, styles.btnViewDetailsOutline]}
                    onPress={() => setShowDetailPanel(true)}
                  >
                    <Icon name="arrow-right-circle-outline" size={15} color="#2563EB" />
                    <Text style={[styles.reqActionBtnTxt, { color: '#2563EB' }]}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        </ScrollView>

        {/* Right Details Drawer Side Pane */}
        {showDetailPanel && (
          <ScrollView style={styles.rightDetailsPane} contentContainerStyle={styles.rightScrollContent} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.rightPaneHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon name="office-building" size={20} color="#2563EB" />
                <Text style={styles.rightPaneTitle}>Job Details</Text>
              </View>
              <TouchableOpacity onPress={() => setShowDetailPanel(false)} style={styles.rightPaneCloseBtn}>
                <Icon name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Section 1: Job Details */}
            <View style={styles.rightPaneSection}>
              <View style={styles.kvRow}>
                <Text style={styles.kvLabel}>Job ID</Text>
                <Text style={styles.kvValueBold}>JOB-2025-0520-001</Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.kvLabel}>Scheduled Time</Text>
                <Text style={styles.kvValue}>20 May 2025, 08:00 AM</Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.kvLabel}>Submitted Time</Text>
                <Text style={styles.kvValue}>20 May 2025, 09:15 AM</Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.kvLabel}>Cleaning Type</Text>
                <Text style={styles.kvValue}>Interior + Exterior</Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.kvLabel}>Work Duration</Text>
                <Text style={styles.kvValue}>1h 10m</Text>
              </View>
            </View>

            {/* Section 2: Customer Details */}
            <Text style={styles.rightPaneSectionTitle}>Customer Details</Text>
            <View style={styles.rightPaneSection}>
              <View style={styles.customerSummaryRow}>
                <Image source={require('../../assets/cleaner_avatar.png')} style={styles.custAvatar} />
                <View>
                  <Text style={styles.custName}>Rahul Sharma</Text>
                  <Text style={styles.custPhone}>98765 43210</Text>
                </View>
              </View>

              <View style={styles.detailMetaItem}>
                <Icon name="email-outline" size={16} color="#64748B" />
                <Text style={styles.detailMetaText}>rahul.sharma@email.com</Text>
              </View>

              <View style={styles.detailMetaItem}>
                <Icon name="map-marker-outline" size={16} color="#64748B" />
                <Text style={styles.detailMetaText} numberOfLines={2}>Sunshine Heights{"\n"}A-1203, Sector 45, Noida</Text>
              </View>

              <View style={styles.vehicleInfoSection}>
                <View style={styles.kvRow}>
                  <Text style={styles.kvLabel}>Vehicle</Text>
                  <Text style={styles.kvValue}>Honda City</Text>
                </View>
                <View style={styles.kvRow}>
                  <Text style={styles.kvLabel}>Number</Text>
                  <Text style={styles.kvValueBold}>DL 01 AB 1234</Text>
                </View>
              </View>
            </View>

            {/* Section 3: Timeline */}
            <Text style={styles.rightPaneSectionTitle}>Timeline</Text>
            <View style={styles.rightPaneSection}>
              {/* Node 1 */}
              <View style={styles.timelineNode}>
                <View style={styles.timelineConnectorCol}>
                  <View style={[styles.timelineDot, { backgroundColor: '#16A34A' }]}>
                    <Icon name="check" size={10} color="#FFFFFF" />
                  </View>
                  <View style={[styles.timelineLine, { backgroundColor: '#16A34A' }]} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Job Assigned</Text>
                  <Text style={styles.timelineMeta}>20 May 2025, 07:45 AM</Text>
                  <Text style={styles.timelineActor}>by System</Text>
                </View>
              </View>

              {/* Node 2 */}
              <View style={styles.timelineNode}>
                <View style={styles.timelineConnectorCol}>
                  <View style={[styles.timelineDot, { backgroundColor: '#16A34A' }]}>
                    <Icon name="check" size={10} color="#FFFFFF" />
                  </View>
                  <View style={[styles.timelineLine, { backgroundColor: '#16A34A' }]} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Cleaner Started</Text>
                  <Text style={styles.timelineMeta}>20 May 2025, 08:05 AM</Text>
                  <Text style={styles.timelineActor}>Ramesh Kumar</Text>
                </View>
              </View>

              {/* Node 3 */}
              <View style={styles.timelineNode}>
                <View style={styles.timelineConnectorCol}>
                  <View style={[styles.timelineDot, { backgroundColor: '#16A34A' }]}>
                    <Icon name="check" size={10} color="#FFFFFF" />
                  </View>
                  <View style={[styles.timelineLine, { backgroundColor: '#F97316' }]} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Work Completed</Text>
                  <Text style={styles.timelineMeta}>20 May 2025, 09:10 AM</Text>
                  <Text style={styles.timelineActor}>Ramesh Kumar</Text>
                </View>
              </View>

              {/* Node 4 */}
              <View style={styles.timelineNode}>
                <View style={styles.timelineConnectorCol}>
                  <View style={[styles.timelineDot, { backgroundColor: '#F97316' }]}>
                    <Icon name="clock-outline" size={10} color="#FFFFFF" />
                  </View>
                  <View style={[styles.timelineLine, { backgroundColor: '#CBD5E1' }]} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Submitted</Text>
                  <Text style={styles.timelineMeta}>20 May 2025, 09:15 AM</Text>
                  <Text style={styles.timelineActor}>Ramesh Kumar</Text>
                </View>
              </View>

              {/* Node 5 */}
              <View style={[styles.timelineNode, { marginBottom: 0 }]}>
                <View style={styles.timelineConnectorCol}>
                  <View style={[styles.timelineDot, { backgroundColor: '#94A3B8' }]} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineTitle, { color: '#94A3B8' }]}>Approved</Text>
                  <Text style={styles.timelineMeta}>—</Text>
                  <Text style={[styles.timelineActor, { color: '#F97316', fontWeight: '700' }]}>Pending</Text>
                </View>
              </View>
            </View>

            {/* Remarks Input */}
            <Text style={styles.rightPaneSectionTitle}>Remarks</Text>
            <View style={styles.remarksContainer}>
              <TextInput
                style={styles.remarksInput}
                placeholder="Enter remarks (optional)..."
                placeholderTextColor="#94A3B8"
                value={remarks}
                onChangeText={setRemarks}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Bottom Actions Buttons */}
            <View style={styles.rightPaneActionsContainer}>
              <TouchableOpacity style={styles.btnSolidApprove}>
                <Icon name="check-circle" size={16} color="#FFFFFF" />
                <Text style={styles.btnSolidApproveTxt}>Approve Work</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnSolidReject}>
                <Icon name="close-circle" size={16} color="#FFFFFF" />
                <Text style={styles.btnSolidRejectTxt}>Reject Work</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnOutlineEscalate}>
                <Icon name="arrow-up-bold-circle-outline" size={16} color="#2563EB" />
                <Text style={styles.btnOutlineEscalateTxt}>Escalate</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
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
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notifBtn: {
    position: 'relative',
    padding: 6,
    marginRight: 10,
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
    backgroundColor: 'rgba(255,255,255,0.15)',
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
    color: '#FFFFFF',
  },
  profileDropdownCode: {
    fontSize: 8,
    color: '#E0F2FE',
    marginTop: -1,
  },
  mainSplitBody: {
    flex: 1,
    flexDirection: 'row',
  },
  leftListPane: {
    flex: 1.1,
  },
  leftScrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  metricsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  closeStatsBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricIconBg: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  viewAllTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F97316',
    marginTop: 6,
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
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 3,
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentActiveBtn: {
    backgroundColor: '#2563EB',
  },
  segmentBtnTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  segmentActiveBtnTxt: {
    color: '#FFFFFF',
  },
  requestsList: {
    gap: 14,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reqHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingBottom: 10,
    marginBottom: 12,
  },
  cleanerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reqAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  reqCleanerName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  reqApartmentName: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  pendingBadgeCapsule: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  pendingBadgeTxt: {
    fontSize: 9,
    fontWeight: '700',
    color: '#F97316',
  },
  reqBodyRow: {
    flexDirection: 'row',
    gap: 12,
  },
  reqTextCol: {
    width: '42%',
    gap: 12,
  },
  reqDetailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  reqDetailTextBold: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  reqDetailTextSub: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 1,
  },
  reqImagesCol: {
    flex: 1,
  },
  comparisonImagesContainer: {
    flexDirection: 'row',
    height: 90,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  comparisonHalfImage: {
    flex: 1,
    position: 'relative',
  },
  comparisonImg: {
    width: '100%',
    height: '100%',
  },
  imageTagLabelBg: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  imageTagLabelTxt: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sliderControlOverlay: {
    position: 'absolute',
    top: '35%',
    left: '46%',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  submittedTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    justifyContent: 'flex-end',
  },
  submittedTimeTxt: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '500',
  },
  reqActionsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    marginTop: 12,
    paddingTop: 10,
    gap: 8,
  },
  reqActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 8,
    gap: 4,
    backgroundColor: '#FFFFFF',
  },
  btnApproveOutline: {
    borderColor: '#16A34A',
  },
  btnRejectOutline: {
    borderColor: '#EF4444',
  },
  btnViewDetailsOutline: {
    borderColor: '#2563EB',
  },
  reqActionBtnTxt: {
    fontSize: 10,
    fontWeight: '700',
  },
  rightDetailsPane: {
    width: 320,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderColor: '#E2E8F0',
  },
  rightScrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  rightPaneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingBottom: 12,
    marginBottom: 14,
  },
  rightPaneTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  rightPaneCloseBtn: {
    padding: 4,
  },
  rightPaneSection: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  rightPaneSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
    marginBottom: 10,
  },
  kvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kvLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  kvValue: {
    fontSize: 10,
    color: '#1E293B',
    fontWeight: '600',
  },
  kvValueBold: {
    fontSize: 10,
    color: '#1E293B',
    fontWeight: '850',
  },
  customerSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    paddingBottom: 8,
    marginBottom: 2,
  },
  custAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  custName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  custPhone: {
    fontSize: 10,
    color: '#64748B',
  },
  detailMetaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  detailMetaText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
    lineHeight: 14,
  },
  vehicleInfoSection: {
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    paddingTop: 8,
    marginTop: 2,
    gap: 8,
  },
  timelineNode: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  timelineConnectorCol: {
    alignItems: 'center',
    width: 20,
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 10,
  },
  timelineTitle: {
    fontSize: 11,
    fontWeight: '750',
    color: '#1E293B',
  },
  timelineMeta: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 1,
  },
  timelineActor: {
    fontSize: 9,
    color: '#2563EB',
    fontWeight: '500',
    marginTop: 1,
  },
  remarksContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 16,
  },
  remarksInput: {
    fontSize: 11,
    color: '#1E293B',
    padding: 0,
    minHeight: 48,
    textAlignVertical: 'top',
  },
  rightPaneActionsContainer: {
    gap: 10,
  },
  btnSolidApprove: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  btnSolidApproveTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  btnSolidReject: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  btnSolidRejectTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  btnOutlineEscalate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  btnOutlineEscalateTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
});

export default WorkApprovalCenterScreen;
