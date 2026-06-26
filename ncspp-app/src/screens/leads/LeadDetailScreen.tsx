import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { colors } from '../../theme/colors';
import { fetchLeadById, updateLeadStatus, clearSelectedLead } from '../../redux/slices/leadSlice';
import { AppDispatch, RootState } from '../../redux/store';

const statusOptions = ['Contacted', 'Interested', 'Converted', 'Lost'];

const LeadDetailScreen = ({ route, navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedLead, loading } = useSelector((state: RootState) => state.lead);
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const leadId = route?.params?.leadId;

  useEffect(() => {
    if (leadId) dispatch(fetchLeadById(leadId));
    return () => { dispatch(clearSelectedLead()); };
  }, [leadId, dispatch]);

  const handleStatusUpdate = async (status: string) => {
    setUpdating(true);
    await dispatch(updateLeadStatus({ id: leadId, status, notes }));
    setUpdating(false);
  };

  const handleConvert = () => {
    Alert.alert(
      'Convert Lead',
      'Mark this lead as converted? This will create a customer record.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Convert', onPress: () => handleStatusUpdate('Converted') },
      ],
    );
  };

  if (!selectedLead) {
    return <LoadingOverlay visible={loading} message="Loading lead..." />;
  }

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={updating} message="Updating..." />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.profileCard}>
          <View style={styles.profileRow}>
            <Text style={styles.profileIcon}>
              {selectedLead.status === 'New' ? '🆕' : '📋'}
            </Text>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {selectedLead.name || 'Unknown'}
              </Text>
              <Text style={styles.profilePhone}>{selectedLead.phone}</Text>
              {selectedLead.email && (
                <Text style={styles.profileEmail}>{selectedLead.email}</Text>
              )}
            </View>
            <StatusBadge status={selectedLead.status || 'New'} size="medium" />
          </View>
        </Card>

        <Card style={styles.detailCard}>
          <Text style={styles.sectionTitle}>Lead Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Service Interested</Text>
            <Text style={styles.detailValue}>
              {selectedLead.service || 'Not specified'}
            </Text>
          </View>
          {selectedLead.location && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{selectedLead.location}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Source</Text>
            <Text style={styles.detailValue}>
              {selectedLead.source || 'Direct'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created</Text>
            <Text style={styles.detailValue}>
              {new Date(selectedLead.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </Text>
          </View>
        </Card>

        {selectedLead.notes && (
          <Card style={styles.detailCard}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{selectedLead.notes}</Text>
          </Card>
        )}

        <Card style={styles.detailCard}>
          <Text style={styles.sectionTitle}>Update Status</Text>
          <View style={styles.statusOptions}>
            {statusOptions.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusBtn,
                  selectedLead.status === status && styles.statusBtnActive,
                ]}
                onPress={() => handleStatusUpdate(status)}
              >
                <Text
                  style={[
                    styles.statusBtnText,
                    selectedLead.status === status && styles.statusBtnTextActive,
                  ]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.notesInput}
            placeholder="Add notes..."
            placeholderTextColor={colors.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
          />
          <Button
            title="Save Notes"
            onPress={() => handleStatusUpdate(selectedLead.status)}
            variant="secondary"
            size="small"
            disabled={!notes}
          />
        </Card>

        {selectedLead.status !== 'Converted' && (
          <Button
            title="Convert to Customer ✅"
            onPress={handleConvert}
            variant="primary"
            size="large"
            style={styles.convertBtn}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 32 },
  profileCard: {},
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileIcon: { fontSize: 36 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '700', color: colors.text },
  profilePhone: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  profileEmail: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  detailCard: {},
  sectionTitle: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 12 },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  detailLabel: { fontSize: 14, color: colors.textSecondary },
  detailValue: { fontSize: 14, color: colors.text, fontWeight: '500' },
  notesText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  statusOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  statusBtn: {
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white,
  },
  statusBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  statusBtnText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  statusBtnTextActive: { color: colors.white },
  notesInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 8,
    padding: 12, minHeight: 60, fontSize: 14, color: colors.text,
    marginBottom: 8, textAlignVertical: 'top',
  },
  convertBtn: { marginTop: 8 },
});

export default LeadDetailScreen;
