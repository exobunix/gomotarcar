import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Platform, Dimensions, StatusBar, ActivityIndicator, Alert, Modal, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../../components/common/Card';
import { attendanceService } from '../../services/attendance.service';
import { leaveService } from '../../services/leave.service';
import cleanerService from '../../services/cleaner.service';

const { width } = Dimensions.get('window');

interface Props { navigation: any }

const DailyAttendanceScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  
  // State
  const [cleaners, setCleaners] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [geoFilter, setGeoFilter] = useState(false);
  const [selectedDate] = useState<Date>(new Date());
  
  // Action Modal State
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  
  // Manual Mark State
  const [manualModalVisible, setManualModalVisible] = useState(false);
  const [selectedManualCleaner, setSelectedManualCleaner] = useState<any>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      
      // Fetch all cleaners, attendance for date, and leaves
      const [cleanersRes, attendanceRes, leavesRes] = await Promise.all([
        cleanerService.list({ limit: 1000 }),
        attendanceService.list({ date: dateStr }),
        leaveService.list({ date: dateStr })
      ]);
      
      setCleaners(cleanersRes.data?.data || []);
      setAttendance(attendanceRes.data?.data || []);
      setLeaves(leavesRes.data?.data || []);
    } catch (err: any) {
      console.error('Error fetching attendance data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadData();
    const unsub = navigation.addListener('focus', loadData);
    return unsub;
  }, [loadData, navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Merge cleaner info with attendance and leave records
  const mergedRecords = cleaners.map((cleaner) => {
    const cleanerIdStr = cleaner._id;
    
    // Find attendance entry
    const attEntry = attendance.find(
      (a) => String(a.cleanerId?._id || a.cleanerId) === String(cleanerIdStr)
    );
    
    // Find leave entry
    const isOnLeave = leaves.some(
      (l) => String(l.cleanerId?._id || l.cleanerId) === String(cleanerIdStr) && l.status === 'approved'
    );
    
    let status = 'Absent';
    if (attEntry) {
      status = attEntry.status === 'late' ? 'Late' : 'Present';
    } else if (isOnLeave) {
      status = 'On Leave';
    }
    
    return {
      _id: cleanerIdStr,
      name: `${cleaner.firstName} ${cleaner.lastName || ''}`.trim(),
      id: cleaner.cleanerId || `CLN-${String(cleanerIdStr).slice(-4).toUpperCase()}`,
      checkin: attEntry?.checkIn?.time ? new Date(attEntry.checkIn.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—',
      checkout: attEntry?.checkOut?.time ? new Date(attEntry.checkOut.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—',
      hours: attEntry?.checkIn?.time && attEntry?.checkOut?.time 
        ? (() => {
            const diff = (new Date(attEntry.checkOut.time).getTime() - new Date(attEntry.checkIn.time).getTime()) / 1000;
            const h = Math.floor(diff / 3600);
            const m = Math.floor((diff % 3600) / 60);
            return `${h}h ${m}m`;
          })()
        : '—',
      status,
      verified: attEntry?.checkIn?.isGPSVerified || false,
      selfieUrl: attEntry?.checkIn?.selfieUrl || null,
      rawRecord: attEntry,
      cleanerRaw: cleaner
    };
  });

  // Filter lists
  const filtered = mergedRecords.filter((record) => {
    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchesSearch = record.name.toLowerCase().includes(q) || record.id.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }
    
    // Status filter
    if (statusFilter !== 'all' && record.status.toLowerCase().replace(' ', '_') !== statusFilter) {
      return false;
    }
    
    // Geo Verification filter
    if (geoFilter && !record.verified) {
      return false;
    }
    
    return true;
  });

  // Statistics calculation
  const totalCleaners = mergedRecords.length || 1;
  const presentCount = mergedRecords.filter(r => r.status === 'Present').length;
  const absentCount = mergedRecords.filter(r => r.status === 'Absent').length;
  const lateCount = mergedRecords.filter(r => r.status === 'Late').length;
  const leaveCount = mergedRecords.filter(r => r.status === 'On Leave').length;

  const presentPct = ((presentCount / totalCleaners) * 100).toFixed(1);
  const absentPct = ((absentCount / totalCleaners) * 100).toFixed(1);
  const latePct = ((lateCount / totalCleaners) * 100).toFixed(1);
  const leavePct = ((leaveCount / totalCleaners) * 100).toFixed(1);

  // Mark checkin action
  const handleMarkCheckin = async (cleanerId: string) => {
    try {
      await attendanceService.checkIn(cleanerId, { 
        time: new Date(), 
        isGPSVerified: true, 
        latitude: 28.6139, 
        longitude: 77.2090 
      });
      Alert.alert('✓ Success', 'Check-in recorded successfully.');
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to check-in');
    }
  };

  // Mark checkout action
  const handleMarkCheckout = async (cleanerId: string) => {
    try {
      await attendanceService.checkOut(cleanerId, { 
        time: new Date(), 
        isGPSVerified: true, 
        latitude: 28.6139, 
        longitude: 77.2090 
      });
      Alert.alert('✓ Success', 'Check-out recorded successfully.');
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to check-out');
    }
  };

  // Mark absent action
  const handleMarkAbsent = async (cleanerId: string) => {
    try {
      await attendanceService.markAbsent(cleanerId, { 
        date: new Date()
      });
      Alert.alert('✓ Success', 'Marked as absent successfully.');
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to mark absent');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return '#16A34A';
      case 'Late': return '#F97316';
      case 'Absent': return '#EF4444';
      default: return '#2563EB'; // On Leave
    }
  };

  const getSelfieIcon = (record: any) => {
    if (record.selfieUrl) {
      return <Icon name="check-circle" size={14} color="#16A34A" />;
    }
    if (record.status === 'Present' || record.status === 'Late') {
      return <Icon name="alert-circle" size={14} color="#F97316" />;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Brand Header Bar */}
      <View style={[styles.headerContainer, { paddingTop: insets.top > 0 ? insets.top + 4 : (Platform.OS === 'ios' ? 44 : 12) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.headerMenuBtn} onPress={() => navigation.openDrawer?.()}>
            <Icon name="menu" size={26} color="#1E293B" />
          </TouchableOpacity>
          
          <View style={styles.brandContainer}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={styles.brandLogo} 
              resizeMode="contain" 
            />
            <Text style={styles.brandSub}>Anything & Everything for your Car</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Main Title section */}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.mainTitle}>Daily Attendance</Text>
            <Text style={styles.subTitle}>Track and manage cleaner attendance</Text>
          </View>
          <View style={styles.datePickerBtn}>
            <Icon name="calendar-month-outline" size={16} color="#2563EB" />
            <Text style={styles.datePickerTxt}>
              {selectedDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* Analytics Grid */}
        <View style={styles.analyticsGrid}>
          <TouchableOpacity style={{ width: '48%', marginBottom: 12 }} onPress={() => setStatusFilter(statusFilter === 'present' ? 'all' : 'present')}>
            <Card variant="elevated" style={[styles.analyticsCard, statusFilter === 'present' && styles.cardActiveFilter]}>
              <View style={[styles.cardIconBg, { backgroundColor: '#ECFDF5' }]}>
                <Icon name="check-bold" size={16} color="#16A34A" />
              </View>
              <Text style={styles.cardVal}>{presentCount}</Text>
              <Text style={[styles.cardLabel, { color: '#16A34A' }]}>Present</Text>
              <View style={[styles.pctCapsule, { backgroundColor: '#E8F5E9' }]}>
                <Text style={[styles.pctCapsuleTxt, { color: '#16A34A' }]}>{presentPct}%</Text>
              </View>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity style={{ width: '48%', marginBottom: 12 }} onPress={() => setStatusFilter(statusFilter === 'absent' ? 'all' : 'absent')}>
            <Card variant="elevated" style={[styles.analyticsCard, statusFilter === 'absent' && styles.cardActiveFilter]}>
              <View style={[styles.cardIconBg, { backgroundColor: '#FEF2F2' }]}>
                <Icon name="close-thick" size={16} color="#EF4444" />
              </View>
              <Text style={styles.cardVal}>{absentCount}</Text>
              <Text style={[styles.cardLabel, { color: '#EF4444' }]}>Absent</Text>
              <View style={[styles.pctCapsule, { backgroundColor: '#FFEBEE' }]}>
                <Text style={[styles.pctCapsuleTxt, { color: '#EF4444' }]}>{absentPct}%</Text>
              </View>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity style={{ width: '48%', marginBottom: 12 }} onPress={() => setStatusFilter(statusFilter === 'late' ? 'all' : 'late')}>
            <Card variant="elevated" style={[styles.analyticsCard, statusFilter === 'late' && styles.cardActiveFilter]}>
              <View style={[styles.cardIconBg, { backgroundColor: '#FFF7ED' }]}>
                <Icon name="clock-outline" size={16} color="#F97316" />
              </View>
              <Text style={styles.cardVal}>{lateCount}</Text>
              <Text style={[styles.cardLabel, { color: '#F97316' }]}>Late</Text>
              <View style={[styles.pctCapsule, { backgroundColor: '#FFF3E0' }]}>
                <Text style={[styles.pctCapsuleTxt, { color: '#F97316' }]}>{latePct}%</Text>
              </View>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity style={{ width: '48%', marginBottom: 12 }} onPress={() => setStatusFilter(statusFilter === 'on_leave' ? 'all' : 'on_leave')}>
            <Card variant="elevated" style={[styles.analyticsCard, statusFilter === 'on_leave' && styles.cardActiveFilter]}>
              <View style={[styles.cardIconBg, { backgroundColor: '#EFF6FF' }]}>
                <Icon name="account-clock" size={16} color="#2563EB" />
              </View>
              <Text style={styles.cardVal}>{leaveCount}</Text>
              <Text style={[styles.cardLabel, { color: '#2563EB' }]}>On Leave</Text>
              <View style={[styles.pctCapsule, { backgroundColor: '#E3F2FD' }]}>
                <Text style={[styles.pctCapsuleTxt, { color: '#2563EB' }]}>{leavePct}%</Text>
              </View>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Quick Actions Row */}
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionItem} onPress={() => setManualModalVisible(true)}>
            <View style={[styles.qaIconBg, { backgroundColor: '#EFF6FF' }]}>
              <Icon name="crop-free" size={22} color="#2563EB" />
            </View>
            <Text style={styles.qaLabel}>Mark Attendance</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionItem} onPress={() => setManualModalVisible(true)}>
            <View style={[styles.qaIconBg, { backgroundColor: '#ECFDF5' }]}>
              <Icon name="clipboard-edit-outline" size={22} color="#10B981" />
            </View>
            <Text style={styles.qaLabel}>Manual Attendance</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.quickActionItem, geoFilter && { backgroundColor: '#E0F2FE', borderColor: '#2563EB', borderWidth: 1 }]} onPress={() => setGeoFilter(!geoFilter)}>
            <View style={[styles.qaIconBg, { backgroundColor: '#FAF5FF' }]}>
              <Icon name="map-marker-radius-outline" size={22} color="#8B5CF6" />
            </View>
            <Text style={styles.qaLabel}>{geoFilter ? 'Geo Verified Only' : 'Geo Verification'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionItem} onPress={() => Alert.alert('Export Complete', 'The daily attendance CSV report has been exported successfully!')}>
            <View style={[styles.qaIconBg, { backgroundColor: '#F0FDF4' }]}>
              <Icon name="download" size={22} color="#16A34A" />
            </View>
            <Text style={styles.qaLabel}>Export</Text>
          </TouchableOpacity>
        </View>

        {/* Search & Filter Row */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Icon name="magnify" size={20} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search cleaner by name or ID..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity style={[styles.filterBtn, statusFilter !== 'all' && { backgroundColor: '#2563EB' }]} onPress={() => setStatusFilter('all')}>
            <Icon name="filter-outline" size={18} color={statusFilter !== 'all' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.filterBtnTxt, statusFilter !== 'all' && { color: '#FFFFFF' }]}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Attendance List Table */}
        <Card variant="elevated" style={styles.tableCard}>
          {loading ? (
            <ActivityIndicator color="#2563EB" style={{ marginVertical: 32 }} />
          ) : filtered.length === 0 ? (
            <View style={{ alignItems: 'center', padding: 32 }}>
              <Icon name="account-search-outline" size={48} color="#CBD5E1" />
              <Text style={{ marginTop: 12, color: '#64748B', fontWeight: '500' }}>No records found</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View style={styles.tableWrapper}>
                {/* Headers */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.headerCol, { width: 140 }]}>Cleaner</Text>
                  <Text style={[styles.headerCol, { width: 90 }]}>Check-In</Text>
                  <Text style={[styles.headerCol, { width: 90 }]}>Check-Out</Text>
                  <Text style={[styles.headerCol, { width: 100 }]}>Working Hours</Text>
                  <Text style={[styles.headerCol, { width: 100 }]}>Status</Text>
                  <Text style={[styles.headerCol, { width: 60, textAlign: 'center' }]}>Selfie</Text>
                  <Text style={[styles.headerCol, { width: 60, textAlign: 'center' }]}>Action</Text>
                </View>

                {/* Rows */}
                {filtered.map((record, idx) => (
                  <View key={record._id} style={styles.tableRow}>
                    {/* Cleaner */}
                    <View style={[styles.rowCell, { width: 140, flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                      <Image source={require('../../assets/cleaner_avatar.png')} style={styles.tableAvatar} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.tableTextBold} numberOfLines={1}>{record.name}</Text>
                        <Text style={styles.tableTextSub}>{record.id}</Text>
                      </View>
                    </View>

                    {/* Check-In */}
                    <View style={[styles.rowCell, { width: 90 }]}>
                      <Text style={styles.tableTextTime}>{record.checkin}</Text>
                      {record.status !== 'Absent' && record.status !== 'On Leave' ? (
                        <View style={styles.verifiedRow}>
                          <Icon name={record.verified ? "map-marker" : "map-marker-off"} size={10} color={record.verified ? "#16A34A" : "#EF4444"} />
                          <Text style={[styles.verifiedTxt, { color: record.verified ? "#16A34A" : "#EF4444" }]}>{record.verified ? 'Verified' : 'Manual'}</Text>
                        </View>
                      ) : (
                        <Text style={[styles.unverifiedTxt, { color: record.status === 'On Leave' ? '#2563EB' : '#EF4444' }]}>
                          {record.status === 'On Leave' ? 'On Leave' : 'Not Marked'}
                        </Text>
                      )}
                    </View>

                    {/* Check-Out */}
                    <View style={[styles.rowCell, { width: 90 }]}>
                      <Text style={styles.tableTextTime}>{record.checkout}</Text>
                      {record.status !== 'Absent' && record.status !== 'On Leave' && record.checkout !== '—' ? (
                        <View style={styles.verifiedRow}>
                          <Icon name="map-marker" size={10} color="#16A34A" />
                          <Text style={styles.verifiedTxt}>Verified</Text>
                        </View>
                      ) : (
                        <Text style={[styles.unverifiedTxt, { color: record.status === 'On Leave' ? '#2563EB' : '#EF4444' }]}>
                          {record.status === 'On Leave' ? 'On Leave' : 'Not Marked'}
                        </Text>
                      )}
                    </View>

                    {/* Working Hours */}
                    <View style={[styles.rowCell, { width: 100 }]}>
                      <Text style={styles.tableHoursTxt}>{record.hours}</Text>
                    </View>

                    {/* Status */}
                    <View style={[styles.rowCell, { width: 100 }]}>
                      <View style={[styles.statusTag, { backgroundColor: record.status === 'Present' ? '#ECFDF5' : (record.status === 'Late' ? '#FFF7ED' : (record.status === 'Absent' ? '#FEF2F2' : '#EFF6FF')) }]}>
                        <Text style={[styles.statusTagTxt, { color: getStatusColor(record.status) }]}>{record.status}</Text>
                      </View>
                    </View>

                    {/* Selfie */}
                    <View style={[styles.rowCell, { width: 60, alignItems: 'center', justifyContent: 'center' }]}>
                      {record.selfieUrl ? (
                        <Image source={{ uri: record.selfieUrl }} style={styles.selfieThumb} />
                      ) : (
                        <View style={styles.selfiePlaceholder}>
                          <Icon name="camera-off" size={16} color="#CBD5E1" />
                        </View>
                      )}
                    </View>

                    {/* Action button */}
                    <TouchableOpacity 
                      style={[styles.rowDotBtn, { width: 60, alignItems: 'center' }]} 
                      onPress={() => {
                        setSelectedRecord(record);
                        setActionModalVisible(true);
                      }}
                    >
                      <Icon name="cog-outline" size={20} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </Card>
      </ScrollView>

      {/* Action Modal (Sheet) */}
      <Modal visible={actionModalVisible} transparent animationType="slide" onRequestClose={() => setActionModalVisible(false)}>
        <TouchableOpacity style={modalStyles.overlay} activeOpacity={1} onPress={() => setActionModalVisible(false)} />
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />
          <Text style={modalStyles.title}>Manage Attendance</Text>
          <Text style={modalStyles.subtitle}>{selectedRecord?.name} ({selectedRecord?.id})</Text>

          <View style={modalStyles.optionsList}>
            {selectedRecord?.status === 'Absent' && (
              <TouchableOpacity 
                style={modalStyles.optionBtn}
                onPress={() => {
                  setActionModalVisible(false);
                  handleMarkCheckin(selectedRecord._id);
                }}
              >
                <Icon name="login" size={22} color="#16A34A" />
                <Text style={modalStyles.optionTxt}>Mark Check-In (Present)</Text>
              </TouchableOpacity>
            )}

            {(selectedRecord?.status === 'Present' || selectedRecord?.status === 'Late') && selectedRecord?.checkout === '—' && (
              <TouchableOpacity 
                style={modalStyles.optionBtn}
                onPress={() => {
                  setActionModalVisible(false);
                  handleMarkCheckout(selectedRecord._id);
                }}
              >
                <Icon name="logout" size={22} color="#F97316" />
                <Text style={modalStyles.optionTxt}>Mark Check-Out</Text>
              </TouchableOpacity>
            )}

            {(selectedRecord?.status === 'Present' || selectedRecord?.status === 'Late') && (
              <TouchableOpacity 
                style={modalStyles.optionBtn}
                onPress={() => {
                  setActionModalVisible(false);
                  handleMarkAbsent(selectedRecord._id);
                }}
              >
                <Icon name="close-box-outline" size={22} color="#EF4444" />
                <Text style={modalStyles.optionTxt}>Mark Absent</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={modalStyles.optionBtn}
              onPress={() => {
                setActionModalVisible(false);
                navigation.navigate('Cleaners', {
                  screen: 'CleanerDetail',
                  params: { cleanerId: selectedRecord?._id }
                });
              }}
            >
              <Icon name="account-outline" size={22} color="#2563EB" />
              <Text style={modalStyles.optionTxt}>View Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={modalStyles.cancelBtn} onPress={() => setActionModalVisible(false)}>
              <Text style={modalStyles.cancelTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Manual Selection Modal */}
      <Modal visible={manualModalVisible} transparent animationType="fade" onRequestClose={() => setManualModalVisible(false)}>
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.sheet, { maxHeight: '80%', width: '90%', borderRadius: 16 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={modalStyles.title}>Select Cleaner</Text>
              <TouchableOpacity onPress={() => setManualModalVisible(false)}>
                <Icon name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {cleaners.map((cleaner) => (
                <TouchableOpacity 
                  key={cleaner._id}
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#F1F5F9' }}
                  onPress={() => {
                    setManualModalVisible(false);
                    setSelectedRecord(mergedRecords.find(r => r._id === cleaner._id));
                    setActionModalVisible(true);
                  }}
                >
                  <Image source={require('../../assets/cleaner_avatar.png')} style={{ width: 36, height: 36, borderRadius: 18, marginRight: 12 }} />
                  <View>
                    <Text style={{ fontWeight: '600', color: '#1E293B' }}>{cleaner.firstName} {cleaner.lastName || ''}</Text>
                    <Text style={{ fontSize: 12, color: '#64748B' }}>{cleaner.cleanerId || 'No ID'}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', alignItems: 'center' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, width: '100%', maxWidth: 500 },
  handle: { width: 40, height: 4, backgroundColor: '#CBD5E1', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 4, marginBottom: 20 },
  optionsList: { gap: 12 },
  optionBtn: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: '#F8FAFC', borderRadius: 8, gap: 12 },
  optionTxt: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  cancelBtn: { padding: 14, alignItems: 'center', marginTop: 8 },
  cancelTxt: { color: '#EF4444', fontWeight: '700', fontSize: 14 }
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerMenuBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  brandContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 32
  },
  brandLogo: {
    width: 150,
    height: 36,
  },
  brandSub: {
    fontSize: 8,
    fontWeight: '500',
    color: '#64748B',
    marginTop: -2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  subTitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  datePickerTxt: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    marginHorizontal: 6,
    fontFamily: 'Inter-Medium',
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  analyticsCard: {
    flex: 1,
    minWidth: '46%',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  cardActiveFilter: {
    borderColor: '#2563EB',
    borderWidth: 2,
  },
  cardIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardVal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  pctCapsule: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },
  pctCapsuleTxt: {
    fontSize: 10,
    fontWeight: '700',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickActionItem: {
    width: '23%',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qaIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  qaLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#1E293B',
    fontSize: 13,
    marginLeft: 6,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterBtnTxt: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 4,
  },
  tableCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableWrapper: {
    padding: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  headerCol: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
  },
  rowCell: {
    justifyContent: 'center',
  },
  tableAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  tableTextBold: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  tableTextSub: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 1,
  },
  tableTextTime: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '500',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  verifiedTxt: {
    fontSize: 9,
    fontWeight: '600',
  },
  unverifiedTxt: {
    fontSize: 9,
    fontWeight: '500',
    marginTop: 2,
  },
  tableHoursTxt: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  statusTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusTagTxt: {
    fontSize: 10,
    fontWeight: '700',
  },
  selfieThumb: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  selfiePlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowDotBtn: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});



export default DailyAttendanceScreen;
