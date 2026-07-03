import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Dimensions,
  StatusBar, RefreshControl, ActivityIndicator, Linking, Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchNotifications, fetchUnreadCount, markNotificationRead } from '../../redux/slices/notificationSlice';

const { width } = Dimensions.get('window');
interface Props { navigation: any }

const FILTERS = ['All', 'Unread', 'System', 'Customer', 'Cleaner'];

const TAG_META: Record<string, { bg: string; color: string }> = {
  Important: { bg: '#FAF5FF', color: '#8B5CF6' },
  High: { bg: '#FEF2F2', color: '#DC2626' },
  New: { bg: '#EFF6FF', color: '#2563EB' },
  Info: { bg: '#ECFDF5', color: '#16A34A' },
  General: { bg: '#F8FAFC', color: '#64748B' },
  Task: { bg: '#FFF7ED', color: '#F97316' },
};

const ICON_MAP: Record<string, string> = {
  task: 'broom',
  complaint: 'message-alert-outline',
  leave: 'calendar-multiselect',
  attendance: 'clock-outline',
  system: 'shield-check-outline',
  approval: 'clipboard-check-outline',
  default: 'bell-outline',
};

const getIcon = (notif: any) => ICON_MAP[notif.type?.toLowerCase()] || ICON_MAP.default;

const formatTime = (d: string | Date | undefined) => {
  if (!d) return '';
  const date = new Date(d);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

const NotificationListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();
  const { notifications, loading, unreadCount } = useSelector((s: RootState) => s.notifications);
  const [activeFilter, setActiveFilter] = useState('All');

  const load = useCallback(() => {
    dispatch(fetchNotifications());
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const unsub = navigation.addListener('focus', load); return unsub; }, [navigation, load]);

  const filtered = notifications.filter(n => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Unread') return !n.isRead;
    return (n.type || '').toLowerCase().includes(activeFilter.toLowerCase());
  });

  const handleMarkRead = (id: string) => {
    dispatch(markNotificationRead(id));
  };

  const handleMarkAllRead = () => {
    notifications.filter(n => !n.isRead).forEach(n => dispatch(markNotificationRead(n._id)));
  };

  const renderItem = ({ item }: { item: any }) => {
    const tag = item.priority === 'high' ? 'High' : item.type === 'system' ? 'System' : 'General';
    const tagMeta = TAG_META[tag] || TAG_META.General;
    return (
      <TouchableOpacity
        style={[styles.card, !item.isRead && styles.cardUnread]}
        onPress={() => handleMarkRead(item._id)}
        activeOpacity={0.85}
      >
        <View style={[styles.iconBg, { backgroundColor: !item.isRead ? '#EFF6FF' : '#F8FAFC' }]}>
          <Icon name={getIcon(item)} size={20} color={!item.isRead ? '#2563EB' : '#94A3B8'} />
        </View>
        <View style={styles.cardBody}>
          <View style={styles.cardTopRow}>
            <Text style={[styles.cardTitle, !item.isRead && { fontWeight: '800', color: '#0F172A' }]} numberOfLines={2}>
              {item.title || 'Notification'}
            </Text>
            <View style={[styles.tag, { backgroundColor: tagMeta.bg }]}>
              <Text style={[styles.tagTxt, { color: tagMeta.color }]}>{tag}</Text>
            </View>
          </View>
          <Text style={styles.cardMsg} numberOfLines={2}>{item.message || item.body || ''}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardTime}>{formatTime(item.createdAt)}</Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1D4ED8" />
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top + 8 : (Platform.OS === 'ios' ? 52 : 16) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-left" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSub}>{unreadCount} unread messages</Text>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllRead}>
              <Text style={styles.markAllTxt}>Mark All Read</Text>
            </TouchableOpacity>
          )}
        </View>
        {/* Filters */}
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={f => f}
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 10 }}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 2 }}
          renderItem={({ item: f }) => (
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterChipTxt, activeFilter === f && { color: '#FFF' }]}>{f}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor="#2563EB" />}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            {loading ? (
              <ActivityIndicator size="large" color="#2563EB" />
            ) : (
              <>
                <Icon name="bell-off-outline" size={52} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No notifications</Text>
                <Text style={styles.emptySub}>You're all caught up!</Text>
              </>
            )}
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#1D4ED8', paddingHorizontal: 16, paddingBottom: 14, borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 2 },
  backBtn: { padding: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 11, color: '#BFDBFE', marginTop: 1 },
  markAllBtn: { backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  markAllTxt: { fontSize: 11, fontWeight: '700', color: '#FFF' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  filterChipActive: { backgroundColor: '#FFF' },
  filterChipTxt: { fontSize: 12, fontWeight: '600', color: '#BFDBFE' },
  listContent: { padding: 16, paddingBottom: 32, gap: 10 },
  card: { flexDirection: 'row', gap: 12, backgroundColor: '#FFF', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#F1F5F9' },
  cardUnread: { backgroundColor: '#F0F6FF', borderColor: '#BFDBFE' },
  iconBg: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  cardBody: { flex: 1 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  cardTitle: { fontSize: 13, fontWeight: '600', color: '#1E293B', flex: 1, marginRight: 8 },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  tagTxt: { fontSize: 9, fontWeight: '700' },
  cardMsg: { fontSize: 12, color: '#64748B', lineHeight: 17 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  cardTime: { fontSize: 10, color: '#94A3B8' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2563EB' },
  emptyWrap: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#475569' },
  emptySub: { fontSize: 13, color: '#94A3B8' },
});

export default NotificationListScreen;
