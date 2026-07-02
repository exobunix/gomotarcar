import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput,
  Platform, Dimensions, StatusBar, Alert, Modal, ScrollView,
  RefreshControl, ActivityIndicator, Linking, KeyboardAvoidingView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../../components/common/Card';
import {
  fetchApprovalStats,
  fetchApprovalList,
  approveTask,
  rejectTask,
} from '../../redux/slices/taskSlice';
import { fetchNotifications, fetchUnreadCount } from '../../redux/slices/notificationSlice';
import { AppDispatch, RootState } from '../../redux/store';

const { width } = Dimensions.get('window');

interface Props { navigation: any }

type Tab = 'pending' | 'approved' | 'rejected';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getCustomerName = (task: any) =>
  task.customerId?.firstName
    ? `${task.customerId.firstName} ${task.customerId.lastName || ''}`.trim()
    : 'Customer';

const getCleanerName = (task: any) =>
  task.cleanerId?.firstName
    ? `${task.cleanerId.firstName} ${task.cleanerId.lastName || ''}`.trim()
    : 'Unassigned';

const getVehicleNo = (task: any) => task.vehicleId?.vehicleNumber || '—';

const getVehicleModel = (task: any) =>
  task.vehicleId?.make
    ? `${task.vehicleId.make} ${task.vehicleId.model || ''}`.trim()
    : '—';

const getCustomerPhone = (task: any) => task.customerId?.phone || '';

const formatDate = (d: string | Date | undefined) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const getDuration = (start: string | Date, end: string | Date): string => {
  if (!start || !end) return '—';
  const diff = (new Date(end).getTime() - new Date(start).getTime()) / 1000;
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const TAB_META: { key: Tab; label: string; color: string; iconBg: string; icon: string }[] = [
  { key: 'pending', label: 'Pending', color: '#F97316', iconBg: '#FFF7ED', icon: 'clock-outline' },
  { key: 'approved', label: 'Approved', color: '#16A34A', iconBg: '#ECFDF5', icon: 'check-bold' },
  { key: 'rejected', label: 'Rejected', color: '#EF4444', iconBg: '#FEF2F2', icon: 'close-thick' },
];

// ─── Notification Drawer ──────────────────────────────────────────────────────
const NotificationDrawer: React.FC<{
  visible: boolean;
  onClose: () => void;
  navigation: any;
}> = ({ visible, onClose, navigation }) => {
  const { notifications, loading } = useSelector((s: RootState) => s.notifications);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={ndStyles.overlay} activeOpacity={1} onPress={onClose} />
      <View style={ndStyles.drawer}>
        <View style={ndStyles.header}>
          <Text style={ndStyles.title}>Notifications</Text>
          <TouchableOpacity onPress={onClose}><Icon name="close" size={22} color="#64748B" /></TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 32 }} color="#2563EB" />
        ) : notifications.length === 0 ? (
          <View style={ndStyles.empty}>
            <Icon name="bell-off-outline" size={44} color="#CBD5E1" />
            <Text style={ndStyles.emptyTxt}>No notifications</Text>
          </View>
        ) : (
          <FlatList
            data={notifications.slice(0, 30)}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            renderItem={({ item }) => (
              <View style={[ndStyles.notifItem, !item.isRead && ndStyles.notifUnread]}>
                <View style={ndStyles.notifDot} />
                <View style={{ flex: 1 }}>
                  <Text style={ndStyles.notifMsg} numberOfLines={2}>{item.message || item.title || 'Notification'}</Text>
                  <Text style={ndStyles.notifTime}>{formatDate(item.createdAt)}</Text>
                </View>
              </View>
            )}
          />
        )}
        <TouchableOpacity
          style={ndStyles.viewAllBtn}
          onPress={() => { onClose(); navigation.navigate('Notifications'); }}
        >
          <Text style={ndStyles.viewAllTxt}>View All Notifications</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

