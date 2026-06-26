import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Dimensions } from 'react-native';
import { colors } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Props { navigation: any }

const ApplyLeaveScreen: React.FC<Props> = ({ navigation }) => {
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [reason, setReason] = useState('Personal work at home.');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [session, setSession] = useState('First Half');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.blueHeaderBg}>
        <View style={styles.topHeaderRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.mainTitle}>Apply Leave</Text>
            <Text style={styles.mainSubTitle}>Request time off from work</Text>
          </View>
          <TouchableOpacity style={styles.policyBtn}>
            <Icon name="information-outline" size={16} color="#FFF" />
            <Text style={styles.policyBtnTxt}>Leave Policy</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Leave Balance */}
        <View style={styles.topCard}>
          <View style={styles.tcHeaderRow}>
            <Text style={styles.tcTitle}>Leave Balance</Text>
            <Text style={styles.tcDate}>As on 15 May 2025</Text>
          </View>

          <View style={styles.balanceGrid}>
            <View style={styles.balanceCol}>
              <View style={[styles.balIconBg, {backgroundColor: '#F0FDF4', borderColor: '#BBF7D0'}]}><Icon name="calendar-check-outline" size={20} color="#16A34A" /></View>
              <Text style={styles.balLbl}>Casual Leave</Text>
              <Text style={styles.balVal}>6.5</Text>
              <Text style={[styles.balSub, {color: '#16A34A'}]}>Days Left</Text>
            </View>
            <View style={styles.gridDivider} />
            <View style={styles.balanceCol}>
              <View style={[styles.balIconBg, {backgroundColor: '#EFF6FF', borderColor: '#BFDBFE'}]}><Icon name="airplane" size={20} color="#2563EB" /></View>
              <Text style={styles.balLbl}>Earned Leave</Text>
              <Text style={styles.balVal}>12.0</Text>
              <Text style={[styles.balSub, {color: '#2563EB'}]}>Days Left</Text>
            </View>
            <View style={styles.gridDivider} />
            <View style={styles.balanceCol}>
              <View style={[styles.balIconBg, {backgroundColor: '#FFF7ED', borderColor: '#FED7AA'}]}><Icon name="medical-bag" size={20} color="#EA580C" /></View>
              <Text style={styles.balLbl}>Sick Leave</Text>
              <Text style={styles.balVal}>4.0</Text>
              <Text style={[styles.balSub, {color: '#EA580C'}]}>Days Left</Text>
            </View>
            <View style={styles.gridDivider} />
            <View style={styles.balanceCol}>
              <View style={[styles.balIconBg, {backgroundColor: '#FAF5FF', borderColor: '#E9D5FF'}]}><Icon name="human-baby-changing-table" size={20} color="#9333EA" /></View>
              <Text style={styles.balLbl}>Maternity Leave</Text>
              <Text style={styles.balVal}>30.0</Text>
              <Text style={[styles.balSub, {color: '#9333EA'}]}>Days Left</Text>
            </View>
          </View>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          
          {/* Leave Type */}
          <Text style={styles.inputLbl}>Leave Type <Text style={{color: '#EF4444'}}>*</Text></Text>
          <TouchableOpacity style={styles.dropdownBox}>
            <Icon name="calendar-outline" size={20} color="#16A34A" style={{marginRight: 8}} />
            <Text style={styles.dropdownTxt}>{leaveType}</Text>
            <Icon name="chevron-down" size={20} color="#64748B" />
          </TouchableOpacity>

          {/* Dates */}
          <View style={styles.rowGrid}>
            <View style={styles.halfCol}>
              <Text style={styles.inputLbl}>From Date <Text style={{color: '#EF4444'}}>*</Text></Text>
              <TouchableOpacity style={styles.dropdownBox}>
                <Icon name="calendar-outline" size={18} color="#64748B" style={{marginRight: 8}} />
                <Text style={styles.dropdownTxtSm}>20 May 2025 (Tue)</Text>
                <Icon name="chevron-down" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            <View style={styles.halfCol}>
              <Text style={styles.inputLbl}>To Date <Text style={{color: '#EF4444'}}>*</Text></Text>
              <TouchableOpacity style={styles.dropdownBox}>
                <Icon name="calendar-outline" size={18} color="#64748B" style={{marginRight: 8}} />
                <Text style={styles.dropdownTxtSm}>21 May 2025 (Wed)</Text>
                <Icon name="chevron-down" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Total Days & Half Day */}
          <Text style={styles.inputLbl}>Total Days</Text>
          <View style={styles.daysRow}>
            <View style={styles.daysInputBox}>
              <Text style={styles.daysInputTxt}>2 Days</Text>
            </View>
            <TouchableOpacity style={styles.checkboxRow} onPress={() => setIsHalfDay(!isHalfDay)}>
              <Icon name={isHalfDay ? "checkbox-marked" : "checkbox-blank-outline"} size={22} color={isHalfDay ? "#2563EB" : "#CBD5E1"} />
              <Text style={styles.checkboxLbl}>Half Day</Text>
            </TouchableOpacity>
          </View>

          {/* Session */}
          <Text style={styles.inputLbl}>Session (for Half Day)</Text>
          <View style={styles.rowGrid}>
            <TouchableOpacity style={[styles.radioBox, session === 'First Half' && isHalfDay && styles.radioBoxActive]} onPress={() => isHalfDay && setSession('First Half')}>
              <Icon name={session === 'First Half' && isHalfDay ? "radiobox-marked" : "radiobox-blank"} size={18} color={session === 'First Half' && isHalfDay ? "#2563EB" : "#CBD5E1"} />
              <Text style={[styles.radioTxt, (!isHalfDay) && {color: '#94A3B8'}]}>First Half <Text style={styles.radioSub}>(Before 01:00 PM)</Text></Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.radioBox, session === 'Second Half' && isHalfDay && styles.radioBoxActive]} onPress={() => isHalfDay && setSession('Second Half')}>
              <Icon name={session === 'Second Half' && isHalfDay ? "radiobox-marked" : "radiobox-blank"} size={18} color={session === 'Second Half' && isHalfDay ? "#2563EB" : "#CBD5E1"} />
              <Text style={[styles.radioTxt, (!isHalfDay) && {color: '#94A3B8'}]}>Second Half <Text style={styles.radioSub}>(After 01:00 PM)</Text></Text>
            </TouchableOpacity>
          </View>

          {/* Reason */}
          <Text style={styles.inputLbl}>Reason for Leave <Text style={{color: '#EF4444'}}>*</Text></Text>
          <View style={styles.textareaBox}>
            <TextInput 
              style={styles.textareaInput}
              multiline
              textAlignVertical="top"
              value={reason}
              onChangeText={setReason}
            />
            <Icon name="resize-bottom-right" size={10} color="#CBD5E1" style={{position: 'absolute', bottom: 2, right: 2}} />
          </View>
          <Text style={styles.charCount}>{reason.length}/200</Text>

          {/* Upload */}
          <Text style={styles.inputLbl}>Upload Supporting Document <Text style={{color: '#64748B', fontWeight: '500'}}>(Optional)</Text></Text>
          <TouchableOpacity style={styles.uploadBox}>
            <Icon name="cloud-upload-outline" size={24} color="#64748B" style={{marginRight: 12}} />
            <View>
              <Text style={styles.uploadTitle}>Tap to upload or browse</Text>
              <Text style={styles.uploadSub}>PDF, JPG, PNG (Max. 5MB)</Text>
            </View>
          </TouchableOpacity>

          {/* Info Banner */}
          <View style={styles.infoBox}>
            <View style={styles.infoIconBg}><Icon name="information-variant" size={16} color="#FFF" /></View>
            <Text style={styles.infoTxt}>Supporting document is required for sick leave and leaves more than 3 days.</Text>
          </View>

        </View>

        {/* Recent Leave History */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Leave History</Text>
            <TouchableOpacity><Text style={styles.viewAllTxt}>View All</Text></TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.historyItem} onPress={() => navigation.navigate('LeaveStatus')}>
            <View style={[styles.histIconBg, {backgroundColor: '#F0FDF4'}]}><Icon name="calendar-check-outline" size={20} color="#16A34A" /></View>
            <View style={styles.histInfo}>
              <Text style={styles.histTitle}>10 May 2025 (Sat)</Text>
              <Text style={styles.histSub}>Casual Leave • 1 Day</Text>
            </View>
            <View style={styles.histBadge}><Text style={styles.histBadgeTxt}>Approved</Text></View>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.btnOutline} onPress={() => navigation.goBack()}>
          <Text style={styles.btnOutlineTxt}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSolid}>
          <Text style={styles.btnSolidTxt}>Submit Request</Text>
          <Icon name="send" size={16} color="#FFF" style={{transform: [{rotate: '-45deg'}], marginLeft: 8, marginTop: -2}} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  blueHeaderBg: {
    backgroundColor: '#0A2540',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 60,
    zIndex: 1,
  },
  topHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerTitles: { flex: 1, paddingHorizontal: 12 },
  mainTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', fontFamily: 'Inter-Bold' },
  mainSubTitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter-Medium', marginTop: 4 },
  policyBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  policyBtnTxt: { fontSize: 12, fontWeight: '600', color: '#FFF', fontFamily: 'Inter-SemiBold', marginLeft: 4 },

  scrollView: { flex: 1, marginTop: -40, zIndex: 2, elevation: 5 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

  topCard: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4, marginBottom: 16 },
  tcHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  tcTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  tcDate: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium' },
  
  balanceGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  balanceCol: { flex: 1, alignItems: 'center' },
  balIconBg: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  balLbl: { fontSize: 9, color: '#475569', fontFamily: 'Inter-Medium', textAlign: 'center' },
  balVal: { fontSize: 16, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold', marginTop: 4, marginBottom: 2 },
  balSub: { fontSize: 9, fontWeight: '700', fontFamily: 'Inter-Bold' },
  gridDivider: { width: 1, height: '70%', backgroundColor: '#F1F5F9', marginHorizontal: 4, alignSelf: 'center' },

  formContainer: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, marginBottom: 16 },
  inputLbl: { fontSize: 12, fontWeight: '700', color: '#0F172A', fontFamily: 'Inter-Bold', marginBottom: 8, marginTop: 16 },
  dropdownBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 12, height: 44, backgroundColor: '#FFF' },
  dropdownTxt: { flex: 1, fontSize: 13, fontWeight: '600', color: '#0F172A', fontFamily: 'Inter-SemiBold' },
  dropdownTxtSm: { flex: 1, fontSize: 11, fontWeight: '600', color: '#0F172A', fontFamily: 'Inter-SemiBold' },
  
  rowGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  halfCol: { width: '48%' },

  daysRow: { flexDirection: 'row', alignItems: 'center' },
  daysInputBox: { flex: 1, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 12, height: 44, justifyContent: 'center', backgroundColor: '#F8FAFC', marginRight: 16 },
  daysInputTxt: { fontSize: 13, color: '#0F172A', fontFamily: 'Inter-Medium' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center' },
  checkboxLbl: { fontSize: 13, fontWeight: '600', color: '#0F172A', fontFamily: 'Inter-SemiBold', marginLeft: 8 },

  radioBox: { width: '48%', flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 8, height: 44, backgroundColor: '#FFF' },
  radioBoxActive: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  radioTxt: { fontSize: 10, fontWeight: '600', color: '#0F172A', fontFamily: 'Inter-SemiBold', marginLeft: 6 },
  radioSub: { color: '#64748B', fontWeight: '400' },

  textareaBox: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, height: 80, backgroundColor: '#FFF', position: 'relative' },
  textareaInput: { flex: 1, fontSize: 13, color: '#0F172A', fontFamily: 'Inter-Medium' },
  charCount: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium', textAlign: 'right', marginTop: 4 },

  uploadBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#E2E8F0', borderStyle: 'dashed', borderRadius: 8, paddingVertical: 16, backgroundColor: '#FFF' },
  uploadTitle: { fontSize: 12, fontWeight: '700', color: '#1E3A8A', fontFamily: 'Inter-Bold', marginBottom: 2 },
  uploadSub: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium' },

  infoBox: { flexDirection: 'row', backgroundColor: '#EFF6FF', borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 16 },
  infoIconBg: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  infoTxt: { flex: 1, fontSize: 10, color: '#1E3A8A', fontFamily: 'Inter-Medium', lineHeight: 14 },

  sectionBlock: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, marginBottom: 16 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  viewAllTxt: { fontSize: 12, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold' },

  historyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  histIconBg: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  histInfo: { flex: 1 },
  histTitle: { fontSize: 12, fontWeight: '700', color: '#0F172A', fontFamily: 'Inter-Bold' },
  histSub: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 2 },
  histBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  histBadgeTxt: { fontSize: 10, fontWeight: '700', color: '#16A34A', fontFamily: 'Inter-Bold' },

  bottomActions: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  btnOutline: { width: '48%', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#2563EB', borderRadius: 12, height: 48 },
  btnOutlineTxt: { fontSize: 14, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold' },
  btnSolid: { width: '48%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0D5BD7', borderRadius: 12, height: 48 },
  btnSolidTxt: { fontSize: 14, fontWeight: '700', color: '#FFF', fontFamily: 'Inter-Bold' },
});

export default ApplyLeaveScreen;
