import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props { navigation: any; route: any }

const CustomerDetailScreen: React.FC<Props> = ({ navigation }) => {

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.blueHeaderBg}>
        <View style={styles.topHeaderRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.mainTitle}>Customer Detail</Text>
            <Text style={styles.mainSubTitle}>View customer information and history</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn}>
              <Icon name="phone-outline" size={22} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Icon name="dots-vertical" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top Profile Card */}
        <View style={styles.topCard}>
          <View style={styles.tcHeader}>
            <View style={styles.tcIconBg}>
              <Icon name="office-building" size={28} color="#0F172A" />
            </View>
            <View style={styles.tcInfo}>
              <View style={styles.titleRow}>
                <Text style={styles.tcTitle}>Green Valley Apartments</Text>
                <View style={styles.activeBadge}><Text style={styles.activeBadgeTxt}>Active</Text></View>
              </View>
              <Text style={styles.tcFlat}>Tower A • Flat 101</Text>
              <View style={styles.tcLocRow}>
                <Icon name="map-marker-outline" size={12} color="#2563EB" />
                <Text style={styles.tcLocTxt}>Green Valley, Sector 62, Noida, UP 201301</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.editBtn}>
              <Icon name="pencil-outline" size={14} color="#FFF" />
              <Text style={styles.editBtnTxt}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <Icon name="account-outline" size={18} color="#2563EB" />
              <Text style={styles.infoLbl}>Contact Person</Text>
              <Text style={styles.infoVal}>Rohit Sharma</Text>
            </View>
            <View style={styles.gridDivider} />
            <View style={styles.infoCol}>
              <Icon name="phone-outline" size={18} color="#16A34A" />
              <Text style={styles.infoLbl}>Phone</Text>
              <Text style={styles.infoVal}>+91 98765 43210</Text>
            </View>
            <View style={styles.gridDivider} />
            <View style={styles.infoCol}>
              <Icon name="email-outline" size={18} color="#9333EA" />
              <Text style={styles.infoLbl}>Email</Text>
              <Text style={styles.infoVal}>rohit@gvaps.com</Text>
            </View>
            <View style={styles.gridDivider} />
            <View style={styles.infoCol}>
              <Icon name="office-building-outline" size={18} color="#EA580C" />
              <Text style={styles.infoLbl}>Property Type</Text>
              <Text style={styles.infoVal}>Residential</Text>
            </View>
          </View>
        </View>

        {/* Tab Bar */}
        <View style={styles.tabsRow}>
          <TouchableOpacity style={styles.tabActive}>
            <Text style={styles.tabActiveTxt}>Overview</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabInactive}><Text style={styles.tabInactiveTxt}>Service History</Text></TouchableOpacity>
          <TouchableOpacity style={styles.tabInactive}><Text style={styles.tabInactiveTxt}>Upcoming Tasks</Text></TouchableOpacity>
          <TouchableOpacity style={styles.tabInactive}><Text style={styles.tabInactiveTxt}>Notes & Files</Text></TouchableOpacity>
        </View>

        {/* Customer Information List */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeader}>Customer Information</Text>

          <View style={styles.listItem}>
            <View style={[styles.listIconBg, { backgroundColor: '#EFF6FF' }]}><Icon name="card-account-details-outline" size={16} color="#2563EB" /></View>
            <Text style={styles.listLbl}>Customer ID</Text>
            <Text style={styles.listVal}>CUST-000145</Text>
          </View>
          <View style={styles.itemDivider} />

          <View style={styles.listItem}>
            <View style={[styles.listIconBg, { backgroundColor: '#ECFDF5' }]}><Icon name="percent-outline" size={16} color="#16A34A" /></View>
            <Text style={styles.listLbl}>GST Number</Text>
            <Text style={styles.listVal}>09AABCG1234H1Z5</Text>
          </View>
          <View style={styles.itemDivider} />

          <View style={styles.listItem}>
            <View style={[styles.listIconBg, { backgroundColor: '#F3E8FF' }]}><Icon name="map-marker-outline" size={16} color="#9333EA" /></View>
            <Text style={styles.listLbl}>Billing Address</Text>
            <Text style={[styles.listVal, { textAlign: 'right', flex: 1, lineHeight: 18 }]}>Green Valley Apartments, Tower A, Sector 62, Noida, UP 201301</Text>
          </View>
          <View style={styles.itemDivider} />

          <View style={styles.listItem}>
            <View style={[styles.listIconBg, { backgroundColor: '#FFF7ED' }]}><Icon name="clock-outline" size={16} color="#EA580C" /></View>
            <Text style={styles.listLbl}>Preferred Service Time</Text>
            <Text style={styles.listVal}>09:00 AM — 06:00 PM</Text>
          </View>
          <View style={styles.itemDivider} />

          <View style={styles.listItem}>
            <View style={[styles.listIconBg, { backgroundColor: '#EFF6FF' }]}><Icon name="calendar-month-outline" size={16} color="#2563EB" /></View>
            <Text style={styles.listLbl}>Preferred Days</Text>
            <Text style={styles.listVal}>Mon, Wed, Fri</Text>
          </View>
          <View style={styles.itemDivider} />

          <View style={styles.listItem}>
            <View style={[styles.listIconBg, { backgroundColor: '#FEF9C3' }]}><Icon name="file-document-outline" size={16} color="#CA8A04" /></View>
            <Text style={styles.listLbl}>Special Instructions</Text>
            <Text style={[styles.listVal, { textAlign: 'right', flex: 1, lineHeight: 18 }]}>Use only eco-friendly cleaning products.</Text>
          </View>
          <View style={styles.itemDivider} />

          <View style={[styles.listItem, { paddingBottom: 0 }]}>
            <View style={[styles.listIconBg, { backgroundColor: '#F3E8FF' }]}><Icon name="calendar-check-outline" size={16} color="#9333EA" /></View>
            <Text style={styles.listLbl}>Customer Since</Text>
            <Text style={styles.listVal}>15 Jan 2024</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeader}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.qaItem}>
              <View style={[styles.qaIconBg, { backgroundColor: '#EFF6FF' }]}><Icon name="clipboard-plus-outline" size={24} color="#2563EB" /></View>
              <Text style={styles.qaTxt}>Create Task</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.qaItem}>
              <View style={[styles.qaIconBg, { backgroundColor: '#ECFDF5' }]}><Icon name="calendar-clock-outline" size={24} color="#16A34A" /></View>
              <Text style={styles.qaTxt}>Schedule Service</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.qaItem}>
              <View style={[styles.qaIconBg, { backgroundColor: '#F3E8FF' }]}><Icon name="file-document-outline" size={24} color="#9333EA" /></View>
              <Text style={styles.qaTxt}>View Invoices</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.qaItem}>
              <View style={[styles.qaIconBg, { backgroundColor: '#FFF7ED' }]}><Icon name="file-document-edit-outline" size={24} color="#EA580C" /></View>
              <Text style={styles.qaTxt}>Add Note</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.qaItem}>
              <View style={[styles.qaIconBg, { backgroundColor: '#F1F5F9' }]}><Icon name="dots-horizontal" size={24} color="#64748B" /></View>
              <Text style={styles.qaTxt}>More</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={[styles.sectionBlock, { marginBottom: 40 }]}>
          <View style={styles.raHeaderRow}>
            <Text style={styles.sectionHeader}>Recent Activity</Text>
            <Text style={styles.viewAllTxt}>View All</Text>
          </View>

          <View style={styles.raItem}>
            <View style={[styles.raIconBg, { borderColor: '#16A34A', backgroundColor: '#ECFDF5' }]}>
              <Icon name="check" size={16} color="#16A34A" />
            </View>
            <View style={styles.raContent}>
              <Text style={styles.raTitle}>Cleaning task completed</Text>
              <Text style={styles.raSub}>Premium Wash • DL 01 AB 1234</Text>
            </View>
            <View style={styles.raTimeCol}>
              <Text style={styles.raDateTxt}>15 May 2025</Text>
              <Text style={styles.raTimeTxt}>10:05 AM</Text>
            </View>
          </View>
          <View style={styles.itemDivider} />

          <View style={styles.raItem}>
            <View style={[styles.raIconBg, { borderColor: '#2563EB', backgroundColor: '#EFF6FF' }]}>
              <Icon name="calendar-month-outline" size={16} color="#2563EB" />
            </View>
            <View style={styles.raContent}>
              <Text style={styles.raTitle}>Task scheduled</Text>
              <Text style={styles.raSub}>Premium Wash • DL 01 AB 1234</Text>
            </View>
            <View style={styles.raTimeCol}>
              <Text style={styles.raDateTxt}>14 May 2025</Text>
              <Text style={styles.raTimeTxt}>04:30 PM</Text>
            </View>
          </View>

        </View>
      </ScrollView>
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
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { padding: 4, marginLeft: 8 },

  scrollView: { flex: 1, marginTop: -40, zIndex: 2, elevation: 5 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },

  topCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 20,
    padding: 16,
  },
  tcHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  tcIconBg: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  tcInfo: { flex: 1, marginLeft: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  tcTitle: { fontSize: 16, fontWeight: '800', color: colors.darkNavy, fontFamily: 'Inter-Bold', marginRight: 8 },
  activeBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  activeBadgeTxt: { fontSize: 10, fontWeight: '700', color: '#16A34A', fontFamily: 'Inter-Bold' },
  tcFlat: { fontSize: 13, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 6 },
  tcLocRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  tcLocTxt: { fontSize: 11, color: '#64748B', fontFamily: 'Inter-Regular', marginLeft: 4 },
  editBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563EB', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  editBtnTxt: { fontSize: 12, fontWeight: '700', color: '#FFF', fontFamily: 'Inter-Bold', marginLeft: 4 },

  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },

  infoGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  infoCol: { alignItems: 'center', flex: 1 },
  infoLbl: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 6, marginBottom: 2 },
  infoVal: { fontSize: 10, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold', textAlign: 'center' },
  gridDivider: { width: 1, height: '100%', backgroundColor: '#F1F5F9' },

  tabsRow: { flexDirection: 'row', paddingHorizontal: 4, marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tabActive: { paddingBottom: 12, borderBottomWidth: 2, borderBottomColor: '#2563EB', marginRight: 24 },
  tabActiveTxt: { fontSize: 13, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold' },
  tabInactive: { paddingBottom: 12, marginRight: 24 },
  tabInactiveTxt: { fontSize: 13, fontWeight: '600', color: '#64748B', fontFamily: 'Inter-SemiBold' },

  sectionBlock: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionHeader: { fontSize: 14, fontWeight: '800', color: colors.darkNavy, fontFamily: 'Inter-Bold', marginBottom: 16 },

  listItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12 },
  listIconBg: { width: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  listLbl: { fontSize: 13, color: '#475569', fontFamily: 'Inter-Medium', marginTop: 4 },
  listVal: { fontSize: 13, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold', marginLeft: 'auto', marginTop: 4 },
  itemDivider: { height: 1, backgroundColor: '#F1F5F9' },

  quickActionsGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  qaItem: { alignItems: 'center' },
  qaIconBg: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  qaTxt: { fontSize: 10, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold', textAlign: 'center', width: 56 },

  raHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  viewAllTxt: { fontSize: 12, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold' },
  raItem: { flexDirection: 'row', paddingVertical: 12, alignItems: 'center' },
  raIconBg: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  raContent: { flex: 1 },
  raTitle: { fontSize: 13, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  raSub: { fontSize: 11, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 4 },
  raTimeCol: { alignItems: 'flex-end' },
  raDateTxt: { fontSize: 11, color: '#64748B', fontFamily: 'Inter-Medium' },
  raTimeTxt: { fontSize: 11, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 2 },
});

export default CustomerDetailScreen;
