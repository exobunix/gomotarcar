import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchTaskById } from '../../redux/slices/taskSlice';
import { AppDispatch, RootState } from '../../redux/store';

interface Props { navigation: any; route: any }

const checklistData = [
  { id: '1', category: 'EXTERIOR', title: 'Exterior Rinse', desc: 'Rinse the exterior to remove loose dirt.', icon: 'car-wash', iconColor: '#10B981', iconBg: '#ECFDF5' },
  { id: '2', category: 'EXTERIOR', title: 'Foam Wash', desc: 'Apply foam and clean the entire exterior surface.', icon: 'spray', iconColor: '#10B981', iconBg: '#ECFDF5' },
  { id: '3', category: 'EXTERIOR', title: 'Tyre & Wheel Cleaning', desc: 'Clean tyres and wheels thoroughly.', icon: 'car-tire-alert', iconColor: '#1D4ED8', iconBg: '#EFF6FF' },
  { id: '4', category: 'INTERIOR', title: 'Interior Vacuum', desc: 'Vacuum all seats, floor mats and carpets.', icon: 'vacuum', iconColor: '#EA580C', iconBg: '#FFF7ED' },
  { id: '5', category: 'INTERIOR', title: 'Dashboard & Panels', desc: 'Clean dashboard, AC vents and all panels.', icon: 'car-door', iconColor: '#EA580C', iconBg: '#FFF7ED' },
  { id: '6', category: 'INTERIOR', title: 'Windows Cleaning', desc: 'Clean all windows and mirrors inside and outside.', icon: 'window-maximize', iconColor: '#EA580C', iconBg: '#FFF7ED' },
  { id: '7', category: 'INTERIOR', title: 'Final Inspection', desc: 'Inspect the vehicle and ensure quality standards.', icon: 'clipboard-check-outline', iconColor: '#9333EA', iconBg: '#F3E8FF' },
];

