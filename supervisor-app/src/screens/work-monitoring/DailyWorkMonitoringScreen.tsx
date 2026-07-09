import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput,
  Platform, Dimensions, StatusBar, Alert, Modal, ScrollView,
  RefreshControl, ActivityIndicator, Linking,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../../components/common/Card';
import {
  fetchTodayForSupervisor,
  approveTask,
  rejectTask,
  rescheduleTask,
} from '../../redux/slices/taskSlice';
import { fetchUnreadCount } from '../../redux/slices/notificationSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { colors } from '../../theme/colors';

const { width } = Dimensions.get('window');

interface Props { navigation: any }

type StatusFilter = 'all' | 'completed' | 'in_progress' | 'assigned' | 'missed';

const STATUS_FILTERS: { key: StatusFilter; label: string; color: string }[] = [
  { key: 'all', label: 'All', color: '#2563EB' },
  { key: 'completed', label: 'Completed', color: '#16A34A' },
  { key: 'in_progress', label: 'In Progress', color: '#2563EB' },
  { key: 'assigned', label: 'Pending', color: '#F97316' },
  { key: 'missed', label: 'Missed', color: '#EF4444' },
];

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'completed': return 'Completed';
    case 'in_progress': return 'In Progress';
    case 'assigned': return 'Pending';
    case 'missed': return 'Missed';
    case 'cancelled': return 'Cancelled';
    default: return status || 'Unknown';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return '#16A34A';
    case 'in_progress': return '#2563EB';
    case 'assigned': return '#F97316';
    case 'missed': return '#EF4444';
    default: return '#64748B';
  }
};

const getStatusBg = (status: string) => {
  switch (status) {
    case 'completed': return '#ECFDF5';
    case 'in_progress': return '#EFF6FF';
    case 'assigned': return '#FFF7ED';
    case 'missed': return '#FEF2F2';
    default: return '#F1F5F9';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return 'check-circle';
    case 'in_progress': return 'progress-clock';
    case 'assigned': return 'clock-outline';
    case 'missed': return 'close-circle';
    default: return 'help-circle-outline';
  }
};

const formatTime = (timeStr: string | undefined): string => {
  if (!timeStr) return '—';
  // If already formatted like "08:00 AM" just return it
  return timeStr;
};

