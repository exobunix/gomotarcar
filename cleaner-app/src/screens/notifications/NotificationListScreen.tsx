import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import EmptyState from '../../components/common/EmptyState';
import { fetchNotifications, markAsRead } from '../../redux/slices/notificationSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { formatDate } from '../../utils/helpers';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props { navigation: any }

const typeConfig: Record<string, { icon: string, color: string, bg: string }> = { 
  task: { icon: 'clipboard-text-outline', color: '#3B82F6', bg: '#EFF6FF' },
  attendance: { icon: 'map-marker-radius-outline', color: '#10B981', bg: '#ECFDF5' }, 
  payment: { icon: 'cash', color: '#F59E0B', bg: '#FFFBEB' }, 
  general: { icon: 'bell-ring-outline', color: '#6366F1', bg: '#EEF2FF' }
};

const NotificationListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, unreadCount, loading } = useSelector((s: RootState) => s.notifications);

  const load = useCallback(() => { dispatch(fetchNotifications({ limit: 50 })); }, [dispatch]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const unsub = navigation.addListener('focus', load); return unsub; }, [navigation, load]);

  const markAllRead = () => {
    // Implement mark all read logic
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={styles.headerRightText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primaryBlue} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="bell-sleep-outline" size={64} color={colors.textTertiary} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyTitle}>No new notifications</Text>
            <Text style={styles.emptyDesc}>You're all caught up! Check back later for updates.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const config = typeConfig[item.type] || typeConfig.general;
          return (
            <TouchableOpacity
              style={[styles.notifItem, !item.isRead && styles.notifUnread]}
              onPress={() => !item.isRead && dispatch(markAsRead(item._id))}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: config.bg }]}>
                <Icon name={config.icon} size={24} color={config.color} />
                {!item.isRead && <View style={styles.unreadDot} />}
              </View>
              <View style={styles.notifContent}>
                <View style={styles.notifHeader}>
                  <Text style={[styles.notifTitle, !item.isRead && { fontFamily: 'Inter-Bold', color: colors.textPrimary }]}>
                    {item.title}
                  </Text>
                  <Text style={styles.notifTime}>{formatDate(item.createdAt, 'time')}</Text>
                </View>
                <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  headerRightText: { fontSize: 13, fontWeight: '600', color: colors.primaryBlue, fontFamily: 'Inter-SemiBold' },
  
  listContent: { paddingBottom: 20 },
  
  notifItem: { 
    flexDirection: 'row', 
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    backgroundColor: colors.white, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.border 
  },
  notifUnread: { backgroundColor: '#F0F5FF' },
  
  iconContainer: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 16,
    position: 'relative'
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.white,
  },
  
  notifContent: { flex: 1, justifyContent: 'center' },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  notifTitle: { fontSize: 15, color: colors.textSecondary, fontFamily: 'Inter-Medium', flex: 1, paddingRight: 8 },
  notifTime: { fontSize: 12, color: colors.textTertiary, fontFamily: 'Inter-Regular', marginTop: 2 },
  notifMessage: { fontSize: 13, color: colors.textSecondary, lineHeight: 20, fontFamily: 'Inter-Regular' },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 100, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold', marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: colors.textSecondary, fontFamily: 'Inter-Regular', textAlign: 'center', lineHeight: 22 },
});

export default NotificationListScreen;
