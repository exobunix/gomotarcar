import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput as RNInput } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import Header from '../../components/common/Header';
import { Input, Button, LoadingOverlay } from '../../components/common';
import StatusBadge from '../../components/common/StatusBadge';
import { fetchTaskById, approveTask, rejectTask, requestRedo } from '../../redux/slices/taskSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { formatDate, formatTime } from '../../utils/helpers';

interface Props { navigation: any; route: any }

const WorkApprovalDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { taskId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { selectedTask: task } = useSelector((s: RootState) => s.tasks);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { dispatch(fetchTaskById(taskId)); }, [dispatch, taskId]);

  const handleApprove = async () => {
    setLoading(true);
    try { await dispatch(approveTask({ id: taskId })).unwrap(); Alert.alert('Approved', 'Task has been approved'); }
    catch { Alert.alert('Error', 'Failed to approve'); }
    finally { setLoading(false); }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { Alert.alert('Required', 'Please provide a rejection reason'); return; }
    setLoading(true);
    try { await dispatch(rejectTask({ id: taskId, reason: rejectReason })).unwrap(); Alert.alert('Rejected', 'Task has been rejected'); navigation.goBack(); }
    catch { Alert.alert('Error', 'Failed to reject'); }
    finally { setLoading(false); }
  };

  const handleRedo = async () => {
    if (!rejectReason.trim()) { Alert.alert('Required', 'Please provide a reason for redo'); return; }
    setLoading(true);
    try { await dispatch(requestRedo({ id: taskId, reason: rejectReason })).unwrap(); Alert.alert('Redo Requested', 'Cleaner will be notified'); navigation.goBack(); }
    catch { Alert.alert('Error', 'Failed to request redo'); }
    finally { setLoading(false); }
  };

  if (!task) return <View style={styles.container}><Header title="Task" onBack={() => navigation.goBack()} /></View>;

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading} />
      <Header title="Work Approval" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card variant="elevated" padding={16}>
          <View style={styles.headerRow}>
            <Text style={styles.vehicle}>{task.vehicleNumber}</Text>
            <StatusBadge status={task.status} size="md" />
          </View>
          <Text style={styles.service}>{task.packageName} • {task.apartmentName}</Text>
          <Text style={styles.date}>{formatDate(task.scheduledDate, 'long')} at {task.scheduledTime}</Text>
          {task.cleanerId && <Text style={styles.cleaner}>Cleaner: {task.cleanerId.name || task.cleanerId}</Text>}
        </Card>

        <Text style={styles.sectionTitle}>Service Details</Text>
        <Card variant="outlined" padding={16}>
          <View style={styles.row}><Text style={styles.label}>Status</Text><StatusBadge status={task.status} /></View>
          <View style={styles.row}><Text style={styles.label}>QR Verified</Text><Text style={styles.value}>{task.qrVerified ? '✅ Yes' : '❌ No'}</Text></View>
          {task.startedAt && <View style={styles.row}><Text style={styles.label}>Started At</Text><Text style={styles.value}>{formatTime(task.startedAt)}</Text></View>}
          {task.completedAt && <View style={styles.row}><Text style={styles.label}>Completed At</Text><Text style={styles.value}>{formatTime(task.completedAt)}</Text></View>}
          {task.rejectionReason && <View style={styles.row}><Text style={styles.label}>Reason</Text><Text style={[styles.value, { color: colors.error }]}>{task.rejectionReason}</Text></View>}
        </Card>

        {/* Photos */}
        {(task.beforePhotos?.length > 0 || task.afterPhotos?.length > 0) && (
          <>
            <Text style={styles.sectionTitle}>Photos</Text>
            <Card variant="outlined" padding={16}>
              {task.beforePhotos?.length > 0 && <Text style={styles.photoLabel}>Before: {task.beforePhotos.length} photos</Text>}
              {task.afterPhotos?.length > 0 && <Text style={styles.photoLabel}>After: {task.afterPhotos.length} photos</Text>}
            </Card>
          </>
        )}

        {/* Actions */}
        {task.status === 'completed' && (
          <>
            <Text style={styles.sectionTitle}>Actions</Text>
            <Card variant="outlined" padding={16}>
              <Button title="✅ Approve Work" onPress={handleApprove} size="lg" style={{ marginBottom: 10 }} loading={loading} />
              <Button title="🔄 Request Redo" variant="outline" onPress={() => setShowReject(!showReject)} size="lg" style={{ marginBottom: 10 }} />
              <Button title="❌ Reject" variant="danger" onPress={() => setShowReject(true)} size="lg" />
            </Card>
          </>
        )}

        {showReject && (
          <Card variant="outlined" padding={16} style={{ marginTop: 12 }}>
            <Input label="Reason" placeholder="Enter reason for rejection/redo" value={rejectReason} onChangeText={setRejectReason} multiline numberOfLines={3} style={{ minHeight: 80 }} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button title="Submit Redo" variant="outline" onPress={handleRedo} style={{ flex: 1 }} />
              <Button title="Submit Reject" variant="danger" onPress={handleReject} style={{ flex: 1 }} />
            </View>
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  vehicle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  service: { fontSize: 14, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  date: { fontSize: 13, color: colors.primaryBlue, marginTop: 4, fontFamily: 'Inter-Medium' },
  cleaner: { fontSize: 13, color: colors.textSecondary, marginTop: 4, fontFamily: 'Inter-Regular' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold', marginBottom: 12, marginTop: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  label: { fontSize: 14, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  value: { fontSize: 14, fontWeight: '500', color: colors.textPrimary, fontFamily: 'Inter-Medium' },
  photoLabel: { fontSize: 14, color: colors.textPrimary, fontFamily: 'Inter-Medium', marginBottom: 4 },
});

export default WorkApprovalDetailScreen;