const formatScheduledDate = (date: Date | string | undefined): string => {
  if (!date) return 'Today';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getCustomerName = (task: any): string => {
  if (task.customerId?.firstName) {
    return `${task.customerId.firstName} ${task.customerId.lastName || ''}`.trim();
  }
  return task.customerName || 'Customer';
};

const getCleanerName = (task: any): string => {
  if (task.cleanerId?.firstName) {
    return `${task.cleanerId.firstName} ${task.cleanerId.lastName || ''}`.trim();
  }
  return 'Not Assigned';
};

const getVehicleNo = (task: any): string => {
  return task.vehicleId?.vehicleNumber || task.vehicleNo || '—';
};

const getVehicleModel = (task: any): string => {
  if (task.vehicleId?.make) return `${task.vehicleId.make} ${task.vehicleId.model || ''}`.trim();
  return task.vehicleModel || '—';
};

const getCustomerPhone = (task: any): string => {
  return task.customerId?.phone || task.customerPhone || '';
};

// ─── Image Viewer Modal ───────────────────────────────────────────────────────
const ImageViewerModal: React.FC<{
  visible: boolean;
  images: string[];
  title: string;
  onClose: () => void;
}> = ({ visible, images, title, onClose }) => {
  const [current, setCurrent] = useState(0);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={imgStyles.overlay}>
        <View style={imgStyles.container}>
          <View style={imgStyles.header}>
            <Text style={imgStyles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={imgStyles.closeBtn}>
              <Icon name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          {images.length === 0 ? (
            <View style={imgStyles.noPhotos}>
              <Icon name="image-off-outline" size={48} color="#94A3B8" />
              <Text style={imgStyles.noPhotosText}>No photos available</Text>
            </View>
          ) : (
            <>
              <Image
                source={{ uri: images[current] }}
                style={imgStyles.mainImage}
                resizeMode="contain"
              />
              <View style={imgStyles.thumbnailRow}>
                {images.map((img, idx) => (
                  <TouchableOpacity key={idx} onPress={() => setCurrent(idx)}>
                    <Image
                      source={{ uri: img }}
                      style={[imgStyles.thumbnail, current === idx && imgStyles.thumbActive]}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={imgStyles.counter}>{current + 1} / {images.length}</Text>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

// ─── Reschedule Modal ─────────────────────────────────────────────────────────
const RescheduleModal: React.FC<{
  visible: boolean;
  taskId: string;
  onClose: () => void;
  onConfirm: (data: any) => void;
  loading: boolean;
}> = ({ visible, taskId, onClose, onConfirm, loading }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={rsStyles.overlay}>
        <View style={rsStyles.sheet}>
          <View style={rsStyles.handle} />
          <Text style={rsStyles.title}>Reschedule Task</Text>
          <Text style={rsStyles.label}>New Date (YYYY-MM-DD)</Text>
          <TextInput
            style={rsStyles.input}
            placeholder="e.g. 2025-06-15"
            placeholderTextColor="#94A3B8"
            value={date}
            onChangeText={setDate}
          />
          <Text style={rsStyles.label}>New Time</Text>
          <TextInput
            style={rsStyles.input}
            placeholder="e.g. 09:00 AM"
            placeholderTextColor="#94A3B8"
            value={time}
            onChangeText={setTime}
          />
          <Text style={rsStyles.label}>Reason (optional)</Text>
          <TextInput
            style={[rsStyles.input, { height: 72, textAlignVertical: 'top' }]}
            placeholder="Reason for reschedule..."
            placeholderTextColor="#94A3B8"
            multiline
            value={reason}
            onChangeText={setReason}
          />
          <View style={rsStyles.btnRow}>
            <TouchableOpacity style={rsStyles.cancelBtn} onPress={onClose}>
              <Text style={rsStyles.cancelTxt}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[rsStyles.confirmBtn, loading && { opacity: 0.7 }]}
              disabled={loading || !date.trim()}
              onPress={() => onConfirm({ scheduledDate: date, scheduledTime: time, reason })}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={rsStyles.confirmTxt}>Confirm</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const DailyWorkMonitoringScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();
  const { dailyTasks, dailyStats, dailyLoading, actionLoading } = useSelector((s: RootState) => s.tasks);
  const { unreadCount } = useSelector((s: RootState) => s.notifications);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Image viewer state
  const [imgModal, setImgModal] = useState<{ visible: boolean; images: string[]; title: string }>({
    visible: false, images: [], title: '',
  });

  // Reschedule modal state
  const [rsModal, setRsModal] = useState<{ visible: boolean; taskId: string }>({
    visible: false, taskId: '',
  });

  const load = useCallback(() => {
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    dispatch(fetchTodayForSupervisor({
      date: dateStr,
      status: statusFilter !== 'all' ? statusFilter : undefined,
    }));
    dispatch(fetchUnreadCount());
  }, [dispatch, selectedDate, statusFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  // Client-side search filter on top of server filter
  const filtered = dailyTasks.filter(task => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      getCustomerName(task).toLowerCase().includes(q) ||
      getVehicleNo(task).toLowerCase().includes(q) ||
      getCleanerName(task).toLowerCase().includes(q) ||
      (task.taskId || '').toLowerCase().includes(q)
    );
  });

  // Stats — prefer from server, fallback to counting filtered list
  const totalCars = dailyStats?.total ?? dailyTasks.length;
  const completedCount = dailyStats?.completed ?? dailyTasks.filter(t => t.status === 'completed').length;
  const pendingCount = dailyStats?.pending ?? dailyTasks.filter(t => t.status === 'assigned').length;
  const inProgressCount = dailyStats?.inProgress ?? dailyTasks.filter(t => t.status === 'in_progress').length;
  const missedCount = dailyStats?.missed ?? dailyTasks.filter(t => t.status === 'missed').length;

  const completedPct = totalCars > 0 ? ((completedCount / totalCars) * 100).toFixed(1) : '0.0';
  const pendingPct = totalCars > 0 ? (((pendingCount + inProgressCount) / totalCars) * 100).toFixed(1) : '0.0';
  const missedPct = totalCars > 0 ? ((missedCount / totalCars) * 100).toFixed(1) : '0.0';

  // ── Handlers ──
  const handleApprove = (task: any) => {
    Alert.alert(
      'Approve Task',
      `Approve cleaning for ${getVehicleNo(task)} by ${getCleanerName(task)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => {
            dispatch(approveTask({ id: task._id, data: { remark: 'Approved by supervisor' } }))
              .unwrap()
              .then(() => {
                Alert.alert('✓ Approved', 'Task marked as completed.');
                load();
              })
              .catch(err => Alert.alert('Error', err?.message || 'Failed to approve.'));
          },
        },
      ],
    );
  };

  const handleReject = (task: any) => {
    Alert.prompt?.(
      'Reject Task',
      'Enter rejection reason:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: (reason?: string) => {
            dispatch(rejectTask({ id: task._id, reason: reason || 'Rejected by supervisor' }))
              .unwrap()
              .then(() => {
                Alert.alert('✗ Rejected', 'Task marked as missed.');
                load();
              })
              .catch(err => Alert.alert('Error', err?.message || 'Failed to reject.'));
          },
        },
      ],
      'plain-text',
      '',
    ) ?? Alert.alert(
      'Reject Task',
      `Reject cleaning for ${getVehicleNo(task)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            dispatch(rejectTask({ id: task._id, reason: 'Rejected by supervisor' }))
              .unwrap()
              .then(() => {
                Alert.alert('✗ Rejected', 'Task marked as missed.');
                load();
              })
              .catch(err => Alert.alert('Error', err?.message || 'Failed to reject.'));
          },
        },
      ],
    );
  };

  const handleViewImages = (task: any) => {
    const allPhotos = [...(task.beforePhotos || []), ...(task.afterPhotos || [])];
    setImgModal({
      visible: true,
      images: allPhotos,
      title: `Photos — ${getVehicleNo(task)}`,
    });
  };

  const handleReschedule = (task: any) => {
    setRsModal({ visible: true, taskId: task._id });
  };

  const handleRescheduleConfirm = (data: any) => {
    dispatch(rescheduleTask({ id: rsModal.taskId, data }))
      .unwrap()
      .then(() => {
        setRsModal({ visible: false, taskId: '' });
        Alert.alert('✓ Rescheduled', 'Task has been rescheduled successfully.');
        load();
      })
      .catch(err => Alert.alert('Error', err?.message || 'Failed to reschedule.'));
  };

  // ── Render task card ──
  const renderItem = ({ item: task }: { item: any }) => {
    const isActioning = actionLoading === task._id;
    const statusLabel = getStatusLabel(task.status);
    const statusColor = getStatusColor(task.status);
    const statusBg = getStatusBg(task.status);
    const canApprove = ['in_progress', 'assigned', 'completed'].includes(task.status);
    const canReject = task.status !== 'missed' && task.status !== 'cancelled';
    const photoCount = (task.beforePhotos?.length || 0) + (task.afterPhotos?.length || 0);

    return (
      <Card variant="elevated" style={styles.taskCard}>
        {/* Header row: task ID + status */}
        <View style={styles.taskCardHeader}>
          <Text style={styles.taskIdTxt}>{task.taskId || `#${task._id?.slice(-6).toUpperCase()}`}</Text>
          <View style={[styles.statusPill, { backgroundColor: statusBg }]}>
            <Icon name={getStatusIcon(task.status)} size={10} color={statusColor} />
            <Text style={[styles.statusPillTxt, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>

        {/* Main data row */}
        <View style={styles.dataRow}>
          {/* Customer + Vehicle */}
          <View style={styles.dataCol}>
            <Text style={styles.dataColLabel}>Customer & Vehicle</Text>
            <Text style={styles.dataPrimary} numberOfLines={1}>{getCustomerName(task)}</Text>
            {getCustomerPhone(task) ? (
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${getCustomerPhone(task)}`)}>
                <Text style={styles.dataPhone}>{getCustomerPhone(task)}</Text>
              </TouchableOpacity>
            ) : null}
            <View style={styles.vehicleRow}>
              <Icon name="car" size={11} color="#64748B" />
              <Text style={styles.vehicleNo} numberOfLines={1}>{getVehicleNo(task)}</Text>
            </View>
            <Text style={styles.vehicleModel} numberOfLines={1}>{getVehicleModel(task)}</Text>
          </View>

          {/* Cleaner + Time */}
          <View style={styles.dataCol}>
            <Text style={styles.dataColLabel}>Cleaner</Text>
            <Text style={styles.dataPrimary} numberOfLines={1}>{getCleanerName(task)}</Text>
            {task.cleanerId?.cleanerId ? (
              <Text style={styles.dataSecondary}>{task.cleanerId.cleanerId}</Text>
            ) : null}

            <Text style={[styles.dataColLabel, { marginTop: 8 }]}>Scheduled</Text>
            <View style={styles.timeRow}>
              <Icon name="clock-outline" size={12} color="#64748B" />
              <Text style={styles.timeTxt}>{formatTime(task.scheduledTime)}</Text>
            </View>
            <Text style={styles.dataSecondary}>{task.timeSlot || 'Morning'}</Text>
          </View>

          {/* Package + Photos count */}
          <View style={[styles.dataCol, { flex: 0.7, alignItems: 'flex-end' }]}>
            {task.packageType ? (
              <View style={styles.packageBadge}>
                <Text style={styles.packageTxt}>{task.packageType.toUpperCase()}</Text>
              </View>
            ) : null}
            {task.qrVerified && (
              <View style={styles.qrBadge}>
                <Icon name="qrcode-scan" size={10} color="#10B981" />
                <Text style={styles.qrTxt}>QR ✓</Text>
              </View>
            )}
            {photoCount > 0 && (
              <View style={styles.photoBadge}>
                <Icon name="camera" size={10} color="#8B5CF6" />
                <Text style={styles.photoTxt}>{photoCount} photos</Text>
              </View>
            )}
            {task.actualStartTime && (
              <View style={{ marginTop: 6 }}>
                <Text style={styles.dataSecondary}>Started</Text>
                <Text style={styles.timeTxt}>
                  {new Date(task.actualStartTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            )}
            {task.actualEndTime && (
              <View style={{ marginTop: 4 }}>
                <Text style={styles.dataSecondary}>Ended</Text>
                <Text style={styles.timeTxt}>
                  {new Date(task.actualEndTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleViewImages(task)}>
            {isActioning ? <ActivityIndicator size="small" color="#8B5CF6" /> : <Icon name="image-multiple-outline" size={15} color="#8B5CF6" />}
            <Text style={[styles.actionTxt, { color: '#8B5CF6' }]}>
              Images{photoCount > 0 ? ` (${photoCount})` : ''}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerV} />

          <TouchableOpacity
            style={[styles.actionBtn, !canApprove && styles.actionDisabled]}
            onPress={() => canApprove && handleApprove(task)}
            disabled={isActioning || !canApprove}
          >
            {isActioning ? (
              <ActivityIndicator size="small" color="#16A34A" />
            ) : (
              <Icon name="check-circle-outline" size={15} color={canApprove ? '#16A34A' : '#CBD5E1'} />
            )}
            <Text style={[styles.actionTxt, { color: canApprove ? '#16A34A' : '#CBD5E1' }]}>Approve</Text>
          </TouchableOpacity>

          <View style={styles.dividerV} />

          <TouchableOpacity
            style={[styles.actionBtn, !canReject && styles.actionDisabled]}
            onPress={() => canReject && handleReject(task)}
            disabled={isActioning || !canReject}
          >
            {isActioning ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <Icon name="close-circle-outline" size={15} color={canReject ? '#EF4444' : '#CBD5E1'} />
            )}
            <Text style={[styles.actionTxt, { color: canReject ? '#EF4444' : '#CBD5E1' }]}>Reject</Text>
          </TouchableOpacity>

          <View style={styles.dividerV} />

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleReschedule(task)}
            disabled={isActioning}
          >
            <Icon name="calendar-edit" size={15} color="#F97316" />
            <Text style={[styles.actionTxt, { color: '#F97316' }]}>Reschedule</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  const todayStr = selectedDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top + 4 : (Platform.OS === 'ios' ? 44 : 12) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.openDrawer?.()}>
            <Icon name="menu" size={26} color="#1E293B" />
          </TouchableOpacity>
          <View style={styles.brandWrap}>
            <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.brandSub}>Anything &amp; Everything for your Car</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Notifications')}>
            <Icon name="bell-outline" size={24} color="#1E293B" />
            {unreadCount > 0 && (
              <View style={styles.badge}><Text style={styles.badgeTxt}>{unreadCount > 99 ? '99+' : unreadCount}</Text></View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={dailyLoading} onRefresh={load} tintColor={colors.primaryBlue} />
        }
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            {dailyLoading ? (
              <ActivityIndicator size="large" color="#2563EB" />
            ) : (
              <>
                <Icon name="car-off" size={52} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No tasks found</Text>
                <Text style={styles.emptySubtitle}>
                  {statusFilter !== 'all' ? `No "${STATUS_FILTERS.find(f => f.key === statusFilter)?.label}" tasks today` : 'No cleaning tasks scheduled for today'}
                </Text>
              </>
            )}
          </View>
        }
        ListHeaderComponent={
          <>
            {/* Page Title + Date */}
            <View style={styles.titleRow}>
              <View>
                <Text style={styles.mainTitle}>Today's Cleaning</Text>
                <Text style={styles.subTitle}>
                  {dailyLoading ? 'Loading...' : `${filtered.length} of ${dailyTasks.length} tasks`}
                </Text>
              </View>
              <View style={styles.dateBtn}>
                <Icon name="calendar-month-outline" size={15} color="#2563EB" />
                <Text style={styles.dateTxt}>{todayStr}</Text>
              </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              {[
                { icon: 'car-outline', iconBg: '#EFF6FF', iconColor: '#2563EB', val: totalCars, label: 'Total Cars', pct: '100%', pctColor: '#2563EB', pctBg: '#EFF6FF', onPress: () => setStatusFilter('all') },
                { icon: 'check-bold', iconBg: '#ECFDF5', iconColor: '#16A34A', val: completedCount, label: 'Completed', pct: `${completedPct}%`, pctColor: '#16A34A', pctBg: '#E8F5E9', onPress: () => setStatusFilter('completed') },
                { icon: 'clock-outline', iconBg: '#FFF7ED', iconColor: '#F97316', val: pendingCount + inProgressCount, label: 'Pending', pct: `${pendingPct}%`, pctColor: '#F97316', pctBg: '#FFF3E0', onPress: () => setStatusFilter('assigned') },
                { icon: 'close-thick', iconBg: '#FEF2F2', iconColor: '#EF4444', val: missedCount, label: 'Missed', pct: `${missedPct}%`, pctColor: '#EF4444', pctBg: '#FFEBEE', onPress: () => setStatusFilter('missed') },
              ].map((card, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.82}
                  style={[styles.statCard, statusFilter === ['all', 'completed', 'assigned', 'missed'][idx] && styles.statCardActive]}
                  onPress={card.onPress}
                >
                  <View style={[styles.statIconBg, { backgroundColor: card.iconBg }]}>
                    <Icon name={card.icon} size={15} color={card.iconColor} />
                  </View>
                  <Text style={styles.statVal}>{dailyLoading ? '—' : card.val}</Text>
                  <Text style={[styles.statLabel, { color: card.iconColor }]}>{card.label}</Text>
                  <View style={[styles.pctPill, { backgroundColor: card.pctBg }]}>
                    <Text style={[styles.pctTxt, { color: card.pctColor }]}>{dailyLoading ? '—' : card.pct}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Search */}
            <View style={styles.searchRow}>
              <View style={styles.searchBox}>
                <Icon name="magnify" size={20} color="#94A3B8" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search customer, vehicle or cleaner..."
                  placeholderTextColor="#94A3B8"
                  value={search}
                  onChangeText={setSearch}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch('')}>
                    <Icon name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Status filter chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={{ paddingRight: 16 }}>
              {STATUS_FILTERS.map(f => (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.chip, statusFilter === f.key && { backgroundColor: f.color, borderColor: f.color }]}
                  onPress={() => setStatusFilter(f.key)}
                >
                  <Text style={[styles.chipTxt, statusFilter === f.key && { color: '#FFFFFF' }]}>{f.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        }
      />

      {/* Image Viewer Modal */}
      <ImageViewerModal
        visible={imgModal.visible}
        images={imgModal.images}
        title={imgModal.title}
        onClose={() => setImgModal({ visible: false, images: [], title: '' })}
      />

      {/* Reschedule Modal */}
      <RescheduleModal
        visible={rsModal.visible}
        taskId={rsModal.taskId}
        onClose={() => setRsModal({ visible: false, taskId: '' })}
        onConfirm={handleRescheduleConfirm}
        loading={actionLoading === rsModal.taskId}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  menuBtn: { padding: 6, borderRadius: 8, backgroundColor: '#F1F5F9' },
  brandWrap: { flex: 1, alignItems: 'center' },
  logo: { width: 150, height: 36 },
  brandSub: { fontSize: 8, color: '#64748B', marginTop: -2 },
  notifBtn: { position: 'relative', padding: 6, backgroundColor: '#F1F5F9', borderRadius: 8 },
  badge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#EF4444', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 },
  badgeTxt: { fontSize: 9, fontWeight: '700', color: '#FFF' },

  listContent: { paddingHorizontal: 16, paddingBottom: 32 },

  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  mainTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  subTitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  dateBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  dateTxt: { fontSize: 12, fontWeight: '600', color: '#2563EB' },

  // Stats
  statsGrid: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statCardActive: { borderColor: '#2563EB', borderWidth: 2 },
  statIconBg: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  statVal: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  statLabel: { fontSize: 9, fontWeight: '600', marginTop: 1, textAlign: 'center' },
  pctPill: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, marginTop: 4 },
  pctTxt: { fontSize: 9, fontWeight: '700' },

  // Search
  searchRow: { flexDirection: 'row', marginBottom: 8, gap: 8 },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 10, paddingHorizontal: 12, height: 42,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#1E293B', marginLeft: 8, padding: 0 },

  // Filter chips
  chipScroll: { marginBottom: 12 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC', marginLeft: 8,
  },
  chipTxt: { fontSize: 11, fontWeight: '600', color: '#475569' },

  // Task card
  taskCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  taskCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  taskIdTxt: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  statusPillTxt: { fontSize: 10, fontWeight: '700' },

  dataRow: { flexDirection: 'row', gap: 8, borderBottomWidth: 1, borderColor: '#F1F5F9', paddingBottom: 10, marginBottom: 8 },
  dataCol: { flex: 1 },
  dataColLabel: { fontSize: 9, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 2 },
  dataPrimary: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  dataPhone: { fontSize: 11, color: '#2563EB', marginTop: 1 },
  dataSecondary: { fontSize: 10, color: '#94A3B8', marginTop: 1 },
  vehicleRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  vehicleNo: { fontSize: 11, fontWeight: '700', color: '#1E293B' },
  vehicleModel: { fontSize: 10, color: '#64748B', marginTop: 1 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  timeTxt: { fontSize: 11, fontWeight: '600', color: '#1E293B' },

  packageBadge: { backgroundColor: '#F1F5F9', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 4 },
  packageTxt: { fontSize: 9, fontWeight: '700', color: '#475569' },
  qrBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#ECFDF5', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 4 },
  qrTxt: { fontSize: 9, fontWeight: '700', color: '#10B981' },
  photoBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#FAF5FF', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 4 },
  photoTxt: { fontSize: 9, fontWeight: '700', color: '#8B5CF6' },

  // Actions
  actionsRow: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 4 },
  actionDisabled: { opacity: 0.4 },
  actionTxt: { fontSize: 9, fontWeight: '700' },
  dividerV: { width: 1, height: 28, backgroundColor: '#E2E8F0' },

  // Empty
  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#475569', marginTop: 8 },
  emptySubtitle: { fontSize: 12, color: '#94A3B8', textAlign: 'center', paddingHorizontal: 32 },
});

// Image modal styles
const imgStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  container: { width: width - 32, maxHeight: '85%', backgroundColor: '#111827', borderRadius: 16, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  title: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  closeBtn: { padding: 4 },
  mainImage: { width: '100%', height: 260 },
  thumbnailRow: { flexDirection: 'row', gap: 6, padding: 10 },
  thumbnail: { width: 52, height: 52, borderRadius: 6, borderWidth: 1, borderColor: '#374151' },
  thumbActive: { borderColor: '#2563EB', borderWidth: 2 },
  counter: { textAlign: 'center', color: '#94A3B8', fontSize: 11, paddingBottom: 10 },
  noPhotos: { alignItems: 'center', padding: 40, gap: 10 },
  noPhotosText: { color: '#94A3B8', fontSize: 13 },
});

// Reschedule modal styles
const rsStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  handle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 17, fontWeight: '800', color: '#0F172A', marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 6 },
  input: {
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: '#1E293B', marginBottom: 12,
  },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, alignItems: 'center', paddingVertical: 12 },
  cancelTxt: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  confirmBtn: { flex: 1, backgroundColor: '#2563EB', borderRadius: 10, alignItems: 'center', paddingVertical: 12 },
  confirmTxt: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});

export default DailyWorkMonitoringScreen;
