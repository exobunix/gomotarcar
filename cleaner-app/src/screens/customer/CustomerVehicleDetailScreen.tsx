import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Image } from 'react-native';
import { colors } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props { navigation: any; route: any }

const CustomerVehicleDetailScreen: React.FC<Props> = ({ navigation }) => {

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.blueHeaderBg}>
        <View style={styles.topHeaderRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.mainTitle}>Customer Vehicle Detail</Text>
            <Text style={styles.mainSubTitle}>View vehicle information and history</Text>
          </View>
          <TouchableOpacity style={{ padding: 4 }}>
            <Icon name="dots-vertical" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top Profile Card */}
        <View style={styles.topCard}>
          {/* Customer Row */}
          <View style={styles.tcHeader}>
            <View style={styles.tcAvatarBg}>
              <Icon name="account-outline" size={28} color="#0F172A" />
            </View>
            <View style={styles.tcInfo}>
              <Text style={styles.tcTitle}>Green Valley Apartments</Text>
              <Text style={styles.tcFlat}>Rohit Sharma</Text>
              <View style={styles.tcLocRow}>
                <Icon name="phone-outline" size={12} color="#2563EB" />
                <Text style={styles.tcLocTxt}>+91 98765 43210</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.viewCustBtn} onPress={() => navigation.navigate('CustomerDetail')}>
              <Text style={styles.viewCustBtnTxt}>View Customer</Text>
              <Icon name="chevron-right" size={14} color="#2563EB" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Vehicle Row */}
          <View style={styles.tcHeader}>
            {/* Mock Image Placeholder */}
            <View style={styles.tcCarImgWrapper}>
              <Image source={require('../../assets/images/car-placeholder.png')} style={styles.carImg} />
            </View>
            <View style={styles.tcInfo}>
              <View style={styles.titleRow}>
                <Text style={styles.tcTitle}>UP16 AB 1234</Text>
                <View style={styles.activeBadge}><Text style={styles.activeBadgeTxt}>Active</Text></View>
              </View>
              <Text style={styles.tcFlat}>Toyota Fortuner • White</Text>
              
              <View style={styles.primaryBadge}>
                <Icon name="star-outline" size={12} color="#2563EB" />
                <Text style={styles.primaryBadgeTxt}>Primary Vehicle</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.editBtn}>
              <Icon name="pencil-outline" size={14} color="#2563EB" />
              <Text style={styles.editBtnTxt}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Bar */}
        <View style={styles.tabsRow}>
          <TouchableOpacity style={styles.tabActive}>
            <Text style={styles.tabActiveTxt}>Overview</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabInactive}><Text style={styles.tabInactiveTxt}>Service History</Text></TouchableOpacity>
          <TouchableOpacity style={styles.tabInactive}><Text style={styles.tabInactiveTxt}>Documents</Text></TouchableOpacity>
          <TouchableOpacity style={styles.tabInactive}><Text style={styles.tabInactiveTxt}>Notes</Text></TouchableOpacity>
        </View>

        {/* Vehicle Information List */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeader}>Vehicle Information</Text>

          <View style={styles.listItem}>
            <View style={[styles.listIconBg, { backgroundColor: '#EFF6FF' }]}><Icon name="card-account-details-outline" size={16} color="#2563EB" /></View>
            <Text style={styles.listLbl}>Registration Number</Text>
            <Text style={styles.listVal}>UP16 AB 1234</Text>
          </View>
          <View style={styles.itemDivider} />

          <View style={styles.listItem}>
            <View style={[styles.listIconBg, { backgroundColor: '#EFF6FF' }]}><Icon name="car-side" size={16} color="#2563EB" /></View>
            <Text style={styles.listLbl}>Make & Model</Text>
            <Text style={styles.listVal}>Toyota Fortuner</Text>
          </View>
          <View style={styles.itemDivider} />

          <View style={styles.listItem}>
            <View style={[styles.listIconBg, { backgroundColor: '#EFF6FF' }]}><Icon name="calendar-month-outline" size={16} color="#2563EB" /></View>
            <Text style={styles.listLbl}>Model Year</Text>
            <Text style={styles.listVal}>2021</Text>
          </View>
          <View style={styles.itemDivider} />

          <View style={styles.listItem}>
            <View style={[styles.listIconBg, { backgroundColor: '#EFF6FF' }]}><Icon name="palette-outline" size={16} color="#2563EB" /></View>
            <Text style={styles.listLbl}>Color</Text>
            <Text style={styles.listVal}>White</Text>
          </View>
          <View style={styles.itemDivider} />

          <View style={styles.listItem}>
            <View style={[styles.listIconBg, { backgroundColor: '#EFF6FF' }]}><Icon name="gas-station-outline" size={16} color="#2563EB" /></View>
            <Text style={styles.listLbl}>Fuel Type</Text>
            <Text style={styles.listVal}>Diesel</Text>
          </View>
          <View style={styles.itemDivider} />

          <View style={styles.listItem}>
            <View style={[styles.listIconBg, { backgroundColor: '#EFF6FF' }]}><Icon name="badge-account-outline" size={16} color="#2563EB" /></View>
            <Text style={styles.listLbl}>VIN Number</Text>
            <Text style={styles.listVal}>MHFGB8GS6M1234567</Text>
          </View>
          <View style={styles.itemDivider} />

          <View style={styles.listItem}>
            <View style={[styles.listIconBg, { backgroundColor: '#EFF6FF' }]}><Icon name="speedometer" size={16} color="#2563EB" /></View>
            <Text style={styles.listLbl}>Kilometers</Text>
            <Text style={styles.listVal}>42,850 km</Text>
          </View>
          <View style={styles.itemDivider} />

          <View style={styles.listItem}>
            <View style={[styles.listIconBg, { backgroundColor: '#EFF6FF' }]}><Icon name="account-outline" size={16} color="#2563EB" /></View>
            <Text style={styles.listLbl}>Added By</Text>
            <Text style={styles.listVal}>Rohit Sharma</Text>
          </View>
          <View style={styles.itemDivider} />

          <View style={[styles.listItem, { paddingBottom: 0 }]}>
            <View style={[styles.listIconBg, { backgroundColor: '#EFF6FF' }]}><Icon name="calendar-check-outline" size={16} color="#2563EB" /></View>
            <Text style={styles.listLbl}>Date Added</Text>
            <Text style={styles.listVal}>15 Jan 2024</Text>
          </View>
        </View>

        {/* Recent Service Summary */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeader}>Recent Service Summary</Text>

          <View style={styles.serviceBanner}>
            <View style={styles.sbIconBg}>
              <Icon name="check" size={18} color="#FFF" />
            </View>
            <View style={styles.sbContent}>
              <Text style={styles.sbTitle}>Last Service Completed</Text>
              <Text style={styles.sbSub}>15 May 2025 • Premium Wash</Text>
            </View>
            <View style={styles.sbRight}>
              <Text style={styles.sbVal}>42,850 km</Text>
              <Text style={styles.sbSub}>at Service Time</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryGrid}>
            <View style={styles.summaryCol}>
              <Icon name="calendar-check-outline" size={20} color="#2563EB" />
              <Text style={styles.summaryLbl}>Total Services</Text>
              <Text style={styles.summaryVal}>8</Text>
            </View>
            <View style={styles.gridDivider} />
            <View style={styles.summaryCol}>
              <Icon name="car-wash" size={20} color="#16A34A" />
              <Text style={styles.summaryLbl}>Total Washes</Text>
              <Text style={styles.summaryVal}>6</Text>
            </View>
            <View style={styles.gridDivider} />
            <View style={styles.summaryCol}>
              <Icon name="shield-check-outline" size={20} color="#EA580C" />
              <Text style={styles.summaryLbl}>Total Protect</Text>
              <Text style={styles.summaryVal}>2</Text>
            </View>
            <View style={styles.gridDivider} />
            <View style={styles.summaryCol}>
              <Icon name="clock-outline" size={20} color="#9333EA" />
              <Text style={styles.summaryLbl}>Avg. Duration</Text>
              <Text style={styles.summaryVal}>55 mins</Text>
            </View>
          </View>

        </View>

        {/* Quick Actions */}
        <View style={[styles.sectionBlock, { marginBottom: 40 }]}>
          <Text style={styles.sectionHeader}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.qaItem}>
              <View style={[styles.qaIconBg, { backgroundColor: '#EFF6FF' }]}><Icon name="calendar-clock-outline" size={24} color="#2563EB" /></View>
              <Text style={styles.qaTxt}>Schedule Service</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.qaItem}>
              <View style={[styles.qaIconBg, { backgroundColor: '#ECFDF5' }]}><Icon name="clipboard-plus-outline" size={24} color="#16A34A" /></View>
              <Text style={styles.qaTxt}>Create Task</Text>
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

      </ScrollView>

      {/* Fixed Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.btnSolidBlue}>
          <Icon name="calendar-clock-outline" size={18} color="#FFF" />
          <Text style={styles.btnSolidBlueTxt}>Schedule Service</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnOutlineBlue}>
          <Icon name="car-outline" size={18} color="#2563EB" />
          <Text style={styles.btnOutlineBlueTxt}>Add Another Vehicle</Text>
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

  scrollView: { flex: 1, marginTop: -40, zIndex: 2, elevation: 5 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

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
  tcAvatarBg: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  tcCarImgWrapper: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F1F5F9', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  carImg: { width: '80%', height: '80%', resizeMode: 'contain' },
  tcInfo: { flex: 1, marginLeft: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  tcTitle: { fontSize: 16, fontWeight: '800', color: colors.darkNavy, fontFamily: 'Inter-Bold', marginRight: 8 },
  activeBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  activeBadgeTxt: { fontSize: 10, fontWeight: '700', color: '#16A34A', fontFamily: 'Inter-Bold' },
  tcFlat: { fontSize: 13, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 6 },
  tcLocRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  tcLocTxt: { fontSize: 11, color: '#64748B', fontFamily: 'Inter-Regular', marginLeft: 4 },
  
  viewCustBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  viewCustBtnTxt: { fontSize: 11, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold', marginRight: 4 },
  
  primaryBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start', marginTop: 8 },
  primaryBadgeTxt: { fontSize: 10, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold', marginLeft: 4 },
  
  editBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  editBtnTxt: { fontSize: 12, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold', marginLeft: 4 },

  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },

  tabsRow: { flexDirection: 'row', paddingHorizontal: 4, marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', justifyContent: 'space-between' },
  tabActive: { paddingBottom: 12, borderBottomWidth: 2, borderBottomColor: '#2563EB' },
  tabActiveTxt: { fontSize: 13, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold' },
  tabInactive: { paddingBottom: 12 },
  tabInactiveTxt: { fontSize: 13, fontWeight: '600', color: '#64748B', fontFamily: 'Inter-SemiBold' },

  sectionBlock: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionHeader: { fontSize: 14, fontWeight: '800', color: colors.darkNavy, fontFamily: 'Inter-Bold', marginBottom: 16 },

  listItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12 },
  listIconBg: { width: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  listLbl: { fontSize: 13, color: '#475569', fontFamily: 'Inter-Medium', marginTop: 4 },
  listVal: { fontSize: 13, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold', marginLeft: 'auto', marginTop: 4 },
  itemDivider: { height: 1, backgroundColor: '#F1F5F9' },

  serviceBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  sbIconBg: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  sbContent: { flex: 1 },
  sbTitle: { fontSize: 13, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  sbSub: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 4 },
  sbRight: { alignItems: 'flex-end' },
  sbVal: { fontSize: 13, fontWeight: '800', color: colors.darkNavy, fontFamily: 'Inter-Bold' },

  summaryGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryCol: { alignItems: 'center', flex: 1 },
  summaryLbl: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 6, marginBottom: 2 },
  summaryVal: { fontSize: 11, fontWeight: '800', color: colors.darkNavy, fontFamily: 'Inter-Bold', textAlign: 'center' },
  gridDivider: { width: 1, height: '100%', backgroundColor: '#F1F5F9' },

  quickActionsGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  qaItem: { alignItems: 'center' },
  qaIconBg: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  qaTxt: { fontSize: 10, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold', textAlign: 'center', width: 56 },

  bottomActions: { padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  btnSolidBlue: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563EB', borderRadius: 12, paddingVertical: 14, marginBottom: 12 },
  btnSolidBlueTxt: { fontSize: 14, fontWeight: '700', color: '#FFF', fontFamily: 'Inter-Bold', marginLeft: 8 },
  btnOutlineBlue: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#2563EB', borderRadius: 12, paddingVertical: 14 },
  btnOutlineBlueTxt: { fontSize: 14, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold', marginLeft: 8 },
});

export default CustomerVehicleDetailScreen;
