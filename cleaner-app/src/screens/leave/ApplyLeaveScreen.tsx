import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Platform, Switch } from 'react-native';
import { useDispatch } from 'react-redux';
import { colors } from '../../theme/colors';
import { Button, LoadingOverlay } from '../../components/common';
import { applyLeave } from '../../redux/slices/leaveSlice';
import { AppDispatch } from '../../redux/store';

const leaveTypes = [
  { id: 'casual', label: 'Casual Leave' },
  { id: 'earned', label: 'Earned Leave' },
  { id: 'sick', label: 'Sick Leave' },
  { id: 'maternity', label: 'Maternity Leave' }
];

interface Props { navigation: any }

const ApplyLeaveScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [type, setType] = useState('casual');
  const [fromDate, setFromDate] = useState('20 May 2025');
  const [toDate, setToDate] = useState('21 May 2025');
  const [reason, setReason] = useState('Personal work at home.');
  const [halfDay, setHalfDay] = useState(false);
  const [session, setSession] = useState<'first' | 'second'>('first');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!fromDate || !toDate || !reason.trim()) {
      Alert.alert('Required', 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await dispatch(applyLeave({ fromDate, toDate, reason: reason.trim(), type })).unwrap();
      Alert.alert('Applied', 'Leave request submitted for approval.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err: any) {
      Alert.alert('Error', typeof err === 'string' ? err : 'Failed to apply');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading} message="Submitting Request..." />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Apply Leave</Text>
          <Text style={styles.headerSub}>Request time off from work</Text>
        </View>
        <TouchableOpacity style={styles.policyBtn} onPress={() => Alert.alert('Leave Policy', '1. Leave request must be submitted 2 days in advance.\n2. Sick leaves of more than 3 days require a medical certificate.')}>
          <Text style={styles.policyIcon}>ℹ️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Leave Balance Grid Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceTitle}>Leave Balance</Text>
            <Text style={styles.balanceDate}>As on 15 May 2025</Text>
          </View>
          <View style={styles.balanceGrid}>
            <View style={[styles.balanceItem, { borderRightWidth: 1, borderBottomWidth: 1, borderColor: colors.border }]}>
              <Text style={styles.balanceVal}>6.5</Text>
              <Text style={styles.balanceLabel}>Casual Leave</Text>
              <Text style={styles.balanceDaysText}>Days Left</Text>
            </View>
            <View style={[styles.balanceItem, { borderBottomWidth: 1, borderColor: colors.border }]}>
              <Text style={[styles.balanceVal, { color: colors.primaryBlue }]}>12.0</Text>
              <Text style={styles.balanceLabel}>Earned Leave</Text>
              <Text style={styles.balanceDaysText}>Days Left</Text>
            </View>
            <View style={[styles.balanceItem, { borderRightWidth: 1, borderColor: colors.border }]}>
              <Text style={[styles.balanceVal, { color: colors.warning }]}>4.0</Text>
              <Text style={styles.balanceLabel}>Sick Leave</Text>
              <Text style={styles.balanceDaysText}>Days Left</Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={[styles.balanceVal, { color: '#C084FC' }]}>30.0</Text>
              <Text style={styles.balanceLabel}>Maternity Leave</Text>
              <Text style={styles.balanceDaysText}>Days Left</Text>
            </View>
          </View>
        </View>

        {/* Leave Type Select */}
        <Text style={styles.fieldLabel}>Leave Type *</Text>
        <View style={styles.typeSelectorRow}>
          {leaveTypes.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.typeChip, type === item.id && styles.typeChipActive]}
              onPress={() => setType(item.id)}
            >
              <Text style={[styles.typeChipText, type === item.id && styles.typeChipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date Row */}
        <View style={styles.datesRow}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.fieldLabel}>From Date *</Text>
            <View style={styles.dateInputContainer}>
              <TextInput style={styles.dateTextInput} value={fromDate} onChangeText={setFromDate} placeholder="From Date" />
              <Text style={styles.calendarIcon}>📅</Text>
            </View>
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.fieldLabel}>To Date *</Text>
            <View style={styles.dateInputContainer}>
              <TextInput style={styles.dateTextInput} value={toDate} onChangeText={setToDate} placeholder="To Date" />
              <Text style={styles.calendarIcon}>📅</Text>
            </View>
          </View>
        </View>

        {/* Days & Half Day */}
        <View style={styles.daysAndHalfRow}>
          <View>
            <Text style={styles.fieldLabel}>Total Days</Text>
            <Text style={styles.totalDaysValue}>2 Days</Text>
          </View>
          <View style={styles.halfDayRow}>
            <Text style={styles.halfDayLabel}>Half Day</Text>
            <Switch 
              value={halfDay} 
              onValueChange={setHalfDay} 
              trackColor={{ false: '#CBD5E1', true: colors.primaryBlue }}
              thumbColor={Platform.OS === 'android' ? colors.white : undefined}
            />
          </View>
        </View>

        {/* Half Day Session Select */}
        {halfDay && (
          <View style={styles.sessionBox}>
            <Text style={styles.fieldLabel}>Session (for Half Day)</Text>
            <View style={styles.sessionRow}>
              <TouchableOpacity 
                style={[styles.sessionBtn, session === 'first' && styles.sessionBtnActive]}
                onPress={() => setSession('first')}
              >
                <View style={[styles.radioDot, session === 'first' && styles.radioDotActive]} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.sessionBtnTitle}>First Half</Text>
                  <Text style={styles.sessionBtnSub}>Before 01:00 PM</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.sessionBtn, session === 'second' && styles.sessionBtnActive]}
                onPress={() => setSession('second')}
              >
                <View style={[styles.radioDot, session === 'second' && styles.radioDotActive]} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.sessionBtnTitle}>Second Half</Text>
                  <Text style={styles.sessionBtnSub}>After 01:00 PM</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Reason for Leave */}
        <View style={styles.reasonHeaderRow}>
          <Text style={styles.fieldLabel}>Reason for Leave *</Text>
          <Text style={styles.charCountText}>{reason.length}/200</Text>
        </View>
        <View style={styles.reasonContainer}>
          <TextInput
            style={styles.reasonInput}
            value={reason}
            onChangeText={(t) => setReason(t.slice(0, 200))}
            placeholder="Explain why you need leave..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Upload Supporting Document */}
        <Text style={styles.fieldLabel}>Upload Supporting Document (Optional)</Text>
        <TouchableOpacity style={styles.uploadBox} onPress={() => Alert.alert('Upload', 'Browser/Camera document selection would launch here.')}>
          <Text style={styles.uploadCloudIcon}>☁️</Text>
          <Text style={styles.uploadMainText}>Tap to upload or browse</Text>
          <Text style={styles.uploadSubText}>PDF, JPG, PNG (Max. 5MB)</Text>
        </TouchableOpacity>

        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <View style={styles.warningIconBg}>
            <Text style={{ fontSize: 14 }}>ℹ️</Text>
          </View>
          <Text style={styles.warningBannerText}>
            Supporting document is required for sick leave and leaves more than 3 days.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>✈️  Submit Request</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'ios' ? 60 : 20, 
    paddingBottom: 16, 
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 22, color: colors.primaryBlue, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  headerSub: { fontSize: 11, color: colors.textSecondary, fontFamily: 'Inter-Regular', marginTop: 2 },
  policyBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  policyIcon: { fontSize: 16, color: colors.primaryBlue },
  scrollContent: { padding: 20 },
  balanceCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
    overflow: 'hidden',
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: '#F8FAFC',
  },
  balanceTitle: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  balanceDate: { fontSize: 11, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  balanceGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  balanceItem: {
    width: '50%',
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceVal: { fontSize: 22, fontWeight: '700', color: colors.success, fontFamily: 'Inter-Bold' },
  balanceLabel: { fontSize: 11, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold', marginTop: 4, textAlign: 'center' },
  balanceDaysText: { fontSize: 9, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold', marginTop: 14, marginBottom: 8 },
  typeSelectorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  typeChip: { 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: 12, 
    backgroundColor: colors.white, 
    borderWidth: 1.5, 
    borderColor: colors.border 
  },
  typeChipActive: { backgroundColor: colors.lightBlue, borderColor: colors.primaryBlue },
  typeChipText: { fontSize: 12, color: colors.textSecondary, fontFamily: 'Inter-Medium' },
  typeChipTextActive: { color: colors.primaryBlue, fontWeight: '700', fontFamily: 'Inter-Bold' },
  datesRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    height: 48,
    paddingHorizontal: 12,
  },
  dateTextInput: { flex: 1, height: '100%', fontSize: 13, color: colors.textPrimary, fontFamily: 'Inter-Regular' },
  calendarIcon: { fontSize: 14, color: colors.textSecondary },
  daysAndHalfRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10 },
  totalDaysValue: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  halfDayRow: { flexDirection: 'row', alignItems: 'center' },
  halfDayLabel: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold', marginRight: 8 },
  sessionBox: { backgroundColor: colors.white, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 12, marginBottom: 12 },
  sessionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  sessionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 10,
  },
  sessionBtnActive: { borderColor: colors.primaryBlue, backgroundColor: colors.lightBlue },
  radioDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: colors.border },
  radioDotActive: { borderColor: colors.primaryBlue, backgroundColor: colors.primaryBlue },
  sessionBtnTitle: { fontSize: 12, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  sessionBtnSub: { fontSize: 9, color: colors.textSecondary, fontFamily: 'Inter-Regular', marginTop: 1 },
  reasonHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  charCountText: { fontSize: 11, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  reasonContainer: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 16,
  },
  reasonInput: { height: 80, fontSize: 13, color: colors.textPrimary, fontFamily: 'Inter-Regular', textAlignVertical: 'top' },
  uploadBox: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: colors.primaryBlue,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  uploadCloudIcon: { fontSize: 28, color: colors.primaryBlue, marginBottom: 6 },
  uploadMainText: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  uploadSubText: { fontSize: 11, color: colors.textSecondary, fontFamily: 'Inter-Regular', marginTop: 2 },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 24,
  },
  warningIconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  warningBannerText: { flex: 1, fontSize: 11, color: '#D97706', fontFamily: 'Inter-Regular' },
  actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelBtn: {
    width: '46%',
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: { color: colors.textSecondary, fontSize: 14, fontWeight: '700', fontFamily: 'Inter-Bold' },
  submitBtn: {
    width: '48%',
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnText: { color: colors.white, fontSize: 14, fontWeight: '700', fontFamily: 'Inter-Bold' },
});

export default ApplyLeaveScreen;
