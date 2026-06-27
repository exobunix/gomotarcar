import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Platform, Dimensions, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../../components/common/Card';

const { width } = Dimensions.get('window');

interface Props { navigation: any }

const GrievanceListScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeSegment, setActiveSegment] = useState('Open');
  const [showDetailPanel, setShowDetailPanel] = useState(true); // default open side details panel as shown in wireframe
  const [searchQuery, setSearchQuery] = useState('');

  const complaintsList = [
    {
      id: 'CMP-2025-0018',
      customerName: 'Rahul Sharma',
      phone: '98765 43210',
      subject: 'Water Spots on Car',
      apartment: 'Sunshine Heights',
      raisedTime: '20 May 2025, 09:15 AM',
      priority: 'High',
      priorityColor: '#EF4444',
      priorityBg: '#FEF2F2',
      status: 'Open',
      statusColor: '#EF4444',
      statusBg: '#FEF2F2'
    },
    {
      id: 'CMP-2025-0017',
      customerName: 'Priya Singh',
      phone: '98123 45678',
      subject: 'Interior Cleaning Not Done Properly',
      apartment: 'Green View Apartments',
      raisedTime: '20 May 2025, 08:50 AM',
      priority: 'Medium',
      priorityColor: '#F97316',
      priorityBg: '#FFF7ED',
      status: 'In Progress',
      statusColor: '#F97316',
      statusBg: '#FFF7ED'
    },
    {
      id: 'CMP-2025-0016',
      customerName: 'Amit Verma',
      phone: '96543 21098',
      subject: 'Scratch on Rear Bumper',
      apartment: 'Maple Residency',
      raisedTime: '20 May 2025, 08:30 AM',
      priority: 'High',
      priorityColor: '#EF4444',
      priorityBg: '#FEF2F2',
      status: 'Open',
      statusColor: '#EF4444',
      statusBg: '#FEF2F2'
    },
    {
      id: 'CMP-2025-0015',
      customerName: 'Neha Gupta',
      phone: '97123 45609',
      subject: 'Cleaner Did Not Arrive',
      apartment: 'Skyline Towers',
      raisedTime: '19 May 2025, 07:45 PM',
      priority: 'Medium',
      priorityColor: '#F97316',
      priorityBg: '#FFF7ED',
      status: 'In Progress',
      statusColor: '#F97316',
      statusBg: '#FFF7ED'
    },
    {
      id: 'CMP-2025-0014',
      customerName: 'Vikas Yadav',
      phone: '98111 22334',
      subject: 'Extra Charges Applied',
      apartment: 'Palm Paradise',
      raisedTime: '19 May 2025, 06:20 PM',
      priority: 'Low',
      priorityColor: '#16A34A',
      priorityBg: '#ECFDF5',
      status: 'Open',
      statusColor: '#EF4444',
      statusBg: '#FEF2F2'
    },
    {
      id: 'CMP-2025-0013',
      customerName: 'Deepak Sharma',
      phone: '95822 21009',
      subject: 'Bad Odour After Cleaning',
      apartment: 'Oasis Apartments',
      raisedTime: '19 May 2025, 05:10 PM',
      priority: 'Medium',
      priorityColor: '#F97316',
      priorityBg: '#FFF7ED',
      status: 'In Progress',
      statusColor: '#F97316',
      statusBg: '#FFF7ED'
    },
    {
      id: 'CMP-2025-0012',
      customerName: 'Pankaj Mehta',
      phone: '98712 33445',
      subject: 'Delay in Service',
      apartment: 'Silver Springs',
      raisedTime: '19 May 2025, 04:40 PM',
      priority: 'Low',
      priorityColor: '#16A34A',
      priorityBg: '#ECFDF5',
      status: 'Open',
      statusColor: '#EF4444',
      statusBg: '#FEF2F2'
    },
    {
      id: 'CMP-2025-0011',
      customerName: 'Suresh Yadav',
      phone: '98701 11223',
      subject: 'Incomplete Exterior Wash',
      apartment: 'Green View Apartments',
      raisedTime: '19 May 2025, 03:25 PM',
      priority: 'High',
      priorityColor: '#EF4444',
      priorityBg: '#FEF2F2',
      status: 'Open',
      statusColor: '#EF4444',
      statusBg: '#FEF2F2'
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

      {/* Split Main Body layout */}
      <View style={styles.mainSplitBody}>
        
        {/* Left List Pane */}
        <ScrollView style={styles.leftListPane} contentContainerStyle={styles.leftScrollContent} showsVerticalScrollIndicator={false}>
          {/* Main Title Section */}
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.mainTitle}>Complaint Management</Text>
              <Text style={styles.subTitle}>Track, assign and resolve complaints</Text>
            </View>
            <TouchableOpacity style={styles.datePickerBtn}>
              <Icon name="calendar-month-outline" size={16} color="#2563EB" />
              <Text style={styles.datePickerTxt}>20 May 2025</Text>
              <Icon name="chevron-down" size={14} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Analytics Metrics Cards Row */}
          <View style={styles.analyticsGrid}>
            <Card variant="elevated" style={styles.analyticsCard}>
              <View style={[styles.cardIconBg, { backgroundColor: '#FEF2F2' }]}>
                <Icon name="message-text-outline" size={16} color="#EF4444" />
              </View>
              <Text style={styles.cardVal}>18</Text>
              <Text style={[styles.cardLabel, { color: '#EF4444' }]}>Open</Text>
              <TouchableOpacity>
                <Text style={[styles.viewAllTxt, { color: '#EF4444' }]}>View All</Text>
              </TouchableOpacity>
            </Card>

            <Card variant="elevated" style={styles.analyticsCard}>
              <View style={[styles.cardIconBg, { backgroundColor: '#FFF7ED' }]}>
                <Icon name="clock-outline" size={16} color="#F97316" />
              </View>
              <Text style={styles.cardVal}>12</Text>
              <Text style={[styles.cardLabel, { color: '#F97316' }]}>In Progress</Text>
              <TouchableOpacity>
                <Text style={[styles.viewAllTxt, { color: '#F97316' }]}>View All</Text>
              </TouchableOpacity>
            </Card>

            <Card variant="elevated" style={styles.analyticsCard}>
              <View style={[styles.cardIconBg, { backgroundColor: '#ECFDF5' }]}>
                <Icon name="check-circle-outline" size={16} color="#16A34A" />
              </View>
              <Text style={styles.cardVal}>36</Text>
              <Text style={[styles.cardLabel, { color: '#16A34A' }]}>Closed</Text>
              <TouchableOpacity>
                <Text style={[styles.viewAllTxt, { color: '#16A34A' }]}>View All</Text>
              </TouchableOpacity>
            </Card>
          </View>

          {/* Search Row */}
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Icon name="magnify" size={20} color="#94A3B8" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search complaint ID, customer or subject..."
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

          {/* Segmented control tabs */}
          <View style={styles.segmentedControl}>
            <TouchableOpacity 
              style={[styles.segmentBtn, activeSegment === 'Open' && styles.segmentActiveBtn]}
              onPress={() => setActiveSegment('Open')}
            >
              <Text style={[styles.segmentBtnTxt, activeSegment === 'Open' && styles.segmentActiveBtnTxt]}>Open (18)</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.segmentBtn, activeSegment === 'In Progress' && styles.segmentActiveBtn]}
              onPress={() => setActiveSegment('In Progress')}
            >
              <Text style={[styles.segmentBtnTxt, activeSegment === 'In Progress' && styles.segmentActiveBtnTxt]}>In Progress (12)</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.segmentBtn, activeSegment === 'Closed' && styles.segmentActiveBtn]}
              onPress={() => setActiveSegment('Closed')}
            >
              <Text style={[styles.segmentBtnTxt, activeSegment === 'Closed' && styles.segmentActiveBtnTxt]}>Closed (36)</Text>
            </TouchableOpacity>
          </View>

          {/* Complaints Cards List */}
          <View style={styles.complaintsList}>
            {complaintsList.map((complaint) => (
              <TouchableOpacity 
                key={complaint.id} 
                onPress={() => setShowDetailPanel(true)}
              >
                <Card variant="elevated" style={styles.complaintCard}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.ticketIdTxt}>{complaint.id}</Text>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <View style={[styles.pillBadge, { borderColor: complaint.priorityColor }]}>
                        <Text style={[styles.pillBadgeTxt, { color: complaint.priorityColor }]}>{complaint.priority}</Text>
                      </View>
                      <View style={[styles.pillBadge, { borderColor: complaint.statusColor }]}>
                        <Text style={[styles.pillBadgeTxt, { color: complaint.statusColor }]}>{complaint.status}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.cardBodyRow}>
                    {/* Customer */}
                    <View style={styles.customerCol}>
                      <Image source={require('../../assets/cleaner_avatar.png')} style={styles.custAvatarSmall} />
                      <View>
                        <Text style={styles.custNameSmall}>{complaint.customerName}</Text>
                        <Text style={styles.custPhoneSmall}>{complaint.phone}</Text>
                      </View>
                    </View>

                    {/* Complaint details */}
                    <View style={styles.complaintDetailsCol}>
                      <Text style={styles.subjectTxt} numberOfLines={1}>{complaint.subject}</Text>
                      <Text style={styles.apartmentTxt} numberOfLines={1}>{complaint.apartment}</Text>
                      
                      <View style={styles.raisedTimeRow}>
                        <Icon name="clock-outline" size={12} color="#64748B" />
                        <Text style={styles.raisedTimeTxt}>{complaint.raisedTime}</Text>
                      </View>
                    </View>

                    {/* Right link arrow */}
                    <Icon name="chevron-right" size={20} color="#94A3B8" />
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>

          {/* Pagination Footer */}
          <View style={styles.paginationRow}>
            <Text style={styles.showingText}>Showing 1 to 8 of 18 complaints</Text>
            <View style={styles.pageBtnRow}>
              <TouchableOpacity style={styles.pageArrowBtn}>
                <Icon name="chevron-left" size={16} color="#64748B" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pageBtn, styles.activePageBtn]}>
                <Text style={[styles.pageBtnTxt, styles.activePageBtnTxt]}>1</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pageBtn}>
                <Text style={styles.pageBtnTxt}>2</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pageBtn}>
                <Text style={styles.pageBtnTxt}>3</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pageArrowBtn}>
                <Icon name="chevron-right" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Right Details Panel Drawer */}
        {showDetailPanel && (
          <ScrollView style={styles.rightDetailsPane} contentContainerStyle={styles.rightScrollContent} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.rightPaneHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.rightPaneTitle}>CMP-2025-0018</Text>
                <View style={[styles.statusCapsuleSolid, { backgroundColor: '#EF4444' }]}>
                  <Text style={styles.statusCapsuleSolidTxt}>Open</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowDetailPanel(false)} style={styles.rightPaneCloseBtn}>
                <Icon name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Subject Info */}
            <View style={styles.subjectCardSection}>
              <View style={styles.kvRow}>
                <Text style={styles.kvLabel}>Subject</Text>
                <Text style={styles.kvValueBold}>Water Spots on Car</Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.kvLabel}>Priority</Text>
                <Text style={[styles.kvValueBold, { color: '#EF4444' }]}>High</Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.kvLabel}>Raised Date</Text>
                <Text style={styles.kvValue}>20 May 2025, 09:15 AM</Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.kvLabel}>Apartment</Text>
                <Text style={styles.kvValue}>Sunshine Heights</Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.kvLabel}>Vehicle</Text>
                <Text style={styles.kvValueBold}>DL 01 AB 1234</Text>
              </View>
            </View>

            {/* Timeline */}
            <Text style={styles.rightPaneSectionTitle}>Timeline</Text>
            <View style={styles.timelineSection}>
              {/* Step 1 */}
              <View style={styles.timelineNode}>
                <View style={styles.timelineConnectorCol}>
                  <View style={[styles.timelineDot, { backgroundColor: '#EF4444' }]}>
                    <Icon name="check" size={10} color="#FFFFFF" />
                  </View>
                  <View style={[styles.timelineLine, { backgroundColor: '#EF4444' }]} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Complaint Raised</Text>
                  <Text style={styles.timelineMeta}>20 May 2025, 09:15 AM</Text>
                  <Text style={styles.timelineActor}>by Rahul Sharma</Text>
                </View>
              </View>

              {/* Step 2 */}
              <View style={styles.timelineNode}>
                <View style={styles.timelineConnectorCol}>
                  <View style={[styles.timelineDot, { backgroundColor: '#F97316' }]}>
                    <Icon name="check" size={10} color="#FFFFFF" />
                  </View>
                  <View style={[styles.timelineLine, { backgroundColor: '#2563EB' }]} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Assigned to Cleaner</Text>
                  <Text style={styles.timelineMeta}>Ramesh Kumar</Text>
                  <Text style={styles.timelineActor}>20 May 2025, 09:25 AM</Text>
                </View>
              </View>

              {/* Step 3 */}
              <View style={styles.timelineNode}>
                <View style={styles.timelineConnectorCol}>
                  <View style={[styles.timelineDot, { backgroundColor: '#2563EB' }]}>
                    <Icon name="check" size={10} color="#FFFFFF" />
                  </View>
                  <View style={[styles.timelineLine, { backgroundColor: '#CBD5E1' }]} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>In Progress</Text>
                  <Text style={styles.timelineMeta}>20 May 2025, 10:05 AM</Text>
                  <Text style={styles.timelineActor}>Cleaner Started Work</Text>
                </View>
              </View>

              {/* Step 4 */}
              <View style={[styles.timelineNode, { marginBottom: 0 }]}>
                <View style={styles.timelineConnectorCol}>
                  <View style={[styles.timelineDot, { backgroundColor: '#94A3B8' }]} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineTitle, { color: '#94A3B8' }]}>Pending Resolution</Text>
                  <Text style={styles.timelineMeta}>—</Text>
                </View>
              </View>
            </View>

            {/* Attachments */}
            <View style={styles.attachmentsHeaderRow}>
              <Text style={styles.rightPaneSectionTitle}>Attachments</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllAttachmentsTxt}>View All (3)</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.attachmentsListGrid}>
              <Image source={require('../../assets/cleaner_avatar.png')} style={styles.attachmentImg} />
              <Image source={require('../../assets/cleaner_avatar.png')} style={styles.attachmentImg} />
              <Image source={require('../../assets/cleaner_avatar.png')} style={styles.attachmentImg} />
            </View>

            {/* Customer Details */}
            <Text style={styles.rightPaneSectionTitle}>Customer Details</Text>
            <View style={styles.customerDetailsSection}>
              <View style={styles.customerMainRow}>
                <Image source={require('../../assets/cleaner_avatar.png')} style={styles.custAvatar} />
                <View>
                  <Text style={styles.custName}>{complaintsList[0].customerName}</Text>
                  <Text style={styles.custPhone}>{complaintsList[0].phone}</Text>
                </View>
              </View>

              <View style={styles.custMetaItem}>
                <Icon name="email-outline" size={16} color="#64748B" />
                <Text style={styles.custMetaTxt}>rahul.sharma@email.com</Text>
              </View>

              <View style={styles.custMetaItem}>
                <Icon name="map-marker-outline" size={16} color="#64748B" />
                <Text style={styles.custMetaTxt} numberOfLines={2}>Sunshine Heights{"\n"}A-1203, Sector 45, Noida</Text>
              </View>

              <View style={styles.vehicleInfoBox}>
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

            {/* Actions Grid */}
            <Text style={styles.rightPaneSectionTitle}>Actions</Text>
            <View style={styles.actionsGrid}>
              <View style={styles.actionsGridRow}>
                <TouchableOpacity style={styles.actionGridItem}>
                  <Icon name="account-plus-outline" size={20} color="#16A34A" />
                  <Text style={[styles.actionGridItemTxt, { color: '#16A34A' }]}>Assign Cleaner</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionGridItem}>
                  <Icon name="arrow-up-bold-circle-outline" size={20} color="#EA580C" />
                  <Text style={[styles.actionGridItemTxt, { color: '#EA580C' }]}>Escalate</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.actionsGridRow}>
                <TouchableOpacity style={styles.actionGridItem}>
                  <Icon name="check-circle-outline" size={20} color="#2563EB" />
                  <Text style={[styles.actionGridItemTxt, { color: '#2563EB' }]}>Resolve</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionGridItem}>
                  <Icon name="notebook-outline" size={20} color="#8B5CF6" />
                  <Text style={[styles.actionGridItemTxt, { color: '#8B5CF6' }]}>Add Notes</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* View Full Details Button */}
            <TouchableOpacity style={styles.btnViewFullDetails}>
              <Text style={styles.btnViewFullDetailsTxt}>View Full Details</Text>
            </TouchableOpacity>

          </ScrollView>
        )}

      </View>
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
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  viewAllTxt: {
    fontSize: 10,
    fontWeight: '700',
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
  complaintsList: {
    gap: 12,
  },
  complaintCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingBottom: 8,
    marginBottom: 10,
  },
  ticketIdTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
    fontFamily: 'monospace',
  },
  pillBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
  },
  pillBadgeTxt: {
    fontSize: 8,
    fontWeight: '700',
  },
  cardBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerCol: {
    width: '35%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
    borderRightWidth: 1,
    borderColor: '#F1F5F9',
  },
  custAvatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  custNameSmall: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  custPhoneSmall: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 1,
  },
  complaintDetailsCol: {
    flex: 1,
    paddingHorizontal: 12,
    gap: 2,
  },
  subjectTxt: {
    fontSize: 11,
    fontWeight: '750',
    color: '#1E293B',
  },
  apartmentTxt: {
    fontSize: 9,
    color: '#64748B',
  },
  raisedTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  raisedTimeTxt: {
    fontSize: 9,
    color: '#64748B',
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  showingText: {
    fontSize: 10,
    color: '#64748B',
  },
  pageBtnRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  pageArrowBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePageBtn: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  pageBtnTxt: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  activePageBtnTxt: {
    color: '#FFFFFF',
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
    fontSize: 14,
    fontWeight: '850',
    color: '#0F172A',
    fontFamily: 'monospace',
  },
  statusCapsuleSolid: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusCapsuleSolidTxt: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rightPaneCloseBtn: {
    padding: 4,
  },
  subjectCardSection: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 10,
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
  rightPaneSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
    marginBottom: 10,
  },
  timelineSection: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
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
  attachmentsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  viewAllAttachmentsTxt: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
  },
  attachmentsListGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  attachmentImg: {
    width: 60,
    height: 60,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  customerDetailsSection: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  customerMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    paddingBottom: 8,
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
  custMetaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  custMetaTxt: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
    lineHeight: 14,
  },
  vehicleInfoBox: {
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    paddingTop: 8,
    gap: 8,
  },
  actionsGrid: {
    gap: 10,
    marginBottom: 20,
  },
  actionsGridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionGridItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 6,
  },
  actionGridItemTxt: {
    fontSize: 10,
    fontWeight: '700',
  },
  btnViewFullDetails: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnViewFullDetailsTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default GrievanceListScreen;
