import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Dimensions, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../../components/common/Card';

const { width } = Dimensions.get('window');

interface Props { navigation: any }

const NotificationListScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('All');

  // Categorized high-fidelity mock data matching the screenshot exactly
  const systemNotifications = [
    {
      id: 'SYS-1',
      title: 'System Maintenance Scheduled',
      message: 'System maintenance is scheduled on 22 May 2025 from 02:00 AM to 04:00 AM.',
      time: '20 May 2025, 09:15 AM',
      sender: 'System',
      icon: 'server',
      tag: 'Important',
      tagBg: '#FAF5FF',
      tagTxt: '#8B5CF6',
      unread: true
    },
    {
      id: 'SYS-2',
      title: 'New Feature Update',
      message: 'Inventory management module has been updated with new features.',
      time: '19 May 2025, 04:30 PM',
      sender: 'System',
      icon: 'shield-check-outline',
      tag: 'New',
      tagBg: '#EFF6FF',
      tagTxt: '#2563EB',
      unread: true
    },
    {
      id: 'SYS-3',
      title: 'Data Backup Completed',
      message: 'Daily data backup completed successfully.',
      time: '19 May 2025, 02:05 PM',
      sender: 'System',
      icon: 'cloud-upload-outline',
      tag: 'Info',
      tagBg: '#ECFDF5',
      tagTxt: '#16A34A',
      unread: true
    }
  ];

  const customerNotifications = [
    {
      id: 'CUST-1',
      title: 'New Complaint Raised',
      message: 'Rahul Sharma has raised a complaint about Water Spots on Car.',
      time: '20 May 2025, 09:10 AM',
      sender: 'Rahul Sharma',
      icon: 'account-alert-outline',
      tag: 'High',
      tagBg: '#FFF7ED',
      tagTxt: '#EA580C',
      unread: true
    },
    {
      id: 'CUST-2',
      title: 'Cleaning Completed',
      message: 'Your car cleaning at Sunshine Heights is completed. Please rate your experience.',
      time: '19 May 2025, 06:20 PM',
      sender: 'Priya Singh',
      icon: 'calendar-check-outline',
      tag: 'General',
      tagBg: '#EFF6FF',
      tagTxt: '#2563EB',
      unread: true
    },
    {
      id: 'CUST-3',
      title: 'Upcoming Cleaning Reminder',
      message: 'Your car cleaning is scheduled tomorrow at 10:00 AM.',
      time: '19 May 2025, 05:45 PM',
      sender: 'Amit Verma',
      icon: 'volume-high',
      tag: 'Reminder',
      tagBg: '#ECFDF5',
      tagTxt: '#16A34A',
      unread: true
    }
  ];

  const cleanerNotifications = [
    {
      id: 'CLEAN-1',
      title: 'New Assignment',
      message: 'You are assigned to Sunshine Heights for cleaning on 21 May 2025.',
      time: '20 May 2025, 08:45 AM',
      sender: 'Ramesh Kumar',
      icon: 'account-arrow-right-outline',
      tag: 'High',
      tagBg: '#FFF7ED',
      tagTxt: '#EA580C',
      unread: true
    },
    {
      id: 'CLEAN-2',
      title: 'Shift Change',
      message: 'Your shift timing has been updated to 08:00 AM – 04:00 PM from 21 May 2025.',
      time: '19 May 2025, 07:30 PM',
      sender: 'Suresh Yadav',
      icon: 'calendar-clock-outline',
      tag: 'Update',
      tagBg: '#EFF6FF',
      tagTxt: '#2563EB',
      unread: true
    },
    {
      id: 'CLEAN-3',
      title: 'Payment Credited',
      message: 'Your earnings of ₹1,250 has been credited.',
      time: '19 May 2025, 06:10 PM',
      sender: 'Vikram Singh',
      icon: 'wallet-outline',
      tag: 'Payment',
      tagBg: '#ECFDF5',
      tagTxt: '#16A34A',
      unread: true
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Brand Header Bar */}
      <View style={[styles.headerContainer, { paddingTop: insets.top > 0 ? insets.top + 4 : (Platform.OS === 'ios' ? 44 : 12) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.headerBackBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#1E293B" />
          </TouchableOpacity>

          <View style={styles.brandContainer}>
            <Text style={styles.headerCenterTitle}>Notifications Center</Text>
            <Text style={styles.headerCenterSub}>Stay updated with all activities</Text>
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
        
        {/* Filter Controls Row */}
        <View style={styles.filterRow}>
          <View style={styles.segmentedControl}>
            <TouchableOpacity 
              style={[styles.segmentBtn, activeFilter === 'All' && styles.segmentActiveBtn]}
              onPress={() => setActiveFilter('All')}
            >
              <Text style={[styles.segmentBtnTxt, activeFilter === 'All' && styles.segmentActiveBtnTxt]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.segmentBtn, activeFilter === 'Unread' && styles.segmentActiveBtn]}
              onPress={() => setActiveFilter('Unread')}
            >
              <Text style={[styles.segmentBtnTxt, activeFilter === 'Unread' && styles.segmentActiveBtnTxt]}>Unread</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.segmentBtn, activeFilter === 'Important' && styles.segmentActiveBtn]}
              onPress={() => setActiveFilter('Important')}
            >
              <Text style={[styles.segmentBtnTxt, activeFilter === 'Important' && styles.segmentActiveBtnTxt]}>Important</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Icon name="filter-outline" size={18} color="#64748B" />
            <Text style={styles.filterBtnTxt}>Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Channels Quick Actions */}
        <View style={styles.quickActionsGrid}>
          {/* Item 1 */}
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={styles.qaLeftIconRow}>
              <View style={[styles.qaCircleIconBg, { backgroundColor: '#8B5CF6' }]}>
                <Icon name="bell-ring" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.qaDetailsCol}>
                <Text style={styles.qaTitle}>Push Notification</Text>
                <Text style={styles.qaDesc}>Send app push{"\n"}notifications</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={16} color="#94A3B8" />
          </TouchableOpacity>

          {/* Item 2 */}
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={styles.qaLeftIconRow}>
              <View style={[styles.qaCircleIconBg, { backgroundColor: '#10B981' }]}>
                <Icon name="message-text" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.qaDetailsCol}>
                <Text style={styles.qaTitle}>SMS</Text>
                <Text style={styles.qaDesc}>Send SMS to users{"\n"}or cleaners</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <View style={[styles.quickActionsGrid, { marginTop: 10 }]}>
          {/* Item 3 */}
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={styles.qaLeftIconRow}>
              <View style={[styles.qaCircleIconBg, { backgroundColor: '#2563EB' }]}>
                <Icon name="email" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.qaDetailsCol}>
                <Text style={styles.qaTitle}>Email</Text>
                <Text style={styles.qaDesc}>Send email{"\n"}notifications</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={16} color="#94A3B8" />
          </TouchableOpacity>

          {/* Item 4 */}
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={styles.qaLeftIconRow}>
              <View style={[styles.qaCircleIconBg, { backgroundColor: '#F59E0B' }]}>
                <Icon name="send" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.qaDetailsCol}>
                <Text style={styles.qaTitle}>Create New</Text>
                <Text style={styles.qaDesc}>Create custom{"\n"}notification</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* 1. System Notifications Section */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="laptop" size={20} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>System Notifications</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.viewAllTxt}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.notifCardList}>
          {systemNotifications.map((n) => (
            <Card key={n.id} variant="elevated" style={styles.notifCard}>
              {n.unread && <View style={styles.unreadBlueDot} />}
              <View style={styles.notifRowContent}>
                <View style={[styles.notifCircleIconBg, { backgroundColor: '#F3E8FF' }]}>
                  <Icon name={n.icon} size={20} color="#8B5CF6" />
                </View>
                
                <View style={styles.notifTextCol}>
                  <Text style={styles.notifTitle}>{n.title}</Text>
                  <Text style={styles.notifMessage}>{n.message}</Text>
                  <Text style={styles.notifMeta}>{n.time}  •  {n.sender}</Text>
                </View>

                <View style={styles.notifRightCol}>
                  <View style={[styles.tagBadge, { backgroundColor: n.tagBg }]}>
                    <Text style={[styles.tagBadgeTxt, { color: n.tagTxt }]}>{n.tag}</Text>
                  </View>
                  <Icon name="chevron-right" size={18} color="#94A3B8" />
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* 2. Customer Notifications Section */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="account-group-outline" size={20} color="#10B981" />
            <Text style={styles.sectionTitle}>Customer Notifications</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.viewAllTxt}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.notifCardList}>
          {customerNotifications.map((n) => (
            <Card key={n.id} variant="elevated" style={styles.notifCard}>
              {n.unread && <View style={styles.unreadBlueDot} />}
              <View style={styles.notifRowContent}>
                <View style={[styles.notifCircleIconBg, { backgroundColor: '#D1FAE5' }]}>
                  <Icon name={n.icon} size={20} color="#10B981" />
                </View>
                
                <View style={styles.notifTextCol}>
                  <Text style={styles.notifTitle}>{n.title}</Text>
                  <Text style={styles.notifMessage}>{n.message}</Text>
                  <Text style={styles.notifMeta}>{n.time}  •  {n.sender}</Text>
                </View>

                <View style={styles.notifRightCol}>
                  <View style={[styles.tagBadge, { backgroundColor: n.tagBg }]}>
                    <Text style={[styles.tagBadgeTxt, { color: n.tagTxt }]}>{n.tag}</Text>
                  </View>
                  <Icon name="chevron-right" size={18} color="#94A3B8" />
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* 3. Cleaner Notifications Section */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="account-tie-outline" size={20} color="#2563EB" />
            <Text style={styles.sectionTitle}>Cleaner Notifications</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.viewAllTxt}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.notifCardList}>
          {cleanerNotifications.map((n) => (
            <Card key={n.id} variant="elevated" style={styles.notifCard}>
              {n.unread && <View style={styles.unreadBlueDot} />}
              <View style={styles.notifRowContent}>
                <View style={[styles.notifCircleIconBg, { backgroundColor: '#DBEAFE' }]}>
                  <Icon name={n.icon} size={20} color="#2563EB" />
                </View>
                
                <View style={styles.notifTextCol}>
                  <Text style={styles.notifTitle}>{n.title}</Text>
                  <Text style={styles.notifMessage}>{n.message}</Text>
                  <Text style={styles.notifMeta}>{n.time}  •  {n.sender}</Text>
                </View>

                <View style={styles.notifRightCol}>
                  <View style={[styles.tagBadge, { backgroundColor: n.tagBg }]}>
                    <Text style={[styles.tagBadgeTxt, { color: n.tagTxt }]}>{n.tag}</Text>
                  </View>
                  <Icon name="chevron-right" size={18} color="#94A3B8" />
                </View>
              </View>
            </Card>
          ))}
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
  headerBackBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  brandContainer: {
    flex: 1,
    paddingLeft: 12,
  },
  headerCenterTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  headerCenterSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    fontFamily: 'Inter-Regular',
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
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  segmentedControl: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 3,
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
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  segmentActiveBtnTxt: {
    color: '#FFFFFF',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 38,
    gap: 6,
  },
  filterBtnTxt: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qaLeftIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qaCircleIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qaDetailsCol: {
    gap: 2,
  },
  qaTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E293B',
  },
  qaDesc: {
    fontSize: 8,
    color: '#64748B',
    lineHeight: 11,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    fontFamily: 'Inter-Bold',
  },
  viewAllTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  notifCardList: {
    gap: 10,
  },
  notifCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    position: 'relative',
  },
  unreadBlueDot: {
    position: 'absolute',
    left: 8,
    top: '48%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  notifRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  notifCircleIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTextCol: {
    flex: 1,
    paddingLeft: 12,
    paddingRight: 8,
    gap: 2,
  },
  notifTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
  },
  notifMessage: {
    fontSize: 10.5,
    color: '#475569',
    lineHeight: 14,
  },
  notifMeta: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
  },
  notifRightCol: {
    alignItems: 'flex-end',
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagBadgeTxt: {
    fontSize: 9,
    fontWeight: '700',
  },
});

export default NotificationListScreen;