// ─── Task Detail Side Panel (Bottom Sheet on mobile) ─────────────────────────
const TaskDetailPanel: React.FC<{
  task: any;
  remarks: string;
  onRemarksChange: (v: string) => void;
  onApprove: () => void;
  onReject: () => void;
  onEscalate: () => void;
  onClose: () => void;
  actionLoading: boolean;
  tab: Tab;
}> = ({ task, remarks, onRemarksChange, onApprove, onReject, onEscalate, onClose, actionLoading, tab }) => {
  if (!task) return null;

  const timeline = (task.statusHistory || []).slice(-5);

  return (
    <Modal visible={!!task} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={dpStyles.overlay} activeOpacity={1} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={dpStyles.sheet}>
          <View style={dpStyles.handle} />

          {/* Header */}
          <View style={dpStyles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon name="file-check-outline" size={20} color="#2563EB" />
              <Text style={dpStyles.title}>Job Details</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={dpStyles.closeBtn}>
              <Icon name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
            {/* Job Meta */}
            <View style={dpStyles.section}>
              <View style={dpStyles.kvRow}>
                <Text style={dpStyles.kvLabel}>Task ID</Text>
                <Text style={dpStyles.kvVal}>{task.taskId || `#${task._id?.slice(-6).toUpperCase()}`}</Text>
              </View>
              <View style={dpStyles.kvRow}>
                <Text style={dpStyles.kvLabel}>Scheduled</Text>
                <Text style={dpStyles.kvVal}>{formatDate(task.scheduledDate)} {task.scheduledTime || ''}</Text>
              </View>
              <View style={dpStyles.kvRow}>
                <Text style={dpStyles.kvLabel}>Completed At</Text>
                <Text style={dpStyles.kvVal}>{formatDate(task.actualEndTime)}</Text>
              </View>
              <View style={dpStyles.kvRow}>
                <Text style={dpStyles.kvLabel}>Work Duration</Text>
                <Text style={dpStyles.kvVal}>{getDuration(task.actualStartTime, task.actualEndTime)}</Text>
              </View>
              <View style={dpStyles.kvRow}>
                <Text style={dpStyles.kvLabel}>Package</Text>
                <Text style={dpStyles.kvVal}>{task.packageType?.toUpperCase() || '—'}</Text>
              </View>
              <View style={dpStyles.kvRow}>
                <Text style={dpStyles.kvLabel}>QR Verified</Text>
                <Text style={[dpStyles.kvVal, { color: task.qrVerified ? '#16A34A' : '#EF4444' }]}>
                  {task.qrVerified ? '✓ Yes' : '✗ No'}
                </Text>
              </View>
            </View>

            {/* Customer */}
            <Text style={dpStyles.sectionTitle}>Customer Details</Text>
            <View style={dpStyles.section}>
              <View style={dpStyles.custRow}>
                <View style={dpStyles.custInitials}>
                  <Text style={dpStyles.custInitialsTxt}>
                    {getCustomerName(task).charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={dpStyles.custName}>{getCustomerName(task)}</Text>
                  <TouchableOpacity onPress={() => Linking.openURL(`tel:${getCustomerPhone(task)}`)}>
                    <Text style={dpStyles.custPhone}>{getCustomerPhone(task)}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={dpStyles.kvRow}>
                <Text style={dpStyles.kvLabel}>Vehicle</Text>
                <Text style={dpStyles.kvVal}>{getVehicleModel(task)}</Text>
              </View>
              <View style={dpStyles.kvRow}>
                <Text style={dpStyles.kvLabel}>Reg. No.</Text>
                <Text style={[dpStyles.kvVal, { fontWeight: '700' }]}>{getVehicleNo(task)}</Text>
              </View>
            </View>

            {/* Cleaner */}
            <Text style={dpStyles.sectionTitle}>Cleaner</Text>
            <View style={dpStyles.section}>
              <View style={dpStyles.kvRow}>
                <Text style={dpStyles.kvLabel}>Name</Text>
                <Text style={dpStyles.kvVal}>{getCleanerName(task)}</Text>
              </View>
              {task.cleanerId?.cleanerId && (
                <View style={dpStyles.kvRow}>
                  <Text style={dpStyles.kvLabel}>Cleaner ID</Text>
                  <Text style={dpStyles.kvVal}>{task.cleanerId.cleanerId}</Text>
                </View>
              )}
              {task.cleanerId?.phone && (
                <View style={dpStyles.kvRow}>
                  <Text style={dpStyles.kvLabel}>Phone</Text>
                  <TouchableOpacity onPress={() => Linking.openURL(`tel:${task.cleanerId.phone}`)}>
                    <Text style={[dpStyles.kvVal, { color: '#2563EB' }]}>{task.cleanerId.phone}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Photos */}
            {(task.beforePhotos?.length > 0 || task.afterPhotos?.length > 0) && (
              <>
                <Text style={dpStyles.sectionTitle}>Before / After Photos</Text>
                <View style={dpStyles.section}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {[...(task.beforePhotos || []).slice(0, 2), ...(task.afterPhotos || []).slice(0, 2)].map((uri: string, i: number) => (
                      <View key={i} style={dpStyles.photoWrap}>
                        <Image source={{ uri }} style={dpStyles.photo} />
                        <View style={dpStyles.photoLabel}>
                          <Text style={dpStyles.photoLabelTxt}>{i < (task.beforePhotos?.length || 0) ? 'Before' : 'After'}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            )}

            {/* Timeline */}
            {timeline.length > 0 && (
              <>
                <Text style={dpStyles.sectionTitle}>Status Timeline</Text>
                <View style={dpStyles.section}>
                  {timeline.map((entry: any, idx: number) => (
                    <View key={idx} style={dpStyles.timelineItem}>
                      <View style={dpStyles.timelineDot} />
                      <View style={{ flex: 1 }}>
                        <Text style={dpStyles.timelineStatus}>{entry.status?.replace('_', ' ').toUpperCase()}</Text>
                        <Text style={dpStyles.timelineMeta}>
                          {formatDate(entry.changedAt)}{entry.remark ? ` — ${entry.remark}` : ''}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Remarks */}
            {tab === 'pending' && (
              <>
                <Text style={dpStyles.sectionTitle}>Remarks</Text>
                <View style={dpStyles.section}>
                  <TextInput
                    style={dpStyles.remarksInput}
                    placeholder="Enter remarks (optional)..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={3}
                    value={remarks}
                    onChangeText={onRemarksChange}
                  />
                </View>
              </>
            )}

            {/* Action Buttons */}
            {tab === 'pending' && (
              <View style={dpStyles.actionBtns}>
                <TouchableOpacity
                  style={[dpStyles.btnApprove, actionLoading && { opacity: 0.7 }]}
                  onPress={onApprove}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Icon name="check-circle" size={16} color="#FFF" />
                  )}
                  <Text style={dpStyles.btnApproveTxt}>Approve Work</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[dpStyles.btnReject, actionLoading && { opacity: 0.7 }]}
                  onPress={onReject}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Icon name="close-circle" size={16} color="#FFF" />
                  )}
                  <Text style={dpStyles.btnRejectTxt}>Reject Work</Text>
                </TouchableOpacity>

                <TouchableOpacity style={dpStyles.btnEscalate} onPress={onEscalate}>
                  <Icon name="arrow-up-bold-circle-outline" size={16} color="#2563EB" />
                  <Text style={dpStyles.btnEscalateTxt}>Escalate</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const WorkApprovalCenterScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();

  const { approvalTasks, approvalStats, approvalLoading, actionLoading } = useSelector((s: RootState) => s.tasks);
  const { notifications, unreadCount } = useSelector((s: RootState) => s.notifications);
  const { supervisor } = useSelector((s: RootState) => s.auth);

  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [remarks, setRemarks] = useState('');
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  const load = useCallback(() => {
    dispatch(fetchApprovalStats());
    dispatch(fetchApprovalList({ tab: activeTab }));
    dispatch(fetchUnreadCount());
  }, [dispatch, activeTab]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    dispatch(fetchApprovalList({ tab }));
  };

  // Client-side search filter
  const filtered = approvalTasks.filter(task => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      getCustomerName(task).toLowerCase().includes(q) ||
      getVehicleNo(task).toLowerCase().includes(q) ||
      getCleanerName(task).toLowerCase().includes(q) ||
      (task.taskId || '').toLowerCase().includes(q)
    );
  });

  // ── Quick approve/reject from card ──
  const handleQuickApprove = (task: any) => {
    Alert.alert(
      'Approve Work',
      `Approve cleaning by ${getCleanerName(task)} for ${getVehicleNo(task)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => {
            dispatch(approveTask({ id: task._id, data: { remark: 'Approved by supervisor' } }))
              .unwrap()
              .then(() => {
                setSelectedTask(null);
                dispatch(fetchApprovalStats());
                dispatch(fetchApprovalList({ tab: activeTab }));
                Alert.alert('✓ Approved', 'Work has been approved successfully.');
              })
              .catch(err => Alert.alert('Error', err?.message || 'Failed to approve.'));
          },
        },
      ],
    );
  };

  const handleQuickReject = (task: any) => {
    Alert.alert(
      'Reject Work',
      `Reject cleaning by ${getCleanerName(task)} for ${getVehicleNo(task)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            dispatch(rejectTask({ id: task._id, reason: 'Rejected by supervisor' }))
              .unwrap()
              .then(() => {
                setSelectedTask(null);
                dispatch(fetchApprovalStats());
                dispatch(fetchApprovalList({ tab: activeTab }));
                Alert.alert('✗ Rejected', 'Work has been rejected.');
              })
              .catch(err => Alert.alert('Error', err?.message || 'Failed to reject.'));
          },
        },
      ],
    );
  };

  // ── Detail panel actions ──
  const handleDetailApprove = () => {
    if (!selectedTask) return;
    dispatch(approveTask({ id: selectedTask._id, data: { remark: remarks || 'Approved by supervisor' } }))
      .unwrap()
      .then(() => {
        setSelectedTask(null);
        setRemarks('');
        dispatch(fetchApprovalStats());
        dispatch(fetchApprovalList({ tab: activeTab }));
        Alert.alert('✓ Approved', 'Work approved successfully.');
      })
      .catch(err => Alert.alert('Error', err?.message || 'Failed to approve.'));
  };

  const handleDetailReject = () => {
    if (!selectedTask) return;
    dispatch(rejectTask({ id: selectedTask._id, reason: remarks || 'Rejected by supervisor' }))
      .unwrap()
      .then(() => {
        setSelectedTask(null);
        setRemarks('');
        dispatch(fetchApprovalStats());
        dispatch(fetchApprovalList({ tab: activeTab }));
        Alert.alert('✗ Rejected', 'Work rejected.');
      })
      .catch(err => Alert.alert('Error', err?.message || 'Failed to reject.'));
  };

  const handleEscalate = () => {
    Alert.alert(
      'Escalate to Manager',
      'This task will be flagged for manager review.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Escalate',
          onPress: () => {
            setSelectedTask(null);
            Alert.alert('Escalated', 'Task has been escalated to the manager.');
          },
        },
      ],
    );
  };

  // ── Render each approval card ──
  const renderCard = ({ item: task }: { item: any }) => {
    const isActioning = actionLoading === task._id;
    const photoCount = (task.beforePhotos?.length || 0) + (task.afterPhotos?.length || 0);

    return (
      <Card variant="elevated" style={styles.card}>
        {/* Card header */}
        <View style={styles.cardHeader}>
          <View style={styles.cleanerInfo}>
            <View style={styles.cleanerInitials}>
              <Text style={styles.cleanerInitialsTxt}>{getCleanerName(task).charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.cleanerName} numberOfLines={1}>{getCleanerName(task)}</Text>
              <Text style={styles.cleanerSub} numberOfLines={1}>{task.cleanerId?.cleanerId || 'Cleaner'}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: TAB_META.find(t => t.key === activeTab)?.iconBg }]}>
            <Text style={[styles.statusBadgeTxt, { color: TAB_META.find(t => t.key === activeTab)?.color }]}>
              {activeTab.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Card body: left text + right images */}
        <View style={styles.cardBody}>
          <View style={styles.textCol}>
            <View style={styles.detailRow}>
              <Icon name="account-outline" size={13} color="#64748B" />
              <Text style={styles.detailTxt} numberOfLines={1}>{getCustomerName(task)}</Text>
            </View>
            <TouchableOpacity style={styles.detailRow} onPress={() => getCustomerPhone(task) && Linking.openURL(`tel:${getCustomerPhone(task)}`)}>
              <Icon name="phone-outline" size={13} color="#64748B" />
              <Text style={[styles.detailTxt, { color: '#2563EB' }]} numberOfLines={1}>{getCustomerPhone(task) || '—'}</Text>
            </TouchableOpacity>
            <View style={styles.detailRow}>
              <Icon name="car-outline" size={13} color="#64748B" />
              <View>
                <Text style={styles.detailTxtBold} numberOfLines={1}>{getVehicleNo(task)}</Text>
                <Text style={styles.detailSub} numberOfLines={1}>{getVehicleModel(task)}</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <Icon name="clock-outline" size={13} color="#64748B" />
              <Text style={styles.detailTxt} numberOfLines={2}>{formatDate(task.actualEndTime || task.updatedAt)}</Text>
            </View>
            {photoCount > 0 && (
              <View style={styles.photoBadge}>
                <Icon name="camera-outline" size={11} color="#8B5CF6" />
                <Text style={styles.photoBadgeTxt}>{photoCount} photos</Text>
              </View>
            )}
          </View>

          {/* Before/After thumbnails */}
          <View style={styles.imagesCol}>
            <View style={styles.imgCompare}>
              <View style={styles.imgHalf}>
                {task.beforePhotos?.[0] ? (
                  <Image source={{ uri: task.beforePhotos[0] }} style={styles.compareImg} />
                ) : (
                  <View style={[styles.compareImg, styles.noPhoto]}>
                    <Icon name="image-off-outline" size={14} color="#CBD5E1" />
                  </View>
                )}
                <View style={styles.imgLabel}><Text style={styles.imgLabelTxt}>Before</Text></View>
              </View>
              <View style={styles.imgHalf}>
                {task.afterPhotos?.[0] ? (
                  <Image source={{ uri: task.afterPhotos[0] }} style={styles.compareImg} />
                ) : (
                  <View style={[styles.compareImg, styles.noPhoto]}>
                    <Icon name="image-off-outline" size={14} color="#CBD5E1" />
                  </View>
                )}
                <View style={styles.imgLabel}><Text style={styles.imgLabelTxt}>After</Text></View>
              </View>
            </View>
            <Text style={styles.submitTime} numberOfLines={1}>
              Submitted: {formatDate(task.actualEndTime || task.updatedAt)}
            </Text>
          </View>
        </View>

        {/* Card actions */}
        <View style={styles.cardActions}>
          {activeTab === 'pending' && (
            <>
              <TouchableOpacity
                style={[styles.actionBtn, styles.approveBtn, isActioning && { opacity: 0.6 }]}
                onPress={() => handleQuickApprove(task)}
                disabled={isActioning}
              >
                {isActioning ? (
                  <ActivityIndicator size="small" color="#16A34A" />
                ) : (
                  <Icon name="check-circle-outline" size={14} color="#16A34A" />
                )}
                <Text style={[styles.actionBtnTxt, { color: '#16A34A' }]}>Approve</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.rejectBtn, isActioning && { opacity: 0.6 }]}
                onPress={() => handleQuickReject(task)}
                disabled={isActioning}
              >
                {isActioning ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <Icon name="close-circle-outline" size={14} color="#EF4444" />
                )}
                <Text style={[styles.actionBtnTxt, { color: '#EF4444' }]}>Reject</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={[styles.actionBtn, styles.viewBtn]}
            onPress={() => { setSelectedTask(task); setRemarks(''); }}
          >
            <Icon name="arrow-right-circle-outline" size={14} color="#2563EB" />
            <Text style={[styles.actionBtnTxt, { color: '#2563EB' }]}>View Details</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  const pendingCount = approvalStats?.pendingApproval ?? approvalTasks.filter(t => t.status === 'in_progress').length;
  const approvedCount = approvalStats?.approvedToday ?? 0;
  const rejectedCount = approvalStats?.rejectedToday ?? 0;

  const supervisorName = supervisor ? `${supervisor.firstName || ''} ${supervisor.lastName || ''}`.trim() : 'Supervisor';
  const supervisorCode = supervisor?.supervisorId || supervisor?.phone?.slice(-4) || 'SUP';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1D4ED8" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top + 8 : (Platform.OS === 'ios' ? 52 : 16) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-left" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerMid}>
            <Text style={styles.headerTitle}>Work Approval Center</Text>
            <Text style={styles.headerSub}>Review and approve cleaner work</Text>
          </View>
          <View style={styles.headerRight}>
            {/* Notification bell */}
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => {
                dispatch(fetchNotifications());
                setShowNotifDrawer(true);
              }}
            >
              <Icon name="bell-outline" size={22} color="#FFF" />
              {unreadCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeTxt}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={approvalLoading} onRefresh={load} tintColor="#FFFFFF" />
        }
        renderItem={renderCard}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            {approvalLoading ? (
              <ActivityIndicator size="large" color="#2563EB" />
            ) : (
              <>
                <Icon name="clipboard-check-outline" size={52} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>
                  {activeTab === 'pending' ? 'No pending approvals' :
                   activeTab === 'approved' ? 'No approved tasks today' : 'No rejected tasks today'}
                </Text>
                <Text style={styles.emptySub}>Pull down to refresh</Text>
              </>
            )}
          </View>
        }
        ListHeaderComponent={
          <>
            {/* Metrics Grid */}
            <Card variant="elevated" style={styles.metricsCard}>
              <View style={styles.metricsRow}>
                {[
                  { icon: 'clock-outline', iconBg: '#FFF7ED', iconColor: '#F97316', val: pendingCount, label: 'Pending Approval', tab: 'pending' as Tab },
                  { icon: 'check-bold', iconBg: '#ECFDF5', iconColor: '#16A34A', val: approvedCount, label: 'Approved Today', tab: 'approved' as Tab },
                  { icon: 'close-thick', iconBg: '#FEF2F2', iconColor: '#EF4444', val: rejectedCount, label: 'Rejected', tab: 'rejected' as Tab },
                ].map((m, idx) => (
                  <View key={idx} style={styles.metricItem}>
                    <View style={[styles.metricIconBg, { backgroundColor: m.iconBg }]}>
                      <Icon name={m.icon} size={15} color={m.iconColor} />
                    </View>
                    <Text style={styles.metricVal}>{approvalLoading ? '—' : m.val}</Text>
                    <Text style={styles.metricLabel}>{m.label}</Text>
                    <TouchableOpacity onPress={() => handleTabChange(m.tab)}>
                      <Text style={[styles.viewAllTxt, { color: m.iconColor }]}>View All</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </Card>

            {/* Search */}
            <View style={styles.searchRow}>
              <View style={styles.searchBox}>
                <Icon name="magnify" size={20} color="#94A3B8" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search cleaner, customer or vehicle..."
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Icon name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
              {TAB_META.map(tab => (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tab, activeTab === tab.key && { backgroundColor: '#FFFFFF', borderColor: tab.color, borderBottomWidth: 2 }]}
                  onPress={() => handleTabChange(tab.key)}
                >
                  <Text style={[styles.tabTxt, activeTab === tab.key && { color: tab.color, fontWeight: '800' }]}>
                    {tab.label} ({approvalLoading ? '…' : tab.key === 'pending' ? pendingCount : tab.key === 'approved' ? approvedCount : rejectedCount})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        }
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        visible={showNotifDrawer}
        onClose={() => setShowNotifDrawer(false)}
        navigation={navigation}
      />

      {/* Task Detail Panel */}
      <TaskDetailPanel
        task={selectedTask}
        remarks={remarks}
        onRemarksChange={setRemarks}
        onApprove={handleDetailApprove}
        onReject={handleDetailReject}
        onEscalate={handleEscalate}
        onClose={() => setSelectedTask(null)}
        actionLoading={actionLoading === selectedTask?._id}
        tab={activeTab}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    backgroundColor: '#1D4ED8',
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { padding: 6, marginRight: 8 },
  headerMid: { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 11, color: '#BFDBFE', marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notifBtn: { position: 'relative', padding: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8 },
  notifBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#EF4444', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 },
  notifBadgeTxt: { fontSize: 9, fontWeight: '700', color: '#FFF' },

  listContent: { padding: 16, paddingBottom: 40 },

  metricsCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#F1F5F9' },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  metricItem: { alignItems: 'center', flex: 1 },
  metricIconBg: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  metricVal: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  metricLabel: { fontSize: 9, fontWeight: '600', color: '#64748B', marginTop: 2, textAlign: 'center' },
  viewAllTxt: { fontSize: 10, fontWeight: '700', marginTop: 4 },

  searchRow: { marginBottom: 12 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, height: 42 },
  searchInput: { flex: 1, fontSize: 13, color: '#1E293B', marginLeft: 8, padding: 0 },

  tabs: { flexDirection: 'row', marginBottom: 14, backgroundColor: '#F1F5F9', borderRadius: 10, overflow: 'hidden' },
  tab: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 10 },
  tabTxt: { fontSize: 11, fontWeight: '600', color: '#64748B' },

  card: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cleanerInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  cleanerInitials: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  cleanerInitialsTxt: { fontSize: 14, fontWeight: '800', color: '#2563EB' },
  cleanerName: { fontSize: 13, fontWeight: '700', color: '#0F172A', maxWidth: width * 0.35 },
  cleanerSub: { fontSize: 10, color: '#94A3B8', maxWidth: width * 0.35 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusBadgeTxt: { fontSize: 9, fontWeight: '800' },

  cardBody: { flexDirection: 'row', gap: 10, borderBottomWidth: 1, borderColor: '#F1F5F9', paddingBottom: 10, marginBottom: 10 },
  textCol: { flex: 1, gap: 4 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  detailTxt: { fontSize: 11, color: '#475569', flex: 1 },
  detailTxtBold: { fontSize: 11, fontWeight: '700', color: '#1E293B' },
  detailSub: { fontSize: 10, color: '#94A3B8' },
  photoBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FAF5FF', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start' },
  photoBadgeTxt: { fontSize: 9, fontWeight: '700', color: '#8B5CF6' },

  imagesCol: { width: 120 },
  imgCompare: { flexDirection: 'row', gap: 4, marginBottom: 4 },
  imgHalf: { flex: 1, position: 'relative' },
  compareImg: { width: '100%', height: 54, borderRadius: 6 },
  noPhoto: { backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  imgLabel: { position: 'absolute', bottom: 2, left: 2, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 3, paddingHorizontal: 4, paddingVertical: 1 },
  imgLabelTxt: { fontSize: 8, color: '#FFF', fontWeight: '700' },
  submitTime: { fontSize: 9, color: '#94A3B8' },

  cardActions: { flexDirection: 'row', gap: 6 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  approveBtn: { borderColor: '#16A34A', backgroundColor: '#ECFDF5' },
  rejectBtn: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  viewBtn: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  actionBtnTxt: { fontSize: 10, fontWeight: '700' },

  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#475569', marginTop: 8 },
  emptySub: { fontSize: 12, color: '#94A3B8' },
});

// Notification drawer styles
const ndStyles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' },
  drawer: { position: 'absolute', top: 0, right: 0, bottom: 0, width: width * 0.82, backgroundColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, elevation: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: '#E2E8F0' },
  title: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  empty: { alignItems: 'center', paddingTop: 64, gap: 10 },
  emptyTxt: { color: '#94A3B8', fontSize: 13 },
  notifItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  notifUnread: { backgroundColor: '#EFF6FF' },
  notifDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2563EB', marginTop: 4 },
  notifMsg: { fontSize: 12, color: '#1E293B', lineHeight: 18 },
  notifTime: { fontSize: 10, color: '#94A3B8', marginTop: 3 },
  viewAllBtn: { margin: 16, backgroundColor: '#EFF6FF', borderRadius: 10, alignItems: 'center', paddingVertical: 12 },
  viewAllTxt: { fontSize: 13, fontWeight: '700', color: '#2563EB' },
});

// Detail panel styles
const dpStyles = StyleSheet.create({
  overlay: { flex: 0.35, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { flex: 0.65, backgroundColor: '#FFF', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 16, paddingBottom: 0 },
  handle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  title: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  closeBtn: { padding: 4 },
  section: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, marginBottom: 12 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 8, marginLeft: 2 },
  kvRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  kvLabel: { fontSize: 11, color: '#64748B' },
  kvVal: { fontSize: 12, fontWeight: '600', color: '#1E293B', flex: 1, textAlign: 'right' },
  custRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  custInitials: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  custInitialsTxt: { fontSize: 16, fontWeight: '800', color: '#2563EB' },
  custName: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  custPhone: { fontSize: 12, color: '#2563EB', marginTop: 2 },
  photoWrap: { flex: 1, position: 'relative' },
  photo: { width: '100%', height: 80, borderRadius: 8 },
  photoLabel: { position: 'absolute', bottom: 4, left: 4, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  photoLabelTxt: { fontSize: 9, color: '#FFF', fontWeight: '700' },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  timelineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2563EB', marginTop: 3 },
  timelineStatus: { fontSize: 11, fontWeight: '700', color: '#1E293B' },
  timelineMeta: { fontSize: 10, color: '#94A3B8', marginTop: 2 },
  remarksInput: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: '#1E293B', minHeight: 72, textAlignVertical: 'top' },
  actionBtns: { gap: 10, paddingHorizontal: 2 },
  btnApprove: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#16A34A', borderRadius: 12, paddingVertical: 12 },
  btnApproveTxt: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  btnReject: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#EF4444', borderRadius: 12, paddingVertical: 12 },
  btnRejectTxt: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  btnEscalate: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#2563EB', borderRadius: 12, paddingVertical: 12 },
  btnEscalateTxt: { fontSize: 14, fontWeight: '700', color: '#2563EB' },
});

export default WorkApprovalCenterScreen;
