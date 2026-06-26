import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import { fetchNotifications, markAsRead, markAllAsRead } from '../../redux/slices/notificationSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { formatDate } from '../../utils/helpers';

interface Props {
  navigation: any;
}

const typeIcons: Record<string, string> = {
  booking: '📋',
  payment: '💳',
  subscription: '📦',
  complaint: '📝',
  general: '🔔',
};

const NotificationListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, unreadCount, loading } = useSelector((s: RootState) => s.notifications);

  const load = useCallback(() => { dispatch(fetchNotifications({ limit: 50 })); }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const unsub = navigation.addListener('focus', load); return unsub; }, [navigation, load]);

  const handleMarkRead = (id: string) => { dispatch(markAsRead(id)); };

  const handleMarkAllRead = () => {
    Alert.alert('Mark All as Read', 'Mark all notifications as read?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Mark All', onPress: () => dispatch(markAllAsRead()) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAllText}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>
      {unreadCount > 0 && (
        <View style={styles.unreadBar}>
          <View style={styles.unreadDot} />
          <Text style={styles.unreadText}>{unreadCount} unread notification{unreadCount > 1 ? 's' : ''}</Text>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primaryBlue} />}
        ListEmptyComponent={
          <EmptyState icon="🔔" title="No Notifications" description="Notifications will appear here when something needs your attention" />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.notifItem, !item.isRead && styles.notifUnread]}
            onPress={() => !item.isRead && handleMarkRead(item._id)}
          >
            <View style={styles.notifIcon}>
              <Text style={styles.notifEmoji}>{typeIcons[item.type] || '🔔'}</Text>
            </View>
            <View style={styles.notifContent}>
              <View style={styles.notifHeader}>
                <Text style={[styles.notifTitle, !item.isRead && styles.notifTitleBold]}>{item.title}</Text>
                <Text style={styles.notifTime}>{formatDate(item.createdAt, 'time')}</Text>
              </View>
              <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12, backgroundColor: colors.white,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  markAllText: { fontSize: 14, fontWeight: '600', color: colors.primaryBlue, fontFamily: 'Inter-SemiBold' },
  unreadBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 8, backgroundColor: colors.lightBlue },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primaryBlue, marginRight: 8 },
  unreadText: { fontSize: 13, color: colors.primaryBlue, fontFamily: 'Inter-Medium' },
  listContent: { paddingBottom: 20 },
  notifItem: {
    flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  notifUnread: { backgroundColor: colors.lightBlue + '80' },
  notifIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.lightBlue, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  notifEmoji: { fontSize: 18 },
  notifContent: { flex: 1 },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  notifTitle: { fontSize: 14, color: colors.textPrimary, fontFamily: 'Inter-Medium' },
  notifTitleBold: { fontWeight: '700', fontFamily: 'Inter-Bold' },
  notifTime: { fontSize: 11, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  notifMessage: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, fontFamily: 'Inter-Regular' },
});

export default NotificationListScreen;
