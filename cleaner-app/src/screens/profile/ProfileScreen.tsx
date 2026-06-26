import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, StatusBar } from 'react-native';
import { useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootState } from '../../redux/store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props { navigation: any }

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { cleaner } = useSelector((state: RootState) => state.auth);
  const insets = useSafeAreaInsets();

  const menuItems = [
    { id: 1, title: 'Personal Information', sub: 'View and update your personal details', icon: 'account-outline', color: '#2563EB', bg: '#EFF6FF', route: 'PersonalInformation' },
    { id: 3, title: 'Bank & Payment Details', sub: 'Manage your bank account and payouts', icon: 'bank-outline', color: '#9333EA', bg: '#FAF5FF', route: 'BankDetails' },
    { id: 4, title: 'Documents', sub: 'Upload and manage your documents', icon: 'folder-outline', color: '#EA580C', bg: '#FFF7ED', route: 'Documents' },
    { id: 6, title: 'Performance', sub: 'View your performance reports and feedback', icon: 'chart-bar', color: '#2563EB', bg: '#EFF6FF', route: 'Performance' },
    { id: 7, title: 'Settings', sub: 'App settings, notifications and preferences', icon: 'cog-outline', color: '#DB2777', bg: '#FDF2F8', route: 'Settings' },
    { id: 8, title: 'Help & Support', sub: 'FAQs, support tickets and contact us', icon: 'help-circle-outline', color: '#EA580C', bg: '#FFF7ED', route: 'HelpSupport' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.blueHeaderBg, { paddingTop: insets.top > 0 ? insets.top + 10 : (Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 40)) }]}>
        <View style={styles.topHeaderRow}>
          <View style={styles.headerTitles}>
            <Text style={styles.mainTitle}>Profile Dashboard</Text>
            <Text style={styles.mainSubTitle}>Manage your profile and preferences</Text>
          </View>
          <View style={styles.headerRightIcons}>
            <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate('Notifications')}>
              <Icon name="bell-outline" size={24} color="#FFF" />
              <View style={styles.bellBadge}><Text style={styles.bellBadgeTxt}>3</Text></View>
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 4 }} onPress={() => navigation.navigate('Settings')}>
              <Icon name="cog-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.blueFiller} />
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.hcTopHalf}>
            {/* Left */}
            <View style={styles.hcAvatarWrapper}>
              <Image source={{uri: cleaner?.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200'}} style={styles.hcAvatar} />
              <View style={styles.hcCameraBadge}><Icon name="camera" size={14} color="#FFF" /></View>
            </View>
            <View style={styles.hcInfo}>
              <View style={styles.hcNameRow}>
                <Text style={styles.hcName}>{cleaner?.name || 'Raj Kumar'}</Text>
                <Icon name="check-decagram" size={16} color="#2563EB" style={{marginLeft: 4}} />
              </View>
              <Text style={styles.hcRole}>{cleaner?.role || 'Housekeeping Staff'}</Text>
              
              <View style={styles.hcMetaRow}>
                <Icon name="map-marker-outline" size={12} color="#64748B" />
                <Text style={styles.hcMetaTxt}>{cleaner?.zone || 'Sector 62, Noida'}</Text>
              </View>
              <View style={styles.hcMetaRow}>
                <Icon name="star" size={12} color="#EAB308" />
                <Text style={[styles.hcMetaTxt, {color: '#2563EB', fontWeight: '700'}]}>{cleaner?.rating || 4.6} <Text style={{color: '#64748B', fontWeight: '500'}}>(126 Reviews)</Text></Text>
              </View>
            </View>
            {/* Right Buttons / Divider */}
            <View style={styles.hcRightCol}>
              <TouchableOpacity style={styles.editBtn}>
                <Text style={styles.editBtnTxt}>Edit Profile</Text>
              </TouchableOpacity>
              <View style={styles.hcRightData}>
                <Text style={styles.hcRightLbl}>Employee ID</Text>
                <Text style={styles.hcRightVal}>EMP100245</Text>
                <Text style={[styles.hcRightLbl, {marginTop: 8}]}>Member Since</Text>
                <Text style={styles.hcRightVal}>15 Jan 2024</Text>
              </View>
              {/* Divider line inserted artificially using absolute pos */}
              <View style={styles.verticalDivider} />
            </View>
          </View>
        </View>

        {/* 4-Block Stats Row */}
        <View style={styles.statsCard}>
          <View style={styles.statsGrid}>
            <View style={styles.statCol}>
              <View style={[styles.statIconBg, {backgroundColor: '#EFF6FF', borderColor: '#BFDBFE'}]}><Icon name="calendar-check-outline" size={20} color="#2563EB" /></View>
              <Text style={styles.statLbl}>Tasks Completed</Text>
              <Text style={styles.statVal}>1,248</Text>
              <Text style={styles.statSub}>Total</Text>
            </View>
            <View style={styles.gridDivider} />
            <View style={styles.statCol}>
              <View style={[styles.statIconBg, {backgroundColor: '#F0FDF4', borderColor: '#BBF7D0'}]}><Icon name="calendar-month-outline" size={20} color="#16A34A" /></View>
              <Text style={styles.statLbl}>Attendance</Text>
              <Text style={styles.statVal}>98%</Text>
              <Text style={[styles.statSub, {color: '#16A34A'}]}>Present Days</Text>
            </View>
            <View style={styles.gridDivider} />
            <View style={styles.statCol}>
              <View style={[styles.statIconBg, {backgroundColor: '#FFF7ED', borderColor: '#FED7AA'}]}><Icon name="star-outline" size={20} color="#EA580C" /></View>
              <Text style={styles.statLbl}>Rating</Text>
              <Text style={styles.statVal}>4.6</Text>
              <Text style={styles.statSub}>Out of 5</Text>
            </View>
            <View style={styles.gridDivider} />
            <View style={styles.statCol}>
              <View style={[styles.statIconBg, {backgroundColor: '#FAF5FF', borderColor: '#E9D5FF'}]}><Icon name="medal-outline" size={20} color="#9333EA" /></View>
              <Text style={styles.statLbl}>Level</Text>
              <Text style={styles.statVal}>Bronze</Text>
              <Text style={[styles.statSub, {color: '#9333EA'}]}>Current Level</Text>
            </View>
          </View>
        </View>

        {/* Menu List */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.menuRow, index !== menuItems.length - 1 && styles.menuBorder]}
              onPress={() => {
                if (item.route) {
                  navigation.navigate(item.route);
                }
              }}
            >
              <View style={[styles.menuIconBg, {backgroundColor: item.bg}]}><Icon name={item.icon} size={20} color={item.color} /></View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSub}>{item.sub}</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Security Banner */}
        <View style={styles.securityBanner}>
          <View style={styles.secLeft}>
            <View style={styles.secIconBg}><Icon name="shield-check-outline" size={24} color="#2563EB" /></View>
            <View>
              <Text style={styles.secTitle}>Your Account is Secure</Text>
              <Text style={styles.secSub}>Last login: 12 May 2025, 09:15 AM</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.secRight}>
            <Text style={styles.secLinkTxt}>View Security</Text>
            <Icon name="chevron-right" size={16} color="#2563EB" />
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    zIndex: 10,
  },
  blueFiller: {
    backgroundColor: '#0A2540',
    height: 50,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginHorizontal: -16,
  },
  topHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerTitles: { flex: 1 },
  mainTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', fontFamily: 'Inter-Bold' },
  mainSubTitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter-Medium', marginTop: 4 },
  headerRightIcons: { flexDirection: 'row', alignItems: 'center' },
  bellBtn: { position: 'relative', padding: 4, marginRight: 12 },
  bellBadge: { position: 'absolute', top: 0, right: 2, backgroundColor: '#EF4444', width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  bellBadgeTxt: { fontSize: 8, fontWeight: '800', color: '#FFF' },

  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  scrollView: { flex: 1 },

  heroCard: { backgroundColor: '#FFF', borderRadius: 16, marginTop: -40, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4, marginBottom: 16 },
  hcTopHalf: { flexDirection: 'row', position: 'relative' },
  hcAvatarWrapper: { position: 'relative', marginRight: 12 },
  hcAvatar: { width: 64, height: 64, borderRadius: 32 },
  hcCameraBadge: { position: 'absolute', bottom: 0, right: -4, backgroundColor: '#2563EB', width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
  hcInfo: { flex: 1, justifyContent: 'center' },
  hcNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  hcName: { fontSize: 16, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  hcRole: { fontSize: 11, color: '#475569', fontFamily: 'Inter-Medium', marginBottom: 6 },
  hcMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  hcMetaTxt: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium', marginLeft: 4 },
  
  hcRightCol: { width: 100, alignItems: 'flex-end', justifyContent: 'space-between', paddingLeft: 8 },
  editBtn: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  editBtnTxt: { fontSize: 10, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold' },
  hcRightData: { alignItems: 'flex-start', width: '100%', paddingLeft: 8, marginTop: 12 },
  hcRightLbl: { fontSize: 8, color: '#64748B', fontFamily: 'Inter-Medium', marginBottom: 2 },
  hcRightVal: { fontSize: 10, fontWeight: '700', color: '#0F172A', fontFamily: 'Inter-Bold' },
  verticalDivider: { position: 'absolute', left: 0, top: 20, bottom: 0, width: 1, backgroundColor: '#E2E8F0' },

  statsCard: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, marginBottom: 16 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  statCol: { flex: 1, alignItems: 'center' },
  statIconBg: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statLbl: { fontSize: 8, color: '#64748B', fontFamily: 'Inter-Medium', textAlign: 'center', marginBottom: 2 },
  statVal: { fontSize: 16, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold', marginBottom: 2, textAlign: 'center' },
  statSub: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium', textAlign: 'center' },
  gridDivider: { width: 1, height: '70%', backgroundColor: '#F1F5F9', marginHorizontal: 4, alignSelf: 'center' },

  menuContainer: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 16, marginBottom: 16 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuIconBg: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  menuInfo: { flex: 1 },
  menuTitle: { fontSize: 12, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold', marginBottom: 2 },
  menuSub: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium' },

  securityBanner: { flexDirection: 'row', backgroundColor: '#EFF6FF', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#BFDBFE', justifyContent: 'space-between' },
  secLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  secIconBg: { marginRight: 12 },
  secTitle: { fontSize: 12, fontWeight: '800', color: '#1E3A8A', fontFamily: 'Inter-Bold', marginBottom: 2 },
  secSub: { fontSize: 10, color: '#475569', fontFamily: 'Inter-Medium' },
  secRight: { flexDirection: 'row', alignItems: 'center' },
  secLinkTxt: { fontSize: 11, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold', marginRight: 2 },
});

export default ProfileScreen;
