import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Props { navigation: any }

const LeaveStatusScreen: React.FC<Props> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('All');

  const leaveRequests = [
    { id: 1, dateStr: '20 May 2025 (Tue) – 21 May 2025 (Wed)', type: 'Casual Leave', duration: '2 Days', reason: 'Personal work at home.', appliedDate: '15 May 2025', status: 'Pending', icon: 'calendar-check-outline', iconColor: '#16A34A', bg: '#F0FDF4' },
    { id: 2, dateStr: '10 May 2025 (Sat)', type: 'Casual Leave', duration: '1 Day', reason: 'Family function.', appliedDate: '08 May 2025', status: 'Approved', approvedBy: 'Rahul Sharma', approvedDate: '08 May 2025', icon: 'airplane', iconColor: '#2563EB', bg: '#EFF6FF' },
    { id: 3, dateStr: '02 May 2025 (Fri) – 04 May 2025 (Sun)', type: 'Sick Leave', duration: '3 Days', reason: 'Fever and rest.', appliedDate: '01 May 2025', status: 'Approved', approvedBy: 'Rahul Sharma', approvedDate: '01 May 2025', icon: 'medical-bag', iconColor: '#EA580C', bg: '#FFF7ED' },
    { id: 4, dateStr: '15 Apr 2025 (Tue) – 30 Apr 2025 (Wed)', type: 'Maternity Leave', duration: '16 Days', reason: 'Maternity leave.', appliedDate: '10 Apr 2025', status: 'Approved', approvedBy: 'Rahul Sharma', approvedDate: '10 Apr 2025', icon: 'human-baby-changing-table', iconColor: '#9333EA', bg: '#FAF5FF' },
    { id: 5, dateStr: '28 Mar 2025 (Fri)', type: 'Casual Leave', duration: '1 Day', reason: 'Personal reason.', appliedDate: '27 Mar 2025', status: 'Rejected', rejectedBy: 'Rahul Sharma', rejectedDate: '27 Mar 2025', icon: 'calendar-remove-outline', iconColor: '#DC2626', bg: '#FEF2F2' },
    { id: 6, dateStr: '20 Mar 2025 (Thu) – 22 Mar 2025 (Sat)', type: 'Earned Leave', duration: '3 Days', reason: 'Out of station.', appliedDate: '18 Mar 2025', status: 'Approved', approvedBy: 'Rahul Sharma', approvedDate: '18 Mar 2025', icon: 'airplane', iconColor: '#2563EB', bg: '#EFF6FF' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.blueHeaderBg}>
        <View style={styles.topHeaderRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.mainTitle}>Leave Status</Text>
            <Text style={styles.mainSubTitle}>Track your leave requests</Text>
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Icon name="filter-variant" size={16} color="#FFF" />
            <Text style={styles.filterBtnTxt}>Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          {['All', 'Pending', 'Approved', 'Rejected'].map(tab => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tabItem, activeTab === tab && styles.tabActive]} 
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabTxt, activeTab === tab && styles.tabTxtActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Leave Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryHeaderRow}>
            <Text style={styles.summaryTitle}>Leave Summary</Text>
            <Text style={styles.summaryDate}>As on 15 May 2025</Text>
          </View>
          
          <View style={styles.summaryGrid}>
            <View style={[styles.summaryCard, {backgroundColor: '#FFF7ED', borderColor: '#FED7AA'}]}>
              <View style={[styles.scIconBg, {backgroundColor: '#FFEDD5'}]}><Icon name="clock-outline" size={18} color="#EA580C" /></View>
              <Text style={styles.scLbl}>Pending</Text>
              <Text style={styles.scVal}>2</Text>
              <Text style={styles.scSub}>Requests</Text>
            </View>
            <View style={[styles.summaryCard, {backgroundColor: '#F0FDF4', borderColor: '#BBF7D0'}]}>
              <View style={[styles.scIconBg, {backgroundColor: '#DCFCE7'}]}><Icon name="check-circle-outline" size={18} color="#16A34A" /></View>
              <Text style={styles.scLbl}>Approved</Text>
              <Text style={styles.scVal}>5</Text>
              <Text style={styles.scSub}>Requests</Text>
            </View>
            <View style={[styles.summaryCard, {backgroundColor: '#FEF2F2', borderColor: '#FECACA'}]}>
              <View style={[styles.scIconBg, {backgroundColor: '#FEE2E2'}]}><Icon name="close-circle-outline" size={18} color="#DC2626" /></View>
              <Text style={styles.scLbl}>Rejected</Text>
              <Text style={styles.scVal}>1</Text>
              <Text style={styles.scSub}>Requests</Text>
            </View>
            <View style={[styles.summaryCard, {backgroundColor: '#EFF6FF', borderColor: '#BFDBFE'}]}>
              <View style={[styles.scIconBg, {backgroundColor: '#DBEAFE'}]}><Icon name="calendar-month-outline" size={18} color="#2563EB" /></View>
              <Text style={styles.scLbl}>Total Requests</Text>
              <Text style={styles.scVal}>8</Text>
              <Text style={styles.scSub}>This Year</Text>
            </View>
          </View>
        </View>

        {/* Requests List */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.listTitle}>Leave Requests (8)</Text>
          <TouchableOpacity style={styles.sortBtn}>
            <Text style={styles.sortBtnTxt}>Sort by: Latest First</Text>
            <Icon name="chevron-down" size={16} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          {leaveRequests.map(req => (
            <View key={req.id} style={styles.reqCard}>
              <View style={styles.reqHeader}>
                <View style={[styles.reqIconBg, {backgroundColor: req.bg}]}><Icon name={req.icon} size={24} color={req.iconColor} /></View>
                <View style={styles.reqHeaderInfo}>
                  <Text style={styles.reqDateStr}>{req.dateStr}</Text>
                  <Text style={styles.reqTypeTxt}>{req.type} • {req.duration}</Text>
                </View>
              </View>

              <View style={styles.reqBody}>
                <View style={styles.reqLeftCol}>
                  <Text style={styles.reqReason}>{req.reason}</Text>
                  <View style={styles.reqAppliedRow}>
                    <Icon name="clock-outline" size={12} color="#94A3B8" style={{marginRight: 4}} />
                    <Text style={styles.reqAppliedTxt}>Applied on {req.appliedDate}</Text>
                  </View>
                </View>
                <View style={styles.reqRightCol}>
                  {req.status === 'Pending' && (
                    <View style={[styles.statusBadge, {borderColor: '#FED7AA', backgroundColor: '#FFF7ED'}]}>
                      <Icon name="clock-outline" size={14} color="#EA580C" style={{marginRight: 4}} />
                      <Text style={[styles.statusBadgeTxt, {color: '#EA580C'}]}>Pending</Text>
                    </View>
                  )}
                  {req.status === 'Approved' && (
                    <>
                      <View style={[styles.statusBadge, {borderColor: '#BBF7D0', backgroundColor: '#F0FDF4'}]}>
                        <Icon name="check-circle-outline" size={14} color="#16A34A" style={{marginRight: 4}} />
                        <Text style={[styles.statusBadgeTxt, {color: '#16A34A'}]}>Approved</Text>
                      </View>
                      <Text style={styles.reqActionTxt}>Approved by {req.approvedBy}{'\n'}on {req.approvedDate}</Text>
                    </>
                  )}
                  {req.status === 'Rejected' && (
                    <>
                      <View style={[styles.statusBadge, {borderColor: '#FECACA', backgroundColor: '#FEF2F2'}]}>
                        <Icon name="close-circle-outline" size={14} color="#DC2626" style={{marginRight: 4}} />
                        <Text style={[styles.statusBadgeTxt, {color: '#DC2626'}]}>Rejected</Text>
                      </View>
                      <Text style={styles.reqActionTxt}>Rejected by {req.rejectedBy}{'\n'}on {req.rejectedDate}</Text>
                    </>
                  )}
                </View>
                <Icon name="chevron-right" size={20} color="#CBD5E1" style={styles.reqArrow} />
              </View>
            </View>
          ))}
        </View>

        {/* Info Banner */}
        <View style={styles.infoBox}>
          <View style={styles.infoIconBg}><Icon name="information-variant" size={20} color="#FFF" /></View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Approved leaves will be adjusted in your leave balance.</Text>
            <Text style={styles.infoSub}>For any queries, contact your supervisor.</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' }, // Slightly grey bg for contrast
  blueHeaderBg: {
    backgroundColor: '#0A2540',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    zIndex: 10,
  },
  topHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  headerTitles: { flex: 1, paddingHorizontal: 12 },
  mainTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', fontFamily: 'Inter-Bold' },
  mainSubTitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter-Medium', marginTop: 4 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  filterBtnTxt: { fontSize: 12, fontWeight: '600', color: '#FFF', fontFamily: 'Inter-SemiBold', marginLeft: 4 },

  tabsRow: { flexDirection: 'row', backgroundColor: '#FFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 0 },
  tabItem: { flex: 1, alignItems: 'center', paddingBottom: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#2563EB' },
  tabTxt: { fontSize: 13, fontWeight: '600', color: '#64748B', fontFamily: 'Inter-SemiBold' },
  tabTxtActive: { color: '#0F172A', fontWeight: '800', fontFamily: 'Inter-Bold' },

  scrollContent: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 16 },

  summaryContainer: { marginBottom: 20 },
  summaryHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  summaryTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  summaryDate: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium' },
  summaryGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryCard: { flex: 1, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, borderRadius: 12, borderWidth: 1, marginHorizontal: 4 },
  scIconBg: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  scLbl: { fontSize: 10, fontWeight: '600', color: '#475569', fontFamily: 'Inter-SemiBold', textAlign: 'center', marginBottom: 4 },
  scVal: { fontSize: 18, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  scSub: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 2 },

  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  listTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  sortBtn: { flexDirection: 'row', alignItems: 'center' },
  sortBtnTxt: { fontSize: 11, color: '#475569', fontFamily: 'Inter-Medium', marginRight: 4 },

  listContainer: { marginBottom: 16 },
  reqCard: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 2 },
  reqHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  reqIconBg: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  reqHeaderInfo: { flex: 1, justifyContent: 'center' },
  reqDateStr: { fontSize: 13, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold', marginBottom: 4 },
  reqTypeTxt: { fontSize: 11, color: '#475569', fontFamily: 'Inter-Medium' },

  reqBody: { flexDirection: 'row', justifyContent: 'space-between', position: 'relative' },
  reqLeftCol: { flex: 1, paddingRight: 8 },
  reqReason: { fontSize: 12, color: '#0F172A', fontFamily: 'Inter-Medium', marginBottom: 8 },
  reqAppliedRow: { flexDirection: 'row', alignItems: 'center' },
  reqAppliedTxt: { fontSize: 10, color: '#94A3B8', fontFamily: 'Inter-Medium' },

  reqRightCol: { alignItems: 'flex-end', justifyContent: 'flex-start', width: 120, paddingRight: 24 }, // reserved space for chevron
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16, borderWidth: 1, marginBottom: 6 },
  statusBadgeTxt: { fontSize: 10, fontWeight: '700', fontFamily: 'Inter-Bold' },
  reqActionTxt: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium', textAlign: 'right' },
  
  reqArrow: { position: 'absolute', right: -4, top: '30%' },

  infoBox: { flexDirection: 'row', backgroundColor: '#EFF6FF', borderRadius: 12, padding: 16, alignItems: 'flex-start', borderWidth: 1, borderColor: '#BFDBFE', marginBottom: 20 },
  infoIconBg: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2 },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: 11, fontWeight: '700', color: '#1E3A8A', fontFamily: 'Inter-Bold', lineHeight: 16 },
  infoSub: { fontSize: 10, color: '#475569', fontFamily: 'Inter-Medium', marginTop: 4 },
});

export default LeaveStatusScreen;