const ChecklistScreen: React.FC<Props> = ({ navigation, route }) => {
  const { taskId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { selectedTask: task } = useSelector((s: RootState) => s.tasks);
  const [completedIds, setCompletedIds] = useState<string[]>(['1', '2']); // Mocking first two completed for UI demo

  useEffect(() => {
    dispatch(fetchTaskById(taskId));
  }, [taskId]);

  const toggleChecklist = (id: string) => {
    setCompletedIds((prev) => 
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleFinish = () => {
    navigation.navigate('Scan', { returnTo: null }); // Assume ending scan
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
  const flatInfo = `Tower ${task.apartmentId?.tower || 'A'} • Flat ${task.apartmentId?.flatNumber || '101'}`;
  const vNum = task.vehicleNumber || task.vehicleId?.vehicleNumber || 'DL 01 AB 1234';
  const vType = task.vehicleType || 'Sedan';
  const pkg = task.packageName || task.packageType || 'Premium Wash';

  const totalTasks = checklistData.length;
  const completedCount = completedIds.length;
  const pendingCount = totalTasks - completedCount;
  const progressPercent = Math.round((completedCount / totalTasks) * 100);

  const exteriorTasks = checklistData.filter(t => t.category === 'EXTERIOR');
  const interiorTasks = checklistData.filter(t => t.category === 'INTERIOR');

  const renderChecklistItem = (item: any) => {
    const isCompleted = completedIds.includes(item.id);
    return (
      <TouchableOpacity 
        key={item.id} 
        style={styles.checkItemCard} 
        onPress={() => toggleChecklist(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.checkItemLeft}>
          {isCompleted ? (
            <Icon name="check-circle" size={24} color="#16A34A" />
          ) : (
            <View style={styles.emptyCircle} />
          )}
        </View>

        <View style={[styles.itemIconBg, { backgroundColor: item.iconBg }]}>
          <Icon name={item.icon} size={24} color={item.iconColor} />
        </View>

        <View style={styles.itemTextCol}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemDesc}>{item.desc}</Text>
        </View>

        <View style={styles.itemStatusCol}>
          <View style={[styles.itemBadge, isCompleted ? styles.itemBadgeDone : styles.itemBadgePending]}>
            <Text style={[styles.itemBadgeTxt, isCompleted ? styles.itemBadgeTxtDone : styles.itemBadgeTxtPending]}>
              {isCompleted ? 'Completed' : 'Pending'}
            </Text>
          </View>
          {isCompleted && <Text style={styles.itemTimeTxt}>09:15 AM</Text>}
        </View>

        <Icon name="chevron-right" size={20} color="#CBD5E1" style={{marginLeft: 8}} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.blueHeaderBg}>
        <View style={styles.topHeaderRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.mainTitle}>Cleaning Checklist</Text>
            <Text style={styles.mainSubTitle}>Complete all tasks to finish the job</Text>
          </View>
          <TouchableOpacity style={{ padding: 4 }}>
            <Icon name="information-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top Location Card */}
        <View style={styles.topCard}>
          <View style={styles.tcHeader}>
            <View style={styles.tcIconBg}>
              <Icon name="office-building" size={24} color="#0F172A" />
            </View>
            <View style={styles.tcInfo}>
              <Text style={styles.tcTitle}>{task.apartmentName || 'Green Valley Apartments'}</Text>
              <Text style={styles.tcFlat}>{flatInfo}</Text>
              <View style={styles.tcLocRow}>
                <Icon name="map-marker-outline" size={12} color="#2563EB" />
                <Text style={styles.tcLocTxt}>Green Valley, Sector 62, Noida, UP 201301</Text>
              </View>
            </View>
            <View style={styles.tcRightCol}>
              <View style={styles.tcTag}><Text style={styles.tcTagTxt}>{pkg}</Text></View>
              <Text style={styles.tcPlate}>{vNum}</Text>
            </View>
          </View>
          
          <View style={styles.tcDivider} />

          {/* Progress Section */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Overall Progress</Text>
              <Text style={styles.progressCount}>{completedCount} of {totalTasks} completed</Text>
            </View>
            
            <View style={styles.progressBarRow}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              </View>
              <Text style={styles.progressPercent}>{progressPercent}%</Text>
            </View>

            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <Icon name="check-circle" size={14} color="#16A34A" />
                <Text style={[styles.legendTxt, {color: '#16A34A'}]}>Completed ({completedCount})</Text>
              </View>
              <View style={styles.legendItem}>
                <Icon name="clock-outline" size={14} color="#F59E0B" />
                <Text style={[styles.legendTxt, {color: '#F59E0B'}]}>In Progress (0)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={styles.legendGreyCircle} />
                <Text style={[styles.legendTxt, {color: '#64748B'}]}>Pending ({pendingCount})</Text>
              </View>
            </View>
          </View>
        </View>

        {/* EXTERIOR Section */}
        <Text style={styles.sectionHeader}>EXTERIOR</Text>
        <View style={styles.checklistGroup}>
          {exteriorTasks.map(renderChecklistItem)}
        </View>

        {/* INTERIOR Section */}
        <Text style={styles.sectionHeader}>INTERIOR</Text>
        <View style={styles.checklistGroup}>
          {interiorTasks.map(renderChecklistItem)}
        </View>

        {/* Add Photos Card */}
        <View style={styles.addPhotosCard}>
          <View style={styles.addPhotosIconBg}>
            <Icon name="camera-outline" size={24} color="#2563EB" />
          </View>
          <View style={{ flex: 1, paddingRight: 16 }}>
            <Text style={styles.addPhotosTitle}>Add Photos <Text style={{fontWeight: '400', color: '#64748B'}}>(Optional)</Text></Text>
            <Text style={styles.addPhotosDesc}>Add before & after photos to maintain quality records and build customer trust.</Text>
          </View>
          <TouchableOpacity style={styles.addPhotosBtn}>
            <Icon name="image-outline" size={16} color="#2563EB" />
            <Text style={styles.addPhotosBtnTxt}>Add Photos</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Fixed Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.btnOutline}>
          <Icon name="pause" size={18} color="#2563EB" />
          <Text style={styles.btnOutlineTxt}>Pause Task</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSolid} onPress={handleFinish}>
          <Icon name="check-circle-outline" size={18} color="#FFF" />
          <Text style={styles.btnSolidTxt}>Task Completed</Text>
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
    paddingHorizontal: 12,
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
  },
  tcHeader: {
    flexDirection: 'row',
    padding: 16,
  },
  tcIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tcInfo: {
    flex: 1,
    marginLeft: 12,
  },
  tcTitle: { fontSize: 14, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  tcFlat: { fontSize: 12, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 4 },
  tcLocRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  tcLocTxt: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Regular', marginLeft: 4 },
  tcRightCol: {
    alignItems: 'flex-end',
  },
  tcTag: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  tcTagTxt: { fontSize: 9, color: '#2563EB', fontWeight: '700', fontFamily: 'Inter-Bold' },
  tcPlate: { fontSize: 13, fontWeight: '800', color: colors.darkNavy, fontFamily: 'Inter-Bold', marginTop: 8 },

  tcDivider: { height: 1, backgroundColor: '#F1F5F9' },

  progressContainer: {
    padding: 16,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressTitle: { fontSize: 13, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  progressCount: { fontSize: 11, color: '#64748B', fontFamily: 'Inter-Medium' },
  progressBarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  progressBarBg: { flex: 1, height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, marginRight: 12 },
  progressBarFill: { height: 8, backgroundColor: '#2563EB', borderRadius: 4 },
  progressPercent: { fontSize: 13, fontWeight: '800', color: '#2563EB', fontFamily: 'Inter-Bold' },
  
  legendRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendGreyCircle: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#CBD5E1' },
  legendTxt: { fontSize: 10, fontWeight: '600', fontFamily: 'Inter-SemiBold', marginLeft: 6 },

  sectionHeader: { fontSize: 11, fontWeight: '800', color: '#64748B', fontFamily: 'Inter-Bold', marginBottom: 8, marginLeft: 4, letterSpacing: 0.5 },
  checklistGroup: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    overflow: 'hidden',
  },
  checkItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  checkItemLeft: { width: 24, alignItems: 'center', justifyContent: 'center' },
  emptyCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: '#CBD5E1' },
  itemIconBg: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginHorizontal: 12 },
  itemTextCol: { flex: 1 },
  itemTitle: { fontSize: 13, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  itemDesc: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 2, lineHeight: 14 },
  itemStatusCol: { alignItems: 'flex-end', marginLeft: 8 },
  itemBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  itemBadgeDone: { backgroundColor: '#F0FDF4' },
  itemBadgePending: { backgroundColor: '#F1F5F9' },
  itemBadgeTxt: { fontSize: 9, fontWeight: '700', fontFamily: 'Inter-Bold' },
  itemBadgeTxtDone: { color: '#16A34A' },
  itemBadgeTxtPending: { color: '#64748B' },
  itemTimeTxt: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 4 },

  addPhotosCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 20,
  },
  addPhotosIconBg: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addPhotosTitle: { fontSize: 13, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  addPhotosDesc: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Regular', marginTop: 4 },
  addPhotosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addPhotosBtnTxt: { fontSize: 11, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold', marginLeft: 6 },

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

export default ChecklistScreen;
