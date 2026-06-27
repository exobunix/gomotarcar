import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image, Platform, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../../components/common/Card';

interface Props { navigation: any }

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  
  // States matching the high-fidelity toggle switches
  const [dataSync, setDataSync] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [biometricLogin, setBiometricLogin] = useState(true);
  
  const [timeFormat12, setTimeFormat12] = useState(true);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Brand Header Bar */}
      <View style={[styles.headerContainer, { paddingTop: insets.top > 0 ? insets.top + 4 : (Platform.OS === 'ios' ? 44 : 12) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.headerMenuBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={26} color="#1E293B" />
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Main Title Section */}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.mainTitle}>Settings</Text>
            <Text style={styles.subTitle}>Manage your app preferences and account settings</Text>
          </View>
        </View>

        {/* General Settings Category */}
        <Card variant="elevated" style={styles.categoryCard}>
          <View style={styles.categoryHeader}>
            <View style={[styles.categoryIconBg, { backgroundColor: '#EFF6FF' }]}>
              <Icon name="cog-outline" size={16} color="#2563EB" />
            </View>
            <Text style={styles.categoryTitle}>General Settings</Text>
          </View>

          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>App Name</Text>
            <Icon name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>Date & Time</Text>
            <View style={styles.settingRightCol}>
              <Text style={styles.settingRightVal}>20 May 2025, 09:41 AM</Text>
              <Icon name="chevron-right" size={18} color="#94A3B8" />
            </View>
          </TouchableOpacity>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Time Format</Text>
            <View style={styles.toggleRowBtn}>
              <TouchableOpacity 
                style={[styles.toggleBtnLeft, timeFormat12 && styles.toggleBtnActive]}
                onPress={() => setTimeFormat12(true)}
              >
                <Text style={[styles.toggleBtnTxt, timeFormat12 && styles.toggleBtnActiveTxt]}>12 Hours</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleBtnRight, !timeFormat12 && styles.toggleBtnActive]}
                onPress={() => setTimeFormat12(false)}
              >
                <Text style={[styles.toggleBtnTxt, !timeFormat12 && styles.toggleBtnActiveTxt]}>24 Hours</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>Default Dashboard</Text>
            <View style={styles.settingRightCol}>
              <Text style={styles.settingRightVal}>Supervisor Dashboard</Text>
              <Icon name="chevron-right" size={18} color="#94A3B8" />
            </View>
          </TouchableOpacity>

          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Data Sync</Text>
              <Text style={styles.settingDesc}>Sync app data in background</Text>
            </View>
            <Switch 
              value={dataSync} 
              onValueChange={setDataSync} 
              trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
              thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : '#F1F5F9'}
            />
          </View>
        </Card>

        {/* Notification Settings Category */}
        <Card variant="elevated" style={styles.categoryCard}>
          <View style={styles.categoryHeader}>
            <View style={[styles.categoryIconBg, { backgroundColor: '#FAF5FF' }]}>
              <Icon name="bell-outline" size={16} color="#8B5CF6" />
            </View>
            <Text style={styles.categoryTitle}>Notification Settings</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDesc}>Receive push notifications</Text>
            </View>
            <Switch 
              value={pushNotif} 
              onValueChange={setPushNotif} 
              trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Sound</Text>
              <Text style={styles.settingDesc}>Play sound on notifications</Text>
            </View>
            <Switch 
              value={sound} 
              onValueChange={setSound} 
              trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Vibration</Text>
              <Text style={styles.settingDesc}>Vibrate on notifications</Text>
            </View>
            <Switch 
              value={vibration} 
              onValueChange={setVibration} 
              trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Email Notifications</Text>
              <Text style={styles.settingDesc}>Receive email alerts</Text>
            </View>
            <Switch 
              value={emailNotif} 
              onValueChange={setEmailNotif} 
              trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <TouchableOpacity style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.settingLabel}>Quiet Hours</Text>
            <View style={styles.settingRightCol}>
              <Text style={styles.settingRightVal}>10:00 PM - 07:00 AM</Text>
              <Icon name="chevron-right" size={18} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        </Card>

        {/* Security Category */}
        <Card variant="elevated" style={styles.categoryCard}>
          <View style={styles.categoryHeader}>
            <View style={[styles.categoryIconBg, { backgroundColor: '#ECFDF5' }]}>
              <Icon name="shield-check-outline" size={16} color="#16A34A" />
            </View>
            <Text style={styles.categoryTitle}>Security</Text>
          </View>

          <TouchableOpacity style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Change Password</Text>
              <Text style={styles.settingDesc}>Update your account password</Text>
            </View>
            <Icon name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Biometric Login</Text>
              <Text style={styles.settingDesc}>Use fingerprint or face to login</Text>
            </View>
            <Switch 
              value={biometricLogin} 
              onValueChange={setBiometricLogin} 
              trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <TouchableOpacity style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Auto Logout</Text>
              <Text style={styles.settingDesc}>Automatically logout after inactivity</Text>
            </View>
            <View style={styles.settingRightCol}>
              <Text style={styles.settingRightVal}>30 Minutes</Text>
              <Icon name="chevron-right" size={18} color="#94A3B8" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Login Activity</Text>
              <Text style={styles.settingDesc}>View recent login activity</Text>
            </View>
            <Icon name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </Card>

        {/* Language Category */}
        <Card variant="elevated" style={styles.categoryCard}>
          <TouchableOpacity style={[styles.settingRow, { borderBottomWidth: 0, paddingVertical: 4 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <View style={[styles.categoryIconBg, { backgroundColor: '#FDF2F8' }]}>
                <Icon name="translate" size={16} color="#DB2777" />
              </View>
              <View>
                <Text style={styles.categoryTitle}>Language</Text>
                <Text style={styles.settingDesc}>Choose your preferred language</Text>
              </View>
            </View>
            <View style={styles.settingRightCol}>
              <Text style={styles.settingRightVal}>English</Text>
              <Icon name="chevron-right" size={18} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        </Card>

        {/* Theme Mode Category */}
        <Card variant="elevated" style={styles.categoryCard}>
          <View style={styles.categoryHeader}>
            <View style={[styles.categoryIconBg, { backgroundColor: '#FEF3C7' }]}>
              <Icon name="palette-outline" size={16} color="#D97706" />
            </View>
            <View>
              <Text style={styles.categoryTitle}>Theme Mode</Text>
              <Text style={styles.settingDesc}>Choose your app appearance</Text>
            </View>
          </View>

          <View style={styles.themeGrid}>
            <TouchableOpacity style={[styles.themeBox, styles.themeBoxActive]}>
              <Icon name="weather-sunny" size={20} color="#2563EB" />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.themeBoxTitle}>Light Theme</Text>
                <Text style={styles.themeBoxDesc}>Use light theme</Text>
              </View>
              <Icon name="radiobox-marked" size={18} color="#2563EB" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.themeBox}>
              <Icon name="weather-night" size={20} color="#64748B" />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.themeBoxTitle}>Dark Theme</Text>
                <Text style={styles.themeBoxDesc}>Use dark theme</Text>
              </View>
              <Icon name="radiobox-blank" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Bottom Banner Info */}
        <View style={styles.bottomInfoBanner}>
          <Icon name="information-outline" size={16} color="#2563EB" />
          <Text style={styles.bottomInfoBannerTxt}>Settings are applied automatically. Your changes are saved and applied across the app</Text>
        </View>

      </ScrollView>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  titleRow: {
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
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  categoryIconBg: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  settingDesc: {
    fontSize: 8.5,
    color: '#64748B',
    marginTop: 2,
  },
  settingRightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingRightVal: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  toggleRowBtn: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    padding: 2,
  },
  toggleBtnLeft: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  toggleBtnRight: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  toggleBtnActive: {
    backgroundColor: '#2563EB',
  },
  toggleBtnTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  toggleBtnActiveTxt: {
    color: '#FFFFFF',
  },
  themeGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  themeBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
  },
  themeBoxActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  themeBoxTitle: {
    fontSize: 11,
    fontWeight: '750',
    color: '#1E293B',
  },
  themeBoxDesc: {
    fontSize: 8.5,
    color: '#64748B',
    marginTop: 2,
  },
  bottomInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginTop: 8,
  },
  bottomInfoBannerTxt: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: '600',
    flex: 1,
    lineHeight: 14,
  },
});

export default SettingsScreen;
