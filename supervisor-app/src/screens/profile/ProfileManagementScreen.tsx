import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../../components/common/Card';

interface Props { navigation: any }

const ProfileManagementScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('Personal Info');

  const subTabs = [
    { name: 'Personal Info', label: 'Personal Info', icon: 'account-outline' },
    { name: 'Documents', label: 'Documents', icon: 'file-document-outline' },
    { name: 'Bank Details', label: 'Bank Details', icon: 'bank-outline' },
    { name: 'Password', label: 'Password', icon: 'lock-outline' },
    { name: 'Notifications', label: 'Notifications', icon: 'bell-outline' },
  ];

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
            <Text style={styles.mainTitle}>Profile Management</Text>
            <Text style={styles.subTitle}>Manage your profile and account settings</Text>
          </View>
        </View>

        {/* Tab Row Buttons */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subTabsRow}>
          {subTabs.map((tab) => {
            const isActive = activeTab === tab.name;
            return (
              <TouchableOpacity 
                key={tab.name} 
                style={[styles.subTabItem, isActive && styles.subTabActiveItem]}
                onPress={() => setActiveTab(tab.name)}
              >
                <Icon name={tab.icon} size={18} color={isActive ? '#FFFFFF' : '#64748B'} />
                <Text style={[styles.subTabLabel, isActive && styles.subTabActiveLabel]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Profile Card Summary Header Box */}
        <Card variant="elevated" style={styles.profileCard}>
          <View style={styles.profileCardRow}>
            <View style={styles.avatarWrapper}>
              <Image source={require('../../assets/cleaner_avatar.png')} style={styles.avatarLarge} />
              <TouchableOpacity style={styles.cameraBtn}>
                <Icon name="camera" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.profileName}>Adarsh Kumar</Text>
              <Text style={styles.profileRole}>Supervisor</Text>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillTxt}>Active</Text>
              </View>

              <View style={styles.metaRow}>
                <Icon name="email-outline" size={14} color="#64748B" />
                <Text style={styles.metaTxt}>adarsh.kumar@gomotarcar.com</Text>
              </View>

              <View style={styles.metaRow}>
                <Icon name="phone-outline" size={14} color="#64748B" />
                <Text style={styles.metaTxt}>+91 98765 43210</Text>
              </View>

              <View style={styles.metaRow}>
                <Icon name="calendar-range" size={14} color="#64748B" />
                <Text style={styles.metaTxt}>Joined on 15 Jan 2024</Text>
              </View>

              <View style={styles.metaRow}>
                <Icon name="map-marker-outline" size={14} color="#64748B" />
                <Text style={styles.metaTxt}>Noida, Uttar Pradesh</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.editProfileBtn}>
              <Icon name="pencil-outline" size={14} color="#2563EB" />
              <Text style={styles.editProfileTxt}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Personal Information Group */}
        <Card variant="elevated" style={styles.infoGroupCard}>
          <Text style={styles.infoGroupTitle}>Personal Information</Text>

          <View style={styles.infoFieldRow}>
            <View style={styles.fieldLabelRow}>
              <Icon name="account-outline" size={16} color="#64748B" />
              <Text style={styles.fieldLabel}>Full Name</Text>
            </View>
            <Text style={styles.fieldVal}>Adarsh Kumar</Text>
          </View>

          <View style={styles.infoFieldRow}>
            <View style={styles.fieldLabelRow}>
              <Icon name="card-account-details-outline" size={16} color="#64748B" />
              <Text style={styles.fieldLabel}>Employee ID</Text>
            </View>
            <Text style={styles.fieldVal}>SUP001</Text>
          </View>

          <View style={styles.infoFieldRow}>
            <View style={styles.fieldLabelRow}>
              <Icon name="calendar" size={16} color="#64748B" />
              <Text style={styles.fieldLabel}>Date of Birth</Text>
            </View>
            <Text style={styles.fieldVal}>12 Mar 1992</Text>
          </View>

          <View style={styles.infoFieldRow}>
            <View style={styles.fieldLabelRow}>
              <Icon name="gender-male-female" size={16} color="#64748B" />
              <Text style={styles.fieldLabel}>Gender</Text>
            </View>
            <Text style={styles.fieldVal}>Male</Text>
          </View>

          <View style={styles.infoFieldRow}>
            <View style={styles.fieldLabelRow}>
              <Icon name="phone-outline" size={16} color="#64748B" />
              <Text style={styles.fieldLabel}>Mobile Number</Text>
            </View>
            <Text style={styles.fieldVal}>+91 98765 43210</Text>
          </View>

          <View style={styles.infoFieldRow}>
            <View style={styles.fieldLabelRow}>
              <Icon name="email-outline" size={16} color="#64748B" />
              <Text style={styles.fieldLabel}>Email Address</Text>
            </View>
            <Text style={styles.fieldVal}>adarsh.kumar@gomotarcar.com</Text>
          </View>

          <View style={[styles.infoFieldRow, { borderBottomWidth: 0 }]}>
            <View style={styles.fieldLabelRow}>
              <Icon name="map-marker-outline" size={16} color="#64748B" />
              <Text style={styles.fieldLabel}>Address</Text>
            </View>
            <Text style={[styles.fieldVal, { textAlign: 'right', flex: 1 }]}>Sector 62, Noida, Uttar Pradesh - 201301</Text>
          </View>
        </Card>

        {/* Emergency Contact Group */}
        <Card variant="elevated" style={styles.infoGroupCard}>
          <Text style={styles.infoGroupTitle}>Emergency Contact</Text>

          <View style={styles.infoFieldRow}>
            <View style={styles.fieldLabelRow}>
              <Icon name="account-alert-outline" size={16} color="#64748B" />
              <Text style={styles.fieldLabel}>Contact Name</Text>
            </View>
            <Text style={styles.fieldVal}>Rajesh Kumar (Brother)</Text>
          </View>

          <View style={styles.infoFieldRow}>
            <View style={styles.fieldLabelRow}>
              <Icon name="account-group-outline" size={16} color="#64748B" />
              <Text style={styles.fieldLabel}>Relationship</Text>
            </View>
            <Text style={styles.fieldVal}>Brother</Text>
          </View>

          <View style={[styles.infoFieldRow, { borderBottomWidth: 0 }]}>
            <View style={styles.fieldLabelRow}>
              <Icon name="phone-outline" size={16} color="#64748B" />
              <Text style={styles.fieldLabel}>Mobile Number</Text>
            </View>
            <Text style={styles.fieldVal}>+91 91234 56789</Text>
          </View>
        </Card>

        {/* Work Information Group */}
        <Card variant="elevated" style={styles.infoGroupCard}>
          <Text style={styles.infoGroupTitle}>Work Information</Text>

          <View style={styles.infoFieldRow}>
            <View style={styles.fieldLabelRow}>
              <Icon name="briefcase-outline" size={16} color="#64748B" />
              <Text style={styles.fieldLabel}>Designation</Text>
            </View>
            <Text style={styles.fieldVal}>Supervisor</Text>
          </View>

          <View style={styles.infoFieldRow}>
            <View style={styles.fieldLabelRow}>
              <Icon name="domain" size={16} color="#64748B" />
              <Text style={styles.fieldLabel}>Department</Text>
            </View>
            <Text style={styles.fieldVal}>Operations</Text>
          </View>

          <View style={styles.infoFieldRow}>
            <View style={styles.fieldLabelRow}>
              <Icon name="account-tie-outline" size={16} color="#64748B" />
              <Text style={styles.fieldLabel}>Reporting Manager</Text>
            </View>
            <Text style={styles.fieldVal}>Amit Verma</Text>
          </View>

          <View style={styles.infoFieldRow}>
            <View style={styles.fieldLabelRow}>
              <Icon name="map-marker-radius-outline" size={16} color="#64748B" />
              <Text style={styles.fieldLabel}>Work Location</Text>
            </View>
            <Text style={styles.fieldVal}>Noida, Uttar Pradesh</Text>
          </View>

          <View style={[styles.infoFieldRow, { borderBottomWidth: 0 }]}>
            <View style={styles.fieldLabelRow}>
              <Icon name="clock-outline" size={16} color="#64748B" />
              <Text style={styles.fieldLabel}>Shift Timing</Text>
            </View>
            <Text style={styles.fieldVal}>09:00 AM - 06:00 PM</Text>
          </View>
        </Card>

        {/* Save Changes Solid Button */}
        <TouchableOpacity style={styles.saveChangesBtn}>
          <Text style={styles.saveChangesTxt}>Save Changes</Text>
        </TouchableOpacity>

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
  subTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  subTabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  subTabActiveItem: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  subTabLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  subTabActiveLabel: {
    color: '#FFFFFF',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  profileCardRow: {
    flexDirection: 'row',
    position: 'relative',
  },
  avatarWrapper: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  profileRole: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
    marginTop: 2,
  },
  statusPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
    marginBottom: 8,
  },
  statusPillTxt: {
    fontSize: 9,
    fontWeight: '700',
    color: '#16A34A',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  metaTxt: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
  },
  editProfileBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  editProfileTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  infoGroupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  infoGroupTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
    marginBottom: 10,
  },
  infoFieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  fieldVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  saveChangesBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveChangesTxt: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default ProfileManagementScreen;
