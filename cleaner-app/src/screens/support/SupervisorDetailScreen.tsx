import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Props { navigation: any }

const SupervisorDetailScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.blueHeaderBg}>
        <View style={styles.topHeaderRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.mainTitle}>Supervisor Detail</Text>
            <Text style={styles.mainSubTitle}>View and connect with your supervisor</Text>
          </View>
          <View style={styles.headerRightIcons}>
            <TouchableOpacity style={{ padding: 4, marginRight: 16 }} onPress={() => navigation.navigate('ChatSupport')}>
              <Icon name="chat-processing-outline" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 4 }}>
              <Icon name="phone-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card */}
        <View style={styles.topCard}>
          <View style={styles.tcHeaderContent}>
            <View style={styles.avatarContainer}>
              <Image source={{uri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200'}} style={styles.avatarImg} />
              <View style={styles.onlineDot} />
            </View>
            <View style={styles.tcInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.tcName}>Rahul Sharma</Text>
              </View>
              <View style={styles.roleRow}>
                <Text style={styles.tcRole}>Field Operations Supervisor</Text>
                <View style={styles.activeBadge}><Text style={styles.activeBadgeTxt}>Active</Text></View>
              </View>
              <View style={styles.locRow}>
                <Icon name="map-marker-outline" size={12} color="#2563EB" />
                <Text style={styles.locTxt}>Noida & Greater Noida Zone</Text>
              </View>
              <View style={styles.locRow}>
                <Icon name="office-building-outline" size={12} color="#475569" />
                <Text style={styles.locTxt}>Cleanium Facilities Services</Text>
              </View>
            </View>
            {/* Rating floating block */}
            <View style={styles.ratingBlock}>
              <View style={styles.ratingTop}>
                <Icon name="star" size={16} color="#EAB308" />
                <Text style={styles.ratingVal}>4.8</Text>
              </View>
              <Text style={styles.ratingLbl}>Team Rating</Text>
            </View>
          </View>

          <View style={styles.itemDivider} />

          {/* Stats Row */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Icon name="account-group-outline" size={20} color="#9333EA" />
              <Text style={styles.statVal}>12</Text>
              <Text style={styles.statLbl}>Team Members</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="check-circle-outline" size={20} color="#16A34A" />
              <Text style={styles.statVal}>256</Text>
              <Text style={styles.statLbl}>Tasks Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="star-outline" size={20} color="#EA580C" />
              <Text style={styles.statVal}>4.8</Text>
              <Text style={styles.statLbl}>Team Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="calendar-month-outline" size={20} color="#2563EB" />
              <Text style={styles.statVal}>2.3 Yrs</Text>
              <Text style={styles.statLbl}>With Company</Text>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.contactGrid}>
            <View style={styles.contactCol}>
              <View style={[styles.contactIconBg, {backgroundColor: '#EFF6FF'}]}><Icon name="phone-outline" size={18} color="#2563EB" /></View>
              <View style={{marginLeft: 12}}>
                <Text style={styles.contactVal}>+91 98765 43210</Text>
                <Text style={styles.contactLbl}>Mobile</Text>
              </View>
            </View>
            <View style={styles.gridDivider} />
            <View style={styles.contactCol}>
              <View style={[styles.contactIconBg, {backgroundColor: '#FAF5FF'}]}><Icon name="email-outline" size={18} color="#9333EA" /></View>
              <View style={{marginLeft: 12}}>
                <Text style={styles.contactVal}>rahul.sharma@cleanium.in</Text>
                <Text style={styles.contactLbl}>Email</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.itemDivider} />

          <View style={styles.contactAddressRow}>
            <View style={[styles.contactIconBg, {backgroundColor: '#EFF6FF'}]}><Icon name="map-marker-outline" size={18} color="#2563EB" /></View>
            <View style={{marginLeft: 12, flex: 1}}>
              <Text style={styles.contactVal}>Office: Sector 62, Noida, UP 201301</Text>
              <Text style={styles.contactLbl}>Regional Office</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#CBD5E1" />
          </View>
        </View>

        {/* Working Hours */}
        <View style={styles.sectionBlock}>
          <View style={styles.whHeader}>
            <View style={styles.whLeft}>
              <View style={[styles.contactIconBg, {backgroundColor: '#F0FDF4'}]}><Icon name="clock-outline" size={18} color="#16A34A" /></View>
              <Text style={[styles.sectionTitle, {marginLeft: 12, marginBottom: 0}]}>Working Hours</Text>
            </View>
            <View style={styles.availBadge}><Text style={styles.availBadgeTxt}>Available</Text></View>
          </View>
          <View style={styles.whBody}>
            <Text style={styles.whTime}>Mon - Sat: 9:00 AM - 6:00 PM</Text>
            <View style={styles.whFooter}>
              <Text style={styles.whSub}>Available during working hours</Text>
              <Text style={styles.whGreen}>Typically replies in 15 mins</Text>
            </View>
          </View>
        </View>

        {/* Team & Responsibility */}
        <View style={styles.sectionBlock}>
          <View style={styles.trHeader}>
            <View style={[styles.contactIconBg, {backgroundColor: '#EFF6FF'}]}><Icon name="account-group-outline" size={18} color="#2563EB" /></View>
            <Text style={[styles.sectionTitle, {marginLeft: 12, marginBottom: 0}]}>Team & Responsibility</Text>
          </View>
          <Text style={styles.trDesc}>Oversees daily operations and performance of your team. Responsible for quality, task allocation and issue resolution.</Text>
          
          <View style={styles.trStatsBox}>
            <View style={styles.trStatCol}>
              <Icon name="account-group-outline" size={20} color="#16A34A" />
              <View style={{marginLeft: 8}}>
                <Text style={styles.trStatVal}>12</Text>
                <Text style={styles.trStatLbl}>Team Members</Text>
              </View>
            </View>
            <View style={styles.trStatCol}>
              <Icon name="clipboard-text-outline" size={20} color="#9333EA" />
              <View style={{marginLeft: 8}}>
                <Text style={styles.trStatVal}>256</Text>
                <Text style={styles.trStatLbl}>Tasks Completed</Text>
              </View>
            </View>
            <View style={styles.trStatCol}>
              <Icon name="target" size={20} color="#EA580C" />
              <View style={{marginLeft: 8}}>
                <Text style={styles.trStatVal}>92%</Text>
                <Text style={styles.trStatLbl}>Team Performance</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Announcements */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Announcements</Text>
            <TouchableOpacity><Text style={styles.viewAllTxt}>View All</Text></TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.announcementRow}>
            <View style={[styles.annIconBg, {backgroundColor: '#F0FDF4'}]}><Icon name="bullhorn-outline" size={18} color="#16A34A" /></View>
            <View style={styles.annInfo}>
              <View style={styles.annTitleRow}>
                <Text style={styles.annTitle}>Weekend Operations Update</Text>
                <Text style={styles.annDate}>12 May 2025</Text>
              </View>
              <Text style={styles.annSub} numberOfLines={1}>Please ensure all tasks are completed on time this weekend.</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#CBD5E1" style={{marginLeft: 8}} />
          </TouchableOpacity>

          <View style={styles.itemDivider} />

          <TouchableOpacity style={styles.announcementRow}>
            <View style={[styles.annIconBg, {backgroundColor: '#FAF5FF'}]}><Icon name="bullhorn-outline" size={18} color="#9333EA" /></View>
            <View style={styles.annInfo}>
              <View style={styles.annTitleRow}>
                <Text style={styles.annTitle}>Quality Check Reminder</Text>
                <Text style={styles.annDate}>09 May 2025</Text>
              </View>
              <Text style={styles.annSub} numberOfLines={1}>Maintain quality standards for all cleaning tasks.</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#CBD5E1" style={{marginLeft: 8}} />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionBlock}>
          <View style={styles.trHeader}>
            <Icon name="lightning-bolt" size={20} color="#2563EB" />
            <Text style={[styles.sectionTitle, {marginLeft: 8, marginBottom: 0}]}>Quick Actions</Text>
          </View>
          
          <View style={styles.qaGrid}>
            <TouchableOpacity style={styles.qaItem} onPress={() => navigation.navigate('ChatSupport')}>
              <View style={[styles.qaIconBg, {backgroundColor: '#EFF6FF', borderColor: '#BFDBFE'}]}><Icon name="chat-processing-outline" size={24} color="#2563EB" /></View>
              <Text style={styles.qaTxt}>Send Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.qaItem}>
              <View style={[styles.qaIconBg, {backgroundColor: '#F0FDF4', borderColor: '#BBF7D0'}]}><Icon name="phone-outline" size={24} color="#16A34A" /></View>
              <Text style={styles.qaTxt}>Call Supervisor</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.qaItem}>
              <View style={[styles.qaIconBg, {backgroundColor: '#FFF7ED', borderColor: '#FED7AA'}]}><Icon name="calendar-outline" size={24} color="#EA580C" /></View>
              <Text style={styles.qaTxt}>Schedule Meeting</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.qaItem}>
              <View style={[styles.qaIconBg, {backgroundColor: '#FAF5FF', borderColor: '#E9D5FF'}]}><Icon name="file-document-outline" size={24} color="#9333EA" /></View>
              <Text style={styles.qaTxt}>Raise Request</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBox}>
          <View style={styles.infoIconBg}><Icon name="information-variant" size={20} color="#FFF" /></View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Need immediate assistance?</Text>
            <Text style={styles.infoSub}>Contact your supervisor for task support, clarifications or any concerns.</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  blueHeaderBg: {
    backgroundColor: '#0A2540',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 60,
    zIndex: 1,
  },
  topHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerTitles: { flex: 1, paddingHorizontal: 12 },
  mainTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', fontFamily: 'Inter-Bold' },
  mainSubTitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter-Medium', marginTop: 4 },
  headerRightIcons: { flexDirection: 'row', alignItems: 'center' },

  scrollView: { flex: 1, marginTop: -40, zIndex: 2, elevation: 5 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

  topCard: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4, marginBottom: 16 },
  tcHeaderContent: { flexDirection: 'row', alignItems: 'center', position: 'relative' },
  avatarContainer: { position: 'relative', marginRight: 16 },
  avatarImg: { width: 70, height: 70, borderRadius: 35 },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#16A34A', borderWidth: 2, borderColor: '#FFF' },
  tcInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  tcName: { fontSize: 16, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  roleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  tcRole: { fontSize: 11, color: '#475569', fontFamily: 'Inter-Medium', marginRight: 8 },
  activeBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  activeBadgeTxt: { fontSize: 9, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold' },
  locRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  locTxt: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Regular', marginLeft: 4 },
  ratingBlock: { position: 'absolute', top: 0, right: 0, backgroundColor: '#F8FAFC', padding: 8, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  ratingTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  ratingVal: { fontSize: 14, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold', marginLeft: 4 },
  ratingLbl: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium' },

  itemDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },

  statsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center' },
  statVal: { fontSize: 13, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold', marginTop: 6, marginBottom: 2 },
  statLbl: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium' },

  sectionBlock: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold', marginBottom: 16 },

  contactGrid: { flexDirection: 'row' },
  contactCol: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  contactIconBg: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  contactVal: { fontSize: 11, fontWeight: '700', color: '#0F172A', fontFamily: 'Inter-Bold', marginBottom: 2 },
  contactLbl: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium' },
  gridDivider: { width: 1, backgroundColor: '#F1F5F9', marginHorizontal: 12 },
  contactAddressRow: { flexDirection: 'row', alignItems: 'center' },

  whHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  whLeft: { flexDirection: 'row', alignItems: 'center' },
  availBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  availBadgeTxt: { fontSize: 10, fontWeight: '700', color: '#16A34A', fontFamily: 'Inter-Bold' },
  whBody: { paddingLeft: 48 },
  whTime: { fontSize: 13, fontWeight: '700', color: '#475569', fontFamily: 'Inter-SemiBold', marginBottom: 6 },
  whFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  whSub: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Regular' },
  whGreen: { fontSize: 10, fontWeight: '700', color: '#16A34A', fontFamily: 'Inter-Bold' },

  trHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  trDesc: { fontSize: 11, color: '#475569', fontFamily: 'Inter-Medium', lineHeight: 18, marginBottom: 16 },
  trStatsBox: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, justifyContent: 'space-between' },
  trStatCol: { flexDirection: 'row', alignItems: 'center' },
  trStatVal: { fontSize: 13, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold', marginBottom: 2 },
  trStatLbl: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium' },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  viewAllTxt: { fontSize: 12, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold' },
  announcementRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  annIconBg: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  annInfo: { flex: 1 },
  annTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  annTitle: { fontSize: 12, fontWeight: '700', color: '#0F172A', fontFamily: 'Inter-Bold' },
  annDate: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium' },
  annSub: { fontSize: 11, color: '#475569', fontFamily: 'Inter-Medium' },

  qaGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  qaItem: { alignItems: 'center', width: '23%' },
  qaIconBg: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8, borderWidth: 1 },
  qaTxt: { fontSize: 9, fontWeight: '700', color: '#0F172A', fontFamily: 'Inter-Bold', textAlign: 'center' },

  infoBox: { flexDirection: 'row', backgroundColor: '#EFF6FF', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#BFDBFE', marginBottom: 20 },
  infoIconBg: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: 11, fontWeight: '700', color: '#1E3A8A', fontFamily: 'Inter-Bold', lineHeight: 16 },
  infoSub: { fontSize: 10, color: '#475569', fontFamily: 'Inter-Medium', marginTop: 4 },
});

export default SupervisorDetailScreen;
