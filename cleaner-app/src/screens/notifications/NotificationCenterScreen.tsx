import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchNotifications, markAsRead } from '../../redux/slices/notificationSlice';
import { AppDispatch, RootState } from '../../redux/store';

interface Props { navigation: any }

const NotificationCenterScreen: React.FC<Props> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('All');
  
  const dispatch = useDispatch<AppDispatch>();
  const { cleaner } = useSelector((s: RootState) => s.auth);
  const { notifications, unreadCount, loading } = useSelector((s: RootState) => s.notifications);

  useEffect(() => {
    if (cleaner?._id) {
      dispatch(fetchNotifications({ userId: cleaner._id }));
    }
  }, [dispatch, cleaner?._id]);

  const dummyNotifications = [
    { id: 'd1', isRead: false, title: 'New Task Assigned', message: 'You have been assigned a new task at Sector 62, Noida.', createdAt: '2m ago', icon: 'calendar-text-outline', iconColor: '#2563EB', bg: '#EFF6FF', isImportant: false, type: 'task' },
    { id: 'd2', isRead: false, title: 'Task Completed', message: 'Task #TSK1256 has been marked as completed.', createdAt: '15m ago', icon: 'check-circle-outline', iconColor: '#16A34A', bg: '#F0FDF4', isImportant: false, type: 'task' },
    { id: 'd3', isRead: false, title: 'Earnings Credited', message: '₹1,250 has been added to your wallet.', createdAt: '1h ago', icon: 'wallet-outline', iconColor: '#EA580C', bg: '#FFF7ED', isImportant: false, type: 'payment' },
    { id: 'd4', isRead: false, title: 'Leave Request Approved', message: 'Your leave request from 20 May to 21 May 2025 has been approved.', createdAt: '2h ago', icon: 'calendar-check-outline', iconColor: '#9333EA', bg: '#FAF5FF', isImportant: false, type: 'general' },
    { id: 'd5', isRead: false, title: 'Issue Update', message: 'Your reported issue #ISSU1452 has been updated by the support team.', createdAt: '3h ago', icon: 'alert-circle-outline', iconColor: '#DC2626', bg: '#FEF2F2', isImportant: true, type: 'general' },
    { id: 'd6', isRead: true, title: 'Announcement', message: 'New safety guidelines have been updated. Please review.', createdAt: 'Yesterday, 6:30 PM', icon: 'bullhorn-outline', iconColor: '#2563EB', bg: '#EFF6FF', isImportant: false, type: 'general' },
  ];

  const displayNotifs = notifications.length > 0 ? notifications : dummyNotifications;

  const getIconData = (type: string, isImportant?: boolean) => {
    if (isImportant) return { icon: 'alert-circle-outline', color: '#DC2626', bg: '#FEF2F2' };
    switch (type) {
      case 'task': return { icon: 'calendar-text-outline', color: '#2563EB', bg: '#EFF6FF' };
      case 'attendance': return { icon: 'calendar-check-outline', color: '#9333EA', bg: '#FAF5FF' };
      case 'payment': return { icon: 'wallet-outline', color: '#16A34A', bg: '#F0FDF4' };
      default: return { icon: 'bell-outline', color: '#64748B', bg: '#F1F5F9' };
    }
  };

  const filteredNotifs = displayNotifs.filter(n => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Unread') return !n.isRead;
    if (activeTab === 'Important') return (n as any).isImportant;
    if (activeTab === 'System') return n.type === 'general';
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.blueHeaderBg}>
        <View style={styles.topHeaderRow}>
          <View style={styles.headerTitles}>
            <Text style={styles.mainTitle}>Notification Center</Text>
            <Text style={styles.mainSubTitle}>Stay updated with important alerts</Text>
          </View>
          <View style={styles.headerRightIcons}>
            <TouchableOpacity style={{ padding: 4, marginRight: 16 }}>
              <Icon name="magnify" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 4 }}>
              <Icon name="cog-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          {['All', 'Unread', 'Important', 'System'].map(tab => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tabItem, activeTab === tab && styles.tabActive]} 
              onPress={() => setActiveTab(tab)}
            >
              <View style={styles.tabTxtRow}>
                <Text style={[styles.tabTxt, activeTab === tab && styles.tabTxtActive]}>{tab}</Text>
                {tab === 'Unread' && <View style={[styles.tabBadge, {backgroundColor: '#2563EB'}]}><Text style={styles.tabBadgeTxt}>8</Text></View>}
                {tab === 'Important' && <View style={[styles.tabBadge, {backgroundColor: '#FEF2F2'}]}><Text style={[styles.tabBadgeTxt, {color: '#DC2626'}]}>3</Text></View>}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Unread Bar */}
      <View style={styles.unreadBar}>
        <View style={styles.unreadBarLeft}>
          <Icon name="bell-ring-outline" size={18} color="#2563EB" />
          <Text style={styles.unreadBarTxt}>You have {unreadCount || 0} unread notifications</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.markReadTxt}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => cleaner?._id && dispatch(fetchNotifications({ userId: cleaner._id }))} />}>
        
        {/* Notifications List */}
        <View style={styles.listContainer}>
          {filteredNotifs.map((notif: any) => {
            const iconData = getIconData(notif.type, notif.isImportant);
            return (
              <TouchableOpacity key={notif._id || notif.id} style={styles.notifRow} onPress={() => notif._id && dispatch(markAsRead(notif._id))}>
                <View style={styles.notifLeft}>
                  <View style={[styles.unreadDot, notif.isRead && {backgroundColor: 'transparent'}]} />
                  <View style={[styles.notifIconBg, {backgroundColor: iconData.bg}]}>
                    <Icon name={iconData.icon} size={22} color={iconData.color} />
                  </View>
                </View>

                <View style={styles.notifBody}>
                  <View style={styles.notifTitleRow}>
                    <Text style={[styles.notifTitle, !notif.isRead && {fontWeight: '600'}]}>{notif.title}</Text>
                    <Text style={styles.notifTime}>{notif.createdAt || notif.time}</Text>
                  </View>
                  <Text style={styles.notifDesc}>{notif.message || notif.desc}</Text>
                  {notif.isImportant && (
                    <View style={styles.importantBadge}>
                      <Text style={styles.importantBadgeTxt}>Important</Text>
                    </View>
                  )}
                </View>

                <Icon name="chevron-right" size={20} color="#CBD5E1" style={styles.chevron} />

              </TouchableOpacity>
            );
          })}
        </View>

        {/* Info Banner */}
        <View style={styles.infoBox}>
          <View style={styles.infoIconBg}><Icon name="information-variant" size={20} color="#FFF" /></View>
          <Text style={styles.infoTxt}>Enable push notifications to never miss important updates.</Text>
          <TouchableOpacity><Text style={styles.openSettingsTxt}>Open Settings</Text></TouchableOpacity>
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
    zIndex: 10,
  },
  topHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  headerTitles: { flex: 1 },
  mainTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', fontFamily: 'Inter-Bold' },
  mainSubTitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter-Medium', marginTop: 4 },
  headerRightIcons: { flexDirection: 'row', alignItems: 'center' },

  tabsRow: { flexDirection: 'row', backgroundColor: '#FFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 0 },
  tabItem: { flex: 1, alignItems: 'center', paddingBottom: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#2563EB' },
  tabTxtRow: { flexDirection: 'row', alignItems: 'center' },
  tabTxt: { fontSize: 12, fontWeight: '600', color: '#64748B', fontFamily: 'Inter-SemiBold' },
  tabTxtActive: { color: '#2563EB', fontWeight: '800', fontFamily: 'Inter-Bold' },
  tabBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, marginLeft: 6, alignItems: 'center', justifyContent: 'center' },
  tabBadgeTxt: { fontSize: 9, fontWeight: '700', color: '#FFF', fontFamily: 'Inter-Bold' },

  unreadBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  unreadBarLeft: { flexDirection: 'row', alignItems: 'center' },
  unreadBarTxt: { fontSize: 12, fontWeight: '600', color: '#0F172A', fontFamily: 'Inter-SemiBold', marginLeft: 8 },
  markReadTxt: { fontSize: 11, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold' },

  scrollContent: { paddingBottom: 40 },

  listContainer: { backgroundColor: '#FFF' },
  notifRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  notifLeft: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2563EB', marginRight: 8 },
  notifIconBg: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  
  notifBody: { flex: 1, paddingRight: 16 },
  notifTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  notifTitle: { flex: 1, fontSize: 13, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  notifTime: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium', marginLeft: 8 },
  notifDesc: { fontSize: 12, color: '#475569', fontFamily: 'Inter-Regular', lineHeight: 18 },
  
  importantBadge: { backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginTop: 8 },
  importantBadgeTxt: { fontSize: 9, fontWeight: '700', color: '#DC2626', fontFamily: 'Inter-Bold' },

  chevron: { alignSelf: 'center' },

  infoBox: { flexDirection: 'row', backgroundColor: '#EFF6FF', borderRadius: 8, padding: 16, alignItems: 'center', marginHorizontal: 16, marginTop: 16, borderWidth: 1, borderColor: '#BFDBFE' },
  infoIconBg: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  infoTxt: { flex: 1, fontSize: 10, color: '#1E3A8A', fontFamily: 'Inter-Medium', lineHeight: 14, marginRight: 8 },
  openSettingsTxt: { fontSize: 11, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold' },
});

export default NotificationCenterScreen;
