import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import { fetchTaskById } from '../../redux/slices/taskSlice';
import { AppDispatch, RootState } from '../../redux/store';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Props { navigation: any; route: any }

const TaskDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { taskId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { selectedTask: task, loading } = useSelector((s: RootState) => s.tasks);

  useEffect(() => {
    dispatch(fetchTaskById(taskId));
  }, [taskId]);

  const handleStart = () => {
    navigation.navigate('Scan', { returnTo: taskId });
  };

  const handleComplete = () => {
    navigation.navigate('CleaningCompletion', { taskId });
  };

  if (!task) {
    return (
      <View style={styles.container}>
        <View style={styles.blueHeaderBg}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const cName = task.customerName || `${task.customerId?.firstName || ''} ${task.customerId?.lastName || ''}`.trim() || 'Unknown Client';
  const timeParts = task.scheduledTime ? task.scheduledTime.split(' ') : ['09:00', 'AM'];
  const timeVal = `${timeParts[0]} ${timeParts[1] || 'AM'}`;
  const flatInfo = `Tower ${task.apartmentId?.tower || 'A'} • Flat ${task.apartmentId?.flatNumber || '101'}`;
  const vNum = task.vehicleNumber || task.vehicleId?.vehicleNumber || 'DL 01 AB 1234';
  const vType = task.vehicleType || 'Sedan';
  const pkg = task.packageName || task.packageType || 'Premium Wash';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return { bg: '#F0FDF4', color: '#16A34A', icon: 'check-circle-outline', label: 'Completed' };
      case 'in_progress': return { bg: '#F0FDF4', color: '#16A34A', icon: 'play-circle-outline', label: 'In Progress' };
      default: return { bg: '#FFF7ED', color: '#EA580C', icon: 'clock-outline', label: 'Pending' };
    }
  };
  const sStyle = getStatusBadge(task.status);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.blueHeaderBg}>
        <View style={styles.topHeaderRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.mainTitle}>Task Detail</Text>
            <Text style={styles.mainSubTitle}>View and update task information</Text>
          </View>
          <TouchableOpacity style={{ padding: 4 }}>
            <Icon name="dots-vertical" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top Info Card */}
        <View style={styles.topCard}>
          <View style={styles.topCardRow}>
            {/* Left Column */}
            <View style={styles.topCardLeftCol}>
              <Text style={styles.tcTime}>{timeVal}</Text>
              <Text style={styles.tcDate}>15 May 2025, Thu</Text>
              <View style={styles.tcTag}><Text style={styles.tcTagTxt}>{vType}</Text></View>
              <Text style={styles.tcPlate}>{vNum}</Text>
              <Text style={styles.tcPkg}>{pkg}</Text>
            </View>

            <View style={styles.tcDivider} />

            {/* Right Column */}
            <View style={styles.topCardRightCol}>
              <View style={styles.tcRightHeader}>
                <View style={styles.tcCustomerRow}>
                  <Image source={require('../../assets/cleaner_avatar.png')} style={styles.tcAvatar} />
                  <View style={{ marginLeft: 8 }}>
                    <Text style={styles.tcCustomerName}>{cName}</Text>
                    <View style={styles.tcPhoneRow}>
                      <Icon name="phone" size={12} color="#2563EB" />
                      <Text style={styles.tcPhone}>+91 98765 43210</Text>
                      <Icon name="message-text" size={14} color="#2563EB" style={{marginLeft: 6}} />
                    </View>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: sStyle.bg }]}>
                  <Icon name={sStyle.icon} size={12} color={sStyle.color} />
                  <Text style={[styles.statusBadgeText, { color: sStyle.color }]}>{sStyle.label}</Text>
                </View>
              </View>

              <View style={styles.tcLocationBlock}>
                <View style={styles.tcLocRow}>
                  <Icon name="office-building" size={14} color="#64748B" />
                  <Text style={styles.tcLocTxt}>{task.apartmentName || 'Green Valley Apartments'}</Text>
                  <Icon name="chevron-right" size={16} color="#CBD5E1" style={{position: 'absolute', right: 0}} />
                </View>
                <View style={styles.tcLocRow}>
                  <Icon name="map-marker-outline" size={14} color="#64748B" />
                  <Text style={styles.tcLocTxt}>{flatInfo}</Text>
                </View>
                <TouchableOpacity style={styles.tcMapBtn}>
                  <Text style={styles.tcMapBtnTxt}>View on Map</Text>
                  <Icon name="chevron-right" size={14} color="#2563EB" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Task Information */}
        <Text style={styles.sectionTitle}>Task Information</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoGridItem}>
            <View style={[styles.infoIconBg, { backgroundColor: '#ECFDF5' }]}>
              <Icon name="calendar-check" size={16} color="#10B981" />
            </View>
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>Service Type</Text>
              <Text style={styles.infoValue}>{pkg}</Text>
            </View>
          </View>

          <View style={styles.infoGridItem}>
            <View style={[styles.infoIconBg, { backgroundColor: '#EFF6FF' }]}>
              <Icon name="clock-outline" size={16} color="#2563EB" />
            </View>
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>Estimated Time</Text>
              <Text style={styles.infoValue}>60 mins</Text>
            </View>
          </View>

          <View style={styles.infoGridItem}>
            <View style={[styles.infoIconBg, { backgroundColor: '#FFF7ED' }]}>
              <Icon name="spray-bottle" size={16} color="#EA580C" />
            </View>
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>Cleaning Type</Text>
              <Text style={styles.infoValue}>Interior + Exterior</Text>
            </View>
          </View>

          <View style={styles.infoGridItem}>
            <View style={[styles.infoIconBg, { backgroundColor: '#F3E8FF' }]}>
              <Icon name="calendar" size={16} color="#9333EA" />
            </View>
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>Scheduled Date</Text>
              <Text style={styles.infoValue}>15 May 2025</Text>
            </View>
          </View>
        </View>

        <View style={styles.specialInstructionsCard}>
          <View style={[styles.infoIconBg, { backgroundColor: '#EFF6FF', marginBottom: 0, marginRight: 12 }]}>
            <Icon name="text-box-outline" size={16} color="#2563EB" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>Special Instructions</Text>
            <Text style={[styles.infoValue, { marginTop: 2 }]}>Customer requested extra focus on windows and mirrors.</Text>
          </View>
        </View>

        {/* Checklist */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Checklist <Text style={{fontWeight: '400', fontSize: 11, color: '#64748B'}}>(0 / 6 Completed)</Text></Text>
          <Text style={styles.viewAllTxt}>View All</Text>
        </View>
        <View style={styles.checklistCard}>
          {['Exterior Rinse', 'Foam Wash', 'Interior Vacuum', 'Dashboard & Panels', 'Windows Cleaning', 'Final Inspection'].map((item, idx) => (
            <View key={idx} style={styles.checklistItem}>
              <View style={styles.checklistCircle} />
              <Text style={styles.checklistTxt}>{item}</Text>
              <Icon name="chevron-right" size={20} color="#CBD5E1" />
            </View>
          ))}
        </View>

        {/* Notes */}
        <View style={styles.notesCard}>
          <View style={[styles.infoIconBg, { backgroundColor: '#F3E8FF', marginBottom: 0, marginRight: 12 }]}>
            <Icon name="text-box-outline" size={16} color="#9333EA" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>Notes</Text>
            <Text style={[styles.infoValue, { marginTop: 2, color: '#94A3B8' }]}>No notes added yet</Text>
          </View>
          <Icon name="chevron-right" size={20} color="#CBD5E1" />
        </View>

      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.btnOutline} onPress={handleStart}>
          <Icon name="clock-outline" size={18} color="#2563EB" />
          <Text style={styles.btnOutlineTxt}>Mark as In Progress</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSolid} onPress={handleComplete}>
          <Icon name="check-circle-outline" size={18} color="#FFF" />
          <Text style={styles.btnSolidTxt}>Mark as Completed</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  blueHeaderBg: {
    backgroundColor: '#0D5BD7',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    zIndex: 1,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitles: {
    flex: 1,
    paddingLeft: 12,
  },
  mainTitle: { fontSize: 20, fontWeight: '700', color: '#FFF', fontFamily: 'Inter-Bold' },
  mainSubTitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter-Medium', marginTop: 2 },
  
  scrollView: {
    flex: 1,
    marginTop: -40,
    zIndex: 2,
    elevation: 5,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // Top Card
  topCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 20,
    overflow: 'hidden',
  },
  topCardRow: {
    flexDirection: 'row',
  },
  topCardLeftCol: {
    width: 120,
    padding: 16,
    alignItems: 'flex-start',
  },
  tcTime: { fontSize: 18, fontWeight: '800', color: '#2563EB', fontFamily: 'Inter-Bold' },
  tcDate: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 4 },
  tcTag: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginTop: 12 },
  tcTagTxt: { fontSize: 10, color: '#2563EB', fontWeight: '600', fontFamily: 'Inter-SemiBold' },
  tcPlate: { fontSize: 14, fontWeight: '800', color: colors.darkNavy, fontFamily: 'Inter-Bold', marginTop: 8 },
  tcPkg: { fontSize: 11, color: '#64748B', fontFamily: 'Inter-Regular', marginTop: 4 },
  
  tcDivider: { width: 1, backgroundColor: '#E2E8F0' },

  topCardRightCol: {
    flex: 1,
    padding: 16,
  },
  tcRightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tcCustomerRow: { flexDirection: 'row', flex: 1 },
  tcAvatar: { width: 40, height: 40, borderRadius: 20 },
  tcCustomerName: { fontSize: 14, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  tcPhoneRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  tcPhone: { fontSize: 11, color: '#64748B', fontFamily: 'Inter-Medium', marginLeft: 4 },
  
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  statusBadgeText: { fontSize: 10, fontWeight: '600', marginLeft: 4, fontFamily: 'Inter-SemiBold' },

  tcLocationBlock: {
    marginTop: 16,
  },
  tcLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    position: 'relative',
  },
  tcLocTxt: { fontSize: 12, color: colors.darkNavy, fontFamily: 'Inter-Medium', marginLeft: 8 },
  tcMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 22,
  },
  tcMapBtnTxt: { fontSize: 12, fontWeight: '600', color: '#2563EB', fontFamily: 'Inter-SemiBold', marginRight: 4 },

  sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.darkNavy, fontFamily: 'Inter-Bold', marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 10 },
  viewAllTxt: { fontSize: 12, fontWeight: '600', color: '#2563EB', fontFamily: 'Inter-SemiBold' },

  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoGridItem: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  infoIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  infoTextCol: {},
  infoLabel: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium' },
  infoValue: { fontSize: 12, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold', marginTop: 2 },

  specialInstructionsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    alignItems: 'center',
  },

  checklistCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    paddingVertical: 8,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  checklistCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    marginRight: 12,
  },
  checklistTxt: { flex: 1, fontSize: 13, color: colors.darkNavy, fontFamily: 'Inter-Medium' },

  notesCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginBottom: 40,
  },

  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    justifyContent: 'space-between',
  },
  btnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    marginRight: 8,
  },
  btnOutlineTxt: { fontSize: 13, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold', marginLeft: 8 },
  btnSolid: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    marginLeft: 8,
  },
  btnSolidTxt: { fontSize: 13, fontWeight: '700', color: '#FFF', fontFamily: 'Inter-Bold', marginLeft: 8 },
});

export default TaskDetailScreen;
