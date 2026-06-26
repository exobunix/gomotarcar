import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Header from '../../components/common/Header';
import EmptyState from '../../components/common/EmptyState';
import { fetchNotifications, markNotificationRead } from '../../redux/slices/notificationSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { formatDate } from '../../utils/helpers';

interface Props { navigation: any }

const typeIcons: Record<string, string> = { task: '📋', payment: '💰', attendance: '📅', system: '🔔', general: '📢' };

const NotificationListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, loading } = useSelector((s: RootState) => s.notifications);

  const load = useCallback(() => { dispatch(fetchNotifications()); }, [dispatch]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { const unsub = navigation.addListener('focus', load); return unsub; }, [navigation, load]);

  const handlePress = (item: any) => {
    if (!item.isRead) dispatch(markNotificationRead(item._id));
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={[styles.item, !item.isRead && styles.unread]} onPress={() => handlePress(item)}>
      <Text style={styles.icon}>{typeIcons[item.type] || '📢'}</Text>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={[styles.title, !item.isRead && styles.unreadTitle]}>{item.title}</Text>
        <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.date}>{formatDate(item.createdAt, 'time')}</Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Notifications" onBack={() => navigation.goBack()} />
      <FlatList data={notifications} keyExtractor={(item) => item._id} contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primaryBlue} />}
        ListEmptyComponent={<EmptyState icon="🔔" title="No Notifications" description="You're all caught up" />}
        renderItem={renderItem} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: 20, paddingBottom: 40 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 14, padding: 14, marginBottom: 6 },
  unread: { backgroundColor: colors.lightBlue },
  icon: { fontSize: 24, width: 40, textAlign: 'center' },
  title: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  unreadTitle: { fontWeight: '700' },
  message: { fontSize: 13, color: colors.textSecondary, marginTop: 2, fontFamily: 'Inter-Regular' },
  date: { fontSize: 11, color: colors.textLight, marginTop: 4, fontFamily: 'Inter-Regular' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primaryBlue, marginLeft: 8 },
});

export default NotificationListScreen;
