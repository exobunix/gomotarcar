import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import { fetchComplaintById } from '../../redux/slices/complaintSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { formatDate } from '../../utils/helpers';

interface Props {
  navigation: any;
  route: any;
}

const ComplaintDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { complaintId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { selectedComplaint } = useSelector((s: RootState) => s.complaints);
  const item = selectedComplaint;

  useEffect(() => {
    dispatch(fetchComplaintById(complaintId));
  }, [complaintId]);

  if (!item) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Complaint Detail</Text>
          <View style={{ width: 44 }} />
        </View>
      </View>
    );
  }

  const priorityColor: Record<string, string> = {
    low: colors.textSecondary, medium: colors.warning, high: colors.error,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complaint Detail</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card variant="elevated" padding={16} style={styles.ticketCard}>
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketNum}>#{item.ticketNumber}</Text>
            <StatusBadge status={item.status} size="md" />
          </View>
          <View style={styles.priorityRow}>
            <View style={[styles.priorityDot, { backgroundColor: priorityColor[item.priority] }]} />
            <Text style={[styles.priorityLabel, { color: priorityColor[item.priority] }]}>
              {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
            </Text>
            <Text style={styles.categoryLabel}>{item.category}</Text>
          </View>
        </Card>

        <Card variant="outlined" padding={16} style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Subject</Text>
          <Text style={styles.subjectText}>{item.subject}</Text>
        </Card>

        <Card variant="outlined" padding={16} style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descText}>{item.description}</Text>
        </Card>

        {item.resolution && (
          <Card variant="outlined" padding={16} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Resolution</Text>
            <Text style={styles.descText}>{item.resolution}</Text>
            {item.resolvedAt && (
              <Text style={styles.resolvedDate}>Resolved on {formatDate(item.resolvedAt, 'long')}</Text>
            )}
          </Card>
        )}

        <Card variant="outlined" padding={16} style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>Opened</Text>
              <Text style={styles.timelineDate}>{formatDate(item.createdAt, 'time')}</Text>
            </View>
          </View>
          {item.resolvedAt && (
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: colors.success }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>Resolved</Text>
                <Text style={styles.timelineDate}>{formatDate(item.resolvedAt, 'time')}</Text>
              </View>
            </View>
          )}
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: colors.white,
  },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 22, color: colors.primaryBlue, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  ticketCard: { marginBottom: 12 },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  ticketNum: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  priorityRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  priorityLabel: { fontSize: 13, fontWeight: '600', fontFamily: 'Inter-SemiBold' },
  categoryLabel: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Inter-Regular', textTransform: 'capitalize' },
  sectionCard: { marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold', marginBottom: 8 },
  subjectText: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  descText: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, fontFamily: 'Inter-Regular' },
  resolvedDate: { marginTop: 12, fontSize: 12, color: colors.success, fontFamily: 'Inter-Regular' },
  timelineItem: { flexDirection: 'row', marginBottom: 12 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primaryBlue, marginTop: 4, marginRight: 12 },
  timelineContent: { flex: 1 },
  timelineLabel: { fontSize: 14, color: colors.textPrimary, fontFamily: 'Inter-Medium' },
  timelineDate: { fontSize: 12, color: colors.textSecondary, marginTop: 2, fontFamily: 'Inter-Regular' },
});

export default ComplaintDetailScreen;
