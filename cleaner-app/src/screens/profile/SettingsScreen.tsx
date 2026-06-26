import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { colors } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootState, AppDispatch } from '../../redux/store';
import { logout } from '../../redux/slices/authSlice';

interface Props { navigation: any }

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { cleaner } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.blueHeaderBg}>
        <View style={styles.topHeaderRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.mainTitle}>Settings</Text>
            <Text style={styles.mainSubTitle}>Manage your app settings and preferences</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top Hero Card (Slim) */}
        <TouchableOpacity style={styles.heroCard}>
          <View style={styles.hcAvatarWrapper}>
            <Image source={{uri: cleaner?.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200'}} style={styles.hcAvatar} />
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
          <Icon name="chevron-right" size={24} color="#CBD5E1" />
        </TouchableOpacity>

        {/* Preferences */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Preferences</Text>
        </View>
        <View style={styles.listContainer}>
          <TouchableOpacity style={styles.listItem}>
            <Icon name="bell-outline" size={20} color="#9333EA" style={styles.listIcon} />
            <View style={styles.listInfo}>
              <Text style={styles.listLbl}>Notifications</Text>
              <Text style={styles.listSub}>Manage notification preferences</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#CBD5E1" />
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity style={styles.listItem}>
            <Icon name="earth" size={20} color="#16A34A" style={styles.listIcon} />
            <View style={styles.listInfo}>
              <Text style={styles.listLbl}>Language</Text>
              <Text style={styles.listSub}>Choose app language</Text>
            </View>
            <Text style={styles.rightValTxt}>English</Text>
            <Icon name="chevron-right" size={20} color="#CBD5E1" />
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity style={styles.listItem}>
            <Icon name="palette-outline" size={20} color="#EA580C" style={styles.listIcon} />
            <View style={styles.listInfo}>
              <Text style={styles.listLbl}>Theme</Text>
              <Text style={styles.listSub}>Choose app theme</Text>
            </View>
            <Text style={styles.rightValTxt}>Light</Text>
            <Icon name="chevron-right" size={20} color="#CBD5E1" />
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity style={styles.listItem}>
            <Icon name="clock-outline" size={20} color="#2563EB" style={styles.listIcon} />
            <View style={styles.listInfo}>
              <Text style={styles.listLbl}>Date & Time</Text>
              <Text style={styles.listSub}>Set date and time preferences</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#CBD5E1" />
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity style={styles.listItem}>
            <Icon name="currency-inr" size={20} color="#9333EA" style={styles.listIcon} />
            <View style={styles.listInfo}>
              <Text style={styles.listLbl}>Currency</Text>
              <Text style={styles.listSub}>Set your preferred currency</Text>
            </View>
            <Text style={styles.rightValTxt}>INR (₹)</Text>
            <Icon name="chevron-right" size={20} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        {/* Account & Security */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Account & Security</Text>
        </View>
        <View style={styles.listContainer}>
          <TouchableOpacity style={styles.listItem}>
            <Icon name="lock-outline" size={20} color="#2563EB" style={styles.listIcon} />
            <View style={styles.listInfo}>
              <Text style={styles.listLbl}>Change Password</Text>
              <Text style={styles.listSub}>Update your account password</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#CBD5E1" />
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity style={styles.listItem}>
            <Icon name="shield-check-outline" size={20} color="#16A34A" style={styles.listIcon} />
            <View style={styles.listInfo}>
              <Text style={styles.listLbl}>Two-Factor Authentication</Text>
              <Text style={styles.listSub}>Add extra security to your account</Text>
            </View>
            <Text style={[styles.rightValTxt, {color: '#16A34A', fontWeight: '700'}]}>Enabled</Text>
            <Icon name="chevron-right" size={20} color="#CBD5E1" />
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity style={styles.listItem}>
            <Icon name="fingerprint" size={20} color="#EA580C" style={styles.listIcon} />
            <View style={styles.listInfo}>
              <Text style={styles.listLbl}>Biometric Login</Text>
              <Text style={styles.listSub}>Use fingerprint or Face ID to login</Text>
            </View>
            <Text style={[styles.rightValTxt, {color: '#16A34A', fontWeight: '700'}]}>Enabled</Text>
            <Icon name="chevron-right" size={20} color="#CBD5E1" />
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity style={styles.listItem}>
            <Icon name="cellphone" size={20} color="#DC2626" style={styles.listIcon} />
            <View style={styles.listInfo}>
              <Text style={styles.listLbl}>Manage Devices</Text>
              <Text style={styles.listSub}>View and manage logged-in devices</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#CBD5E1" />
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity style={styles.listItem} onPress={handleLogout}>
            <Icon name="logout" size={20} color="#9333EA" style={styles.listIcon} />
            <View style={styles.listInfo}>
              <Text style={styles.listLbl}>Logout</Text>
              <Text style={styles.listSub}>Sign out from your account</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        {/* Other */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Other</Text>
        </View>
        <View style={styles.listContainer}>
          <TouchableOpacity style={styles.listItem}>
            <Icon name="help-circle-outline" size={20} color="#2563EB" style={styles.listIcon} />
            <View style={styles.listInfo}>
              <Text style={styles.listLbl}>Help & Support</Text>
              <Text style={styles.listSub}>Get help and contact support</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#CBD5E1" />
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity style={styles.listItem}>
            <Icon name="information-outline" size={20} color="#16A34A" style={styles.listIcon} />
            <View style={styles.listInfo}>
              <Text style={styles.listLbl}>About App</Text>
              <Text style={styles.listSub}>App version and information</Text>
            </View>
            <Text style={styles.rightValTxt}>v2.4.1</Text>
            <Icon name="chevron-right" size={20} color="#CBD5E1" />
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity style={styles.listItem}>
            <Icon name="file-document-outline" size={20} color="#EA580C" style={styles.listIcon} />
            <View style={styles.listInfo}>
              <Text style={styles.listLbl}>Privacy Policy</Text>
              <Text style={styles.listSub}>Read our privacy policy</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#CBD5E1" />
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity style={styles.listItem}>
            <Icon name="shield-check-outline" size={20} color="#DC2626" style={styles.listIcon} />
            <View style={styles.listInfo}>
              <Text style={styles.listLbl}>Terms & Conditions</Text>
              <Text style={styles.listSub}>Read our terms and conditions</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        {/* Delete Account */}
        <TouchableOpacity style={styles.deleteCard}>
          <View style={styles.delIconBg}><Icon name="trash-can-outline" size={20} color="#DC2626" /></View>
          <View style={styles.listInfo}>
            <Text style={styles.delTitle}>Delete Account</Text>
            <Text style={styles.delSub}>Permanently delete your account and data</Text>
          </View>
          <Icon name="chevron-right" size={20} color="#CBD5E1" />
        </TouchableOpacity>

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
    paddingBottom: 25,
    position: 'relative',
    zIndex: 1,
  },
  topHeaderRow: { flexDirection: 'row', alignItems: 'flex-start' },
  headerTitles: { flex: 1, marginLeft: 12 },
  mainTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', fontFamily: 'Inter-Bold' },
  mainSubTitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter-Medium', marginTop: 4 },

  scrollView: { flex: 1, marginTop: -15, position: 'relative', zIndex: 2, elevation: 5 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

  heroCard: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4, marginBottom: 20 },
  hcAvatarWrapper: { marginRight: 16 },
  hcAvatar: { width: 64, height: 64, borderRadius: 32 },
  hcInfo: { flex: 1, justifyContent: 'center' },
  hcNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  hcName: { fontSize: 16, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  hcRole: { fontSize: 11, color: '#475569', fontFamily: 'Inter-Medium', marginBottom: 6 },
  hcMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  hcMetaTxt: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium', marginLeft: 4 },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },

  listContainer: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20 },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16 },
  listIcon: { marginRight: 12 },
  listInfo: { flex: 1 },
  listLbl: { fontSize: 12, fontWeight: '700', color: '#0F172A', fontFamily: 'Inter-Bold', marginBottom: 2 },
  listSub: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium' },
  rightValTxt: { fontSize: 11, color: '#64748B', fontFamily: 'Inter-Regular', marginRight: 8 },
  listDivider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 16 },

  deleteCard: { flexDirection: 'row', backgroundColor: '#FEF2F2', borderRadius: 16, borderWidth: 1, borderColor: '#FECACA', padding: 16, alignItems: 'center' },
  delIconBg: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: '#FECACA' },
  delTitle: { fontSize: 12, fontWeight: '800', color: '#DC2626', fontFamily: 'Inter-Bold', marginBottom: 2 },
  delSub: { fontSize: 10, color: '#475569', fontFamily: 'Inter-Medium' },
});

export default SettingsScreen;
