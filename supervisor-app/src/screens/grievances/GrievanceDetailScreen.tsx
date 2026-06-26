import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import Header from '../../components/common/Header';
import { Input, Button, LoadingOverlay } from '../../components/common';
import StatusBadge from '../../components/common/StatusBadge';
import { fetchComplaintById } from '../../redux/slices/complaintSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { formatDate } from '../../utils/helpers';
import { complaintService } from '../../services/complaint.service';

interface Props { navigation: any; route: any }

const GrievanceDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { grievanceId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { selectedComplaint: complaint } = useSelector((s: RootState) => s.complaints);
  const [resolution, setResolution] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { dispatch(fetchComplaintById(grievanceId)); }, [dispatch, grievanceId]);

  const handleResolve = async () => {
    if (!resolution.trim()) { Alert.alert('Required', 'Enter resolution notes'); return; }
    setLoading(true);
    try {
      await complaintService.resolve(grievanceId, { resolution: resolution.trim() });
      Alert.alert('Resolved', 'Complaint marked as resolved', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch { Alert.alert('Error', 'Failed to resolve'); }
    finally { setLoading(false); }
  };

  if (!complaint) return <View style={styles.container}><Header title="Grievance" onBack={() => navigation.goBack()} /></View>;

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading} />
      <Header title="Grievance Details" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card variant="elevated" padding={16}>
          <View style={styles.topRow}>
            <Text style={styles.ticket}>#{complaint.ticketNumber}</Text>
            <StatusBadge status={complaint.status} size="md" />
          </View>
          <Text style={styles.subject}>{complaint.subject}</Text>
          <Text style={styles.category}>{complaint.category} • Priority: {complaint.priority}</Text>
        </Card>

        <Card variant="outlined" padding={16} style={{ marginTop: 12 }}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{complaint.description}</Text>
          <View style={styles.row}><Text style={styles.label}>Customer</Text><Text style={styles.value}>{complaint.customerId?.name || 'N/A'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Created</Text><Text style={styles.value}>{formatDate(complaint.createdAt, 'full')}</Text></View>
          {complaint.assignedTo && <View style={styles.row}><Text style={styles.label}>Assigned To</Text><Text style={styles.value}>{complaint.assignedTo.name}</Text></View>}
        </Card>

        {(complaint.status === 'open' || complaint.status === 'in_progress') && (
          <>
            <Text style={styles.sectionTitle}>Take Action</Text>
            <Card variant="outlined" padding={16}>
              <Input label="Resolution Notes" placeholder="Describe how this was resolved..." value={resolution} onChangeText={setResolution} multiline numberOfLines={4} style={{ minHeight: 100 }} />
              <Button title="Mark as Resolved" onPress={handleResolve} size="lg" loading={loading} />
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ticket: { fontSize: 16, fontWeight: '700', color: colors.primaryBlue, fontFamily: 'monospace' },
  subject: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  category: { fontSize: 13, color: colors.textSecondary, marginTop: 4, fontFamily: 'Inter-Regular', textTransform: 'capitalize' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold', marginBottom: 12 },
  description: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 16, fontFamily: 'Inter-Regular' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  label: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  value: { fontSize: 13, fontWeight: '500', color: colors.textPrimary, fontFamily: 'Inter-Medium' },
});

export default GrievanceDetailScreen;
