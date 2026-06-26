import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { Button } from '../../components/common/Button';
import { colors } from '../../theme/colors';
import { fetchNotifications, markAsRead, markAllAsRead } from '../../redux/slices/notificationSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus';

const typeIcons: Record<string, string> = {
  lead: '📋',
  payment: '💰',
  review: '⭐',
  system: '🔔',
  offer: '🏷',
  alert: '⚠️',
};

const NotificationListScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, unreadCount, loading } = useSelector((state: RootState) => state.notification);

  useRefreshOnFocus(() => dispatch(fetchNotifications()));
  useEffect(() => { dispatch(fetchNotifications()); }, [dispatch]);

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => dispatch(fetchNotifications())} />
        }
      >
        {unreadCount > 0 && (
          <View style={styles.unreadBar}>
            <Text style={styles.unreadText}>
              {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
            </Text>
            <TouchableOpacity onPress={() => dispatch(markAllAsRead())}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          </View>
        )}

        {notifications.length === 0 ? (
          <EmptyState
            icon="🔔"
            title="No Notifications"
            message="You're all caught up! Notifications will appear here."
          />
        ) : (
          notifications.map((notif: any) => (
            <TouchableOpacity
              key={notif._id}
              onPress={() => !notif.read && dispatch(markAsRead(notif._id))}
            >
              <Card style={[styles.notifCard, !notif.read && styles.notifUnread]}>
                <View style={styles.notifRow}>
                  <Text style={styles.notifIcon}>
                    {typeIcons[notif.type] || '🔔'}
                  </Text>
                  <View style={styles.notifContent}>
                    <Text style={[styles.notifTitle, !notif.read && styles.notifTitleUnread]}>
                      {notif.title}
                    </Text>
                    {notif.message && (
                      <Text style={styles.notifMessage} numberOfLines={2}>
                        {notif.message}
                      </Text>
                    )}
                    <Text style={styles.notifTime}>
                      {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  {!notif.read && <View style={styles.unreadDot} />}
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16, gap: 8, paddingBottom: 32 },
  unreadBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 8,
  },
  unreadText: { fontSize: 14, fontWeight: '600', color: colors.text },
  markAllText: { fontSize: 13, color: colors.primary, fontWeight: '500' },
  notifCard: { marginBottom: 0 },
  notifUnread: { backgroundColor: '#F0F7FF', borderColor: colors.primary + '40' },
  notifRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  notifIcon: { fontSize: 24, width: 32, textAlign: 'center' },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '500', color: colors.text },
  notifTitleUnread: { fontWeight: '700' },
  notifMessage: { fontSize: 13, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
  notifTime: { fontSize: 11, color: colors.textSecondary, marginTop: 4 },
  unreadDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary,
  },
});

export default NotificationListScreen;
